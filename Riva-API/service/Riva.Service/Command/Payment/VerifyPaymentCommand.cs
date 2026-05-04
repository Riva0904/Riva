using MediatR;
using Riva.Dto.Payment;

namespace Riva.Service.Command.Payment;

public class VerifyPaymentCommand : IRequest<PaymentDto>
{
    public VerifyPaymentRequestDto Request { get; set; } = new();
}