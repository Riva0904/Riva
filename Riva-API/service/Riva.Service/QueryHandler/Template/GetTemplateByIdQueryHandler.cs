using MediatR;
using Riva.Dto.Template;
using Riva.Service.Query.Template;
using Riva.Service.Repository;

namespace Riva.Service.QueryHandler.Template;

public class GetTemplateByIdQueryHandler : IRequestHandler<GetTemplateByIdQuery, TemplateDetailDto>
{
    private readonly ITemplateRepository _templateRepository;

    public GetTemplateByIdQueryHandler(ITemplateRepository templateRepository)
    {
        _templateRepository = templateRepository;
    }

    public async Task<TemplateDetailDto> Handle(GetTemplateByIdQuery request, CancellationToken cancellationToken)
    {
        var template = await _templateRepository.GetByIdAsync(request.TemplateId)
            ?? throw new KeyNotFoundException($"Template {request.TemplateId} not found.");

        return new TemplateDetailDto
        {
            TemplateId = template.TemplateId,
            Name = template.Name,
            CategoryId = template.CategoryId,
            CategoryName = template.CategoryName ?? string.Empty,
            IsPaid = template.IsPaid,
            Price = template.Price,
            TemplateHtml = template.TemplateHtml,
            TemplateCss = template.TemplateCss,
            TemplateJs = template.TemplateJs,
            SchemaJson = template.SchemaJson,
            PreviewImageUrl = template.PreviewImageUrl,
            CreatedDate = template.CreatedDate
        };
    }
}
