using MediatR;

namespace Riva.Service.Command.User;

public class UpdateUserStatusCommand : IRequest<Unit>
{
    public int UserId { get; set; }
    public bool IsActive { get; set; }
}
