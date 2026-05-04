using MediatR;
using Riva.Dto.Payment;

namespace Riva.Service.Command.Payment;

public class InitiatePaymentCommand : IRequest<PaymentDto>
{
    public InitiatePaymentRequestDto Request { get; set; } = new();
    public int UserId { get; set; }
}