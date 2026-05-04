using MediatR;
using Riva.Dto.Payment;

namespace Riva.Service.Command.Payment;

public class CreateOrderCommand : IRequest<CreateOrderResponseDto>
{
    public int PaymentId { get; set; }
    public int UserId { get; set; }
}