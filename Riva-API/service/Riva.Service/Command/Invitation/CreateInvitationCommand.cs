using MediatR;
using Riva.Dto.Invitation;

namespace Riva.Service.Command.Invitation;

public class CreateInvitationCommand : IRequest<CreateInvitationResponse>
{
    public int UserId { get; set; }
    public int TemplateId { get; set; }
    public string Title { get; set; } = string.Empty;
    public string FieldValuesJson { get; set; } = "{}";
    public string? SeoTitle { get; set; }
    public string? SeoDescription { get; set; }
}
