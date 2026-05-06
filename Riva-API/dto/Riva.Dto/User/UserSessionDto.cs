namespace Riva.Dto.User;

public class UserSessionDto
{
    public int UserId { get; set; }
    public string Username { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Role { get; set; } = string.Empty;
    public bool IsActive { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? LastLoginAt { get; set; }
    public TemplateStats Templates { get; set; } = new();
    public List<CategoryStat> Categories { get; set; } = new();
}

public class TemplateStats
{
    public int Free { get; set; }
    public int Paid { get; set; }
    public int Total { get; set; }
}

public class CategoryStat
{
    public int CategoryId { get; set; }
    public string Name { get; set; } = string.Empty;
    public int FreeCount { get; set; }
    public int PaidCount { get; set; }
    public int Total { get; set; }
}
