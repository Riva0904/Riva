using MediatR;
using Riva.Service.Command.Auth;
using Riva.Service.Repository;

namespace Riva.Service.CommandHandler.Auth;

public class VerifyAdminOtpCommandHandler : IRequestHandler<VerifyAdminOtpCommand, Unit>
{
    private readonly IOtpRepository _otpRepository;
    private readonly IUserRepository _userRepository;

    public VerifyAdminOtpCommandHandler(IOtpRepository otpRepository, IUserRepository userRepository)
    {
        _otpRepository = otpRepository;
        _userRepository = userRepository;
    }

    public async Task<Unit> Handle(VerifyAdminOtpCommand request, CancellationToken cancellationToken)
    {
        var otp = await _otpRepository.GetLatestPendingOtpAsync(request.Email)
            ?? throw new InvalidOperationException("No pending OTP found for this email.");

        if (otp.IsExpired)
            throw new InvalidOperationException("OTP has expired. Please request a new one.");

        if (otp.OtpCode != request.OtpCode)
            throw new InvalidOperationException("Invalid OTP.");

        await _otpRepository.MarkOtpUsedAsync(otp.Id);
        await _userRepository.SetVerifiedAsync(request.Email);

        return Unit.Value;
    }
}
