public abstract class SearchGameState
{
    public List<SearchBox> Boxes { get; set; }
    public int Target { get; set; }
    public int Moves { get; set; }
    public bool IsWon { get; set; }
    public bool IsLost { get; set; }
    public string Algorithm { get; set; }
}

public class LinearSearchGameState : SearchGameState
{
    public int CurrentIndex { get; set; } 
}

public class BinarySearchGameState : SearchGameState
{
    public int Low { get; set; }
    public int High { get; set; }
}
