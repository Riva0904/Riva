namespace Riva.Dto.Template;

public class TemplateResponseDto
{
    public int TemplateId { get; set; }
    public string PreviewHtml { get; set; } = string.Empty;
    public string Message { get; set; } = string.Empty;
}