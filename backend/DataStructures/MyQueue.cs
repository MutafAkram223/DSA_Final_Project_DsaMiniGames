using System.Collections.Generic;

namespace Backend.DataStructures
{
    public class QueueNode<T>
    {
        public T Data;
        public QueueNode<T>? Next;

        public QueueNode(T data)
        {
            Data = data;
            Next = null;
        }
    }

    public class MyQueue<T>
    {
        private QueueNode<T>? front;
        private QueueNode<T>? rear;
        private int count;

        public int MaxSize { get; set; } = 100;

        public MyQueue()
        {
            front = null;
            rear = null;
            count = 0;
        }

        public bool IsEmpty()
        {
            return count == 0;
        }

        public bool IsFull()
        {
            return count >= MaxSize;
        }

        public int Count()
        {
            return count;
        }

        public bool Enqueue(T value)
        {
            if (IsFull())
            {
                return false;
            }

            QueueNode<T> newNode = new QueueNode<T>(value);

            if (rear == null)
            {
                front = newNode;
                rear = newNode;
            }
            else
            {
                rear.Next = newNode;
                rear = newNode;
            }

            count++;
            return true;
        }

        public T? Dequeue()
        {
            if (IsEmpty())
            {
                return default;
            }

            QueueNode<T> temp = front!;
            front = front!.Next;

            if (front == null)
            {
                rear = null;
            }

            count--;
            return temp.Data;
        }

        public List<T> ToList()
        {
            List<T> result = new List<T>();
            QueueNode<T>? current = front;

            while (current != null)
            {
                result.Add(current.Data);
                current = current.Next;
            }

            return result;
        }

        public void Clear()
        {
            front = null;
            rear = null;
            count = 0;
        }
    }
}
