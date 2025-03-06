using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace BacktestAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class HistoricalDataController : Controller
    {
        private readonly ApplicationDbContext _context;

        public HistoricalDataController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpGet("{assetId}")]
        public async Task<IActionResult> GetHistoricalData(int assetId)
        {
            var data = await _context.HistoricalData
                .Where(d => d.AssetId == assetId)
                .ToListAsync();
            return Ok(data);
        }
    }
}
