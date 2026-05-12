namespace Riva.Domain.Entity;

public class UserSubscription
{
    public int Id { get; set; }
    public int UserId { get; set; }
    /// <summary>Paid | Pro</summary>
    public string PlanType { get; set; } = "Paid";
    /// <summary>Monthly | Yearly</summary>
    public string BillingCycle { get; set; } = "Monthly";
    /// <summary>Active | Expired | Cancelled</summary>
    public string Status { get; set; } = "Active";
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
    public decimal Amount { get; set; }
    public string? RazorpayPaymentId { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
