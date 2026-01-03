// Defines configuration of each level

public class SearchLevel
{
    public int LevelId { get; set; }
    public string Type { get; set; }    // Linear or Binary
    public int MaxMoves { get; set; }   // Used only for Binary Search
}
