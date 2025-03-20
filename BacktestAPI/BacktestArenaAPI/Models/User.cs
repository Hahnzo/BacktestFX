using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace BacktestArenaAPI.Models
{
    public class User
    {
        [Key]
        public int Id { get; set; }

        [Required]
        [StringLength(50)]
        public string Username { get; set; }

        [Required]
        [EmailAddress]
        [StringLength(100)]
        public string Email { get; set; }

        [Required]
        public string PasswordHash { get; set; }

        public string? ProfilePicture { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public DateTime LastLogin { get; set; }

        // Navigation properties
        public virtual ICollection<Backtest> Backtests { get; set; }
    }
}
