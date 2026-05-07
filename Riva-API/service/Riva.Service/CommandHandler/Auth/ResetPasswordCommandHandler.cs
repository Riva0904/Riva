using MediatR;
using Riva.Service.Command.Auth;
using Riva.Service.Repository;

namespace Riva.Service.CommandHandler.Auth;

public class ResetPasswordCommandHandler : IRequestHandler<ResetPasswordCommand, Unit>
{
    private readonly IUserRepository _userRepository;
    private readonly IOtpRepository _otpRepository;

    public ResetPasswordCommandHandler(IUserRepository userRepository, IOtpRepository otpRepository)
    {
        _userRepository = userRepository;
        _otpRepository = otpRepository;
    }

    public async Task<Unit> Handle(ResetPasswordCommand request, CancellationToken cancellationToken)
    {
        if (request.NewPassword.Length < 6)
            throw new InvalidOperationException("Password must be at least 6 characters.");

        var user = await _userRepository.GetByEmailAsync(request.Email)
            ?? throw new InvalidOperationException("No account found with this email address.");

        var otp = await _otpRepository.GetLatestPendingOtpAsync(request.Email, "PasswordReset")
            ?? throw new InvalidOperationException("No pending password reset OTP found. Please request a new one.");

        if (otp.IsExpired)
            throw new InvalidOperationException("OTP has expired. Please request a new one.");

        if (otp.OtpCode != request.OtpCode)
            throw new InvalidOperationException("Invalid OTP code.");

        // Mark OTP used and update password
        await _otpRepository.MarkOtpUsedAsync(otp.Id);
        user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.NewPassword);
        user.UpdatedAt = DateTime.UtcNow;
        await _userRepository.UpdateAsync(user);

        return Unit.Value;
    }
}
