public class StackGameState
{
    public List<string> MainStack { get; set; }
    public List<string> AuxA { get; set; }
    public List<string> AuxB { get; set; }
    public List<string> Target { get; set; }

    public int Moves { get; set; }
    public bool IsSolved { get; set; }
}
