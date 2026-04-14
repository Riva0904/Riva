using MediatR;
using Riva.Dto.Admin;

namespace Riva.Service.Query.User;

public class GetCurrentUserQuery : IRequest<UserDto>
{
    public int UserId { get; set; }
}
