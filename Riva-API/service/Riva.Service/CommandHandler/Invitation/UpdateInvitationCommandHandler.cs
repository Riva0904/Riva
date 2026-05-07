using MediatR;
using Riva.Service.Command.Invitation;
using Riva.Service.Repository;

namespace Riva.Service.CommandHandler.Invitation;

public class UpdateInvitationCommandHandler : IRequestHandler<UpdateInvitationCommand, Unit>
{
    private readonly IInvitationRepository _invitations;

    public UpdateInvitationCommandHandler(IInvitationRepository invitations)
        => _invitations = invitations;

    public async Task<Unit> Handle(UpdateInvitationCommand request, CancellationToken cancellationToken)
    {
        var invitation = await _invitations.GetByIdAsync(request.InvitationId)
            ?? throw new KeyNotFoundException("Invitation not found.");

        if (invitation.UserId != request.UserId)
            throw new UnauthorizedAccessException("You do not own this invitation.");

        invitation.Title           = request.Title.Trim();
        invitation.FieldValuesJson = string.IsNullOrWhiteSpace(request.FieldValuesJson) ? "{}" : request.FieldValuesJson;
        invitation.SeoTitle        = request.SeoTitle;
        invitation.SeoDescription  = request.SeoDescription;
        invitation.UpdatedAt       = DateTime.UtcNow;

        await _invitations.UpdateAsync(invitation);
        return Unit.Value;
    }
}
