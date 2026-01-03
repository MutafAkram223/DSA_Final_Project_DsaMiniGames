// This service controls the entire game logic
// It uses real DSA algorithms and updates game state

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
        // Initialize algorithm classes
        linearSearch = new LinearSearch();
        binarySearch = new BinarySearch();
    }

    // Start a new level
    public SearchGameState StartLevel(int levelId)
    {
        moves = 0;

        // Generate random boxes
        boxes = GenerateBoxes(15);

        // Pick a random target from boxes
        target = boxes[new Random().Next(boxes.Count)].Value;

        // Decide level type
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

            // Sort boxes for binary search
            boxes.Sort((a, b) => a.Value.CompareTo(b.Value));

            low = 0;
            high = boxes.Count - 1;

            return CreateBinaryState();
        }
    }

    // Handle user clicking a box
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

    // One step of Linear Search
    private SearchGameState LinearStep(int index)
    {
        // Enforce sequential access
        if (index != currentIndex)
        {
            return CreateLinearState();
        }

        moves++;

        // If found
        if (boxes[index].Value == target)
        {
            boxes[index].Status = "found";
            return CreateLinearState(true, false);
        }

        // Otherwise open the box
        boxes[index].Status = "open";
        currentIndex++;

        // If end reached
        if (currentIndex >= boxes.Count)
        {
            return CreateLinearState(false, true);
        }

        return CreateLinearState();
    }

    // One step of Binary Search
    private SearchGameState BinaryStep(int index)
    {
        int mid = (low + high) / 2;

        // Only mid index is allowed
        if (index != mid)
        {
            return CreateBinaryState();
        }

        moves++;

        // If found
        if (boxes[mid].Value == target)
        {
            boxes[mid].Status = "found";
            return CreateBinaryState(true, false);
        }

        // Eliminate half based on comparison
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

        // If move limit exceeded
        if (moves >= level.MaxMoves)
        {
            return CreateBinaryState(false, true);
        }

        return CreateBinaryState();
    }

    // Create Linear Search game state
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

    // Create Binary Search game state
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

    // Generate unique random boxes
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