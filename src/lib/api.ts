// API utility for frontend to call FastAPI backend
// Support both VITE_AURL (alias) and VITE_FASTAPI_URL for backwards compatibility
const FASTAPI_URL = (import.meta as any).env.VITE_AURL || (import.meta as any).env.VITE_FASTAPI_URL || 'http://127.0.0.1:8000';

export async function fetchSchedule(headway: number) {
  const response = await fetch(`${FASTAPI_URL}/schedule`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ headway }),
  });
  if (!response.ok) throw new Error('Failed to fetch schedule');
  return await response.json();
}

// Function to send data to PocketBase via FastAPI
export async function sendToPocketBase(collection: string, data: any) {
  try {
    console.log(`Sending to PocketBase collection '${collection}':`, data);
    
    const payload = { collection, data };
    console.log('Request payload:', payload);
    
    const response = await fetch(`${FASTAPI_URL}/upload_to_pocketbase`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });
    
    console.log('Response status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Error response:', errorText);
      throw new Error(`Failed to send data to PocketBase: ${errorText}`);
    }
    
    const responseData = await response.json();
    console.log('Success response:', responseData);
    return responseData;
  } catch (error) {
    console.error('Error sending data to PocketBase:', error);
    throw error;
  }
}
