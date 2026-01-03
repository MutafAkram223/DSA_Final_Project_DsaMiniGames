namespace DSAGamePlatform.Models.Hashing
{
    public class HashValidationResult
    {
        public bool IsCorrect { get; set; }
        public int ExpectedIndex { get; set; }
        public string Message { get; set; }
    }
}