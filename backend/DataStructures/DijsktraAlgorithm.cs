using System;
using System.Collections.Generic;

public class DijkstraAlgorithm
{
    public int FindShortestCost(int nodesCount, List<List<(int to, int weight)>> adj, int start, int end)
    {
        List<int> dist = new List<int>();

        for (int i = 0; i < nodesCount; i++)
        {
            dist.Add(int.MaxValue);
        }

        PriorityQueue<(int node, int cost), int> pq = new PriorityQueue<(int, int), int>();

        dist[start] = 0;
        pq.Enqueue((start, 0), 0);

        while (pq.Count > 0)
        {
            var current = pq.Dequeue();
            int u = current.node;
            int currentCost = current.cost;

            if (currentCost > dist[u])
            {
                continue;
            }

            if (u == end)
            {
                return dist[u];
            }

            foreach (var edge in adj[u])
            {
                int v = edge.to;
                int weight = edge.weight;

                int newCost = dist[u] + weight;

                if (dist[v] > newCost)
                {
                    dist[v] = newCost;
                    pq.Enqueue((v, newCost), newCost);
                }
            }
        }

        return int.MaxValue;
    }
}
