using MediatR;
using Riva.Dto.Invitation;

namespace Riva.Service.Command.Invitation;

public class PublishInvitationCommand : IRequest<PublishInvitationResponse>
{
    public int InvitationId { get; set; }
    public int UserId { get; set; }
    public bool IsPublic { get; set; } = true;
    public DateTime? ExpiresAt { get; set; }
}
