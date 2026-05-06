namespace Riva.Domain.Entity;

public class User
{
    public int Id { get; set; }
    public string Username { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string PasswordHash { get; set; } = string.Empty;
    public string Role { get; set; } = "User";
    public bool IsVerified { get; set; } = false;
    public bool IsActive { get; set; } = true;
    public string SubscriptionTier { get; set; } = "Free"; // Free, Premium, Enterprise
    public DateTime? SubscriptionExpiryDate { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }
    public DateTime? LastLoginAt { get; set; }

    // Navigation properties
    public virtual ICollection<Template>? CreatedTemplates { get; set; }
    public virtual ICollection<Payment>? Payments { get; set; }
    public virtual ICollection<EmailOtp>? EmailOtps { get; set; }
    public virtual ICollection<PaymentOtp>? PaymentOtps { get; set; }
    public virtual ICollection<AdminAction>? AdminActions { get; set; }

    // Helper methods
    public bool IsAdmin => Role == "Admin";
    public bool IsSubscriptionActive => SubscriptionTier != "Free" && 
                                        SubscriptionExpiryDate.HasValue && 
                                        SubscriptionExpiryDate > DateTime.UtcNow;
}
