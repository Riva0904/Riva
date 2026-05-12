using System.Data;
using System.Data.SqlClient;
using Riva.Api.Data;
using Riva.Domain.Entity;
using Riva.Service.Repository;

namespace Riva.Api.Repository;

public class SubscriptionRepository : ISubscriptionRepository
{
    private readonly DatabaseConnection _db;
    public SubscriptionRepository(DatabaseConnection db) => _db = db;

    // ── Active subscription ───────────────────────────────────────────

    public async Task<UserSubscription?> GetActiveSubscriptionAsync(int userId)
    {
        const string sql = @"
            SELECT TOP 1 Id, UserId, PlanType, BillingCycle, Status, StartDate, EndDate,
                         Amount, RazorpayPaymentId, CreatedAt
            FROM UserSubscriptions
            WHERE UserId = @UserId AND Status = 'Active' AND EndDate > GETUTCDATE()
            ORDER BY EndDate DESC";

        using var conn = await _db.GetOpenConnectionAsync();
        using var cmd  = new SqlCommand(sql, conn);
        cmd.Parameters.AddWithValue("@UserId", userId);
        using var r = await cmd.ExecuteReaderAsync();
        return await r.ReadAsync() ? MapSub(r) : null;
    }

    public async Task<int> CreateSubscriptionAsync(UserSubscription sub)
    {
        const string sql = @"
            INSERT INTO UserSubscriptions
                (UserId, PlanType, BillingCycle, Status, StartDate, EndDate, Amount, RazorpayPaymentId, CreatedAt)
            OUTPUT INSERTED.Id
            VALUES (@UserId, @PlanType, @BillingCycle, @Status, @StartDate, @EndDate, @Amount, @RazorpayPaymentId, @CreatedAt)";

        using var conn = await _db.GetOpenConnectionAsync();
        using var cmd  = new SqlCommand(sql, conn);
        cmd.Parameters.AddWithValue("@UserId",            sub.UserId);
        cmd.Parameters.AddWithValue("@PlanType",          sub.PlanType);
        cmd.Parameters.AddWithValue("@BillingCycle",      sub.BillingCycle);
        cmd.Parameters.AddWithValue("@Status",            sub.Status);
        cmd.Parameters.AddWithValue("@StartDate",         sub.StartDate);
        cmd.Parameters.AddWithValue("@EndDate",           sub.EndDate);
        cmd.Parameters.AddWithValue("@Amount",            sub.Amount);
        cmd.Parameters.AddWithValue("@RazorpayPaymentId", (object?)sub.RazorpayPaymentId ?? DBNull.Value);
        cmd.Parameters.AddWithValue("@CreatedAt",         sub.CreatedAt);
        return Convert.ToInt32(await cmd.ExecuteScalarAsync());
    }

    public async Task<IEnumerable<UserSubscription>> GetAllSubscriptionsAsync()
    {
        const string sql = @"
            SELECT Id, UserId, PlanType, BillingCycle, Status, StartDate, EndDate,
                   Amount, RazorpayPaymentId, CreatedAt
            FROM UserSubscriptions ORDER BY CreatedAt DESC";
        using var conn = await _db.GetOpenConnectionAsync();
        using var cmd  = new SqlCommand(sql, conn);
        using var r    = await cmd.ExecuteReaderAsync();
        var list = new List<UserSubscription>();
        while (await r.ReadAsync()) list.Add(MapSub(r));
        return list;
    }

    // ── Template purchases ────────────────────────────────────────────

    public async Task<bool> HasPurchasedTemplateAsync(int userId, int templateId)
    {
        const string sql = "SELECT COUNT(1) FROM TemplatePurchases WHERE UserId=@U AND TemplateId=@T";
        using var conn = await _db.GetOpenConnectionAsync();
        using var cmd  = new SqlCommand(sql, conn);
        cmd.Parameters.AddWithValue("@U", userId);
        cmd.Parameters.AddWithValue("@T", templateId);
        return Convert.ToInt32(await cmd.ExecuteScalarAsync()) > 0;
    }

    public async Task<int> CreatePurchaseAsync(TemplatePurchase p)
    {
        const string sql = @"
            INSERT INTO TemplatePurchases (UserId, TemplateId, Amount, RazorpayPaymentId, PurchasedAt)
            OUTPUT INSERTED.Id
            VALUES (@UserId, @TemplateId, @Amount, @RazorpayPaymentId, @PurchasedAt)";
        using var conn = await _db.GetOpenConnectionAsync();
        using var cmd  = new SqlCommand(sql, conn);
        cmd.Parameters.AddWithValue("@UserId",            p.UserId);
        cmd.Parameters.AddWithValue("@TemplateId",        p.TemplateId);
        cmd.Parameters.AddWithValue("@Amount",            p.Amount);
        cmd.Parameters.AddWithValue("@RazorpayPaymentId", (object?)p.RazorpayPaymentId ?? DBNull.Value);
        cmd.Parameters.AddWithValue("@PurchasedAt",       p.PurchasedAt);
        return Convert.ToInt32(await cmd.ExecuteScalarAsync());
    }

    public async Task<IEnumerable<TemplatePurchase>> GetUserPurchasesAsync(int userId)
    {
        const string sql = "SELECT Id,UserId,TemplateId,Amount,RazorpayPaymentId,PurchasedAt FROM TemplatePurchases WHERE UserId=@U";
        using var conn = await _db.GetOpenConnectionAsync();
        using var cmd  = new SqlCommand(sql, conn);
        cmd.Parameters.AddWithValue("@U", userId);
        using var r    = await cmd.ExecuteReaderAsync();
        var list = new List<TemplatePurchase>();
        while (await r.ReadAsync()) list.Add(new TemplatePurchase
        {
            Id                = r.GetInt32(0),
            UserId            = r.GetInt32(1),
            TemplateId        = r.GetInt32(2),
            Amount            = r.GetDecimal(3),
            RazorpayPaymentId = r.IsDBNull(4) ? null : r.GetString(4),
            PurchasedAt       = r.GetDateTime(5),
        });
        return list;
    }

    // ── Monthly pool ──────────────────────────────────────────────────

    public async Task<List<int>> GetMonthlyPoolIdsAsync(string planType)
    {
        const string sql = "SELECT TemplateId FROM MonthlyPlanPool WHERE PlanType=@P";
        using var conn = await _db.GetOpenConnectionAsync();
        using var cmd  = new SqlCommand(sql, conn);
        cmd.Parameters.AddWithValue("@P", planType);
        using var r    = await cmd.ExecuteReaderAsync();
        var ids = new List<int>();
        while (await r.ReadAsync()) ids.Add(r.GetInt32(0));
        return ids;
    }

    public async Task SetMonthlyPoolAsync(string planType, List<int> templateIds)
    {
        using var conn = await _db.GetOpenConnectionAsync();
        // Clear existing pool for this plan type
        using (var del = new SqlCommand("DELETE FROM MonthlyPlanPool WHERE PlanType=@P", conn))
        {
            del.Parameters.AddWithValue("@P", planType);
            await del.ExecuteNonQueryAsync();
        }
        // Insert new pool
        foreach (var tid in templateIds)
        {
            using var ins = new SqlCommand(
                "INSERT INTO MonthlyPlanPool (PlanType, TemplateId, AddedAt) VALUES (@P,@T,GETUTCDATE())", conn);
            ins.Parameters.AddWithValue("@P", planType);
            ins.Parameters.AddWithValue("@T", tid);
            await ins.ExecuteNonQueryAsync();
        }
    }

    public async Task<int> GetMonthlyQuotaAsync(string planType)
    {
        const string sql = "SELECT MonthlyQuota FROM PlanSettings WHERE PlanType = @P";
        using var conn = await _db.GetOpenConnectionAsync();
        using var cmd  = new SqlCommand(sql, conn);
        cmd.Parameters.AddWithValue("@P", planType);
        var result = await cmd.ExecuteScalarAsync();
        return result == null || result == DBNull.Value ? 30 : Convert.ToInt32(result);
    }

    public async Task SetMonthlyQuotaAsync(string planType, int quota)
    {
        const string sql = @"
            IF EXISTS (SELECT 1 FROM PlanSettings WHERE PlanType = @P)
                UPDATE PlanSettings SET MonthlyQuota = @Q WHERE PlanType = @P
            ELSE
                INSERT INTO PlanSettings (PlanType, MonthlyQuota, YearlyQuota) VALUES (@P, @Q, 0)";
        using var conn = await _db.GetOpenConnectionAsync();
        using var cmd  = new SqlCommand(sql, conn);
        cmd.Parameters.AddWithValue("@P", planType);
        cmd.Parameters.AddWithValue("@Q", quota);
        await cmd.ExecuteNonQueryAsync();
    }

    public async Task<int> GetYearlyQuotaAsync(string planType)
    {
        const string sql = "SELECT YearlyQuota FROM PlanSettings WHERE PlanType = @P";
        using var conn = await _db.GetOpenConnectionAsync();
        using var cmd  = new SqlCommand(sql, conn);
        cmd.Parameters.AddWithValue("@P", planType);
        var result = await cmd.ExecuteScalarAsync();
        return result == null || result == DBNull.Value ? 0 : Convert.ToInt32(result);
    }

    public async Task SetYearlyQuotaAsync(string planType, int quota)
    {
        const string sql = @"
            IF EXISTS (SELECT 1 FROM PlanSettings WHERE PlanType = @P)
                UPDATE PlanSettings SET YearlyQuota = @Q WHERE PlanType = @P
            ELSE
                INSERT INTO PlanSettings (PlanType, MonthlyQuota, YearlyQuota) VALUES (@P, 30, @Q)";
        using var conn = await _db.GetOpenConnectionAsync();
        using var cmd  = new SqlCommand(sql, conn);
        cmd.Parameters.AddWithValue("@P", planType);
        cmd.Parameters.AddWithValue("@Q", quota);
        await cmd.ExecuteNonQueryAsync();
    }

    private static UserSubscription MapSub(SqlDataReader r) => new()
    {
        Id                = r.GetInt32(r.GetOrdinal("Id")),
        UserId            = r.GetInt32(r.GetOrdinal("UserId")),
        PlanType          = r.GetString(r.GetOrdinal("PlanType")),
        BillingCycle      = r.GetString(r.GetOrdinal("BillingCycle")),
        Status            = r.GetString(r.GetOrdinal("Status")),
        StartDate         = r.GetDateTime(r.GetOrdinal("StartDate")),
        EndDate           = r.GetDateTime(r.GetOrdinal("EndDate")),
        Amount            = r.GetDecimal(r.GetOrdinal("Amount")),
        RazorpayPaymentId = r.IsDBNull(r.GetOrdinal("RazorpayPaymentId")) ? null : r.GetString(r.GetOrdinal("RazorpayPaymentId")),
        CreatedAt         = r.GetDateTime(r.GetOrdinal("CreatedAt")),
    };
}
