using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using BacktestArenaAPI.Data;
using BacktestArenaAPI.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace BacktestArenaAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class MarketDataController : Controller
    {
        private readonly ApplicationDbContext _context;
        public MarketDataController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpGet("symbols")]
        public async Task<ActionResult<IEnumerable<string>>> GetSymbols()
        {
            return await _context.MarketData
                .Select(m => m.Symbol)
                .Distinct()
                .ToListAsync();
        }

        [HttpGet("timeframes")]
        public async Task<ActionResult<IEnumerable<string>>> GetTimeframes()
        {
            return await _context.MarketData
                .Select(m => m.Timeframe)
                .Distinct()
                .ToListAsync();
        }

        [HttpGet("{symbol}/{timeframe}")]
        public async Task<ActionResult<IEnumerable<MarketData>>> GetMarketData(
            string symbol,
            string timeframe,
            [FromQuery] DateTime? from = null,
            [FromQuery] DateTime? to = null)
        {
            var query = _context.MarketData
                .Where(m => m.Symbol == symbol && m.Timeframe == timeframe);

            if (from.HasValue)
            {
                query = query.Where(m => m.Timestamp >= from.Value);
            }

            if (to.HasValue)
            {
                query = query.Where(m => m.Timestamp <= to.Value);
            }

            return await query.OrderBy(m => m.Timestamp).ToListAsync();
        }

        [HttpPost("import")]
        [Authorize(Roles = "Admin")] // Only admins can import market data
        public async Task<ActionResult> ImportMarketData([FromBody] List<MarketData> marketDataList)
        {
            try
            {
                foreach (var data in marketDataList)
                {
                    // Check if data already exists
                    var existingData = await _context.MarketData.FirstOrDefaultAsync(
                        m => m.Symbol == data.Symbol &&
                             m.Timeframe == data.Timeframe &&
                             m.Timestamp == data.Timestamp);

                    if (existingData == null)
                    {
                        _context.MarketData.Add(data);
                    }
                    else
                    {
                        // Update existing data
                        existingData.Open = data.Open;
                        existingData.High = data.High;
                        existingData.Low = data.Low;
                        existingData.Close = data.Close;
                        existingData.Volume = data.Volume;
                    }
                }

                await _context.SaveChangesAsync();
                return Ok(new { message = $"Successfully imported {marketDataList.Count} data points" });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }
    }
}
