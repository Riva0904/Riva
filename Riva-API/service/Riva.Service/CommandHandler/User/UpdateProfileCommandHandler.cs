using MediatR;
using Riva.Service.Command.User;
using Riva.Service.Repository;

namespace Riva.Service.CommandHandler.User;

public class UpdateProfileCommandHandler : IRequestHandler<UpdateProfileCommand, Unit>
{
    private readonly IUserRepository _users;
    public UpdateProfileCommandHandler(IUserRepository users) => _users = users;

    public async Task<Unit> Handle(UpdateProfileCommand req, CancellationToken ct)
    {
        var user = await _users.GetByIdAsync(req.UserId)
            ?? throw new KeyNotFoundException("User not found.");

        if (req.Username.Trim() != user.Username)
        {
            var existing = await _users.GetByUsernameAsync(req.Username.Trim());
            if (existing != null && existing.Id != req.UserId)
                throw new InvalidOperationException("Username is already taken.");
        }

        if (req.Email.Trim().ToLower() != user.Email.ToLower())
        {
            var existing = await _users.GetByEmailAsync(req.Email.Trim());
            if (existing != null && existing.Id != req.UserId)
                throw new InvalidOperationException("Email is already in use.");
        }

        user.Username    = req.Username.Trim();
        user.Email       = req.Email.Trim();
        user.DisplayName = req.DisplayName?.Trim();
        user.UpdatedAt   = DateTime.UtcNow;
        await _users.UpdateAsync(user);
        return Unit.Value;
    }
}

public class ChangePasswordCommandHandler : IRequestHandler<ChangePasswordCommand, Unit>
{
    private readonly IUserRepository _users;
    public ChangePasswordCommandHandler(IUserRepository users) => _users = users;

    public async Task<Unit> Handle(ChangePasswordCommand req, CancellationToken ct)
    {
        if (req.NewPassword.Length < 6)
            throw new ArgumentException("New password must be at least 6 characters.");

        var user = await _users.GetByIdAsync(req.UserId)
            ?? throw new KeyNotFoundException("User not found.");

        if (!BCrypt.Net.BCrypt.Verify(req.CurrentPassword, user.PasswordHash))
            throw new UnauthorizedAccessException("Current password is incorrect.");

        user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(req.NewPassword);
        user.UpdatedAt    = DateTime.UtcNow;
        await _users.UpdateAsync(user);
        return Unit.Value;
    }
}

public class UpdateProfileImageCommandHandler : IRequestHandler<UpdateProfileImageCommand, string>
{
    private readonly IUserRepository _users;
    public UpdateProfileImageCommandHandler(IUserRepository users) => _users = users;

    public async Task<string> Handle(UpdateProfileImageCommand req, CancellationToken ct)
    {
        var user = await _users.GetByIdAsync(req.UserId)
            ?? throw new KeyNotFoundException("User not found.");

        user.ProfileImageUrl = req.ImageUrl;
        user.UpdatedAt       = DateTime.UtcNow;
        await _users.UpdateAsync(user);
        return req.ImageUrl;
    }
}
