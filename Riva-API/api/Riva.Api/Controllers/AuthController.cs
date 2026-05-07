using MediatR;
using Microsoft.AspNetCore.Mvc;
using Riva.Dto.Auth;
using Riva.Service.Command.Auth;

namespace Riva.Api.Controllers;

[ApiController]
[Route("api/auth")]
public class AuthController : ControllerBase
{
    private readonly IMediator _mediator;
    private readonly IConfiguration _config;

    public AuthController(IMediator mediator, IConfiguration config)
    {
        _mediator = mediator;
        _config = config;
    }

    // ── User Auth ─────────────────────────────────────────────────────

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginRequest request)
    {
        var response = await _mediator.Send(new LoginCommand
        {
            EmailOrUsername = request.EmailOrUsername,
            Password = request.Password
        });
        return Ok(response);
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
            Email = request.Email,
            OtpCode = request.OtpCode
        });
        return Ok(new { Message = "Account verified! You can now log in." });
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
            Email = request.Email,
            OtpCode = request.OtpCode,
            NewPassword = request.NewPassword
        });
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
