namespace Riva.Service.Interfaces;

public interface IEmailService
{
    Task SendOtpEmailAsync(string toEmail, string toName, string otpCode);
    Task SendPasswordResetEmailAsync(string toEmail, string toName, string otpCode);
    Task SendRsvpNotificationAsync(string ownerEmail, string ownerName,
        string guestName, string status, string? message, string invitationTitle, string dashboardLink);
}
