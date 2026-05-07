using MediatR;
using Riva.Dto.Invitation;

namespace Riva.Service.Query.Invitation;

public class GetInvitationBySlugQuery : IRequest<InvitationDetailDto>
{
    public string Slug { get; set; } = string.Empty;
}

public class GetInvitationByIdQuery : IRequest<InvitationDetailDto>
{
    public int InvitationId { get; set; }
    public int UserId { get; set; }  // ownership check (0 = admin bypass)
}

public class GetUserInvitationsQuery : IRequest<List<InvitationSummaryDto>>
{
    public int UserId { get; set; }
}
