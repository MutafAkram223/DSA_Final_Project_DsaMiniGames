using System.Collections.Generic;

namespace Backend.Models.Tree
{
    public class TreeArrayRequest
    {
        public List<string?> TreeArray { get; set; } = new List<string?>();
        public string TraversalType { get; set; } = "PRE";
        public List<string> UserSequence { get; set; } = new List<string>();
    }
}
