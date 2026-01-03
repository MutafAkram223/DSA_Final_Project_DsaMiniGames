using Microsoft.AspNetCore.Mvc;

namespace backend.Controllers
{
    [ApiController]
    [Route("api/stack")]
    public class StackController : ControllerBase
    {
        private static StackGameService game = new StackGameService();

        [HttpPost("start/{levelId}")]
        public StackGameState Start(int levelId)
        {
            return game.StartLevel(levelId);
        }

        [HttpPost("move")]
        public StackGameState Move([FromBody] MoveRequest request)
        {
            return game.Move(request.From, request.To);
        }
    }

    public class MoveRequest
    {
        public string From { get; set; }
        public string To { get; set; }
    }
}
