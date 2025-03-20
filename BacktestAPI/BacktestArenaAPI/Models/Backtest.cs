using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace BacktestArenaAPI.Models
{
    public class Backtest
    {
        [Key]
        public int Id { get; set; }

        [Required]
        [StringLength(100)]
        public string Name { get; set; }

        [StringLength(500)]
        public string Description { get; set; }

        [Required]
        public string Symbol { get; set; }

        [Required]
        public string Timeframe { get; set; }

        [Required]
        public DateTime StartDate { get; set; }

        [Required]
        public DateTime EndDate { get; set; }

        [Column(TypeName = "decimal(18,8)")]
        public decimal InitialBalance { get; set; } = 10000m;

        [Column(TypeName = "decimal(18,8)")]
        public decimal FinalBalance { get; set; }

        [Column(TypeName = "decimal(18,8)")]
        public decimal TotalPnL { get; set; }

        public int TotalTrades { get; set; }

        public int WinningTrades { get; set; }

        public int LosingTrades { get; set; }

        [Column(TypeName = "decimal(18,8)")]
        public decimal WinRate { get; set; }

        [Column(TypeName = "decimal(18,8)")]
        public decimal AverageProfit { get; set; }

        [Column(TypeName = "decimal(18,8)")]
        public decimal AverageLoss { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

        // Foreign keys
        public int UserId { get; set; }
        [ForeignKey("UserId")]
        public virtual User User { get; set; }

        // Navigation properties
        public virtual ICollection<Order> Orders { get; set; }
    }
}
