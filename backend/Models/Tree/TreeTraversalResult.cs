using System.Collections.Generic;

namespace Backend.Models.Tree
{
    public class TreeTraversalResult
    {
        public bool IsCorrect { get; set; }
        public List<string> ExpectedSequence { get; set; } = new List<string>();
        public string Message { get; set; } = "";
    }
}
