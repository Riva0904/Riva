using MediatR;

namespace Riva.Service.Command.Auth;

public class ForgotPasswordCommand : IRequest<Unit>
{
    public string Email { get; set; } = string.Empty;
}
