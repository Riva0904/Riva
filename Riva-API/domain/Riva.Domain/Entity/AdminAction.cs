namespace Riva.Domain.Entity;

public class AdminAction
{
    public int Id { get; set; }
    public int AdminUserId { get; set; }
    public string Action { get; set; } = string.Empty;
    public int? TargetUserId { get; set; }
    public string? Details { get; set; }
    public string? IpAddress { get; set; }
    public DateTime Timestamp { get; set; } = DateTime.UtcNow;

    // Navigation property
    public User? AdminUser { get; set; }
    public User? TargetUser { get; set; }
}