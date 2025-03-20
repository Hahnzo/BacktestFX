using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;

namespace BacktestArenaAPI.Models
{
    public class MarketData
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public string Symbol { get; set; }

        [Required]
        public string Timeframe { get; set; }

        [Required]
        public DateTime Timestamp { get; set; }

        [Required]
        [Column(TypeName = "decimal(18,8)")]
        public decimal Open { get; set; }

        [Required]
        [Column(TypeName = "decimal(18,8)")]
        public decimal High { get; set; }

        [Required]
        [Column(TypeName = "decimal(18,8)")]
        public decimal Low { get; set; }

        [Required]
        [Column(TypeName = "decimal(18,8)")]
        public decimal Close { get; set; }

        [Required]
        public long Volume { get; set; }

        // Composite index will be created for Symbol + Timeframe + Timestamp
    }
}
