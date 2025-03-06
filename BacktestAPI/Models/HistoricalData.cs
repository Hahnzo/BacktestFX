namespace BacktestAPI.Models
{
    public class HistoricalData
    {
        public int Id { get; set; }
        public int AssetId { get; set; }
        public Asset Asset { get; set; }
        public DateTime Timestamp { get; set; }
        public decimal Open { get; set; }
        public decimal High { get; set; }
        public decimal Low { get; set; }
        public decimal Close { get; set; }
        public decimal Volume { get; set; }
    }
}
