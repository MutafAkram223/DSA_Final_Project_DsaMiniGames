public class StackGameService
{
    private Stack<string> mainStack;
    private Stack<string> auxA;
    private Stack<string> auxB;

    private StackLevel currentLevel;
    private int moves;

    private List<StackLevel> levels;

    public StackGameService()
    {
        levels = new List<StackLevel>();

        levels.Add(new StackLevel
        {
            LevelId = 1,
            Start = new List<string> { "red", "blue", "green" },
            Target = new List<string> { "blue", "red", "green" }
        });

        levels.Add(new StackLevel
        {
            LevelId = 2,
            Start = new List<string> { "yellow", "green", "blue", "red" },
            Target = new List<string> { "green", "yellow", "red", "blue" }
        });

        levels.Add(new StackLevel
        {
            LevelId = 3,
            Start = new List<string> { "purple", "orange", "teal", "pink", "brown" },
            Target = new List<string> { "orange", "purple", "pink", "brown", "teal" }
        });
    }

    public StackGameState StartLevel(int levelId)
    {
        currentLevel = levels.Find(l => l.LevelId == levelId);

        mainStack = new Stack<string>();
        auxA = new Stack<string>();
        auxB = new Stack<string>();

        moves = 0;

        for (int i = 0; i < currentLevel.Start.Count; i++)
        {
            mainStack.Push(currentLevel.Start[i]);
        }

        return GetState();
    }

    public StackGameState Move(string from, string to)
    {
        moves++;

        Stack<string> source = GetStack(from);
        Stack<string> destination = GetStack(to);

        string value = source.Pop();
        destination.Push(value);

        return GetState();
    }

    private Stack<string> GetStack(string name)
    {
        if (name == "MAIN") return mainStack;
        if (name == "AUX_A") return auxA;
        if (name == "AUX_B") return auxB;

        throw new Exception("Invalid stack name");
    }

    private StackGameState GetState()
    {
        bool solved = true;

        List<string> mainItems = mainStack.GetItems();
        List<string> targetItems = currentLevel.Target;

        if (mainItems.Count != targetItems.Count)
        {
            solved = false;
        }
        else
        {
            for (int i = 0; i < mainItems.Count; i++)
            {
                if (mainItems[i] != targetItems[i])
                {
                    solved = false;
                    break;
                }
            }
        }

        StackGameState state = new StackGameState();
        state.MainStack = mainStack.GetItems();
        state.AuxA = auxA.GetItems();
        state.AuxB = auxB.GetItems();
        state.Target = currentLevel.Target;
        state.Moves = moves;
        state.IsSolved = solved;

        return state;
    }
}
