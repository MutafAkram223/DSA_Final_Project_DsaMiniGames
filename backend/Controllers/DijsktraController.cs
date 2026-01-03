using Microsoft.AspNetCore.Mvc;

[ApiController]
[Route("api/dijkstra")]
public class DijkstraController : ControllerBase
{
    private static readonly DijkstraService service = new DijkstraService();

    [HttpPost("compute")]
    public ActionResult<ComputeResult> Compute([FromBody] ComputeRequest request)
    {
        if (request == null || request.Nodes == null || request.Edges == null)
        {
            return BadRequest();
        }

        var result = service.Compute(request);
        return Ok(result);
    }
}
