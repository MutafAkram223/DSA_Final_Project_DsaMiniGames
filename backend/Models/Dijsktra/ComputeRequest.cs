using System.Collections.Generic;

public class ComputeRequest
{
    public List<NodeDto> Nodes { get; set; }
    public List<EdgeDto> Edges { get; set; }

    public string Start { get; set; }
    public string End { get; set; }
}
