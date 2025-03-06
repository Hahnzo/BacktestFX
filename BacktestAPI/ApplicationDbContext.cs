using BacktestAPI.Models;
using Microsoft.EntityFrameworkCore;

namespace BacktestAPI
{
    public class ApplicationDbContext: DbContext
    {
        public DbSet<AssetClass> AssetClasses { get; set; }
        public DbSet<Asset> Assets { get; set; }
        public DbSet<HistoricalData> HistoricalData { get; set; }

        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options)
        {
        }
    }
}
