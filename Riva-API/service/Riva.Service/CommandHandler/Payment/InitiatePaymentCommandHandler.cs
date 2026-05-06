using MediatR;
using Riva.Dto.Payment;
using Riva.Service.Command.Payment;
using Riva.Service.Repository;

namespace Riva.Service.CommandHandler.Payment;

public class InitiatePaymentCommandHandler : IRequestHandler<InitiatePaymentCommand, PaymentDto>
{
    private readonly IPaymentRepository _paymentRepository;

    public InitiatePaymentCommandHandler(IPaymentRepository paymentRepository)
    {
        _paymentRepository = paymentRepository;
    }

    public async Task<PaymentDto> Handle(InitiatePaymentCommand request, CancellationToken cancellationToken)
    {
        var payment = new Riva.Domain.Entity.Payment
        {
            UserId = request.UserId,
            Amount = request.Request.Amount,
            Currency = request.Request.Currency ?? "INR",
            Status = "Pending",
            TransactionDate = DateTime.UtcNow
        };

        var id = await _paymentRepository.CreatePaymentAsync(payment);

        return new PaymentDto
        {
            Id = id,
            UserId = payment.UserId,
            Amount = payment.Amount,
            Currency = payment.Currency,
            Status = payment.Status,
            Notes = request.Request.Notes,
            CreatedAt = payment.TransactionDate
        };
    }
}
