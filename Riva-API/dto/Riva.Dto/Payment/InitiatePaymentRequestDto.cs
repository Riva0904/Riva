namespace Riva.Dto.Payment;

public class InitiatePaymentRequestDto
{
    public decimal Amount { get; set; }
    public string Currency { get; set; } = "INR";
    public string? Notes { get; set; }
}