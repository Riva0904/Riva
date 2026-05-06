using MediatR;
using Microsoft.Extensions.Configuration;
using Riva.Dto.Payment;
using Riva.Service.Command.Payment;
using Riva.Service.Repository;

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
        var payment = await _paymentRepository.GetPaymentByOrderIdAsync(request.Request.RazorpayOrderId)
            ?? throw new Exception("Payment not found.");

        payment.Status = "Completed";
        payment.RazorpayPaymentId = request.Request.RazorpayPaymentId;
        payment.RazorpaySignature = request.Request.RazorpaySignature;
        payment.CompletionDate = DateTime.UtcNow;
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
            CreatedAt = payment.TransactionDate
        };
    }
}
