using System.Collections.Generic;
using System.Linq;

public class SortingService
{
    public SortingResult Validate(SortingRequest request)
    {
        List<int> correctSorted;

        if (request.Level == 1)
        {
            correctSorted = BubbleSort.Sort(request.InitialArray);
        }
        else
        {
            correctSorted = InsertionSort.Sort(request.InitialArray);
        }

        bool isCorrect = correctSorted.SequenceEqual(request.UserArray);

        SortingResult result = new SortingResult();
        result.IsCorrect = isCorrect;
        result.Expected = correctSorted;

        return result;
    }
}
