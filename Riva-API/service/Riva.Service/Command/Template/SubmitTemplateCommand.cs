using MediatR;
using Riva.Dto.Template;

namespace Riva.Service.Command.Template;

public class SubmitTemplateCommand : IRequest<TemplateResponseDto>
{
    public TemplateRequestDto Request { get; set; } = new();
    public int? UserId { get; set; } // Optional, for authenticated users
}