using Backend.DataStructures;
using Backend.Models.Queue;
using System;

namespace Backend.Services
{
    public class QueueService
    {
        private MyQueue<PassengerDto> myQueue;

        public QueueService()
        {
            myQueue = new MyQueue<PassengerDto>();
            myQueue.MaxSize = 200;
        }

        public QueueState GetState()
        {
            QueueState state = new QueueState();
            state.Items = myQueue.ToList();
            return state;
        }

        public QueueState Enqueue(PassengerDto passenger)
        {
            if (passenger.Id == 0)
            {
                passenger.Id = DateTime.Now.Ticks;
            }

            myQueue.Enqueue(passenger);
            return GetState();
        }

        public (PassengerDto?, QueueState) Dequeue()
        {
            PassengerDto? removed = myQueue.Dequeue();
            QueueState state = GetState();
            return (removed, state);
        }

        public QueueState Clear()
        {
            myQueue.Clear();
            return GetState();
        }
    }
}
