using MediatR;
using Riva.Service.Command.Payment;
using Riva.Service.Repository;

namespace Riva.Service.CommandHandler.Payment;

public class VerifyOtpCommandHandler : IRequestHandler<VerifyOtpCommand, bool>
{
    private readonly IPaymentRepository _paymentRepository;

    public VerifyOtpCommandHandler(IPaymentRepository paymentRepository)
    {
        _paymentRepository = paymentRepository;
    }

    public async Task<bool> Handle(VerifyOtpCommand request, CancellationToken cancellationToken)
    {
        return await _paymentRepository.VerifyPaymentOtpAsync(request.PaymentId, request.Code);
    }
}