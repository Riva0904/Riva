using System.Security.Cryptography;
using System.Text;
using MediatR;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.Extensions.Caching.Memory;
using Riva.Dto.Auth;
using Riva.Service.Command.Auth;
using Riva.Service.Interfaces;
using Riva.Service.Repository;

namespace Riva.Api.Controllers;

[ApiController]
[Route("api/auth")]
public class AuthController : ControllerBase
{
    private readonly IMediator             _mediator;
    private readonly IConfiguration        _config;
    private readonly IEmailService         _email;
    private readonly IMemoryCache          _cache;
    private readonly IUserRepository       _users;
    private readonly IJwtService           _jwt;
    private readonly IUserDeviceRepository _devices;

    private const int MaxFailedAttempts = 5;
    private const int LockoutMinutes    = 30;

    public AuthController(IMediator mediator, IConfiguration config,
        IEmailService email, IMemoryCache cache, IUserRepository users,
        IJwtService jwt, IUserDeviceRepository devices)
    {
        _mediator = mediator;
        _config   = config;
        _email    = email;
        _cache    = cache;
        _users    = users;
        _jwt      = jwt;
        _devices  = devices;
    }

    private string DeviceHash(string? userAgent, string? ip)
    {
        var raw = $"{userAgent?.ToLowerInvariant()}|{ip}";
        return Convert.ToHexString(SHA256.HashData(Encoding.UTF8.GetBytes(raw)))[..32];
    }

    private string FriendlyDevice(string? userAgent)
    {
        if (string.IsNullOrWhiteSpace(userAgent)) return "Unknown device";
        if (userAgent.Contains("iPhone") || userAgent.Contains("iPad")) return "iPhone / iPad";
        if (userAgent.Contains("Android")) return "Android device";
        if (userAgent.Contains("Windows")) return "Windows PC";
        if (userAgent.Contains("Macintosh")) return "Mac";
        if (userAgent.Contains("Linux")) return "Linux device";
        return "Unknown browser";
    }

    private string LockoutKey(string id) => $"lockout:{id}";
    private string FailKey(string id)    => $"fails:{id}";

    // ── User Auth ─────────────────────────────────────────────────────

    [HttpPost("login")]
    [EnableRateLimiting("login")]
    public async Task<IActionResult> Login([FromBody] LoginRequest request)
    {
        var id = request.EmailOrUsername?.ToLowerInvariant() ?? "";

        // Check lockout
        if (_cache.TryGetValue(LockoutKey(id), out _))
            return StatusCode(423, new { Message = $"Account locked due to too many failed attempts. Try again in {LockoutMinutes} minutes." });

        try
        {
            var response = await _mediator.Send(new LoginCommand
            {
                EmailOrUsername = request.EmailOrUsername,
                Password        = request.Password
            });

            // Reset failed attempts on success
            _cache.Remove(FailKey(id));

            // ── Smart login notifications ──────────────────────────────────
            try
            {
                var frontendUrl  = _config["App:FrontendUrl"]?.TrimEnd('/') ?? "http://localhost:5173";
                var ua           = Request.Headers["User-Agent"].ToString();
                var ip           = HttpContext.Connection.RemoteIpAddress?.ToString() ?? "unknown";
                var deviceHash   = DeviceHash(ua, ip);
                var deviceLabel  = FriendlyDevice(ua);
                var loginTime    = DateTime.UtcNow.ToString("dddd, dd MMM yyyy HH:mm 'UTC'");

                if (response.IsFirstLogin)
                {
                    // First ever login → welcome email + register device
                    await _email.SendFirstLoginWelcomeAsync(
                        response.Email, response.Username, $"{frontendUrl}/dashboard");
                    await _devices.AddDeviceAsync(
                        (await _users.GetByEmailAsync(response.Email))!.Id, deviceHash, deviceLabel);
                }
                else
                {
                    var user = await _users.GetByEmailAsync(response.Email);
                    if (user is not null)
                    {
                        var known = await _devices.IsKnownDeviceAsync(user.Id, deviceHash);
                        if (!known)
                        {
                            // New device → security alert + register it
                            await _email.SendNewDeviceAlertAsync(
                                response.Email, response.Username,
                                deviceLabel, loginTime,
                                $"{frontendUrl}/settings");
                            await _devices.AddDeviceAsync(user.Id, deviceHash, deviceLabel);
                        }
                        // Known device → no email (normal login)
                    }
                }
            }
            catch { /* never block login due to email/device issues */ }

            return Ok(response);
        }
        catch (UnauthorizedAccessException ex)
        {
            // Increment failed attempts
            var fails = _cache.GetOrCreate(FailKey(id), e =>
            {
                e.AbsoluteExpirationRelativeToNow = TimeSpan.FromMinutes(LockoutMinutes);
                return 0;
            });
            fails++;
            _cache.Set(FailKey(id), fails, TimeSpan.FromMinutes(LockoutMinutes));

            if (fails >= MaxFailedAttempts)
            {
                _cache.Set(LockoutKey(id), true, TimeSpan.FromMinutes(LockoutMinutes));
                _cache.Remove(FailKey(id));
                return StatusCode(423, new { Message = $"Account locked after {MaxFailedAttempts} failed attempts. Try again in {LockoutMinutes} minutes." });
            }

            return Unauthorized(new { Message = ex.Message, AttemptsRemaining = MaxFailedAttempts - fails });
        }
    }

    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] RegisterRequest request)
    {
        var response = await _mediator.Send(new RegisterCommand
        {
            Username = request.Username,
            Email = request.Email,
            Password = request.Password
        });
        return Ok(response);
    }

    [HttpPost("verify-otp")]
    public async Task<IActionResult> VerifyUserOtp([FromBody] VerifyOtpRequest request)
    {
        await _mediator.Send(new VerifyAdminOtpCommand
        {
            Email   = request.Email,
            OtpCode = request.OtpCode
        });

        // Fetch the verified user and generate token for auto-login
        var user = await _users.GetByEmailAsync(request.Email);
        if (user is null)
            return Ok(new { Message = "Account verified! You can now log in." });

        var token = _jwt.GenerateToken(user);

        // Send welcome + admin notification emails (non-blocking)
        try
        {
            var name        = user.DisplayName ?? user.Username;
            var frontendUrl = _config["App:FrontendUrl"]?.TrimEnd('/') ?? "http://localhost:5173";
            var adminEmail  = _config["App:AdminNotifyEmail"] ?? _config["Email:FromAddress"] ?? "";
            var joinedAt    = DateTime.UtcNow.ToString("dddd, dd MMM yyyy HH:mm 'UTC'");

            await _email.SendWelcomeEmailAsync(request.Email, name, $"{frontendUrl}/dashboard");

            if (!string.IsNullOrWhiteSpace(adminEmail))
                await _email.SendNewUserAlertAsync(adminEmail, user.Username, request.Email, joinedAt);
        }
        catch { }

        // Return token so frontend can auto-login
        return Ok(new
        {
            Message  = "Account verified! Welcome to Riva 🎉",
            Token    = token,
            Username = user.Username,
            Email    = user.Email,
            Role     = user.Role
        });
    }

    [HttpPost("resend-otp")]
    public async Task<IActionResult> ResendUserOtp([FromBody] ResendOtpRequest request)
    {
        await _mediator.Send(new ResendOtpCommand { Email = request.Email });
        return Ok(new { Message = "A new OTP has been sent to your email." });
    }

    // ── Forgot / Reset Password ───────────────────────────────────────

    [HttpPost("forgot-password")]
    public async Task<IActionResult> ForgotPassword([FromBody] ForgotPasswordRequest request)
    {
        await _mediator.Send(new ForgotPasswordCommand { Email = request.Email });
        return Ok(new { Message = "Password reset OTP sent to your email." });
    }

    [HttpPost("reset-password")]
    public async Task<IActionResult> ResetPassword([FromBody] ResetPasswordRequest request)
    {
        await _mediator.Send(new ResetPasswordCommand
        {
            Email       = request.Email,
            OtpCode     = request.OtpCode,
            NewPassword = request.NewPassword
        });

        // Security alert — notify user their password was changed
        try { await _email.SendPasswordChangedAlertAsync(request.Email, request.Email); }
        catch { }

        return Ok(new { Message = "Password reset successfully. You can now log in." });
    }

    // ── Admin Auth ────────────────────────────────────────────────────

    [HttpPost("admin/register")]
    public async Task<IActionResult> AdminRegister([FromBody] AdminRegisterRequest request)
    {
        var expectedKey = _config["AdminRegistration:SecretKey"];
        if (string.IsNullOrWhiteSpace(request.SecretKey) || request.SecretKey != expectedKey)
            return Unauthorized(new { Message = "Invalid admin secret key." });

        var response = await _mediator.Send(new AdminRegisterCommand
        {
            Username = request.Username,
            Email = request.Email,
            Password = request.Password,
            SecretKey = request.SecretKey
        });
        return Ok(response);
    }

    [HttpPost("admin/verify-otp")]
    public async Task<IActionResult> AdminVerifyOtp([FromBody] VerifyOtpRequest request)
    {
        await _mediator.Send(new VerifyAdminOtpCommand
        {
            Email = request.Email,
            OtpCode = request.OtpCode
        });
        return Ok(new { Message = "Admin account verified. You may now log in." });
    }

    [HttpPost("admin/resend-otp")]
    public async Task<IActionResult> AdminResendOtp([FromBody] ResendOtpRequest request)
    {
        await _mediator.Send(new ResendOtpCommand { Email = request.Email });
        return Ok(new { Message = "A new OTP has been sent to your email." });
    }
}
