using MediatR;
using Riva.Dto.Admin;

namespace Riva.Service.Query.User;

public class GetUserByIdQuery : IRequest<UserDto>
{
    public int UserId { get; set; }
}
