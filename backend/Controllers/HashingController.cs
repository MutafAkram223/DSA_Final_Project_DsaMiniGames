using Microsoft.AspNetCore.Mvc;
using DSAGamePlatform.DataStructures;
using DSAGamePlatform.Models.Hashing;

namespace DSAGamePlatform.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class HashingController : ControllerBase
    {
        private readonly HashingAlgorithm _hashingAlgo;

        public HashingController()
        {
            _hashingAlgo = new HashingAlgorithm();
        }

        [HttpPost("validate")]
        public IActionResult ValidateMove([FromBody] HashValidationRequest request)
        {
            var result = _hashingAlgo.ValidateMove(request);
            return Ok(result);
        }
    }
}