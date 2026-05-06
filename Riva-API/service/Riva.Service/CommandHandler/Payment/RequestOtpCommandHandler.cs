using MediatR;
using Riva.Service.Command.Payment;
using Riva.Service.Repository;

namespace Riva.Service.CommandHandler.Payment;

public class RequestOtpCommandHandler : IRequestHandler<RequestOtpCommand, bool>
{
    private readonly IPaymentRepository _paymentRepository;

    public RequestOtpCommandHandler(IPaymentRepository paymentRepository)
    {
        _paymentRepository = paymentRepository;
    }

    public async Task<bool> Handle(RequestOtpCommand request, CancellationToken cancellationToken)
    {
        var otpCode = Random.Shared.Next(100000, 999999).ToString();
        var otp = new Riva.Domain.Entity.PaymentOtp
        {
            UserId = request.UserId,
            Email = string.Empty,
            OtpCode = otpCode,
            ExpiryTime = DateTime.UtcNow.AddMinutes(5),
            Status = "Pending",
            CreatedAt = DateTime.UtcNow
        };
        await _paymentRepository.CreatePaymentOtpAsync(otp);
        return true;
    }
}
