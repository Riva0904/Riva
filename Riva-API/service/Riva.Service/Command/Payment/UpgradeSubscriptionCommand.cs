using MediatR;
using Riva.Dto.Payment;

namespace Riva.Service.Command.Payment;

public class UpgradeSubscriptionCommand : IRequest<UpgradeSubscriptionResponseDto>
{
    public int UserId { get; set; }
    public string PlanType { get; set; } = "Premium";
    public string PaymentId { get; set; } = string.Empty;
}