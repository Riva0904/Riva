using MediatR;
using Riva.Dto.Template;

namespace Riva.Service.Command.Template;

public class AddTemplateCommand : IRequest<AddTemplateResponse>
{
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public int CategoryId { get; set; }
    public bool IsPaid { get; set; }
    public decimal? Price { get; set; }
    public string TierType { get; set; } = "Free";
    public string TemplateHtml { get; set; } = string.Empty;
    public string? TemplateCss { get; set; }
    public string? TemplateJs { get; set; }
    public string SchemaJson { get; set; } = "[]";
    public string? PreviewImageUrl { get; set; }
    public string? ThumbnailUrl { get; set; }
    public string? Tags { get; set; }
    public int CreatedBy { get; set; }
}

/// <summary>Command to change a template's published/draft status.</summary>
public class UpdateTemplateStatusCommand : IRequest<Unit>
{
    public int TemplateId { get; set; }
    /// <summary>Published | Draft | Archived</summary>
    public string Status { get; set; } = "Published";
}
