namespace Riva.Dto.Template;

public class TemplateDto
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
    public DateTime CreatedAt { get; set; }
    public int? UserId { get; set; }
}