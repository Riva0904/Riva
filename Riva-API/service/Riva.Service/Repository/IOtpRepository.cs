using Riva.Domain.Entity;

namespace Riva.Service.Repository;

public interface IOtpRepository
{
    Task SaveOtpAsync(EmailOtp otp);
    Task<EmailOtp?> GetLatestPendingOtpAsync(string email, string type = "Registration");
    Task MarkOtpUsedAsync(int otpId);
    Task ExpireAllPendingForEmailAsync(string email, string type = "Registration");
    Task<bool> HasVerifiedOtpAsync(string email); // checks Type='Registration' + Status='Used'
}
