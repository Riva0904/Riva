using MediatR;
using Microsoft.Extensions.Configuration;
using Riva.Dto.Payment;
using Riva.Service.Command.Payment;
using Riva.Service.Repository;

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
        var payment = await _paymentRepository.GetPaymentByIdAsync(request.PaymentId)
            ?? throw new Exception("Payment not found.");

        if (payment.UserId != request.UserId)
            throw new UnauthorizedAccessException("Unauthorized.");

        return new CreateOrderResponseDto
        {
            PaymentId = payment.Id,
            RazorpayOrderId = payment.RazorpayOrderId ?? string.Empty,
            Amount = payment.Amount,
            Currency = payment.Currency,
            Key = _configuration["Razorpay:KeyId"] ?? string.Empty
        };
    }
}
