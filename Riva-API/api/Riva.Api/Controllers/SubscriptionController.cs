using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Riva.Domain.Entity;
using Riva.Service.Repository;

namespace Riva.Api.Controllers;

[ApiController]
[Route("api/subscription")]
[Authorize]
public class SubscriptionController : ControllerBase
{
    private readonly ISubscriptionRepository _subs;
    private readonly ITemplateRepository     _templates;

    // ── Pricing table ─────────────────────────────────────────────────
    private static readonly Dictionary<string, decimal> Plans = new()
    {
        ["Paid-Monthly"]  =  799m,
        ["Paid-Yearly"]   = 2499m,
        ["Pro-Monthly"]   = 1499m,
        ["Pro-Yearly"]    = 3499m,
    };

    public SubscriptionController(ISubscriptionRepository subs, ITemplateRepository templates)
    {
        _subs      = subs;
        _templates = templates;
    }

    private int CurrentUserId() => int.Parse(User.FindFirst("id")?.Value ?? "0");

    // ── Check access to a template ────────────────────────────────────

    [HttpPost("check-access")]
    public async Task<IActionResult> CheckAccess([FromBody] CheckAccessRequest req)
    {
        var userId   = CurrentUserId();
        var template = await _templates.GetByIdAsync(req.TemplateId);
        if (template is null) return NotFound(new { hasAccess = false, reason = "Template not found" });

        // Free templates always accessible
        if (template.TierType == "Free")
            return Ok(new { hasAccess = true, reason = "Free template" });

        // Individual purchase overrides everything
        if (await _subs.HasPurchasedTemplateAsync(userId, req.TemplateId))
            return Ok(new { hasAccess = true, reason = "Purchased" });

        var sub = await _subs.GetActiveSubscriptionAsync(userId);
        if (sub is null)
            return Ok(new { hasAccess = false, reason = "No active plan" });

        // ── Plan hierarchy: Premium (Paid) > Pro > Free ───────────────

        // ── Check publish limit (0 = unlimited) ──────────────────────────
        var isMonthly = sub.BillingCycle == "Monthly";
        var limit     = isMonthly
            ? await _subs.GetMonthlyQuotaAsync(sub.PlanType)
            : await _subs.GetYearlyQuotaAsync(sub.PlanType);

        if (limit > 0)
        {
            var used = await _subs.GetPublishCountAsync(userId, sub.StartDate, sub.EndDate);
            if (used >= limit)
                return Ok(new { hasAccess = false, reason = $"Publish limit reached ({used}/{limit}). Upgrade for more." });
        }

        // ── Tier access: Premium (Paid) = all templates; Pro = Free+Pro only ──

        // Premium plan (Paid) — access ALL template tiers
        if (sub.PlanType == "Paid")
            return Ok(new { hasAccess = true, reason = "Premium plan" });

        // Pro plan — Free + Pro templates only; Premium templates require upgrade
        if (sub.PlanType == "Pro")
        {
            if (template.TierType == "Premium")
                return Ok(new { hasAccess = false, reason = "Premium plan required for Premium templates" });
            return Ok(new { hasAccess = true, reason = "Pro plan" });
        }

        return Ok(new { hasAccess = false, reason = "No active plan" });
    }

    // ── Get user's current plan + purchased templates ─────────────────

    [HttpGet("my-plan")]
    public async Task<IActionResult> MyPlan()
    {
        var userId  = CurrentUserId();
        var sub     = await _subs.GetActiveSubscriptionAsync(userId);
        var buys    = await _subs.GetUserPurchasesAsync(userId);

        return Ok(new
        {
            subscription     = sub is null ? null : new
            {
                sub.PlanType,
                sub.BillingCycle,
                sub.Status,
                sub.StartDate,
                sub.EndDate,
                sub.Amount,
            },
            purchasedTemplateIds = buys.Select(b => b.TemplateId).ToList(),
        });
    }

    // ── Record purchase after Razorpay payment success ─────────────────

    [HttpPost("record-purchase")]
    public async Task<IActionResult> RecordPurchase([FromBody] RecordPurchaseRequest req)
    {
        var userId   = CurrentUserId();
        var template = await _templates.GetByIdAsync(req.TemplateId);
        if (template is null) return NotFound();

        // Idempotency — don't duplicate
        if (await _subs.HasPurchasedTemplateAsync(userId, req.TemplateId))
            return Ok(new { message = "Already purchased" });

        await _subs.CreatePurchaseAsync(new TemplatePurchase
        {
            UserId            = userId,
            TemplateId        = req.TemplateId,
            Amount            = req.Amount,
            RazorpayPaymentId = req.RazorpayPaymentId,
            PurchasedAt       = DateTime.UtcNow,
        });

        return Ok(new { message = "Purchase recorded", templateId = req.TemplateId });
    }

    // ── Record subscription after Razorpay payment success ────────────

    [HttpPost("record-subscription")]
    public async Task<IActionResult> RecordSubscription([FromBody] RecordSubscriptionRequest req)
    {
        var userId = CurrentUserId();

        if (!Plans.TryGetValue($"{req.PlanType}-{req.BillingCycle}", out var expectedAmount))
            return BadRequest(new { message = "Invalid plan" });

        var start  = DateTime.UtcNow;
        var end    = req.BillingCycle == "Monthly" ? start.AddMonths(1) : start.AddYears(1);

        await _subs.CreateSubscriptionAsync(new UserSubscription
        {
            UserId            = userId,
            PlanType          = req.PlanType,
            BillingCycle      = req.BillingCycle,
            Status            = "Active",
            StartDate         = start,
            EndDate           = end,
            Amount            = expectedAmount,
            RazorpayPaymentId = req.RazorpayPaymentId,
            CreatedAt         = DateTime.UtcNow,
        });

        return Ok(new { message = "Subscription activated", planType = req.PlanType, billingCycle = req.BillingCycle, endDate = end });
    }

    // ── Get pricing plans ─────────────────────────────────────────────

    [HttpGet("plans")]
    [AllowAnonymous]
    public IActionResult GetPlans()
    {
        return Ok(new
        {
            paid = new
            {
                perTemplate   = new[] { 49m, 79m, 149m },
                monthly       = new { amount = 799m,  templates = 30, label = "30 Paid templates/month" },
                yearly        = new { amount = 2499m, templates = -1, label = "Unlimited Paid templates/year" },
            },
            pro = new
            {
                perTemplate   = new[] { 149m, 179m, 249m },
                monthly       = new { amount = 1499m, templates = 30, label = "30 Pro templates/month" },
                yearly        = new { amount = 3499m, templates = -1, label = "Unlimited Pro templates/year" },
            },
        });
    }

    // ── Admin: plan settings (price + publish limit) ──────────────────

    [HttpGet("admin/plan-settings")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> GetAllPlanSettings()
    {
        var (paidMonthlyPrice, paidYearlyPrice) = await _subs.GetPricesAsync("Paid");
        var (proMonthlyPrice,  proYearlyPrice)  = await _subs.GetPricesAsync("Pro");
        return Ok(new {
            premium = new {
                monthlyPrice = paidMonthlyPrice, yearlyPrice  = paidYearlyPrice,
                monthlyLimit = await _subs.GetMonthlyQuotaAsync("Paid"),
                yearlyLimit  = await _subs.GetYearlyQuotaAsync("Paid"),
            },
            pro = new {
                monthlyPrice = proMonthlyPrice,  yearlyPrice  = proYearlyPrice,
                monthlyLimit = await _subs.GetMonthlyQuotaAsync("Pro"),
                yearlyLimit  = await _subs.GetYearlyQuotaAsync("Pro"),
            },
        });
    }

    [HttpPost("admin/plan-settings")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> SavePlanSettings([FromBody] SavePlanSettingsRequest req)
    {
        await _subs.SetPricesAsync(req.PlanType, req.MonthlyPrice, req.YearlyPrice);
        await _subs.SetMonthlyQuotaAsync(req.PlanType, req.MonthlyLimit);
        await _subs.SetYearlyQuotaAsync(req.PlanType, req.YearlyLimit);
        return Ok(new { message = "Plan settings saved." });
    }

    // ── Admin: all subscriptions ───────────────────────────────────────

    [HttpGet("admin/all")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> GetAll()
    {
        var subs = await _subs.GetAllSubscriptionsAsync();
        return Ok(subs);
    }
}

// ── Request DTOs ──────────────────────────────────────────────────────────────

public class CheckAccessRequest      { public int TemplateId { get; set; } }
public class RecordPurchaseRequest   { public int TemplateId { get; set; } public decimal Amount { get; set; } public string? RazorpayPaymentId { get; set; } }
public class RecordSubscriptionRequest { public string PlanType { get; set; } = "Paid"; public string BillingCycle { get; set; } = "Monthly"; public string? RazorpayPaymentId { get; set; } }
public class SavePlanSettingsRequest {
    public string PlanType    { get; set; } = "Paid";
    public decimal MonthlyPrice { get; set; }
    public decimal YearlyPrice  { get; set; }
    public int MonthlyLimit   { get; set; }   // 0 = unlimited
    public int YearlyLimit    { get; set; }   // 0 = unlimited
}
