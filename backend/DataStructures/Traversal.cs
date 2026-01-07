using System.Collections.Generic;

public static class Traversal
{
    public static List<string> PreOrder(List<string?> tree)
    {
        List<string> result = new List<string>();

        void Visit(int index)
        {
            if (index >= tree.Count || tree[index] == null)
                return;

            result.Add(tree[index]!);
            Visit(2 * index + 1);
            Visit(2 * index + 2);
        }

        Visit(0);
        return result;
    }

    public static List<string> InOrder(List<string?> tree)
    {
        List<string> result = new List<string>();

        void Visit(int index)
        {
            if (index >= tree.Count || tree[index] == null)
                return;

            Visit(2 * index + 1);
            result.Add(tree[index]!);
            Visit(2 * index + 2);
        }

        Visit(0);
        return result;
    }

    public static List<string> PostOrder(List<string?> tree)
    {
        List<string> result = new List<string>();

        void Visit(int index)
        {
            if (index >= tree.Count || tree[index] == null)
                return;

            Visit(2 * index + 1);
            Visit(2 * index + 2);
            result.Add(tree[index]!);
        }

        Visit(0);
        return result;
    }
}
