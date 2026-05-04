namespace Riva.Dto.Payment;

public class UpgradeSubscriptionRequestDto
{
    public string PlanType { get; set; } = "Premium"; // "Premium" or "Basic"
    public string PaymentId { get; set; } = string.Empty;
}

public class UpgradeSubscriptionResponseDto
{
    public bool Success { get; set; }
    public string Message { get; set; } = string.Empty;
    public string NewTier { get; set; } = string.Empty;
    public DateTime? ExpiryDate { get; set; }
}