using MediatR;
using Riva.Dto.Admin;

namespace Riva.Service.Query.Admin;

public class GetAllUsersQuery : IRequest<List<UserDto>>
{
}