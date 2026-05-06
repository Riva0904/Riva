namespace Riva.Dto.Auth;

public class RegisterRequest
{
    public string Username { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
}

public class RegisterResponse
{
    public string Message { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public bool OtpSent { get; set; }
}
