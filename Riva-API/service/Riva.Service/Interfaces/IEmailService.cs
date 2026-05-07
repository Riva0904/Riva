namespace Riva.Service.Interfaces;

public interface IEmailService
{
    Task SendOtpEmailAsync(string toEmail, string toName, string otpCode);
    Task SendPasswordResetEmailAsync(string toEmail, string toName, string otpCode);
}
