namespace Riva.Dto.Template;

/// <summary>
/// DTO for template list item (summary view)
/// </summary>
public class TemplateListItemDto
{
    public int TemplateId { get; set; }
    public string Name { get; set; } = string.Empty;
    public int CategoryId { get; set; }
    public string CategoryName { get; set; } = string.Empty;
    public bool IsPaid { get; set; }
    public decimal? Price { get; set; }
    public string? PreviewImageUrl { get; set; }
    public DateTime CreatedDate { get; set; }
    public string CreatedByUsername { get; set; } = string.Empty;
}

/// <summary>
/// DTO for template detailed view
/// </summary>
public class TemplateDetailDto
{
    public int TemplateId { get; set; }
    public string Name { get; set; } = string.Empty;
    public int CategoryId { get; set; }
    public string CategoryName { get; set; } = string.Empty;
    public bool IsPaid { get; set; }
    public decimal? Price { get; set; }
    public string TemplateHtml { get; set; } = string.Empty;
    public string? TemplateCss { get; set; }
    public string? TemplateJs { get; set; }
    public string SchemaJson { get; set; } = "[]";
    public string? PreviewImageUrl { get; set; }
    public DateTime CreatedDate { get; set; }
    public int CreatedBy { get; set; }
    public string CreatedByUsername { get; set; } = string.Empty;
}

/// <summary>
/// Request DTO for adding/creating a new template (Admin only)
/// </summary>
public class AddTemplateRequest
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
}

/// <summary>
/// Response DTO for template creation
/// </summary>
public class AddTemplateResponse
{
    public int TemplateId { get; set; }
    public string Message { get; set; } = string.Empty;
    public DateTime CreatedDate { get; set; }
}

/// <summary>
/// Request DTO for updating a template
/// </summary>
public class UpdateTemplateRequest
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
}
