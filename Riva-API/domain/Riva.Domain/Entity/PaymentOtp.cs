namespace Riva.Domain.Entity;

public class PaymentOtp
{
    public int Id { get; set; }
    public int PaymentId { get; set; }
    public string Code { get; set; } = string.Empty;
    public DateTime ExpiresAt { get; set; }
    public bool IsUsed { get; set; }
    public DateTime CreatedAt { get; set; }
}