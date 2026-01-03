using System;
using System.Collections.Generic;
using Backend.Models.Tree;

public class TreeService
{
    public TreeTraversalResult Validate(TreeArrayRequest request)
    {
        var result = new TreeTraversalResult();

        if (request == null)
        {
            result.IsCorrect = false;
            result.Message = "Request is null";
            result.ExpectedSequence = new List<string>();
            return result;
        }
 
        var type = (request.TraversalType ?? "").Trim().ToUpperInvariant();

        List<string> expected;

        if (type == "PRE")
        {
            expected = Traversal.PreOrder(request.TreeArray);
        }
        else if (type == "IN")
        {
            expected = Traversal.InOrder(request.TreeArray);
        }
        else if (type == "POST")
        {
            expected = Traversal.PostOrder(request.TreeArray);
        }
        else
        {
            expected = Traversal.PreOrder(request.TreeArray);
        }

        result.ExpectedSequence = expected;
        result.IsCorrect = CompareSequences(expected, request.UserSequence);

        result.Message = result.IsCorrect ? "Match" : "Sequence differs";
        return result;
    }

    private bool CompareSequences(List<string> expected, List<string> user)
    {
        if (expected == null || user == null)
            return false;

        if (expected.Count != user.Count)
            return false;

        for (int i = 0; i < expected.Count; i++)
        {
            if (!string.Equals(expected[i], user[i], StringComparison.OrdinalIgnoreCase))
            {
                return false;
            }
        }

        return true;
    }
}
