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

        // Free templates are always accessible
        if (template.TierType == "Free")
            return Ok(new { hasAccess = true, reason = "Free template" });

        // Check individual purchase
        if (await _subs.HasPurchasedTemplateAsync(userId, req.TemplateId))
            return Ok(new { hasAccess = true, reason = "Purchased" });

        // Check active subscription
        var sub = await _subs.GetActiveSubscriptionAsync(userId);
        if (sub is null)
            return Ok(new { hasAccess = false, reason = "No access" });

        // Yearly = unlimited templates
        if (sub.BillingCycle == "Yearly")
        {
            bool canAccess = template.TierType == "Paid"
                ? sub.PlanType is "Paid" or "Pro"
                : sub.PlanType == "Pro"; // Pro template requires Pro plan
            return Ok(new { hasAccess = canAccess, reason = canAccess ? "Yearly plan" : "Upgrade to Pro" });
        }

        // Monthly = only templates in monthly pool
        if (sub.BillingCycle == "Monthly")
        {
            bool planCovers = template.TierType == "Paid"
                ? sub.PlanType is "Paid" or "Pro"
                : sub.PlanType == "Pro";

            if (!planCovers)
                return Ok(new { hasAccess = false, reason = "Upgrade to Pro" });

            var poolIds = await _subs.GetMonthlyPoolIdsAsync(sub.PlanType);
            bool inPool = poolIds.Contains(req.TemplateId);
            return Ok(new { hasAccess = inPool, reason = inPool ? "Monthly plan" : "Template not in your monthly plan" });
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

    // ── Admin: manage monthly pool ─────────────────────────────────────

    [HttpGet("admin/pool/{planType}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> GetPool(string planType)
    {
        var ids          = await _subs.GetMonthlyPoolIdsAsync(planType);
        var monthlyQuota = await _subs.GetMonthlyQuotaAsync(planType);
        var yearlyQuota  = await _subs.GetYearlyQuotaAsync(planType);
        return Ok(new { planType, templateIds = ids, monthlyQuota, yearlyQuota });
    }

    [HttpPost("admin/yearly-quota")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> SetYearlyQuota([FromBody] SetYearlyQuotaRequest req)
    {
        await _subs.SetYearlyQuotaAsync(req.PlanType, req.YearlyQuota);
        return Ok(new { message = $"{req.PlanType} yearly quota set to {(req.YearlyQuota == 0 ? "unlimited" : req.YearlyQuota.ToString())}." });
    }

    [HttpPost("admin/pool")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> SetPool([FromBody] SetPoolRequest req)
    {
        if (req.MonthlyQuota > 0)
            await _subs.SetMonthlyQuotaAsync(req.PlanType, req.MonthlyQuota);

        if (req.TemplateIds.Count > req.MonthlyQuota && req.MonthlyQuota > 0)
            return BadRequest(new { message = $"Selected {req.TemplateIds.Count} templates exceed the quota of {req.MonthlyQuota}." });

        await _subs.SetMonthlyPoolAsync(req.PlanType, req.TemplateIds);
        return Ok(new { message = $"{req.PlanType} monthly pool updated — {req.TemplateIds.Count} templates, quota: {req.MonthlyQuota}." });
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
public class SetPoolRequest          { public string PlanType { get; set; } = "Paid"; public List<int> TemplateIds { get; set; } = new(); public int MonthlyQuota { get; set; } = 30; }
public class SetYearlyQuotaRequest  { public string PlanType { get; set; } = "Paid"; public int YearlyQuota { get; set; } = 0; }
