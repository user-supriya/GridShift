import React, { useEffect, useState } from 'react';
import { RailwaySimulation } from '@/lib/railwaySimulation';
import { SimulationState } from '@/types/railway';
import { TrackDiagram } from '@/components/TrackDiagram';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Train, Activity, Clock, TrendingUp, Database, RefreshCw, Play, Square, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Slider } from '@/components/ui/slider';

// PocketBase integration
import PocketBase from 'pocketbase';

// Read PocketBase URL from Vite env or fallback to localhost
const POCKETBASE_URL = (import.meta as any).env.VITE_POCKETBASE_URL || 'http://127.0.0.1:8090';
const pb = new PocketBase(POCKETBASE_URL);

// Define the PocketBase train record structure
interface PocketBaseTrain {
  id: string;
  number: string;
  name: string;
  priority: number;
  schedule: {
    [key: string]: any;
  };
  created: string;
  updated: string;
}

// Define the PocketBase schedule record structure
interface PocketBaseSchedule {
  id: string;
  name: string;
  schedule: {
    [key: string]: any;
  };
  created: string;
  updated: string;
}

export const Dashboard: React.FC = () => {
  const [simulation] = useState(() => new RailwaySimulation());
  const [state, setState] = useState<SimulationState>(simulation.getState());
  const [loading, setLoading] = useState({ pocketbase: false, pocketbaseSchedule: false, pocketbaseResults: false });
  const [error, setError] = useState<{ pocketbase: string | null; pocketbaseSchedule: string | null; pocketbaseResults: string | null }>({ 
    pocketbase: null,
    pocketbaseSchedule: null,
    pocketbaseResults: null
  });
  const [pocketbaseData, setPocketbaseData] = useState<PocketBaseTrain[]>([]);
  const [pocketbaseScheduleData, setPocketbaseScheduleData] = useState<PocketBaseSchedule[]>([]);
  const [throughput, setThroughput] = useState<number | null>(null);

  // Fetch throughput from PocketBase 'results' collection
  const fetchPocketBaseResults = async () => {
    setLoading(prev => ({ ...prev, pocketbaseResults: true }));
    setError(prev => ({ ...prev, pocketbaseResults: null }));
    try {
      // Get the latest result (assuming sorted by created desc)
      const records = await pb.collection('results').getFullList({ sort: '-created', });
      if (records.length > 0 && typeof records[0].throughput === 'number') {
        setThroughput(records[0].throughput);
      } else {
        setThroughput(null);
      }
    } catch (err: any) {
      setError(prev => ({ ...prev, pocketbaseResults: err.message || 'Failed to fetch throughput' }));
      setThroughput(null);
    } finally {
      setLoading(prev => ({ ...prev, pocketbaseResults: false }));
    }
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setState(simulation.getState());
    }, 100);
    return () => clearInterval(interval);
  }, [simulation]);

  // Fetch train data from PocketBase
  const fetchPocketBaseData = async () => {
    setLoading(prev => ({ ...prev, pocketbase: true }));
    setError(prev => ({ ...prev, pocketbase: null }));
    try {
      const records = await pb.collection('trains').getFullList({
        sort: '-created',
      });
      setPocketbaseData(
        records.map((record: any) => ({
          id: record.id,
          number: record.number,
          name: record.name,
          priority: record.priority,
          schedule: record.schedule,
          created: record.created,
          updated: record.updated,
        }))
      );
    } catch (err: any) {
      setError(prev => ({ 
        ...prev, 
        pocketbase: err.message || 'Failed to fetch PocketBase data' 
      }));
    } finally {
      setLoading(prev => ({ ...prev, pocketbase: false }));
    }
  };

  // Fetch schedule data from PocketBase
  const fetchPocketBaseScheduleData = async () => {
    setLoading(prev => ({ ...prev, pocketbaseSchedule: true }));
    setError(prev => ({ ...prev, pocketbaseSchedule: null }));
    try {
      const records = await pb.collection('schedule').getFullList({
        sort: '-created',
      });
      setPocketbaseScheduleData(
        records.map((record: any) => ({
          id: record.id,
          name: record.name,
          schedule: record.schedule,
          created: record.created,
          updated: record.updated,
        }))
      );
    } catch (err: any) {
      setError(prev => ({ 
        ...prev, 
        pocketbaseSchedule: err.message || 'Failed to fetch PocketBase schedule data' 
      }));
    } finally {
      setLoading(prev => ({ ...prev, pocketbaseSchedule: false }));
    }
  };

  // Fetch data on mount
  useEffect(() => {
    fetchPocketBaseData();
    fetchPocketBaseScheduleData();
    // Also fetch throughput results
    fetchPocketBaseResults();
  }, []);

  const handleStart = () => simulation.start();
  const handleStop = () => simulation.stop();
  const handleReset = () => {
    simulation.stop();
    setState(simulation.getState());
  };
  const handleSpeedChange = (speed: number) => simulation.setSpeed(speed);
  const handleOverrideSignal = (signalId: string, status: 'red' | 'yellow' | 'green') => simulation.overrideSignal(signalId, status);

  const handleSignalClick = (signalId: string) => {
    const signal = state.signals.find(s => s.id === signalId);
    if (signal) {
      const nextStatus = signal.status === 'red' ? 'green' : signal.status === 'green' ? 'yellow' : 'red';
      handleOverrideSignal(signalId, nextStatus);
    }
  };

  // Format train data for display
  const formatTrainData = (train: PocketBaseTrain) => {
    return {
      id: train.id || 'N/A',
      number: train.number || 'N/A',
      name: train.name || 'Unnamed Train',
      priority: train.priority || 0,
      schedule: train.schedule || {},
      created: train.created || 'Unknown',
      updated: train.updated || 'Unknown'
    };
  };

  // Format schedule data for display
  const formatScheduleData = (schedule: PocketBaseSchedule) => {
    return {
      id: schedule.id || 'N/A',
      name: schedule.name || 'Unnamed Schedule',
      schedule: schedule.schedule || {},
      created: schedule.created || 'Unknown',
      updated: schedule.updated || 'Unknown'
    };
  };

  // Render schedule in a table format
  const renderScheduleTable = (schedule: any) => {
    if (!schedule || Object.keys(schedule).length === 0) {
      return (
        <div className="text-center py-4 text-blue-300">
          No schedule data available
        </div>
      );
    }

    // Convert schedule object to array of entries
    const scheduleEntries = Object.entries(schedule);
    
    return (
      <div className="overflow-hidden rounded border border-blue-900/50">
        <table className="w-full text-sm">
          <thead className="bg-blue-900/30">
            <tr>
              <th className="text-left p-2 text-blue-300 font-medium text-xs">Time</th>
              <th className="text-left p-2 text-blue-300 font-medium text-xs">Station</th>
            </tr>
          </thead>
          <tbody>
            {scheduleEntries.map(([time, details], index) => (
              <tr 
                key={time} 
                className={index % 2 === 0 ? 'bg-gray-900/30' : 'bg-gray-800/30'}
              >
                <td className="p-2 text-blue-200 font-mono text-xs">
                  {(details as any).time || time}
                </td>
                <td className="p-2 text-blue-100 text-xs">
                  {(details as any).station || 'Unknown Station'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  return (
  <div className="min-h-screen bg-black text-gray-100 p-2 md:p-4">
  <div className="max-w-7xl mx-auto space-y-4">
        {/* Header */}
  <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 py-3 border-b border-gray-800">
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-[#3b82f6] flex items-center gap-2">
              <Train className="h-6 w-6" />
              Railway Control Dashboard
            </h1>
            <p className="text-[#60a5fa] text-sm mt-1">Real-time train operations monitoring</p>
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm"
              className="border-gray-700 text-gray-300 hover:bg-gray-900 h-8 px-2"
              onClick={fetchPocketBaseData}
              disabled={loading.pocketbase}
            >
              <Database className={`h-3 w-3 mr-1 ${loading.pocketbase ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Sync Trains</span>
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              className="border-gray-700 text-gray-300 hover:bg-gray-900 h-8 px-2"
              onClick={fetchPocketBaseScheduleData}
              disabled={loading.pocketbaseSchedule}
            >
              <Database className={`h-3 w-3 mr-1 ${loading.pocketbaseSchedule ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Sync Schedules</span>
            </Button>
          </div>
        </div>

        {/* Quick Stats (PocketBase only) */}
  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Card className="bg-gray-950 border-gray-800 shadow-lg">
            <CardContent className="p-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-400 flex items-center gap-1">
                    <Train className="h-3 w-3" />
                    Total Trains
                  </p>
                  <p className="text-lg font-bold mt-1 text-gray-100">{pocketbaseData.length}</p>
                </div>
                <Badge variant="secondary" className="bg-[#2563eb] text-white text-xs">
                  Trains
                </Badge>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gray-950 border-gray-800 shadow-lg">
            <CardContent className="p-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-400 flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    Delay
                  </p>
                  <p className="text-lg font-bold mt-1 text-gray-100">{state.metrics.averageDelay.toFixed(1)}m</p>
                </div>
                <Badge 
                  variant={state.metrics.averageDelay > 5 ? "destructive" : "default"}
                  className={state.metrics.averageDelay > 5 
                    ? "bg-red-900 text-red-200 text-xs" 
                    : "bg-[#2563eb] text-white text-xs"}
                >
                  {state.metrics.averageDelay > 5 ? "High" : "Normal"}
                </Badge>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gray-950 border-gray-800 shadow-lg">
            <CardContent className="p-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-400 flex items-center gap-1">
                    <TrendingUp className="h-3 w-3" />
                    Throughput
                  </p>
                  {loading.pocketbaseResults ? (
                    <Skeleton className="h-6 w-16 bg-gray-900" />
                  ) : error.pocketbaseResults ? (
                    <span className="text-red-400 text-xs">Error</span>
                  ) : (
                    <p className="text-lg font-bold mt-1 text-gray-100">{throughput !== null ? throughput : (state.metrics.throughput ?? '-')}</p>
                  )}
                </div>
                <Badge variant="outline" className="border-[#3b82f6] text-[#3b82f6] text-xs">
                  trains/hr
                </Badge>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gray-950 border-gray-800 shadow-lg">
            <CardContent className="p-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-400 flex items-center gap-1">
                    <Database className="h-3 w-3" />
                    Schedules
                  </p>
                  <p className="text-lg font-bold mt-1 text-gray-100">{pocketbaseScheduleData.length}</p>
                </div>
                <Badge variant="secondary" className="bg-[#2563eb] text-white text-xs">
                  Schedules
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Data Sources Tabs */}
  <Tabs defaultValue="pocketbase" className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-gray-950 border border-gray-800">
            <TabsTrigger 
              value="pocketbase" 
              className="data-[state=active]:bg-gray-900 data-[state=active]:text-gray-100 text-gray-400 py-2 text-sm"
            >
              <Database className="h-3 w-3 mr-1" />
              Trains
            </TabsTrigger>
            <TabsTrigger 
              value="pocketbase-schedule" 
              className="data-[state=active]:bg-gray-900 data-[state=active]:text-gray-100 text-gray-400 py-2 text-sm"
            >
              <Database className="h-3 w-3 mr-1" />
              PB Schedule
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="pocketbase" className="mt-3">
            <Card className="bg-gray-950 border-gray-800 shadow-lg">
              <CardHeader className="flex flex-row items-center justify-between pb-2 pt-3 px-3">
                <CardTitle className="flex items-center gap-2 text-gray-400 text-sm">
                  <Database className="h-4 w-4" />
                  Train Records
                </CardTitle>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-gray-400 hover:bg-gray-900 h-7 w-7 p-0"
                  onClick={fetchPocketBaseData}
                  disabled={loading.pocketbase}
                >
                  <RefreshCw className={`h-3 w-3 ${loading.pocketbase ? 'animate-spin' : ''}`} />
                </Button>
              </CardHeader>
              <CardContent className="px-3 pb-3 pt-0">
                {loading.pocketbase ? (
                  <div className="space-y-2">
                    <Skeleton className="h-3 w-full bg-gray-900" />
                    <Skeleton className="h-3 w-3/4 bg-gray-900" />
                    <Skeleton className="h-3 w-5/6 bg-gray-900" />
                  </div>
                ) : error.pocketbase ? (
                  <Alert variant="destructive" className="border-red-900 bg-red-950 py-2 px-3">
                    <AlertTitle className="text-red-300 text-sm">PocketBase Error</AlertTitle>
                    <AlertDescription className="text-red-200 text-xs">{error.pocketbase}</AlertDescription>
                  </Alert>
                ) : pocketbaseData.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {pocketbaseData.map((record) => {
                      const train = formatTrainData(record);
                      
                      return (
                        <Card 
                          key={record.id} 
                          className="bg-gray-950 border-gray-800 shadow"
                        >
                          <CardHeader className="pb-2 pt-3 px-3">
                            <CardTitle className="text-[#3b82f6] flex justify-between items-start text-sm">
                              <span className="truncate">{train.name}</span>
                              <Badge 
                                variant="default"
                                className="bg-[#2563eb] text-white text-xs ml-2"
                              >
                                P{train.priority}
                              </Badge>
                            </CardTitle>
                            <div className="text-[#60a5fa] text-xs">
                              Train #{train.number}
                            </div>
                          </CardHeader>
                          <CardContent className="text-xs pt-1 px-3 pb-3">
                            <div>
                              <div className="text-[#60a5fa] font-medium mb-1 text-[10px]">Schedule</div>
                              <div className="bg-black rounded border border-gray-800">
                                <ScrollArea className="h-[150px]">
                                  {renderScheduleTable(train.schedule)}
                                </ScrollArea>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-6 text-gray-400 text-sm">
                    No PocketBase data available
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="pocketbase-schedule" className="mt-3">
            <Card className="bg-gray-950 border-gray-800 shadow-lg">
              <CardHeader className="flex flex-row items-center justify-between pb-2 pt-3 px-3">
                <CardTitle className="flex items-center gap-2 text-gray-400 text-sm">
                  <Database className="h-4 w-4" />
                  PocketBase Schedules
                </CardTitle>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-gray-400 hover:bg-gray-900 h-7 w-7 p-0"
                  onClick={fetchPocketBaseScheduleData}
                  disabled={loading.pocketbaseSchedule}
                >
                  <RefreshCw className={`h-3 w-3 ${loading.pocketbaseSchedule ? 'animate-spin' : ''}`} />
                </Button>
              </CardHeader>
              <CardContent className="px-3 pb-3 pt-0">
                {loading.pocketbaseSchedule ? (
                  <div className="space-y-2">
                    <Skeleton className="h-3 w-full bg-gray-900" />
                    <Skeleton className="h-3 w-3/4 bg-gray-900" />
                    <Skeleton className="h-3 w-5/6 bg-gray-900" />
                  </div>
                ) : error.pocketbaseSchedule ? (
                  <Alert variant="destructive" className="border-red-900 bg-red-950 py-2 px-3">
                    <AlertTitle className="text-red-300 text-sm">PocketBase Schedule Error</AlertTitle>
                    <AlertDescription className="text-red-200 text-xs">{error.pocketbaseSchedule}</AlertDescription>
                  </Alert>
                ) : pocketbaseScheduleData.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {pocketbaseScheduleData.map((record) => {
                      const schedule = formatScheduleData(record);
                      
                      return (
                        <Card 
                          key={record.id} 
                          className="bg-gray-950 border-gray-800 shadow"
                        >
                          <CardHeader className="pb-2 pt-3 px-3">
                            <CardTitle className="text-[#3b82f6] text-sm truncate">
                              {schedule.name}
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="text-xs pt-1 px-3 pb-3">
                            <div>
                              <div className="text-[#60a5fa] font-medium mb-1 text-[10px]">Schedule</div>
                              <div className="bg-black rounded border border-gray-800">
                                <ScrollArea className="h-[150px]">
                                  {renderScheduleTable(schedule.schedule)}
                                </ScrollArea>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-6 text-gray-400 text-sm">
                    No PocketBase schedule data available
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Main Dashboard */}
  <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Track Diagram */}
          <div className="lg:col-span-2">
            <Card className="bg-gray-950 border-gray-800 shadow-lg h-full">
              <CardHeader className="pb-2 pt-3 px-3">
                <CardTitle className="flex items-center gap-2 text-gray-400 text-sm">
                  <Train className="h-4 w-4" />
                  Railway Network Overview
                </CardTitle>
              </CardHeader>
              <CardContent className="p-2 md:p-3">
                <div className="bg-black rounded-lg border border-gray-800 p-2 overflow-hidden">
                  <div className="overflow-auto max-h-[400px]">
                    <TrackDiagram
                      trains={state.trains}
                      signals={state.signals}
                      tracks={state.tracks}
                      stations={state.stations}
                      onSignalClick={handleSignalClick}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* AI_TRAIN Data Form */}
          <div>
            <Card className="bg-gray-950 border-gray-800 shadow-lg h-full">
              <CardHeader className="pb-2 pt-3 px-3">
                <CardTitle className="flex items-center gap-2 text-gray-400 text-sm">
                  <Activity className="h-4 w-4" />
                  AI_TRAIN Data Submission
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 px-3 pb-3">
                <form
                  onSubmit={async (e) => {
                    e.preventDefault();
                    const form = e.target as HTMLFormElement;
                    const trainNumber = (form.elements.namedItem('trainNumber') as HTMLSelectElement).value;
                    const delay = parseInt((form.elements.namedItem('delay') as HTMLInputElement).value, 10);
                    const headway = parseInt((form.elements.namedItem('headway') as HTMLInputElement).value, 10);
                    const payload = {
                      trains: {},
                      delays: {},
                      headway
                    };
                    // Find train info from PocketBase data
                    const train = pocketbaseData.find(t => t.number === trainNumber);
                    if (train) {
                      payload.trains[train.number] = {
                        name: train.name,
                        priority: train.priority,
                        schedule: train.schedule
                      };
                      payload.delays[train.number] = delay;
                    }
                    try {
                      const FASTAPI_URL = (import.meta as any).env.VITE_AURL || (import.meta as any).env.VITE_FASTAPI_URL || 'http://127.0.0.1:8000';
                      const response = await fetch(`${FASTAPI_URL}/schedule`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(payload)
                      });
                      if (!response.ok) throw new Error('Failed to send data to AI_TRAIN');
                      alert('Data sent to AI_TRAIN and scheduled!');
                    } catch (err) {
                      alert('Error sending data: ' + err);
                    }
                  }}
                  className="space-y-4"
                >
                  <div>
                    <label className="text-xs text-gray-400">Train Number</label>
                    <select name="trainNumber" className="w-full rounded bg-gray-900 text-gray-300 p-2 mt-1">
                      {pocketbaseData.map(train => (
                        <option key={train.number} value={train.number}>{train.number} - {train.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-gray-400">Delay (minutes)</label>
                    <input name="delay" type="number" min="0" defaultValue="0" className="w-full rounded bg-gray-900 text-gray-300 p-2 mt-1" />
                  </div>
                  <div>
                    <label className="text-xs text-gray-400">Headway (minutes)</label>
                    <input name="headway" type="number" min="1" defaultValue="10" className="w-full rounded bg-gray-900 text-gray-300 p-2 mt-1" />
                  </div>
                  <Button type="submit" className="w-full bg-gray-900 hover:bg-gray-800 text-gray-100">Send to AI_TRAIN</Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};