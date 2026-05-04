using MediatR;
using Microsoft.Extensions.Configuration;
using Riva.Service.Command.Payment;
using Riva.Dto.Payment;
using Riva.Service.Repository;
using Razorpay.Api;

namespace Riva.Service.CommandHandler.Payment;

public class CreateOrderCommandHandler : IRequestHandler<CreateOrderCommand, CreateOrderResponseDto>
{
    private readonly IPaymentRepository _paymentRepository;
    private readonly IConfiguration _configuration;

    public CreateOrderCommandHandler(IPaymentRepository paymentRepository, IConfiguration configuration)
    {
        _paymentRepository = paymentRepository;
        _configuration = configuration;
    }

    public async Task<CreateOrderResponseDto> Handle(CreateOrderCommand request, CancellationToken cancellationToken)
    {
        var payment = await _paymentRepository.GetPaymentByIdAsync(request.PaymentId);
        if (payment == null || payment.UserId != request.UserId)
        {
            throw new Exception("Payment not found or unauthorized");
        }

        var razorpayKeyId = _configuration["Razorpay:KeyId"];
        var razorpayKeySecret = _configuration["Razorpay:KeySecret"];
        if (string.IsNullOrEmpty(razorpayKeyId) || string.IsNullOrEmpty(razorpayKeySecret))
        {
            throw new Exception("Razorpay configuration is missing.");
        }

        var client = new RazorpayClient(razorpayKeyId, razorpayKeySecret);
        var options = new Dictionary<string, object>
        {
            { "amount", (int)(payment.Amount * 100) },
            { "currency", payment.Currency },
            { "receipt", $"receipt_{payment.Id}" },
            { "payment_capture", 1 }
        };

        var order = client.Order.Create(options);

        payment.RazorpayOrderId = order["id"].ToString();
        await _paymentRepository.UpdatePaymentAsync(payment);

        return new CreateOrderResponseDto
        {
            PaymentId = payment.Id,
            RazorpayOrderId = payment.RazorpayOrderId,
            Amount = payment.Amount,
            Currency = payment.Currency,
            Key = razorpayKeyId
        };
    }
}