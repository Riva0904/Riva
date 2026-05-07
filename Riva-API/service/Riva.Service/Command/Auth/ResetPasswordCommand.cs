using MediatR;

namespace Riva.Service.Command.Auth;

public class ResetPasswordCommand : IRequest<Unit>
{
    public string Email { get; set; } = string.Empty;
    public string OtpCode { get; set; } = string.Empty;
    public string NewPassword { get; set; } = string.Empty;
}
