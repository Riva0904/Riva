using System.Data.SqlClient;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Riva.Api.Data;

namespace Riva.Api.Controllers;

[ApiController]
[Route("postapi/[controller]")]
[AllowAnonymous]
public class BusinessController : ControllerBase
{
    private readonly DatabaseConnection _dbConnection;

    public BusinessController(DatabaseConnection dbConnection)
    {
        _dbConnection = dbConnection;
    }

    [HttpGet("payment-summary")]
    public async Task<IActionResult> GetPaymentSummary()
    {
        using var connection = await _dbConnection.GetOpenConnectionAsync();
        var paymentQuery = @"
SELECT
    SUM(CASE WHEN IsActive = 1 THEN 1 ELSE 0 END) AS ActiveUsers,
    SUM(CASE WHEN CreatedAt >= DATEADD(month, DATEDIFF(month, 0, GETUTCDATE()), 0) THEN 1 ELSE 0 END) AS NewThisMonth,
    SUM(CASE WHEN CreatedAt >= DATEADD(day, -30, GETUTCDATE()) THEN 1 ELSE 0 END) AS RecentTransactions,
    SUM(CASE WHEN IsActive = 0 THEN 1 ELSE 0 END) AS PendingInvoices,
    SUM(CASE WHEN Role = 'User' AND CreatedAt >= DATEADD(day, -14, GETUTCDATE()) THEN 1 ELSE 0 END) AS TrialUsers,
    AVG(CAST(DATEDIFF(day, CreatedAt, GETUTCDATE()) AS FLOAT)) AS AvgLifetimeDays
FROM Users;";
        using var command = new SqlCommand(paymentQuery, connection);
        using var reader = await command.ExecuteReaderAsync();
            if (!await reader.ReadAsync())
            {
                return Ok(new
                {
                    TotalRevenue = 0m,
                    RecentTransactions = 0,
                    PaidCustomers = 0,
                    PendingInvoices = 0,
                    LastUpdated = DateTime.UtcNow.ToString("o")
                });
            }

            var activeUsers = reader.IsDBNull(0) ? 0 : reader.GetInt32(0);
            var newThisMonth = reader.IsDBNull(1) ? 0 : reader.GetInt32(1);
            var recentTransactions = reader.IsDBNull(2) ? 0 : reader.GetInt32(2);
            var pendingInvoices = reader.IsDBNull(3) ? 0 : reader.GetInt32(3);
            var trialUsers = reader.IsDBNull(4) ? 0 : reader.GetInt32(4);
            var avgLifetimeDays = reader.IsDBNull(5) ? 0.0 : reader.GetDouble(5);

            var summary = new
            {
                TotalRevenue = Math.Round(activeUsers * 19.99m, 2),
                RecentTransactions = recentTransactions,
                PaidCustomers = activeUsers,
                PendingInvoices = pendingInvoices,
                LastUpdated = DateTime.UtcNow.ToString("o"),
                ActiveUsers = activeUsers,
                NewThisMonth = newThisMonth,
                TrialUsers = trialUsers,
                AvgLifetimeDays = (int)Math.Round(avgLifetimeDays)
            };

            return Ok(summary);
    }

    [HttpGet("subscriber-overview")]
    public async Task<IActionResult> GetSubscriberOverview()
    {
        using var connection = await _dbConnection.GetOpenConnectionAsync();
        var subscriberQuery = @"
SELECT
    COUNT(*) AS TotalUsers,
    SUM(CASE WHEN IsActive = 1 THEN 1 ELSE 0 END) AS ActiveSubscribers,
    SUM(CASE WHEN CreatedAt >= DATEADD(month, DATEDIFF(month, 0, GETUTCDATE()), 0) THEN 1 ELSE 0 END) AS NewThisMonth,
    SUM(CASE WHEN IsActive = 0 THEN 1 ELSE 0 END) AS ChurnedUsers,
    SUM(CASE WHEN Role = 'User' AND CreatedAt >= DATEADD(day, -14, GETUTCDATE()) THEN 1 ELSE 0 END) AS TrialUsers,
    AVG(CAST(DATEDIFF(day, CreatedAt, GETUTCDATE()) AS FLOAT)) AS AvgLifetimeDays
FROM Users;";
        using var command = new SqlCommand(subscriberQuery, connection);
        using var reader = await command.ExecuteReaderAsync();
            if (!await reader.ReadAsync())
            {
                return Ok(new
                {
                    ActiveSubscribers = 0,
                    NewThisMonth = 0,
                    ChurnRate = 0.0,
                    TrialUsers = 0,
                    AvgLifetimeDays = 0
                });
            }

            var totalUsers = reader.IsDBNull(0) ? 0 : reader.GetInt32(0);
            var activeSubscribers = reader.IsDBNull(1) ? 0 : reader.GetInt32(1);
            var newThisMonth = reader.IsDBNull(2) ? 0 : reader.GetInt32(2);
            var churnedUsers = reader.IsDBNull(3) ? 0 : reader.GetInt32(3);
            var trialUsers = reader.IsDBNull(4) ? 0 : reader.GetInt32(4);
            var avgLifetimeDays = reader.IsDBNull(5) ? 0.0 : reader.GetDouble(5);

            var overview = new
            {
                ActiveSubscribers = activeSubscribers,
                NewThisMonth = newThisMonth,
                ChurnRate = totalUsers > 0 ? Math.Round((double)churnedUsers / totalUsers * 100.0, 1) : 0.0,
                TrialUsers = trialUsers,
                AvgLifetimeDays = (int)Math.Round(avgLifetimeDays)
            };

            return Ok(overview);
    }
}
