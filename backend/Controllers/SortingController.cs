using Microsoft.AspNetCore.Mvc;

[ApiController]
[Route("api/sorting")]
public class SortingController : ControllerBase
{
    private readonly SortingService service;

    public SortingController(SortingService service)
    {
        this.service = service;
    }

    [HttpPost("validate")]
    public SortingResult Validate([FromBody] SortingRequest request)
    {
        return service.Validate(request);
    }
}
