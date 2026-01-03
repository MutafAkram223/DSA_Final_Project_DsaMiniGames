using Microsoft.AspNetCore.Mvc;

// Controller connects frontend with service

[ApiController]
[Route("api/search")]
public class SearchController : ControllerBase
{
    private static SearchGameService game = new SearchGameService();

    [HttpPost("start/{levelId}")]
    public SearchGameState Start(int levelId)
    {
        return game.StartLevel(levelId);
    }

    [HttpPost("click/{index}")]
    public SearchGameState Click(int index)
    {
        return game.ClickBox(index);
    }
}
