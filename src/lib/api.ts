// API utility for frontend to call FastAPI backend
export async function fetchSchedule(headway: number) {
  const response = await fetch('http://127.0.0.1:8000/schedule', {
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
    
    const response = await fetch('http://127.0.0.1:8000/upload_to_pocketbase', {
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
