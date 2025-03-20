using Microsoft.EntityFrameworkCore;
using BacktestArenaAPI.Models;

namespace BacktestArenaAPI.Data
{
    public class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
           : base(options){}

        public DbSet<User> Users { get; set; }
        public DbSet<Backtest> Backtests { get; set; }
        public DbSet<Order> Orders { get; set; }
        public DbSet<MarketData> MarketData { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Configure composite index for Market Data
            modelBuilder.Entity<MarketData>()
                .HasIndex(m => new { m.Symbol, m.Timeframe, m.Timestamp })
                .IsUnique();

            // Configure relationships
            modelBuilder.Entity<User>()
                .HasMany(u => u.Backtests)
                .WithOne(b => b.User)
                .HasForeignKey(b => b.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<Backtest>()
                .HasMany(b => b.Orders)
                .WithOne(o => o.Backtest)
                .HasForeignKey(o => o.BacktestId)
                .OnDelete(DeleteBehavior.Cascade);
        }
    }
}
