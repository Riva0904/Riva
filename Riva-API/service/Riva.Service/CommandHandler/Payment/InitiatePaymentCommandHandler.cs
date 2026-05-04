using MediatR;
using Riva.Service.Command.Payment;
using Riva.Dto.Payment;
using Riva.Service.Repository;
using Riva.Domain.Entity;

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
            Currency = request.Request.Currency,
            Notes = request.Request.Notes
        };

        var id = await _paymentRepository.CreatePaymentAsync(payment);

        return new PaymentDto
        {
            Id = id,
            UserId = payment.UserId,
            Amount = payment.Amount,
            Currency = payment.Currency,
            Status = payment.Status,
            CreatedAt = DateTime.UtcNow,
            Notes = payment.Notes
        };
    }
}