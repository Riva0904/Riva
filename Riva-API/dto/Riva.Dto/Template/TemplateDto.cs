namespace Riva.Dto.Template;

public class TemplateListItemDto
{
    public int TemplateId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public int CategoryId { get; set; }
    public string CategoryName { get; set; } = string.Empty;
    public bool IsPaid { get; set; }
    public decimal? Price { get; set; }
    public string TierType { get; set; } = "Free";
    public string? PreviewImageUrl { get; set; }
    public string? ThumbnailUrl { get; set; }
    public string Status { get; set; } = "Published";
    public DateTime CreatedDate { get; set; }
    public string CreatedByUsername { get; set; } = string.Empty;
}

public class TemplateDetailDto
{
    public int TemplateId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public int CategoryId { get; set; }
    public string CategoryName { get; set; } = string.Empty;
    public bool IsPaid { get; set; }
    public decimal? Price { get; set; }
    public string TierType { get; set; } = "Free";
    public string TemplateHtml { get; set; } = string.Empty;
    public string? TemplateCss { get; set; }
    public string? TemplateJs { get; set; }
    public string SchemaJson { get; set; } = "[]";
    public string? PreviewImageUrl { get; set; }
    public string? ThumbnailUrl { get; set; }
    public string Status { get; set; } = "Published";
    public DateTime CreatedDate { get; set; }
    public int CreatedBy { get; set; }
    public string CreatedByUsername { get; set; } = string.Empty;
}

public class AddTemplateRequest
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
}

public class UpdateStatusRequest
{
    /// <summary>Published | Draft | Archived</summary>
    public string Status { get; set; } = "Published";
}

public class AddTemplateResponse
{
    public int TemplateId { get; set; }
    public string Message { get; set; } = string.Empty;
    public DateTime CreatedDate { get; set; }
}

public class UpdateTemplateRequest
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
}
