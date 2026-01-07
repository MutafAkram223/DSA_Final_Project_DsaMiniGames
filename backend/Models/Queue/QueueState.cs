using System.Collections.Generic;

namespace Backend.Models.Queue
{
    public class QueueState
    {
        public List<PassengerDto> Items { get; set; } = new List<PassengerDto>();
    }
}
