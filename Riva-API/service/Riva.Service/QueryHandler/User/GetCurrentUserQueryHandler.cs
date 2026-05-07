using MediatR;
using Riva.Dto.Admin;
using Riva.Service.Query.User;
using Riva.Service.Repository;

namespace Riva.Service.QueryHandler.User;

public class GetCurrentUserQueryHandler : IRequestHandler<GetCurrentUserQuery, UserProfileDto>
{
    private readonly IUserRepository _users;
    private readonly IInvitationRepository _invitations;

    public GetCurrentUserQueryHandler(IUserRepository users, IInvitationRepository invitations)
    {
        _users       = users;
        _invitations = invitations;
    }

    public async Task<UserProfileDto> Handle(GetCurrentUserQuery request, CancellationToken ct)
    {
        var user = await _users.GetByIdAsync(request.UserId)
            ?? throw new KeyNotFoundException("User not found.");

        var (freeUsed, paidUsed) = await _users.GetTemplateUsageAsync(user.Id);
        var myInvitations        = await _invitations.GetByUserIdAsync(user.Id);

        return new UserProfileDto
        {
            Id                      = user.Id,
            Username                = user.Username,
            DisplayName             = user.DisplayName,
            Email                   = user.Email,
            Role                    = user.Role,
            IsActive                = user.IsActive,
            ProfileImageUrl         = user.ProfileImageUrl,
            CreatedAt               = user.CreatedAt,
            UpdatedAt               = user.UpdatedAt,
            LastLoginAt             = user.LastLoginAt,
            FreeTemplatesUsed       = freeUsed,
            PaidTemplatesUsed       = paidUsed,
            TotalInvitationsCreated = myInvitations.Count,
            SessionStatus           = "Active",
        };
    }
}
