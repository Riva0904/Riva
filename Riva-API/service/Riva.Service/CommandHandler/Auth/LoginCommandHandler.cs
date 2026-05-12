using MediatR;
using Riva.Dto.Auth;
using Riva.Service.Command.Auth;
using Riva.Service.Interfaces;
using Riva.Service.Repository;

namespace Riva.Service.CommandHandler.Auth;

public class LoginCommandHandler : IRequestHandler<LoginCommand, LoginResponse>
{
    private readonly IUserRepository _userRepository;
    private readonly IJwtService     _jwtService;

    public LoginCommandHandler(IUserRepository userRepository, IJwtService jwtService)
    {
        _userRepository = userRepository;
        _jwtService     = jwtService;
    }

    public async Task<LoginResponse> Handle(LoginCommand request, CancellationToken cancellationToken)
    {
        var user = await _userRepository.GetByEmailAsync(request.EmailOrUsername)
                   ?? await _userRepository.GetByUsernameAsync(request.EmailOrUsername);

        if (user == null || !BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash))
            throw new UnauthorizedAccessException("Invalid credentials.");

        if (!user.IsActive)
            throw new UnauthorizedAccessException("Account is disabled. Contact admin.");

        if (!user.IsVerified)
            throw new UnauthorizedAccessException("Account not verified. Please check your email for the OTP.");

        // Capture whether this is the user's very first login (before updating)
        var isFirstLogin = user.LastLoginAt == null;

        // Record the login time (fire-and-forget — never blocks the login response)
        _ = _userRepository.UpdateLastLoginAsync(user.Id);

        var token = _jwtService.GenerateToken(user);

        return new LoginResponse
        {
            Token        = token,
            Username     = user.Username,
            Email        = user.Email,
            Role         = user.Role,
            IsFirstLogin = isFirstLogin
        };
    }
}
