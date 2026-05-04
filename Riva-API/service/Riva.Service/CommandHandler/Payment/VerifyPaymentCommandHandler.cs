using MediatR;
using Microsoft.Extensions.Configuration;
using Riva.Service.Command.Payment;
using Riva.Dto.Payment;
using Riva.Service.Repository;
using Razorpay.Api;

namespace Riva.Service.CommandHandler.Payment;

public class VerifyPaymentCommandHandler : IRequestHandler<VerifyPaymentCommand, PaymentDto>
{
    private readonly IPaymentRepository _paymentRepository;
    private readonly IConfiguration _configuration;

    public VerifyPaymentCommandHandler(IPaymentRepository paymentRepository, IConfiguration configuration)
    {
        _paymentRepository = paymentRepository;
        _configuration = configuration;
    }

    public async Task<PaymentDto> Handle(VerifyPaymentCommand request, CancellationToken cancellationToken)
    {
        var payment = await _paymentRepository.GetPaymentByOrderIdAsync(request.Request.RazorpayOrderId);

        if (payment == null)
        {
            throw new Exception("Payment not found");
        }

        var razorpayKeyId = _configuration["Razorpay:KeyId"];
        var razorpayKeySecret = _configuration["Razorpay:KeySecret"];
        if (string.IsNullOrEmpty(razorpayKeyId) || string.IsNullOrEmpty(razorpayKeySecret))
        {
            throw new Exception("Razorpay configuration is missing.");
        }

        var attributes = new Dictionary<string, string>
        {
            { "razorpay_order_id", request.Request.RazorpayOrderId },
            { "razorpay_payment_id", request.Request.RazorpayPaymentId },
            { "razorpay_signature", request.Request.RazorpaySignature }
        };

        Utils.verifyPaymentSignature(attributes);

        payment.Status = "Completed";
        payment.RazorpayPaymentId = request.Request.RazorpayPaymentId;
        payment.RazorpaySignature = request.Request.RazorpaySignature;
        await _paymentRepository.UpdatePaymentAsync(payment);

        return new PaymentDto
        {
            Id = payment.Id,
            UserId = payment.UserId,
            Amount = payment.Amount,
            Currency = payment.Currency,
            Status = payment.Status,
            RazorpayOrderId = payment.RazorpayOrderId,
            RazorpayPaymentId = payment.RazorpayPaymentId,
            RazorpaySignature = payment.RazorpaySignature,
            CreatedAt = payment.CreatedAt,
            UpdatedAt = payment.UpdatedAt,
            Notes = payment.Notes
        };
    }
}