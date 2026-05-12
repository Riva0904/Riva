using MediatR;
using Riva.Dto.Category;
using Riva.Service.Query.Category;
using Riva.Service.Repository;

namespace Riva.Service.QueryHandler.Category;

public class GetCategoriesQueryHandler : IRequestHandler<GetCategoriesQuery, List<CategoryDto>>
{
    private readonly ICategoryRepository _categoryRepository;
    private readonly ITemplateRepository _templateRepository;

    public GetCategoriesQueryHandler(ICategoryRepository categoryRepository, ITemplateRepository templateRepository)
    {
        _categoryRepository = categoryRepository;
        _templateRepository = templateRepository;
    }

    public async Task<List<CategoryDto>> Handle(GetCategoriesQuery request, CancellationToken cancellationToken)
    {
        var categories = await _categoryRepository.GetAllActiveAsync();

        IEnumerable<Riva.Domain.Entity.Template> allTemplates;
        try { allTemplates = await _templateRepository.GetAllAsync(null, null); }
        catch { allTemplates = Enumerable.Empty<Riva.Domain.Entity.Template>(); }

        return categories.Select(c => new CategoryDto
        {
            CategoryId    = c.CategoryId,
            Name          = c.Name,
            TemplateCount = allTemplates.Count(t => t.CategoryId == c.CategoryId)
        }).ToList();
    }
}
