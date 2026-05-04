using MediatR;
using Riva.Service.Command.Payment;
using Riva.Service.Repository;
using Riva.Domain.Entity;

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
        // Generate 6-digit OTP
        var otpCode = new Random().Next(100000, 999999).ToString();

        var otp = new PaymentOtp
        {
            PaymentId = request.PaymentId,
            Code = otpCode,
            ExpiresAt = DateTime.UtcNow.AddMinutes(5) // 5 minutes expiry
        };

        await _paymentRepository.CreatePaymentOtpAsync(otp);

        // In real app, send OTP via SMS/Email
        // For demo, just return true
        return true;
    }
}