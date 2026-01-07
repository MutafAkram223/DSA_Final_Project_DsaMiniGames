public class SearchGameService
{
    private List<SearchBox> boxes;
    private int target;
    private int moves;

    private int currentIndex;
    private int low;
    private int high;

    private SearchLevel level;

    private LinearSearch linearSearch;
    private BinarySearch binarySearch;

    public SearchGameService()
    {
        linearSearch = new LinearSearch();
        binarySearch = new BinarySearch();
    }

    public SearchGameState StartLevel(int levelId)
    {
        moves = 0;

        boxes = GenerateBoxes(15);

        target = boxes[new Random().Next(boxes.Count)].Value;

        if (levelId == 1)
        {
            level = new SearchLevel
            {
                LevelId = 1,
                Type = "Linear"
            };

            currentIndex = 0;
            return CreateLinearState();
        }
        else
        {
            level = new SearchLevel
            {
                LevelId = 2,
                Type = "Binary",
                MaxMoves = 4
            };

            boxes.Sort((a, b) => a.Value.CompareTo(b.Value));

            low = 0;
            high = boxes.Count - 1;

            return CreateBinaryState();
        }
    }

    public SearchGameState ClickBox(int index)
    {
        if (level.Type == "Linear")
        {
            return LinearStep(index);
        }
        else
        {
            return BinaryStep(index);
        }
    }

    private SearchGameState LinearStep(int index)
    {
        if (index != currentIndex)
        {
            return CreateLinearState();
        }

        moves++;

        if (boxes[index].Value == target)
        {
            boxes[index].Status = "found";
            return CreateLinearState(true, false);
        }

        boxes[index].Status = "open";
        currentIndex++;

        if (currentIndex >= boxes.Count)
        {
            return CreateLinearState(false, true);
        }

        return CreateLinearState();
    }

    private SearchGameState BinaryStep(int index)
    {
        int mid = (low + high) / 2;

        if (index != mid)
        {
            return CreateBinaryState();
        }

        moves++;

        if (boxes[mid].Value == target)
        {
            boxes[mid].Status = "found";
            return CreateBinaryState(true, false);
        }

        if (boxes[mid].Value < target)
        {
            for (int i = low; i <= mid; i++)
            {
                boxes[i].Status = "eliminated";
            }
            low = mid + 1;
        }
        else
        {
            for (int i = mid; i <= high; i++)
            {
                boxes[i].Status = "eliminated";
            }
            high = mid - 1;
        }

        if (moves >= level.MaxMoves)
        {
            return CreateBinaryState(false, true);
        }

        return CreateBinaryState();
    }

    private LinearSearchGameState CreateLinearState(bool won = false, bool lost = false)
    {
        return new LinearSearchGameState
        {
            Boxes = boxes,
            Target = target,
            Moves = moves,
            CurrentIndex = currentIndex,
            IsWon = won,
            IsLost = lost,
            Algorithm = "Linear Search"
        };
    }

    private BinarySearchGameState CreateBinaryState(bool won = false, bool lost = false)
    {
        return new BinarySearchGameState
        {
            Boxes = boxes,
            Target = target,
            Moves = moves,
            Low = low,
            High = high,
            IsWon = won,
            IsLost = lost,
            Algorithm = "Binary Search"
        };
    }

    private List<SearchBox> GenerateBoxes(int count)
    {
        HashSet<int> values = new HashSet<int>();
        Random rand = new Random();

        while (values.Count < count)
        {
            values.Add(rand.Next(10, 99));
        }

        List<SearchBox> list = new List<SearchBox>();
        int index = 0;

        foreach (int v in values)
        {
            list.Add(new SearchBox
            {
                Index = index,
                Value = v,
                Status = "closed"
            });
            index++;
        }

        return list;
    }
}