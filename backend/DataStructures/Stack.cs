public class Stack<T>
{
    private List<T> items;

    public Stack()
    {
        items = new List<T>();
    }

    public void Push(T value)
    {
        items.Add(value);
    }

    public T Pop()
    {
        if (items.Count == 0)
        {
            throw new Exception("Stack is empty");
        }

        int index = items.Count - 1;
        T value = items[index];
        items.RemoveAt(index);

        return value;
    }

    public List<T> GetItems()
    {
        List<T> copy = new List<T>();

        for (int i = 0; i < items.Count; i++)
        {
            copy.Add(items[i]);
        }

        return copy;
    }
}
