using MediatR;

namespace Riva.Service.Command.User;

public class UpdateUserRoleCommand : IRequest<Unit>
{
    public int UserId { get; set; }
    public string NewRole { get; set; } = string.Empty;
}
