namespace Riva.Domain.Entity;

public class TemplateVersion
{
    public int VersionId { get; set; }
    public int TemplateId { get; set; }
    public int Version { get; set; }

    public string? HtmlContent { get; set; }
    public string? CssContent { get; set; }
    public string? JsContent { get; set; }
    public string? SchemaJson { get; set; }

    public string? ChangedBy { get; set; }
    public string? ChangeNote { get; set; }
    public DateTime ChangedAt { get; set; } = DateTime.UtcNow;
}
