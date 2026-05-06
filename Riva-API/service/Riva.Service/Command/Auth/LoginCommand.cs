using MediatR;
using Riva.Dto.Auth;

namespace Riva.Service.Command.Auth;

public class LoginCommand : IRequest<LoginResponse>
{
    public string EmailOrUsername { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
}
