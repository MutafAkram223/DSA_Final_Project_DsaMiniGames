const BASE = "http://localhost:5000/api/dijkstra";

export async function computeOptimalPath(graph, startId, endId) {
  const body = {
    nodes: graph.nodes,
    edges: graph.edges,
    start: startId,
    end: endId
  };

  const res = await fetch(`${BASE}/compute`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });

  if (!res.ok) {
    throw new Error("Failed to compute optimal path");
  }

  const data = await res.json();
  return data;
}
