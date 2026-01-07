using Microsoft.AspNetCore.Mvc;
using Backend.Services;
using Backend.Models.Queue;

namespace Backend.Controllers
{
    [ApiController]
    [Route("api/queue")]
    public class QueueController : ControllerBase
    {
        private QueueService queueService;

        public QueueController(QueueService service)
        {
            queueService = service;
        }

        [HttpGet]
        public IActionResult GetQueue()
        {
            return Ok(queueService.GetState());
        }

        [HttpPost("enqueue")]
        public IActionResult Enqueue([FromBody] PassengerDto passenger)
        {
            QueueState state = queueService.Enqueue(passenger);
            return Ok(state);
        }

        [HttpPost("dequeue")]
        public IActionResult Dequeue()
        {
            var result = queueService.Dequeue();
            return Ok(new
            {
                dequeued = result.Item1,
                state = result.Item2
            });
        }

        [HttpPost("clear")]
        public IActionResult Clear()
        {
            return Ok(queueService.Clear());
        }
    }
}
