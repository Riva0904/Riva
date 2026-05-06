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
