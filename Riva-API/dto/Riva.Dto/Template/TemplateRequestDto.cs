namespace Riva.Dto.Template;

public class TemplateRequestDto
{
    public int TemplateId { get; set; }
    public string Title { get; set; } = string.Empty;
    public string RecipientName { get; set; } = string.Empty;
    public string Greeting { get; set; } = string.Empty;
    public string Location { get; set; } = string.Empty;
    public string EventDate { get; set; } = string.Empty;
    public string PersonalMessage { get; set; } = string.Empty;
    public bool IncludeGoogleMaps { get; set; }
}