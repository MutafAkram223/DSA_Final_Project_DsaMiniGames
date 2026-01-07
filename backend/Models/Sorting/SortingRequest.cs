using System.Collections.Generic;

public class SortingRequest
{
    // For now I have added only two levels
    // 1: Bubble Sort 
    // 2: Insertion Sort
    public int Level { get; set; }

    // I am showing initial array to the user and the user array will be the final array that wll be made by the user
    public List<int> InitialArray { get; set; } = new List<int>();
    public List<int> UserArray { get; set; } = new List<int>();
}
