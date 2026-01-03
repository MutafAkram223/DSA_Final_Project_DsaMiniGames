using System.Collections.Generic;
using DSAGamePlatform.Models.Hashing;

namespace DSAGamePlatform.DataStructures
{
    public class HashingAlgorithm
    {
        public HashValidationResult ValidateMove(HashValidationRequest request)
        {
            int targetIndex = request.GuestId % request.TableSize;
            int expectedIndex = targetIndex;

            bool isCorrect = false;
            string message = "";

            // DIRECT HASHING & CHAINING
            if (request.Mode == "DIRECT" || request.Mode == "CHAIN")
            {
                expectedIndex = targetIndex;

                if (request.ClickedIndex == expectedIndex)
                {
                    isCorrect = true;
                    message = "Correct!";
                }
                else
                {
                    isCorrect = false;

                    if (request.Mode == "CHAIN")
                    {
                        message = "Chain Mode: Always select the base Hash Index!";
                    }
                    else
                    {
                        message = "Wrong! " + request.GuestId + " % " +
                                  request.TableSize + " = " + targetIndex;
                    }
                }
            }

            // LINEAR PROBING & REHASHING
            else if (request.Mode == "LINEAR" || request.Mode == "REHASH")
            {
                int probe = targetIndex;
                int count = 0;

                while (request.OccupiedIndices.Contains(probe) &&
                       count < request.TableSize)
                {
                    probe = (probe + 1) % request.TableSize;
                    count++;
                }

                expectedIndex = probe;

                if (request.ClickedIndex == expectedIndex)
                {
                    isCorrect = true;
                    message = "Correct!";
                }
                else
                {
                    isCorrect = false;

                    if (request.ClickedIndex == targetIndex &&
                        request.OccupiedIndices.Contains(targetIndex))
                    {
                        message = "Occupied! Check Next (+1)";
                    }
                    else if (request.ClickedIndex == 0 &&
                             targetIndex == request.TableSize - 1)
                    {
                        message = "Room 0 is the wrap-around!";
                    }
                    else
                    {
                        message = "Incorrect Linear Probe.";
                    }
                }
            }

            HashValidationResult result = new HashValidationResult();
            result.IsCorrect = isCorrect;
            result.ExpectedIndex = expectedIndex;
            result.Message = message;

            return result;
        }
    }
}
