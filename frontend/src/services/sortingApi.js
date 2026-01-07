// frontend/src/api/sortingApi.js
// Small wrapper around fetch so UI doesn't do raw fetch calls.

const BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5000';

export async function validateSort(payload) {
  // payload: { level: number, initialArray: number[], finalArray: number[] }
  const url = `${BASE}/api/sorting/validate`;
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Server error: ${res.status} ${text}`);
  }

  return await res.json(); // { isCorrect: bool, expected: [], steps: number }
}
