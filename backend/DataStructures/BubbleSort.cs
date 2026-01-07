using System.Collections.Generic;

public static class BubbleSort
{
    public static List<int> Sort(List<int> input)
    {
        List<int> arr = new List<int>(input);

        for (int i = 0; i < arr.Count - 1; i++)
        {
            for (int j = 0; j < arr.Count - i - 1; j++)
            {
                if (arr[j] > arr[j + 1])
                {
                    int temp = arr[j];
                    arr[j] = arr[j + 1];
                    arr[j + 1] = temp;
                }
            }
        }

        return arr;
    }
}
