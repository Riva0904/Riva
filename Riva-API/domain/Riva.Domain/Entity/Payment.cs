namespace Riva.Domain.Entity;

public class Payment
{
    public int Id { get; set; }
    public int UserId { get; set; }
    public int? TemplateId { get; set; }
    public decimal Amount { get; set; }
    public string Currency { get; set; } = "INR";
    public string Status { get; set; } = "Pending"; // Pending, Completed, Failed, Cancelled
    public string? RazorpayOrderId { get; set; }
    public string? RazorpayPaymentId { get; set; }
    public string? RazorpaySignature { get; set; }
    public string? SubscriptionTierPurchased { get; set; } // Premium, Enterprise, etc.
    public DateTime TransactionDate { get; set; } = DateTime.UtcNow;
    public DateTime? CompletionDate { get; set; }
    public DateTime? UpdatedAt { get; set; }

    // Navigation properties
    public virtual User? User { get; set; }
    public virtual Template? Template { get; set; }
    public virtual ICollection<PaymentOtp>? PaymentOtps { get; set; }

    // Status validation constants
    public const string PENDING = "Pending";
    public const string COMPLETED = "Completed";
    public const string FAILED = "Failed";
    public const string CANCELLED = "Cancelled";

    // Helper methods
    public bool IsCompleted => Status == COMPLETED;
    public bool IsFailed => Status == FAILED;
    public bool IsPending => Status == PENDING;
    
    public void MarkAsCompleted()
    {
        Status = COMPLETED;
        CompletionDate = DateTime.UtcNow;
        UpdatedAt = DateTime.UtcNow;
    }

    public void MarkAsFailed()
    {
        Status = FAILED;
        UpdatedAt = DateTime.UtcNow;
    }
}
