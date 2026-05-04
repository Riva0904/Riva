using MediatR;

namespace Riva.Service.Command.User;

public class UpdateUserSubscriptionCommand : IRequest
{
    public int UserId { get; set; }
    public string SubscriptionTier { get; set; } = "Free";
    public DateTime? SubscriptionExpiry { get; set; }
}