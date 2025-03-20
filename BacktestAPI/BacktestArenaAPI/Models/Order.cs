using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace BacktestArenaAPI.Models
{
    public enum OrderType
    {
        Market,
        Limit,
        Stop,
        StopLimit
    }

    public enum OrderSide
    {
        Buy,
        Sell
    }

    public enum OrderStatus
    {
        Pending,
        Filled,
        Cancelled,
        Rejected
    }

    public class Order
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public OrderType Type { get; set; }

        [Required]
        public OrderSide Side { get; set; }

        [Required]
        public OrderStatus Status { get; set; }

        [Required]
        [Column(TypeName = "decimal(18,8)")]
        public decimal Price { get; set; }

        [Column(TypeName = "decimal(18,8)")]
        public decimal? StopPrice { get; set; }

        [Required]
        [Column(TypeName = "decimal(18,8)")]
        public decimal Quantity { get; set; }

        [Column(TypeName = "decimal(18,8)")]
        public decimal? TakeProfit { get; set; }

        [Column(TypeName = "decimal(18,8)")]
        public decimal? StopLoss { get; set; }

        [Required]
        public DateTime EntryTime { get; set; }

        public DateTime? ExitTime { get; set; }

        [Column(TypeName = "decimal(18,8)")]
        public decimal? ExitPrice { get; set; }

        [Column(TypeName = "decimal(18,8)")]
        public decimal? PnL { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

        // Foreign keys
        public int BacktestId { get; set; }
        [ForeignKey("BacktestId")]
        public virtual Backtest Backtest { get; set; }
    }
}
