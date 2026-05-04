using MediatR;

namespace Riva.Service.Command.Payment;

public class VerifyOtpCommand : IRequest<bool>
{
    public int PaymentId { get; set; }
    public string Code { get; set; } = string.Empty;
    public int UserId { get; set; }
}