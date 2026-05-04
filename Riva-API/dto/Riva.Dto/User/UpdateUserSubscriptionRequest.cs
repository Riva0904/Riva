namespace Riva.Dto.User;

public class UpdateUserSubscriptionRequest
{
    public int UserId { get; set; }
    public string SubscriptionTier { get; set; } = "Free";
    public DateTime? SubscriptionExpiry { get; set; }
}