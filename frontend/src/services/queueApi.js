const API_BASE = 'http://localhost:5000/api/queue'; // Adjust port to match your backend

export async function getQueueState() {
  const res = await fetch(API_BASE);
  if (!res.ok) throw new Error('Failed to fetch queue state');
  return res.json();
}

export async function enqueuePassenger(passenger) {
  const res = await fetch(`${API_BASE}/enqueue`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(passenger)
  });
  if (!res.ok) throw new Error('Failed to enqueue passenger');
  return res.json();
}

export async function dequeuePassenger() {
  const res = await fetch(`${API_BASE}/dequeue`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  });
  if (!res.ok) throw new Error('Failed to dequeue passenger');
  return res.json();
}

export async function clearQueue() {
  const res = await fetch(`${API_BASE}/clear`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  });
  if (!res.ok) throw new Error('Failed to clear queue');
  return res.json();
}
