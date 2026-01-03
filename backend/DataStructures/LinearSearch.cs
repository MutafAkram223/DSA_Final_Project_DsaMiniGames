public class LinearSearch
{
    public int Find(List<int> arr, int target, int startIndex)
    {
        for (int i = startIndex; i < arr.Count; i++)
        {
            if (arr[i] == target)
            {
                return i;
            }
        }

        return -1;
    }
}
