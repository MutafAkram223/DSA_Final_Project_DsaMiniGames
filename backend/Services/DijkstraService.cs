using System.Collections.Generic;

public class DijkstraService
{
    private DijkstraAlgorithm algorithm;

    public DijkstraService()
    {
        algorithm = new DijkstraAlgorithm();
    }

    // I am calling this function in controller and it is used to connect backend to frontend
    // Also, computerequest is object that I have made and we will convert strings into ints like CS Departement Node
    // cannot be passed directly to the Dijsktra Algo

    public ComputeResult Compute(ComputeRequest request)
    {
        Dictionary<string, int> nodeIndexMap = new Dictionary<string, int>();
        int index = 0;

        foreach (var node in request.Nodes)
        {
            nodeIndexMap[node.Id] = index;
            index++;
        }

        int totalNodes = nodeIndexMap.Count;

        List<List<(int to, int weight)>> adjacencyList = new List<List<(int, int)>>();

        for (int i = 0; i < totalNodes; i++)
        {
            adjacencyList.Add(new List<(int, int)>());
        }

        foreach (var edge in request.Edges)
        {
            int u = nodeIndexMap[edge.U];
            int v = nodeIndexMap[edge.V];
            int w = edge.W;

            adjacencyList[u].Add((v, w));
            adjacencyList[v].Add((u, w));
        }

        int startIndex = nodeIndexMap[request.Start];
        int endIndex = nodeIndexMap[request.End];

        int shortestCost = algorithm.FindShortestCost(totalNodes, adjacencyList, startIndex, endIndex);

        ComputeResult result = new ComputeResult();

        if (shortestCost == int.MaxValue)
        {
            result.OptimalCost = -1;
        }
        else
        {
            result.OptimalCost = shortestCost;
        }

        result.OptimalPath = new List<string>();

        return result;
    }
}
