namespace Riva.Service.Interfaces;

public interface IEmailService
{
    Task SendOtpEmailAsync(string toEmail, string toName, string otpCode);
    Task SendPasswordResetEmailAsync(string toEmail, string toName, string otpCode);
    Task SendRsvpNotificationAsync(string ownerEmail, string ownerName,
        string guestName, string status, string? message, string invitationTitle, string dashboardLink);
    Task SendLoginAlertAsync(string toEmail, string toName, string loginTime, string settingsLink);
    Task SendPasswordChangedAlertAsync(string toEmail, string toName);
    Task SendWelcomeEmailAsync(string toEmail, string toName, string dashboardLink);
    Task SendNewUserAlertAsync(string adminEmail, string newUsername, string newEmail, string joinedAt);
}
