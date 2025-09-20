
# pip install httpx

# install FastAPI

#  C:/Users/supri/AppData/Local/Programs/Python/Python313/python.exe -m uvicorn main:app --reload


import httpx


from fastapi import Request

import os

# Read PocketBase API base URL from env or fallback
POCKETBASE_BASE = os.environ.get('POCKETBASE_URL', 'http://127.0.0.1:8090')
POCKETBASE_URL = POCKETBASE_BASE.rstrip('/') + '/api/collections'

# Optional: FASTAPI_HOST/PORT can be configured via env when running the server
FASTAPI_HOST = os.environ.get('FASTAPI_HOST', '127.0.0.1')
FASTAPI_PORT = int(os.environ.get('FASTAPI_PORT', '8000'))

async def fetch_pocketbase_collection(collection: str) -> list:
    async with httpx.AsyncClient() as client:
        resp = await client.get(f"{POCKETBASE_URL}/{collection}/records")
        resp.raise_for_status()
        return resp.json().get("items", [])


from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import Dict, List, Any
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Endpoint to receive data from AI_TRAIN and forward to PocketBase ---
class PocketBaseUploadRequest(BaseModel):
    collection: str
    data: dict

@app.post("/upload_to_pocketbase")
async def upload_to_pocketbase(req: PocketBaseUploadRequest):
    """
    Receives data from AI_TRAIN and uploads it to the specified PocketBase collection.
    """
    print(f"Received request to upload to {req.collection}")
    print(f"Data: {req.data}")
    
    try:
        async with httpx.AsyncClient() as client:
            pb_url = f"{POCKETBASE_URL}/{req.collection}/records"
            print(f"Sending to PocketBase URL: {pb_url}")
            print(f"Request payload: {req.data}")
            
            resp = await client.post(pb_url, json=req.data)
            print(f"PocketBase response status: {resp.status_code}")
            
            if resp.status_code != 200 and resp.status_code != 201:
                error_text = resp.text
                print(f"Error from PocketBase: {error_text}")
                raise HTTPException(status_code=resp.status_code, detail=error_text)
            
            result = resp.json()
            print(f"Success response: {result}")
            return result
    except Exception as e:
        print(f"Exception in upload_to_pocketbase: {str(e)}")
        raise

class TrainScheduleRequest(BaseModel):
    trains: Dict[str, Any]
    delays: Dict[str, int]
    headway: int

class ScheduleResult(BaseModel):
    base_schedules: Dict[str, List]
    final_schedules: Dict[str, List]
    throughput: float
    num_trains: int
    span_hours: float

@app.get("/")
def root():
    return {"message": "Train Scheduling API is running."}


# --- Scheduling Logic from AI_TRAIN ---
from datetime import datetime, timedelta

def str_to_time(s: str) -> datetime:
    return datetime.strptime(s, "%H:%M")

def time_to_str(t: datetime) -> str:
    return t.strftime("%H:%M")

def minutes_between(t1: datetime, t2: datetime) -> int:
    return int((t2 - t1).total_seconds() // 60)

def get_effective_priority(train: dict, delay: int) -> int:
    return train["priority"]

def resolve_conflicts(arrivals: list, headway: int) -> list:
    arrivals.sort(key=lambda x: x[1])
    i = 1
    while i < len(arrivals):
        prev_tid, prev_t, prev_pr, prev_delay, prev_sched = arrivals[i-1]
        curr_tid, curr_t, curr_pr, curr_delay, curr_sched = arrivals[i]
        gap = minutes_between(prev_t, curr_t)
        if gap < headway:
            if prev_pr < curr_pr:
                winner_idx, loser_idx = i-1, i
                winner_time = arrivals[winner_idx][1]
            elif curr_pr < prev_pr:
                winner_idx, loser_idx = i, i-1
                winner_time = arrivals[winner_idx][1]
            else:
                if prev_sched <= curr_sched:
                    winner_idx, loser_idx = i-1, i
                    winner_time = arrivals[winner_idx][1]
                else:
                    winner_idx, loser_idx = i, i-1
                    winner_time = arrivals[winner_idx][1]
            new_loser_time = winner_time + timedelta(minutes=headway)
            if new_loser_time > arrivals[loser_idx][1]:
                arrivals[loser_idx][1] = new_loser_time
                arrivals.sort(key=lambda x: x[1])
                i = 1
                continue
        i += 1
    return arrivals

def reschedule_all(trains: dict, delays: dict, headway: int):
    base_schedules = {}
    for tid, tr in trains.items():
        delay = delays.get(tid, 0)
        sched = [(station["station"], str_to_time(station["time"]) + timedelta(minutes=delay)) for station in tr["schedule"]]
        base_schedules[tid] = sched
    final_schedules = {tid: list(sched) for tid, sched in base_schedules.items()}
    stations = sorted({st for tr in trains.values() for st in [s["station"] for s in tr["schedule"]]})
    for station in stations:
        arrivals = []
        for tid, sched in final_schedules.items():
            for st, t in sched:
                if st == station:
                    orig_time_str = next(ot["time"] for ot in trains[tid]["schedule"] if ot["station"] == st)
                    scheduled_dt = str_to_time(orig_time_str)
                    delay_here = minutes_between(scheduled_dt, t)
                    eff_pr = get_effective_priority(trains[tid], delay_here)
                    arrivals.append([tid, t, eff_pr, delay_here, scheduled_dt])
                    break
        if len(arrivals) <= 1:
            continue
        resolved = resolve_conflicts(arrivals, headway)
        for tid, resolved_time, _, _, _ in resolved:
            idx = next((j for j, (st, _) in enumerate(final_schedules[tid]) if st == station), None)
            if idx is None:
                continue
            base_time = base_schedules[tid][idx][1]
            chosen_time = max(base_time, resolved_time)
            shift_minutes = minutes_between(final_schedules[tid][idx][1], chosen_time)
            if shift_minutes > 0:
                for j in range(idx, len(final_schedules[tid])):
                    st_j, t_j = final_schedules[tid][j]
                    final_schedules[tid][j] = (st_j, t_j + timedelta(minutes=shift_minutes))
    return base_schedules, final_schedules

def compute_throughput(all_schedules: dict):
    if not all_schedules:
        return 0.0, 0, 0.0
    num_trains = len(all_schedules)
    origin_times = [sched[0][1] for sched in all_schedules.values()]
    final_times = [sched[-1][1] for sched in all_schedules.values()]
    earliest_origin = min(origin_times)
    latest_final = max(final_times)
    total_minutes = minutes_between(earliest_origin, latest_final)
    if total_minutes <= 0:
        total_minutes = 1
    span_hours = total_minutes / 60.0
    throughput = num_trains / span_hours
    return throughput, num_trains, span_hours

def ai_schedule(trains, delays, headway):
    base_schedules, final_schedules = reschedule_all(trains, delays, headway)
    throughput, num_trains, span_hours = compute_throughput(final_schedules)
    # Convert datetime objects to strings for JSON serialization
    def serialize(sched):
        return [(st, time_to_str(t)) for st, t in sched]
    base_schedules_str = {tid: serialize(sched) for tid, sched in base_schedules.items()}
    final_schedules_str = {tid: serialize(sched) for tid, sched in final_schedules.items()}
    return base_schedules_str, final_schedules_str, throughput, num_trains, span_hours

@app.post("/schedule", response_model=ScheduleResult)
async def schedule_trains(req: TrainScheduleRequest):
    # Example: fetch trains and delays from PocketBase
    trains_data = await fetch_pocketbase_collection("trains")
    delays_data = await fetch_pocketbase_collection("delays")
    # Transform PocketBase data to expected format for scheduling logic
    trains = {t['number']: t for t in trains_data}
    delays = {d['train_number']: d['delay_minutes'] for d in delays_data}
    # Use headway from request or default
    headway = req.headway or 10
    # Call your scheduling logic here
    base_schedules, final_schedules, throughput, num_trains, span_hours = ai_schedule(
        trains, delays, headway
    )
    return {
        "base_schedules": base_schedules,
        "final_schedules": final_schedules,
        "throughput": throughput,
        "num_trains": num_trains,
        "span_hours": span_hours,
    }
