using MediatR;
using Riva.Domain.Entity;
using Riva.Service.Command.Auth;
using Riva.Service.Interfaces;
using Riva.Service.Repository;

namespace Riva.Service.CommandHandler.Auth;

public class ResendOtpCommandHandler : IRequestHandler<ResendOtpCommand, Unit>
{
    private readonly IUserRepository _userRepository;
    private readonly IOtpRepository _otpRepository;
    private readonly IEmailService _emailService;

    public ResendOtpCommandHandler(
        IUserRepository userRepository,
        IOtpRepository otpRepository,
        IEmailService emailService)
    {
        _userRepository = userRepository;
        _otpRepository = otpRepository;
        _emailService = emailService;
    }

    public async Task<Unit> Handle(ResendOtpCommand request, CancellationToken cancellationToken)
    {
        var user = await _userRepository.GetByEmailAsync(request.Email)
            ?? throw new InvalidOperationException("No account found with this email.");

        if (user.IsVerified)
            throw new InvalidOperationException("Account is already verified.");

        await _otpRepository.ExpireAllPendingForEmailAsync(request.Email);

        var otpCode = Random.Shared.Next(100000, 999999).ToString();
        var otp = new EmailOtp
        {
            Email = request.Email,
            OtpCode = otpCode,
            ExpiryTime = DateTime.UtcNow.AddMinutes(10),
            Status = "Pending",
            CreatedAt = DateTime.UtcNow
        };

        await _otpRepository.SaveOtpAsync(otp);
        await _emailService.SendOtpEmailAsync(request.Email, user.Username, otpCode);

        return Unit.Value;
    }
}
