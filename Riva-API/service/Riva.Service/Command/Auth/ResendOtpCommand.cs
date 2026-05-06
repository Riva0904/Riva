using MediatR;

namespace Riva.Service.Command.Auth;

public class ResendOtpCommand : IRequest<Unit>
{
    public string Email { get; set; } = string.Empty;
}
