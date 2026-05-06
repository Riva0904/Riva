using MediatR;
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

    public AdminRegisterCommandHandler(
        IUserRepository userRepository,
        IOtpRepository otpRepository,
        IEmailService emailService)
    {
        _userRepository = userRepository;
        _otpRepository = otpRepository;
        _emailService = emailService;
    }

    public async Task<AdminRegisterResponse> Handle(AdminRegisterCommand request, CancellationToken cancellationToken)
    {
        if (await _userRepository.GetByEmailAsync(request.Email) != null)
            throw new InvalidOperationException("An account with this email already exists.");

        if (await _userRepository.GetByUsernameAsync(request.Username) != null)
            throw new InvalidOperationException("Username is already taken.");

        var admin = new Riva.Domain.Entity.User
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

        var otpCode = Random.Shared.Next(100000, 999999).ToString();

        await _otpRepository.ExpireAllPendingForEmailAsync(request.Email);
        await _otpRepository.SaveOtpAsync(new Riva.Domain.Entity.EmailOtp
        {
            Email = request.Email,
            OtpCode = otpCode,
            ExpiryTime = DateTime.UtcNow.AddMinutes(10),
            Status = "Pending",
            CreatedAt = DateTime.UtcNow
        });

        // Try sending email — if SMTP is not configured, return OTP in response for dev use
        var emailSent = false;
        try
        {
            await _emailService.SendOtpEmailAsync(request.Email, request.Username, otpCode);
            emailSent = true;
        }
        catch
        {
            // Email not configured — OTP included in response for development
        }

        var message = emailSent
            ? "Admin account created. Check your email for the OTP."
            : $"Admin account created. Email not configured — your OTP is: {otpCode}";

        return new AdminRegisterResponse
        {
            Message = message,
            Email = request.Email
        };
    }
}
