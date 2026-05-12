using MailKit.Net.Smtp;
using MailKit.Security;
using MimeKit;
using Riva.Service.Interfaces;

namespace Riva.Api.Services;

public class EmailService : IEmailService
{
    private readonly IConfiguration _config;

    public EmailService(IConfiguration config)
    {
        _config = config;
    }

    public async Task SendOtpEmailAsync(string toEmail, string toName, string otpCode)
    {
        var message = new MimeMessage();
        message.From.Add(new MailboxAddress(
            _config["Email:FromName"] ?? "Riva Invitations",
            _config["Email:FromAddress"]));
        message.To.Add(new MailboxAddress(toName, toEmail));
        message.Subject = "Your Riva Admin Verification OTP";

        message.Body = new TextPart("html")
        {
            Text = BuildOtpEmailHtml(toName, otpCode)
        };

        using var client = new SmtpClient();
        await client.ConnectAsync(
            _config["Email:Host"],
            int.Parse(_config["Email:Port"] ?? "587"),
            SecureSocketOptions.StartTls);
        await client.AuthenticateAsync(_config["Email:Username"], _config["Email:Password"]);
        await client.SendAsync(message);
        await client.DisconnectAsync(true);
    }

    public async Task SendPasswordResetEmailAsync(string toEmail, string toName, string otpCode)
    {
        var message = new MimeMessage();
        message.From.Add(new MailboxAddress(
            _config["Email:FromName"] ?? "Riva Invitations",
            _config["Email:FromAddress"]));
        message.To.Add(new MailboxAddress(toName, toEmail));
        message.Subject = "Reset Your Riva Password";

        message.Body = new TextPart("html")
        {
            Text = BuildPasswordResetEmailHtml(toName, otpCode)
        };

        using var client = new SmtpClient();
        await client.ConnectAsync(
            _config["Email:Host"],
            int.Parse(_config["Email:Port"] ?? "587"),
            SecureSocketOptions.StartTls);
        await client.AuthenticateAsync(_config["Email:Username"], _config["Email:Password"]);
        await client.SendAsync(message);
        await client.DisconnectAsync(true);
    }

    public async Task SendRsvpNotificationAsync(string ownerEmail, string ownerName,
        string guestName, string status, string? message, string invitationTitle, string dashboardLink)
    {
        var (color, emoji) = status switch
        {
            "Accepted" => ("#16a34a", "✅"),
            "Declined" => ("#dc2626", "❌"),
            _          => ("#d97706", "🤔")
        };

        var msgBlock = string.IsNullOrWhiteSpace(message) ? "" : $@"
          <div style='background:#f8fafc;border-left:4px solid {color};border-radius:0 8px 8px 0;padding:12px 16px;margin:16px 0;'>
            <p style='margin:0;color:#475569;font-style:italic;'>{message}</p>
          </div>";

        var html = $@"<!DOCTYPE html><html><head><meta charset='UTF-8'></head>
<body style='font-family:Arial,sans-serif;background:#f0fdf4;padding:32px;'>
  <div style='max-width:520px;margin:0 auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 2px 16px rgba(0,0,0,.08);'>
    <div style='background:linear-gradient(135deg,#16a34a,#059669);padding:28px 32px;'>
      <h2 style='color:#fff;margin:0;font-size:1.4rem;'>🎉 New RSVP Response</h2>
      <p style='color:#bbf7d0;margin:6px 0 0;font-size:.9rem;'>For your invitation: <strong>{invitationTitle}</strong></p>
    </div>
    <div style='padding:28px 32px;'>
      <p style='margin:0 0 8px;'>Hi <strong>{ownerName}</strong>,</p>
      <p style='margin:0 0 16px;color:#475569;'><strong>{guestName}</strong> has responded to your invitation:</p>
      <div style='text-align:center;margin:20px 0;'>
        <span style='display:inline-block;background:{color};color:#fff;font-weight:bold;font-size:1.1rem;padding:10px 32px;border-radius:999px;'>{emoji} {status}</span>
      </div>
      {msgBlock}
      <div style='text-align:center;margin:28px 0 8px;'>
        <a href='{dashboardLink}' style='display:inline-block;background:linear-gradient(135deg,#16a34a,#059669);color:#fff;font-weight:bold;padding:14px 32px;border-radius:10px;text-decoration:none;font-size:.95rem;'>
          View All Responses →
        </a>
      </div>
      <p style='color:#94a3b8;font-size:.8rem;text-align:center;margin-top:24px;'>Riva Digital Invitation Platform</p>
    </div>
  </div>
</body></html>";

        var mail = new MimeMessage();
        mail.From.Add(new MailboxAddress(_config["Email:FromName"] ?? "Riva Invitations", _config["Email:FromAddress"]));
        mail.To.Add(new MailboxAddress(ownerName, ownerEmail));
        mail.Subject = $"New RSVP: {guestName} responded to \"{invitationTitle}\"";
        mail.Body    = new TextPart("html") { Text = html };

        using var client = new SmtpClient();
        await client.ConnectAsync(_config["Email:Host"], int.Parse(_config["Email:Port"] ?? "587"), SecureSocketOptions.StartTls);
        await client.AuthenticateAsync(_config["Email:Username"], _config["Email:Password"]);
        await client.SendAsync(mail);
        await client.DisconnectAsync(true);
    }

    public async Task SendWelcomeEmailAsync(string toEmail, string toName, string dashboardLink)
    {
        var html = $@"<!DOCTYPE html><html><head><meta charset='UTF-8'></head>
<body style='font-family:Arial,sans-serif;background:#f0fdf4;padding:32px;'>
  <div style='max-width:520px;margin:0 auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 2px 16px rgba(0,0,0,.08);'>
    <div style='background:linear-gradient(135deg,#16a34a,#059669);padding:32px;text-align:center;'>
      <div style='font-size:3rem;margin-bottom:8px;'>🎉</div>
      <h1 style='color:#fff;margin:0;font-size:1.6rem;'>Welcome to Riva!</h1>
      <p style='color:#bbf7d0;margin:8px 0 0;'>Your account is verified and ready to go.</p>
    </div>
    <div style='padding:32px;'>
      <p>Hi <strong>{toName}</strong>,</p>
      <p style='color:#475569;line-height:1.7;'>
        You're all set! Start creating beautiful digital invitations in minutes —
        choose from stunning animated templates, share with one link, and track RSVPs in real time.
      </p>
      <div style='background:#f0fdf4;border-radius:12px;padding:20px;margin:20px 0;'>
        <p style='margin:0 0 8px;font-weight:bold;color:#15803d;'>What you can do:</p>
        <p style='margin:4px 0;color:#475569;font-size:.9rem;'>🎨 Browse 50+ animated templates</p>
        <p style='margin:4px 0;color:#475569;font-size:.9rem;'>📩 Send invitations via link, QR, or WhatsApp</p>
        <p style='margin:4px 0;color:#475569;font-size:.9rem;'>📊 Track RSVPs in real time</p>
      </div>
      <div style='text-align:center;margin:24px 0;'>
        <a href='{dashboardLink}' style='display:inline-block;background:linear-gradient(135deg,#16a34a,#059669);color:#fff;font-weight:bold;padding:14px 36px;border-radius:12px;text-decoration:none;font-size:1rem;'>
          Go to Dashboard →
        </a>
      </div>
      <p style='color:#94a3b8;font-size:.8rem;text-align:center;'>Riva Digital Invitation Platform</p>
    </div>
  </div>
</body></html>";

        await SendAsync(toEmail, toName, "🎉 Welcome to Riva — You're all set!", html);
    }

    public async Task SendNewUserAlertAsync(string adminEmail, string newUsername, string newEmail, string joinedAt)
    {
        var html = $@"<!DOCTYPE html><html><head><meta charset='UTF-8'></head>
<body style='font-family:Arial,sans-serif;background:#f8fafc;padding:32px;'>
  <div style='max-width:480px;margin:0 auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,.08);'>
    <div style='background:linear-gradient(135deg,#1e40af,#3b82f6);padding:24px 32px;'>
      <h2 style='color:#fff;margin:0;font-size:1.2rem;'>👤 New User Registration</h2>
    </div>
    <div style='padding:28px 32px;'>
      <p style='margin:0 0 16px;color:#475569;'>A new user has verified their account on Riva:</p>
      <div style='background:#f8fafc;border-radius:10px;padding:16px;margin-bottom:16px;'>
        <p style='margin:4px 0;font-size:.9rem;color:#334155;'>👤 <strong>Username:</strong> {newUsername}</p>
        <p style='margin:4px 0;font-size:.9rem;color:#334155;'>📧 <strong>Email:</strong> {newEmail}</p>
        <p style='margin:4px 0;font-size:.9rem;color:#334155;'>🕐 <strong>Joined:</strong> {joinedAt}</p>
      </div>
      <p style='color:#94a3b8;font-size:.8rem;text-align:center;'>Riva Admin Notification</p>
    </div>
  </div>
</body></html>";

        await SendAsync(adminEmail, "Riva Admin", $"New user joined: {newUsername}", html);
    }

    private async Task SendAsync(string toEmail, string toName, string subject, string html)
    {
        var mail = new MimeMessage();
        mail.From.Add(new MailboxAddress(_config["Email:FromName"] ?? "Riva Invitations", _config["Email:FromAddress"]));
        mail.To.Add(new MailboxAddress(toName, toEmail));
        mail.Subject = subject;
        mail.Body    = new TextPart("html") { Text = html };

        using var client = new SmtpClient();
        await client.ConnectAsync(_config["Email:Host"], int.Parse(_config["Email:Port"] ?? "587"), SecureSocketOptions.StartTls);
        await client.AuthenticateAsync(_config["Email:Username"], _config["Email:Password"]);
        await client.SendAsync(mail);
        await client.DisconnectAsync(true);
    }

    public async Task SendLoginAlertAsync(string toEmail, string toName, string loginTime, string settingsLink)
    {
        var html = $@"<!DOCTYPE html><html><head><meta charset='UTF-8'></head>
<body style='font-family:Arial,sans-serif;background:#f0fdf4;padding:32px;'>
  <div style='max-width:520px;margin:0 auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 2px 16px rgba(0,0,0,.08);'>
    <div style='background:linear-gradient(135deg,#16a34a,#059669);padding:32px;text-align:center;'>
      <div style='font-size:3rem;margin-bottom:8px;'>🎉</div>
      <h2 style='color:#fff;margin:0;font-size:1.5rem;font-weight:900;'>Congratulations!</h2>
      <p style='color:#bbf7d0;margin:6px 0 0;font-size:.95rem;'>You have successfully signed in to Riva</p>
    </div>
    <div style='padding:28px 32px;'>
      <p>Hi <strong>{toName}</strong>,</p>
      <p style='color:#475569;line-height:1.7;'>
        Welcome back! You are now signed in to your Riva account. Start creating beautiful digital invitations and tracking your RSVPs in real time.
      </p>
      <div style='background:#f0fdf4;border-radius:12px;padding:16px;margin:20px 0;border-left:4px solid #16a34a;'>
        <p style='margin:0;font-size:.9rem;color:#334155;'>🕐 <strong>Login time:</strong> {loginTime}</p>
      </div>
      <div style='text-align:center;margin:24px 0 8px;'>
        <a href='{settingsLink.Replace("/settings", "/dashboard")}' style='display:inline-block;background:linear-gradient(135deg,#16a34a,#059669);color:#fff;font-weight:bold;padding:14px 32px;border-radius:10px;text-decoration:none;font-size:.95rem;'>
          Go to Dashboard →
        </a>
      </div>
      <p style='color:#94a3b8;font-size:.75rem;text-align:center;margin-top:20px;'>
        Not you? <a href='{settingsLink}' style='color:#16a34a;'>Change your password</a> immediately.
      </p>
      <p style='color:#94a3b8;font-size:.8rem;text-align:center;'>Riva Digital Invitation Platform</p>
    </div>
  </div>
</body></html>";

        var mail = new MimeMessage();
        mail.From.Add(new MailboxAddress(_config["Email:FromName"] ?? "Riva Invitations", _config["Email:FromAddress"]));
        mail.To.Add(new MailboxAddress(toName, toEmail));
        mail.Subject = "Security Alert: New login to your Riva account";
        mail.Body    = new TextPart("html") { Text = html };

        using var client = new SmtpClient();
        await client.ConnectAsync(_config["Email:Host"], int.Parse(_config["Email:Port"] ?? "587"), SecureSocketOptions.StartTls);
        await client.AuthenticateAsync(_config["Email:Username"], _config["Email:Password"]);
        await client.SendAsync(mail);
        await client.DisconnectAsync(true);
    }

    public async Task SendPasswordChangedAlertAsync(string toEmail, string toName)
    {
        var html = $@"<!DOCTYPE html><html><head><meta charset='UTF-8'></head>
<body style='font-family:Arial,sans-serif;background:#f0fdf4;padding:32px;'>
  <div style='max-width:520px;margin:0 auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 2px 16px rgba(0,0,0,.08);'>
    <div style='background:linear-gradient(135deg,#d97706,#b45309);padding:28px 32px;'>
      <h2 style='color:#fff;margin:0;font-size:1.3rem;'>🔑 Password Changed</h2>
    </div>
    <div style='padding:28px 32px;'>
      <p>Hi <strong>{toName}</strong>,</p>
      <p style='color:#475569;'>Your Riva account password was successfully changed.</p>
      <p style='color:#dc2626;font-weight:bold;'>If you did not make this change, contact support immediately.</p>
      <p style='color:#94a3b8;font-size:.8rem;text-align:center;margin-top:24px;'>Riva Digital Invitation Platform</p>
    </div>
  </div>
</body></html>";

        var mail = new MimeMessage();
        mail.From.Add(new MailboxAddress(_config["Email:FromName"] ?? "Riva Invitations", _config["Email:FromAddress"]));
        mail.To.Add(new MailboxAddress(toName, toEmail));
        mail.Subject = "Security Alert: Your Riva password was changed";
        mail.Body    = new TextPart("html") { Text = html };

        using var client = new SmtpClient();
        await client.ConnectAsync(_config["Email:Host"], int.Parse(_config["Email:Port"] ?? "587"), SecureSocketOptions.StartTls);
        await client.AuthenticateAsync(_config["Email:Username"], _config["Email:Password"]);
        await client.SendAsync(mail);
        await client.DisconnectAsync(true);
    }

    private static string BuildPasswordResetEmailHtml(string name, string otp) => $@"
<!DOCTYPE html>
<html>
<head><meta charset='UTF-8'></head>
<body style='font-family:Arial,sans-serif;background:#f4f4f4;padding:32px;'>
  <div style='max-width:480px;margin:0 auto;background:#fff;border-radius:12px;padding:32px;box-shadow:0 2px 12px rgba(0,0,0,.08);'>
    <h2 style='color:#dc2626;margin-top:0;'>Password Reset Request</h2>
    <p>Hi <strong>{name}</strong>,</p>
    <p>We received a request to reset your Riva account password. Use the OTP below. It expires in <strong>10 minutes</strong>.</p>
    <div style='text-align:center;margin:32px 0;'>
      <span style='display:inline-block;background:#dc2626;color:#fff;font-size:2rem;font-weight:bold;letter-spacing:8px;padding:16px 32px;border-radius:8px;'>{otp}</span>
    </div>
    <p style='color:#888;font-size:0.85rem;'>If you did not request a password reset, ignore this email. Your password will not change.</p>
  </div>
</body>
</html>";

    private static string BuildOtpEmailHtml(string name, string otp) => $@"
<!DOCTYPE html>
<html>
<head><meta charset='UTF-8'></head>
<body style='font-family:Arial,sans-serif;background:#f4f4f4;padding:32px;'>
  <div style='max-width:480px;margin:0 auto;background:#fff;border-radius:12px;padding:32px;box-shadow:0 2px 12px rgba(0,0,0,.08);'>
    <h2 style='color:#6d28d9;margin-top:0;'>Admin Account Verification</h2>
    <p>Hi <strong>{name}</strong>,</p>
    <p>Use the OTP below to verify your Riva admin account. It expires in <strong>10 minutes</strong>.</p>
    <div style='text-align:center;margin:32px 0;'>
      <span style='display:inline-block;background:#6d28d9;color:#fff;font-size:2rem;font-weight:bold;letter-spacing:8px;padding:16px 32px;border-radius:8px;'>{otp}</span>
    </div>
    <p style='color:#888;font-size:0.85rem;'>If you did not request this, ignore this email.</p>
  </div>
</body>
</html>";
}
