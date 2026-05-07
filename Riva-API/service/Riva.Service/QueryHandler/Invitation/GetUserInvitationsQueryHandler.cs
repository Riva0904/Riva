using MediatR;
using Riva.Dto.Invitation;
using Riva.Service.Query.Invitation;
using Riva.Service.Repository;

namespace Riva.Service.QueryHandler.Invitation;

public class GetUserInvitationsQueryHandler
    : IRequestHandler<GetUserInvitationsQuery, List<InvitationSummaryDto>>
{
    private readonly IInvitationRepository _invitations;

    public GetUserInvitationsQueryHandler(IInvitationRepository invitations)
        => _invitations = invitations;

    public async Task<List<InvitationSummaryDto>> Handle(
        GetUserInvitationsQuery request, CancellationToken cancellationToken)
    {
        var list = await _invitations.GetByUserIdAsync(request.UserId);

        return list.Select(inv => new InvitationSummaryDto
        {
            InvitationId = inv.InvitationId,
            TemplateId   = inv.TemplateId,
            TemplateName = inv.Template?.Name ?? string.Empty,
            ThumbnailUrl = inv.Template?.ThumbnailUrl,
            Title        = inv.Title,
            Slug         = inv.Slug,
            Status       = inv.Status,
            IsPublic     = inv.IsPublic,
            PublishedAt  = inv.PublishedAt,
            CreatedAt    = inv.CreatedAt,
            ViewCount    = inv.ViewCount
        }).ToList();
    }
}
