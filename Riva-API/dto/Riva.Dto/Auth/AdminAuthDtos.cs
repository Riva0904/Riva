namespace Riva.Dto.Auth;

/// <summary>
/// Request DTO for admin registration
/// </summary>
public class AdminRegisterRequest
{
    public string Username { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
    public string SecretKey { get; set; } = string.Empty; // Admin registration secret
}

/// <summary>
/// Response DTO for admin registration - sends OTP to email
/// </summary>
public class AdminRegisterResponse
{
    public string Message { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public int OtpExpiryMinutes { get; set; } = 10;
}

/// <summary>
/// Request DTO for OTP verification (admin registration)
/// </summary>
public class VerifyOtpRequest
{
    public string Email { get; set; } = string.Empty;
    public string OtpCode { get; set; } = string.Empty;
}

/// <summary>
/// Response DTO for OTP verification
/// </summary>
public class VerifyOtpResponse
{
    public bool IsVerified { get; set; }
    public string Message { get; set; } = string.Empty;
    public string? Token { get; set; }
    public string? Email { get; set; }
    public string? Username { get; set; }
    public string? Role { get; set; }
}

/// <summary>
/// Request DTO for resending OTP
/// </summary>
public class ResendOtpRequest
{
    public string Email { get; set; } = string.Empty;
}

/// <summary>
/// Response DTO for resending OTP
/// </summary>
public class ResendOtpResponse
{
    public bool Success { get; set; }
    public string Message { get; set; } = string.Empty;
    public int OtpExpiryMinutes { get; set; } = 10;
}
