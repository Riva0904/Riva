namespace Riva.Dto.Payment;

public class VerifyOtpRequestDto
{
    public int PaymentId { get; set; }
    public string Code { get; set; } = string.Empty;
}