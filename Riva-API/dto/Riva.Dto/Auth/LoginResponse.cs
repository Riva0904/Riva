namespace Riva.Dto.Auth;

/// <summary>
/// Response DTO for successful login
/// </summary>
public class LoginResponse
{
    public string Token { get; set; } = string.Empty;
    public string Username { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Role { get; set; } = string.Empty; // "User" or "Admin"
    public bool IsVerified { get; set; }
    public string SubscriptionTier { get; set; } = "Free"; // Free, Premium, Enterprise
    public DateTime? SubscriptionExpiryDate { get; set; }
    public DateTime ExpiresAt { get; set; }
}
