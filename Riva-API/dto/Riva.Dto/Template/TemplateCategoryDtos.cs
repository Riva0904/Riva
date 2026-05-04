namespace Riva.Dto.Template;

public class TemplateCategoryDto
{
    public int TemplateId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string ImageUrl { get; set; } = string.Empty;
    public string Tier { get; set; } = "Free";
    public int MaxPhotos { get; set; } = 3;
    public int SortOrder { get; set; }
}

public class TemplateCategoryListDto
{
    public List<TemplateCategoryDto> Templates { get; set; } = new();
}

public class SharedTemplateDto
{
    public int Id { get; set; }
    public int TemplateId { get; set; }
    public string Title { get; set; } = string.Empty;
    public string RecipientName { get; set; } = string.Empty;
    public string Greeting { get; set; } = string.Empty;
    public string Location { get; set; } = string.Empty;
    public DateTime? EventDate { get; set; }
    public string PersonalMessage { get; set; } = string.Empty;
    public bool IncludeGoogleMaps { get; set; }
    public int ViewCount { get; set; }
    public DateTime CreatedAt { get; set; }
    public string CreatorName { get; set; } = string.Empty;
}

public class ShareTemplateResponseDto
{
    public string ShareToken { get; set; } = string.Empty;
    public string ShareUrl { get; set; } = string.Empty;
    public string Message { get; set; } = string.Empty;
}