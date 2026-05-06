using MediatR;

namespace Riva.Service.Command.Auth;

public class VerifyAdminOtpCommand : IRequest<Unit>
{
    public string Email { get; set; } = string.Empty;
    public string OtpCode { get; set; } = string.Empty;
}
