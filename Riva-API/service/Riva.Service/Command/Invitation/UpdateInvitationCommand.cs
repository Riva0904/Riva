using MediatR;

namespace Riva.Service.Command.Invitation;

public class UpdateInvitationCommand : IRequest<Unit>
{
    public int InvitationId { get; set; }
    public int UserId { get; set; }  // for ownership check
    public string Title { get; set; } = string.Empty;
    public string FieldValuesJson { get; set; } = "{}";
    public string? SeoTitle { get; set; }
    public string? SeoDescription { get; set; }
}
