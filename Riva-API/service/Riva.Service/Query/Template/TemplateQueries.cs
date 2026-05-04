using MediatR;
using Riva.Dto.Template;

namespace Riva.Service.Query.Template;

public class GetTemplatesByTierQuery : IRequest<TemplateCategoryListDto>
{
    public string UserTier { get; set; } = "Free";
}

public class GetTemplateCategoriesQuery : IRequest<TemplateCategoryListDto>
{
}

public class GetSharedTemplateQuery : IRequest<SharedTemplateDto>
{
    public string ShareToken { get; set; } = string.Empty;
}