using Microsoft.AspNetCore.Mvc;
using Backend.Models.Tree;  

[ApiController]
[Route("api/tree")]
public class TreeController : ControllerBase
{
    private readonly TreeService _service;

    public TreeController()
    {
        _service = new TreeService();
    }

    [HttpPost("validate")]
    public ActionResult<TreeTraversalResult> Validate([FromBody] TreeArrayRequest request)
    {
        if (request == null)
        {
            return BadRequest("Request body is required.");
        }

        if (request.TreeArray == null || request.TreeArray.Count == 0)
        {
            return BadRequest("TreeArray must be provided and non-empty.");
        }

        var result = _service.Validate(request);
        return Ok(result);
    }
}
