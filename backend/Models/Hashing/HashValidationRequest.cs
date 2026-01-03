using System.Collections.Generic;

namespace DSAGamePlatform.Models.Hashing
{
    public class HashValidationRequest
    {
        public int GuestId { get; set; }
        public int TableSize { get; set; }
        public string Mode { get; set; }  
        public int ClickedIndex { get; set; }
        public List<int> OccupiedIndices { get; set; } = new List<int>();
    }
}