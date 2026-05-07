using MediatR;

namespace Riva.Service.Command.User;

public class UpdateProfileCommand : IRequest<Unit>
{
    public int UserId { get; set; }
    public string Username { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string? DisplayName { get; set; }
}

public class ChangePasswordCommand : IRequest<Unit>
{
    public int UserId { get; set; }
    public string CurrentPassword { get; set; } = string.Empty;
    public string NewPassword { get; set; } = string.Empty;
}

public class UpdateProfileImageCommand : IRequest<string>
{
    public int UserId { get; set; }
    public string ImageUrl { get; set; } = string.Empty;
}
