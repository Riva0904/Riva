using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Riva.Api.Data;
using System.Data.SqlClient;

namespace Riva.Api.Controllers;

[ApiController]
[Route("api/admin/notifications")]
[Authorize(Roles = "Admin")]
public class NotificationsController : ControllerBase
{
    private readonly DatabaseConnection _db;
    private readonly ILogger<NotificationsController> _logger;

    public NotificationsController(DatabaseConnection db, ILogger<NotificationsController> logger)
    {
        _db     = db;
        _logger = logger;
    }

    private sealed record NotifItem(string Type, string Icon, string Title, string Message, DateTime Time);

    // GET /api/admin/notifications?hours=24
    [HttpGet]
    public async Task<IActionResult> Get([FromQuery] int hours = 24)
    {
        var since = DateTime.UtcNow.AddHours(-hours);
        var items = new List<NotifItem>();

        using var conn = await _db.GetOpenConnectionAsync();

        // New user registrations
        try
        {
            const string sql = @"
                SELECT TOP 20 Username, Email, CreatedAt
                FROM Users
                WHERE Role = 'User' AND CreatedAt >= @Since
                ORDER BY CreatedAt DESC";
            using var cmd = new SqlCommand(sql, conn);
            cmd.Parameters.AddWithValue("@Since", since);
            using var r = await cmd.ExecuteReaderAsync();
            while (await r.ReadAsync())
                items.Add(new("registration", "👤", "New user registered",
                    $"{r.GetString(0)} ({r.GetString(1)})", r.GetDateTime(2)));
        }
        catch (Exception ex) { _logger.LogError(ex, "Failed to load registration notifications"); }

        // Completed payments
        try
        {
            const string sql = @"
                SELECT TOP 20 p.Amount, p.TransactionDate, u.Username
                FROM Payments p
                LEFT JOIN Users u ON u.Id = p.UserId
                WHERE p.Status = 'Completed' AND p.TransactionDate >= @Since
                ORDER BY p.TransactionDate DESC";
            using var cmd = new SqlCommand(sql, conn);
            cmd.Parameters.AddWithValue("@Since", since);
            using var r = await cmd.ExecuteReaderAsync();
            while (await r.ReadAsync())
            {
                var user = r.IsDBNull(2) ? "Unknown" : r.GetString(2);
                items.Add(new("payment", "💰", "Payment completed",
                    $"₹{r.GetDecimal(0):0} from {user}", r.GetDateTime(1)));
            }
        }
        catch (Exception ex) { _logger.LogError(ex, "Failed to load payment notifications"); }

        // Admin security actions
        try
        {
            const string sql = @"
                SELECT TOP 10 a.Action, a.Details, a.Timestamp, u.Username
                FROM AdminActions a
                LEFT JOIN Users u ON u.Id = a.AdminUserId
                WHERE a.Timestamp >= @Since
                ORDER BY a.Timestamp DESC";
            using var cmd = new SqlCommand(sql, conn);
            cmd.Parameters.AddWithValue("@Since", since);
            using var r = await cmd.ExecuteReaderAsync();
            while (await r.ReadAsync())
            {
                var admin   = r.IsDBNull(3) ? "Admin" : r.GetString(3);
                var details = r.IsDBNull(1) ? "" : r.GetString(1);
                items.Add(new("security", "🔒", r.GetString(0),
                    string.IsNullOrEmpty(details) ? $"By {admin}" : details,
                    r.GetDateTime(2)));
            }
        }
        catch (Exception ex) { _logger.LogError(ex, "Failed to load security notifications"); }

        var sorted = items
            .OrderByDescending(n => n.Time)
            .Select((n, i) => new
            {
                id      = i + 1,
                type    = n.Type,
                icon    = n.Icon,
                title   = n.Title,
                message = n.Message,
                time    = n.Time.ToString("o"),
            })
            .ToList();

        return Ok(new { notifications = sorted, total = sorted.Count });
    }
}
