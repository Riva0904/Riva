using MediatR;
using Riva.Dto.Template;

namespace Riva.Service.Query.Template;

public class GetTemplatesQuery : IRequest<TemplatesListResponse>
{
    public int? CategoryId { get; set; }
    public bool? IsPaid { get; set; }
}

public class GetTemplateByIdQuery : IRequest<TemplateDetailDto>
{
    public int TemplateId { get; set; }
}
