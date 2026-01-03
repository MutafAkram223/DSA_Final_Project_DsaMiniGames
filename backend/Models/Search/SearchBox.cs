// Represents a single box in the game UI

public class SearchBox
{
    public int Index { get; set; }          // Position of the box
    public int Value { get; set; }          // Number inside the box
    public string Status { get; set; }      // closed, open, eliminated, found
}
