using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using BacktestArenaAPI.Data;
using BacktestArenaAPI.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;

namespace BacktestArenaAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class BacktestController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public BacktestController(ApplicationDbContext context)
        {
            _context = context;
        }

        // GET: api/Backtest
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Backtest>>> GetBacktests()
        {
            int userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier).Value);
            return await _context.Backtests.Where(b => b.UserId == userId).ToListAsync();
        }

        // GET: api/Backtest/5
        [HttpGet("{id}")]
        public async Task<ActionResult<Backtest>> GetBacktest(int id)
        {
            int userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier).Value);

            var backtest = await _context.Backtests
                .Include(b => b.Orders)
                .FirstOrDefaultAsync(b => b.Id == id && b.UserId == userId);

            if (backtest == null)
            {
                return NotFound();
            }

            return backtest;
        }

        // POST: api/Backtest
        [HttpPost]
        public async Task<ActionResult<Backtest>> CreateBacktest(Backtest backtest)
        {
            int userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier).Value);

            backtest.UserId = userId;
            backtest.CreatedAt = DateTime.UtcNow;
            backtest.UpdatedAt = DateTime.UtcNow;

            _context.Backtests.Add(backtest);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetBacktest), new { id = backtest.Id }, backtest);
        }

        // PUT: api/Backtest/5
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateBacktest(int id, Backtest backtest)
        {
            int userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier).Value);

            if (id != backtest.Id)
            {
                return BadRequest();
            }

            var existingBacktest = await _context.Backtests
                .FirstOrDefaultAsync(b => b.Id == id && b.UserId == userId);

            if (existingBacktest == null)
            {
                return NotFound();
            }

            existingBacktest.Name = backtest.Name;
            existingBacktest.Description = backtest.Description;
            existingBacktest.Symbol = backtest.Symbol;
            existingBacktest.Timeframe = backtest.Timeframe;
            existingBacktest.StartDate = backtest.StartDate;
            existingBacktest.EndDate = backtest.EndDate;
            existingBacktest.InitialBalance = backtest.InitialBalance;
            existingBacktest.FinalBalance = backtest.FinalBalance;
            existingBacktest.TotalPnL = backtest.TotalPnL;
            existingBacktest.TotalTrades = backtest.TotalTrades;
            existingBacktest.WinningTrades = backtest.WinningTrades;
            existingBacktest.LosingTrades = backtest.LosingTrades;
            existingBacktest.WinRate = backtest.WinRate;
            existingBacktest.AverageProfit = backtest.AverageProfit;
            existingBacktest.AverageLoss = backtest.AverageLoss;
            existingBacktest.UpdatedAt = DateTime.UtcNow;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!BacktestExists(id))
                {
                    return NotFound();
                }
                else
                {
                    throw;
                }
            }

            return NoContent();
        }

        // DELETE: api/Backtest/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteBacktest(int id)
        {
            int userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier).Value);

            var backtest = await _context.Backtests
                .FirstOrDefaultAsync(b => b.Id == id && b.UserId == userId);

            if (backtest == null)
            {
                return NotFound();
            }

            _context.Backtests.Remove(backtest);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool BacktestExists(int id)
        {
            return _context.Backtests.Any(e => e.Id == id);
        }

        // POST: api/Backtest/5/Order
        [HttpPost("{backtestId}/Order")]
        public async Task<ActionResult<Order>> AddOrder(int backtestId, Order order)
        {
            int userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier).Value);

            var backtest = await _context.Backtests
                .FirstOrDefaultAsync(b => b.Id == backtestId && b.UserId == userId);

            if (backtest == null)
            {
                return NotFound("Backtest not found");
            }

            order.BacktestId = backtestId;
            order.CreatedAt = DateTime.UtcNow;
            order.UpdatedAt = DateTime.UtcNow;

            _context.Orders.Add(order);
            await _context.SaveChangesAsync();

            // Recalculate backtest statistics
            await UpdateBacktestStatistics(backtestId);

            return CreatedAtAction("GetOrder", new { backtestId, id = order.Id }, order);
        }

        // GET: api/Backtest/5/Order/1
        [HttpGet("{backtestId}/Order/{id}")]
        public async Task<ActionResult<Order>> GetOrder(int backtestId, int id)
        {
            int userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier).Value);

            var backtest = await _context.Backtests
                .FirstOrDefaultAsync(b => b.Id == backtestId && b.UserId == userId);

            if (backtest == null)
            {
                return NotFound("Backtest not found");
            }

            var order = await _context.Orders
                .FirstOrDefaultAsync(o => o.Id == id && o.BacktestId == backtestId);

            if (order == null)
            {
                return NotFound("Order not found");
            }

            return order;
        }

        // PUT: api/Backtest/5/Order/1
        [HttpPut("{backtestId}/Order/{id}")]
        public async Task<IActionResult> UpdateOrder(int backtestId, int id, Order order)
        {
            int userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier).Value);

            if (id != order.Id || backtestId != order.BacktestId)
            {
                return BadRequest();
            }

            var backtest = await _context.Backtests
                .FirstOrDefaultAsync(b => b.Id == backtestId && b.UserId == userId);

            if (backtest == null)
            {
                return NotFound("Backtest not found");
            }

            var existingOrder = await _context.Orders
                .FirstOrDefaultAsync(o => o.Id == id && o.BacktestId == backtestId);

            if (existingOrder == null)
            {
                return NotFound("Order not found");
            }

            existingOrder.Type = order.Type;
            existingOrder.Side = order.Side;
            existingOrder.Status = order.Status;
            existingOrder.Price = order.Price;
            existingOrder.StopPrice = order.StopPrice;
            existingOrder.Quantity = order.Quantity;
            existingOrder.TakeProfit = order.TakeProfit;
            existingOrder.StopLoss = order.StopLoss;
            existingOrder.EntryTime = order.EntryTime;
            existingOrder.ExitTime = order.ExitTime;
            existingOrder.ExitPrice = order.ExitPrice;
            existingOrder.PnL = order.PnL;
            existingOrder.UpdatedAt = DateTime.UtcNow;

            try
            {
                await _context.SaveChangesAsync();

                // Recalculate backtest statistics
                await UpdateBacktestStatistics(backtestId);
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!OrderExists(id))
                {
                    return NotFound();
                }
                else
                {
                    throw;
                }
            }

            return NoContent();
        }

        // DELETE: api/Backtest/5/Order/1
        [HttpDelete("{backtestId}/Order/{id}")]
        public async Task<IActionResult> DeleteOrder(int backtestId, int id)
        {
            int userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier).Value);

            var backtest = await _context.Backtests
                .FirstOrDefaultAsync(b => b.Id == backtestId && b.UserId == userId);

            if (backtest == null)
            {
                return NotFound("Backtest not found");
            }

            var order = await _context.Orders
                .FirstOrDefaultAsync(o => o.Id == id && o.BacktestId == backtestId);

            if (order == null)
            {
                return NotFound("Order not found");
            }

            _context.Orders.Remove(order);
            await _context.SaveChangesAsync();

            // Recalculate backtest statistics
            await UpdateBacktestStatistics(backtestId);

            return NoContent();
        }

        private bool OrderExists(int id)
        {
            return _context.Orders.Any(e => e.Id == id);
        }

        private async Task UpdateBacktestStatistics(int backtestId)
        {
            var backtest = await _context.Backtests
                .Include(b => b.Orders)
                .FirstOrDefaultAsync(b => b.Id == backtestId);

            if (backtest == null)
            {
                return;
            }

            var closedOrders = backtest.Orders
                .Where(o => o.Status == OrderStatus.Filled && o.ExitTime.HasValue && o.PnL.HasValue)
                .ToList();

            // Calculate statistics
            backtest.TotalTrades = closedOrders.Count;
            backtest.WinningTrades = closedOrders.Count(o => o.PnL > 0);
            backtest.LosingTrades = closedOrders.Count(o => o.PnL <= 0);
            backtest.TotalPnL = closedOrders.Sum(o => o.PnL ?? 0);
            backtest.FinalBalance = backtest.InitialBalance + backtest.TotalPnL;

            if (backtest.TotalTrades > 0)
            {
                backtest.WinRate = (decimal)backtest.WinningTrades / backtest.TotalTrades * 100;

                var winningOrders = closedOrders.Where(o => o.PnL > 0).ToList();
                var losingOrders = closedOrders.Where(o => o.PnL <= 0).ToList();

                backtest.AverageProfit = winningOrders.Any() ? winningOrders.Average(o => o.PnL ?? 0) : 0;
                backtest.AverageLoss = losingOrders.Any() ? losingOrders.Average(o => o.PnL ?? 0) : 0;
            }
            else
            {
                backtest.WinRate = 0;
                backtest.AverageProfit = 0;
                backtest.AverageLoss = 0;
            }

            backtest.UpdatedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();
        }
    }
}
