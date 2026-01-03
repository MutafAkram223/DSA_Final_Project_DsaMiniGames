public class BinarySearch
{
    public int Find(List<int> arr, int target, int low, int high)
    {
        if (low > high)
        {
            return -1;
        }

        int mid = (low + high) / 2;

        if (arr[mid] == target)
        {
            return mid;
        }

        if (arr[mid] < target)
        {
            return Find(arr, target, mid + 1, high);
        }

        return Find(arr, target, low, mid - 1);
    }
}
