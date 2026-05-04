namespace Riva.Domain.Entity;

public class Template
{
    public int Id { get; set; }
    public int TemplateId { get; set; }
    public string Title { get; set; } = string.Empty;
    public string? RecipientName { get; set; }
    public string? Greeting { get; set; }
    public string? Location { get; set; }
    public DateTime? EventDate { get; set; }
    public string? PersonalMessage { get; set; }
    public bool IncludeGoogleMaps { get; set; }
    public string? Tier { get; set; }
    public int? MaxPhotos { get; set; }
    public string? ShareToken { get; set; }
    public bool IsPublic { get; set; }
    public int ViewCount { get; set; }
    public DateTime CreatedAt { get; set; }
    public int? UserId { get; set; }
}