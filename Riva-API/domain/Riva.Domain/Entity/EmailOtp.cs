namespace Riva.Domain.Entity;

public class EmailOtp
{
    public int Id { get; set; }
    public int? UserId { get; set; }
    public string Email { get; set; } = string.Empty;
    public string OtpCode { get; set; } = string.Empty;
    public DateTime ExpiryTime { get; set; }
    public string Status { get; set; } = "Pending"; // Pending, Used, Expired
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Navigation property
    public virtual User? User { get; set; }

    // Computed properties
    public bool IsExpired => DateTime.UtcNow > ExpiryTime;
    public bool IsPending => Status == "Pending";
    
    public void MarkAsUsed()
    {
        Status = "Used";
    }

    public void MarkAsExpired()
    {
        Status = "Expired";
    }
}
