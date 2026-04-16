using MediatR;

namespace Riva.Service.Command.User;

public class DeleteUserCommand : IRequest<Unit>
{
    public int UserId { get; set; }
}
