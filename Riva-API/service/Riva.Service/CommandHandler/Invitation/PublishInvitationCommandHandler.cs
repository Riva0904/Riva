using MediatR;
using Riva.Dto.Invitation;
using Riva.Service.Command.Invitation;
using Riva.Service.Repository;

namespace Riva.Service.CommandHandler.Invitation;

public class PublishInvitationCommandHandler
    : IRequestHandler<PublishInvitationCommand, PublishInvitationResponse>
{
    private readonly IInvitationRepository _invitations;

    public PublishInvitationCommandHandler(IInvitationRepository invitations)
        => _invitations = invitations;

    public async Task<PublishInvitationResponse> Handle(
        PublishInvitationCommand request, CancellationToken cancellationToken)
    {
        var invitation = await _invitations.GetByIdAsync(request.InvitationId)
            ?? throw new KeyNotFoundException("Invitation not found.");

        if (invitation.UserId != request.UserId)
            throw new UnauthorizedAccessException("You do not own this invitation.");

        invitation.Status      = "Published";
        invitation.IsPublic    = request.IsPublic;
        invitation.ExpiresAt   = request.ExpiresAt;
        invitation.PublishedAt = DateTime.UtcNow;
        invitation.UpdatedAt   = DateTime.UtcNow;

        await _invitations.UpdateAsync(invitation);

        return new PublishInvitationResponse
        {
            Slug      = invitation.Slug,
            PublicUrl = $"/invite/{invitation.Slug}",
            Message   = "Invitation published successfully."
        };
    }
}
