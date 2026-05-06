using MediatR;
using Riva.Dto.Auth;
using Riva.Service.Command.Auth;
using Riva.Service.Interfaces;
using Riva.Service.Repository;

namespace Riva.Service.CommandHandler.Auth;

public class LoginCommandHandler : IRequestHandler<LoginCommand, LoginResponse>
{
    private readonly IUserRepository _userRepository;
    private readonly IOtpRepository _otpRepository;
    private readonly IJwtService _jwtService;

    public LoginCommandHandler(
        IUserRepository userRepository,
        IOtpRepository otpRepository,
        IJwtService jwtService)
    {
        _userRepository = userRepository;
        _otpRepository = otpRepository;
        _jwtService = jwtService;
    }

    public async Task<LoginResponse> Handle(LoginCommand request, CancellationToken cancellationToken)
    {
        var user = await _userRepository.GetByEmailAsync(request.EmailOrUsername)
                   ?? await _userRepository.GetByUsernameAsync(request.EmailOrUsername);

        if (user == null || !BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash))
            throw new UnauthorizedAccessException("Invalid credentials.");

        if (!user.IsActive)
            throw new UnauthorizedAccessException("Account is disabled. Contact admin.");

        // All users must verify OTP before logging in
        var hasVerifiedOtp = await _otpRepository.HasVerifiedOtpAsync(user.Email);
        if (!hasVerifiedOtp)
            throw new UnauthorizedAccessException("Account not verified. Please check your email for the OTP.");

        var token = _jwtService.GenerateToken(user);

        return new LoginResponse
        {
            Token = token,
            Username = user.Username,
            Email = user.Email,
            Role = user.Role
        };
    }
}
