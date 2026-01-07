using System.Collections.Generic;

public static class InsertionSort
{
    public static List<int> Sort(List<int> input)
    {
        List<int> arr = new List<int>(input);

        for (int i = 1; i < arr.Count; i++)
        {
            int key = arr[i];
            int j = i - 1;

            while (j >= 0 && arr[j] > key)
            {
                arr[j + 1] = arr[j];
                j--;
            }

            arr[j + 1] = key;
        }

        return arr;
    }
}
