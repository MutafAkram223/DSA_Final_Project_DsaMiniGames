public class NodeDto
{
    public string Id { get; set; }
    public string Label { get; set; }

    // Here, x and y represents placement of Node in UI. So, Mam it is not used in backend dijsktra algorithm
    public double X { get; set; }
    public double Y { get; set; }
}