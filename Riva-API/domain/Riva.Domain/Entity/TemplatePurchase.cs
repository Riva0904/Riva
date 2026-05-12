namespace Riva.Domain.Entity;

public class TemplatePurchase
{
    public int Id { get; set; }
    public int UserId { get; set; }
    public int TemplateId { get; set; }
    public decimal Amount { get; set; }
    public string? RazorpayPaymentId { get; set; }
    public DateTime PurchasedAt { get; set; } = DateTime.UtcNow;
}
