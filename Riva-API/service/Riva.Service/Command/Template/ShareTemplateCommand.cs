using MediatR;
using Riva.Dto.Template;

namespace Riva.Service.Command.Template;

public class ShareTemplateCommand : IRequest<ShareTemplateResponseDto>
{
    public int TemplateId { get; set; }
    public int? UserId { get; set; }
}