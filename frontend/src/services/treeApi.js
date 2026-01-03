const BASE_URL = "http://localhost:5000/api/tree";

export async function validateTraversalArray(payload) {
  const res = await fetch(`${BASE_URL}/validate-array`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error("API error: " + text);
  }

  const data = await res.json();
  return data;
}
