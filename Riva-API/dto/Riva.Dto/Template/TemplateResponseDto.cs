namespace Riva.Dto.Template;

public class TemplatesListResponse
{
    public List<TemplateListItemDto> Templates { get; set; } = new();
    public int Total { get; set; }
}
