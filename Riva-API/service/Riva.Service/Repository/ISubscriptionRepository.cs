using Riva.Domain.Entity;

namespace Riva.Service.Repository;

public interface ISubscriptionRepository
{
    // ── Subscriptions ─────────────────────────────────────────────────
    Task<UserSubscription?> GetActiveSubscriptionAsync(int userId);
    Task<int> CreateSubscriptionAsync(UserSubscription sub);
    Task<IEnumerable<UserSubscription>> GetAllSubscriptionsAsync();

    // ── Template purchases ────────────────────────────────────────────
    Task<bool> HasPurchasedTemplateAsync(int userId, int templateId);
    Task<int> CreatePurchaseAsync(TemplatePurchase purchase);
    Task<IEnumerable<TemplatePurchase>> GetUserPurchasesAsync(int userId);

    // ── Monthly pool ──────────────────────────────────────────────────
    Task<List<int>> GetMonthlyPoolIdsAsync(string planType);
    Task SetMonthlyPoolAsync(string planType, List<int> templateIds);

    // ── Plan settings (quota) ─────────────────────────────────────────
    Task<int> GetMonthlyQuotaAsync(string planType);
    Task SetMonthlyQuotaAsync(string planType, int quota);
    Task<int> GetYearlyQuotaAsync(string planType);
    Task SetYearlyQuotaAsync(string planType, int quota);

    // ── Plan settings (prices) ────────────────────────────────────────
    Task<(decimal Monthly, decimal Yearly)> GetPricesAsync(string planType);
    Task SetPricesAsync(string planType, decimal monthlyPrice, decimal yearlyPrice);

    // ── Publish count (invitations created in subscription period) ────
    Task<int> GetPublishCountAsync(int userId, DateTime start, DateTime end);
}
