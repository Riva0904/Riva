namespace Riva.Dto.Admin;

public class AdminActionDto
{
    public int Id { get; set; }
    public int AdminUserId { get; set; }
    public string AdminUsername { get; set; } = string.Empty;
    public string Action { get; set; } = string.Empty;
    public int? TargetUserId { get; set; }
    public string? TargetUsername { get; set; }
    public string? Details { get; set; }
    public string? IpAddress { get; set; }
    public DateTime Timestamp { get; set; }
}