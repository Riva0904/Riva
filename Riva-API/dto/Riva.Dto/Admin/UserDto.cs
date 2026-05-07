namespace Riva.Dto.Admin;

public class UserDto
{
    public int Id { get; set; }
    public string Username { get; set; } = string.Empty;
    public string? DisplayName { get; set; }
    public string Email { get; set; } = string.Empty;
    public string Role { get; set; } = string.Empty;
    public bool IsActive { get; set; }
    public string? ProfileImageUrl { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
    public DateTime? LastLoginAt { get; set; }
}

/// <summary>Full profile — returned by GET /api/users/profile</summary>
public class UserProfileDto : UserDto
{
    public int FreeTemplatesUsed { get; set; }
    public int PaidTemplatesUsed { get; set; }
    public int TotalInvitationsCreated { get; set; }
    /// <summary>Active | Expired</summary>
    public string SessionStatus { get; set; } = "Active";
}

public class UpdateProfileRequest
{
    public string Username { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string? DisplayName { get; set; }
}

public class ChangePasswordRequest
{
    public string CurrentPassword { get; set; } = string.Empty;
    public string NewPassword { get; set; } = string.Empty;
    public string ConfirmPassword { get; set; } = string.Empty;
}
