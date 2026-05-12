using MediatR;
using Riva.Dto.Auth;
using Riva.Service.Command.Auth;
using Riva.Service.Interfaces;
using Riva.Service.Repository;

namespace Riva.Service.CommandHandler.Auth;

public class RegisterCommandHandler : IRequestHandler<RegisterCommand, RegisterResponse>
{
    private readonly IUserRepository _userRepository;
    private readonly IOtpRepository  _otpRepository;
    private readonly IEmailService   _emailService;

    public RegisterCommandHandler(
        IUserRepository userRepository,
        IOtpRepository  otpRepository,
        IEmailService   emailService)
    {
        _userRepository = userRepository;
        _otpRepository  = otpRepository;
        _emailService   = emailService;
    }

    public async Task<RegisterResponse> Handle(RegisterCommand request, CancellationToken cancellationToken)
    {
        var existingByEmail    = await _userRepository.GetByEmailAsync(request.Email);
        var existingByUsername = await _userRepository.GetByUsernameAsync(request.Username);

        if (existingByEmail != null)
        {
            // Verified accounts cannot be re-registered
            if (existingByEmail.IsVerified)
                throw new InvalidOperationException("An account with this email already exists.");

            // Unverified: update the record so the user can retry with new details
            existingByEmail.Username     = request.Username;
            existingByEmail.PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password);
            existingByEmail.UpdatedAt    = DateTime.UtcNow;
            await _userRepository.UpdateAsync(existingByEmail);
        }
        else
        {
            // Username uniqueness: block only verified collisions
            if (existingByUsername != null && existingByUsername.IsVerified)
                throw new InvalidOperationException("Username is already taken.");

            var user = new Riva.Domain.Entity.User
            {
                Username     = request.Username,
                Email        = request.Email,
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password),
                Role         = "User",
                IsVerified   = false,
                IsActive     = true,
                CreatedAt    = DateTime.UtcNow
            };

            await _userRepository.AddAsync(user);
            await _userRepository.SaveChangesAsync();
        }

        // Expire old OTPs and issue a fresh one
        var otpCode = Random.Shared.Next(100000, 999999).ToString();
        await _otpRepository.ExpireAllPendingForEmailAsync(request.Email);
        await _otpRepository.SaveOtpAsync(new Riva.Domain.Entity.EmailOtp
        {
            Email      = request.Email,
            OtpCode    = otpCode,
            ExpiryTime = DateTime.UtcNow.AddMinutes(10),
            Status     = "Pending",
            Type       = "Registration",
            CreatedAt  = DateTime.UtcNow
        });

        var emailSent = false;
        try
        {
            await _emailService.SendOtpEmailAsync(request.Email, request.Username, otpCode);
            emailSent = true;
        }
        catch { }

        var message = emailSent
            ? "Account created! Check your email for the OTP to verify your account."
            : $"Account created! Email not configured — your OTP is: {otpCode}";

        return new RegisterResponse
        {
            Message = message,
            Email   = request.Email,
            OtpSent = emailSent
        };
    }
}
