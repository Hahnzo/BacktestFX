namespace BacktestAPI.Models
{
    public class Asset
    {
        public int Id { get; set; }
        public int AssetClassId { get; set; }
        public AssetClass AssetClass { get; set; }
        public string Symbol { get; set; }
        public string Name { get; set; }
    }
}
