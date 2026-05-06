using MediatR;
using Riva.Dto.Auth;

namespace Riva.Service.Command.Auth;

public class RegisterCommand : IRequest<RegisterResponse>
{
    public string Username { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
}
