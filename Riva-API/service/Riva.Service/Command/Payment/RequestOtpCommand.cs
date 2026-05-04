using MediatR;

namespace Riva.Service.Command.Payment;

public class RequestOtpCommand : IRequest<bool>
{
    public int PaymentId { get; set; }
    public int UserId { get; set; }
}