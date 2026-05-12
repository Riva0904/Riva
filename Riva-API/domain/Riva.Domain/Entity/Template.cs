namespace Riva.Domain.Entity;

public class Template
{
    public int TemplateId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public int CategoryId { get; set; }

    public string TemplateHtml { get; set; } = string.Empty;
    public string? TemplateCss { get; set; }
    public string? TemplateJs { get; set; }

    /// <summary>
    /// JSON array describing customisable fields:
    /// [{ "name": "title", "type": "text", "label": "Invitation Title", "required": true }]
    /// </summary>
    public string SchemaJson { get; set; } = "[]";

    public string? PreviewImageUrl { get; set; }
    public string? ThumbnailUrl { get; set; }

    public bool IsPaid { get; set; }
    public decimal? Price { get; set; }

    /// <summary>Free | Premium | Pro</summary>
    public string TierType { get; set; } = "Free";

    /// <summary>Draft | Published | Archived</summary>
    public string Status { get; set; } = "Draft";

    public int Version { get; set; } = 1;
    public string? Tags { get; set; }

    public int CreatedBy { get; set; }
    public DateTime CreatedDate { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedDate { get; set; }

    // Populated by JOIN queries, not a DB column on Templates
    public string? CategoryName { get; set; }
}
