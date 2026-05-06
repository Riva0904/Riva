using Riva.Domain.Entity;

namespace Riva.Service.Repository;

public interface IOtpRepository
{
    Task SaveOtpAsync(EmailOtp otp);
    Task<EmailOtp?> GetLatestPendingOtpAsync(string email);
    Task MarkOtpUsedAsync(int otpId);
    Task ExpireAllPendingForEmailAsync(string email);
}
