using MediatR;
using Riva.Dto.Template;
using Riva.Service.Query.Template;
using Riva.Service.Repository;

namespace Riva.Service.QueryHandler.Template;

public class GetTemplatesQueryHandler : IRequestHandler<GetTemplatesQuery, TemplatesListResponse>
{
    private readonly ITemplateRepository _templateRepository;

    public GetTemplatesQueryHandler(ITemplateRepository templateRepository)
    {
        _templateRepository = templateRepository;
    }

    public async Task<TemplatesListResponse> Handle(GetTemplatesQuery request, CancellationToken cancellationToken)
    {
        var templates = await _templateRepository.GetAllAsync(request.CategoryId, request.IsPaid);

        var items = templates.Select(t => new TemplateListItemDto
        {
            TemplateId = t.TemplateId,
            Name = t.Name,
            CategoryId = t.CategoryId,
            CategoryName = t.CategoryName ?? string.Empty,
            IsPaid = t.IsPaid,
            Price = t.Price,
            PreviewImageUrl = t.PreviewImageUrl,
            CreatedDate = t.CreatedDate
        }).ToList();

        return new TemplatesListResponse
        {
            Templates = items,
            Total = items.Count
        };
    }
}
