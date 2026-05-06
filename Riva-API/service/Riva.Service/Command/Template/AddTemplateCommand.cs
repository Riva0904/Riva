using MediatR;
using Riva.Dto.Template;

namespace Riva.Service.Command.Template;

public class AddTemplateCommand : IRequest<AddTemplateResponse>
{
    public string Name { get; set; } = string.Empty;
    public int CategoryId { get; set; }
    public bool IsPaid { get; set; }
    public decimal? Price { get; set; }
    public string TemplateHtml { get; set; } = string.Empty;
    public string? TemplateCss { get; set; }
    public string? TemplateJs { get; set; }
    public string SchemaJson { get; set; } = "[]";
    public string? PreviewImageUrl { get; set; }
    public int CreatedBy { get; set; }
}
