using MediatR;
using Riva.Domain.Entity;
using Riva.Service.Command.Auth;
using Riva.Service.Interfaces;
using Riva.Service.Repository;

namespace Riva.Service.CommandHandler.Auth;

public class ForgotPasswordCommandHandler : IRequestHandler<ForgotPasswordCommand, Unit>
{
    private readonly IUserRepository _userRepository;
    private readonly IOtpRepository _otpRepository;
    private readonly IEmailService _emailService;

    public ForgotPasswordCommandHandler(
        IUserRepository userRepository,
        IOtpRepository otpRepository,
        IEmailService emailService)
    {
        _userRepository = userRepository;
        _otpRepository = otpRepository;
        _emailService = emailService;
    }

    public async Task<Unit> Handle(ForgotPasswordCommand request, CancellationToken cancellationToken)
    {
        var user = await _userRepository.GetByEmailAsync(request.Email)
            ?? throw new InvalidOperationException("No account found with this email address.");

        // Expire any existing pending password-reset OTPs for this email
        await _otpRepository.ExpireAllPendingForEmailAsync(request.Email, "PasswordReset");

        var otpCode = Random.Shared.Next(100000, 999999).ToString();
        await _otpRepository.SaveOtpAsync(new EmailOtp
        {
            Email = request.Email,
            OtpCode = otpCode,
            ExpiryTime = DateTime.UtcNow.AddMinutes(10),
            Status = "Pending",
            Type = "PasswordReset",
            CreatedAt = DateTime.UtcNow
        });

        await _emailService.SendPasswordResetEmailAsync(request.Email, user.Username, otpCode);

        return Unit.Value;
    }
}
