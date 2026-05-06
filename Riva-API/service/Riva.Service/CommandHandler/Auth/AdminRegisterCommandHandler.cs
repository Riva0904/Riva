using MediatR;
using Microsoft.Extensions.Configuration;
using Riva.Domain.Entity;
using Riva.Dto.Auth;
using Riva.Service.Command.Auth;
using Riva.Service.Interfaces;
using Riva.Service.Repository;

namespace Riva.Service.CommandHandler.Auth;

public class AdminRegisterCommandHandler : IRequestHandler<AdminRegisterCommand, AdminRegisterResponse>
{
    private readonly IUserRepository _userRepository;
    private readonly IOtpRepository _otpRepository;
    private readonly IEmailService _emailService;
    private readonly IConfiguration _configuration;

    public AdminRegisterCommandHandler(
        IUserRepository userRepository,
        IOtpRepository otpRepository,
        IEmailService emailService,
        IConfiguration configuration)
    {
        _userRepository = userRepository;
        _otpRepository = otpRepository;
        _emailService = emailService;
        _configuration = configuration;
    }

    public async Task<AdminRegisterResponse> Handle(AdminRegisterCommand request, CancellationToken cancellationToken)
    {
        var expectedSecret = _configuration["AdminRegistration:SecretKey"];
        if (string.IsNullOrWhiteSpace(expectedSecret) || request.SecretKey != expectedSecret)
            throw new UnauthorizedAccessException("Invalid admin secret key.");

        if (await _userRepository.GetByEmailAsync(request.Email) != null)
            throw new InvalidOperationException("An account with this email already exists.");

        if (await _userRepository.GetByUsernameAsync(request.Username) != null)
            throw new InvalidOperationException("Username is already taken.");

        var admin = new User
        {
            Username = request.Username,
            Email = request.Email,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password),
            Role = "Admin",
            IsVerified = false,
            IsActive = true,
            CreatedAt = DateTime.UtcNow
        };

        await _userRepository.AddAsync(admin);
        await _userRepository.SaveChangesAsync();

        await SendOtpAsync(request.Email, request.Username);

        return new AdminRegisterResponse
        {
            Message = "Admin account created. Check your email for the OTP to complete verification.",
            Email = request.Email
        };
    }

    private async Task SendOtpAsync(string email, string name)
    {
        await _otpRepository.ExpireAllPendingForEmailAsync(email);

        var otpCode = GenerateOtp();
        var otp = new EmailOtp
        {
            Email = email,
            OtpCode = otpCode,
            ExpiryTime = DateTime.UtcNow.AddMinutes(10),
            Status = "Pending",
            CreatedAt = DateTime.UtcNow
        };

        await _otpRepository.SaveOtpAsync(otp);
        await _emailService.SendOtpEmailAsync(email, name, otpCode);
    }

    private static string GenerateOtp()
    {
        return Random.Shared.Next(100000, 999999).ToString();
    }
}
