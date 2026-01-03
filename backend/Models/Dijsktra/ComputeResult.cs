using System.Collections.Generic;

public class ComputeResult
{
    public int OptimalCost { get; set; }

    // Currently not used, remvoed it because UI we mainly need optimal cost
    public List<string> OptimalPath { get; set; }
}
