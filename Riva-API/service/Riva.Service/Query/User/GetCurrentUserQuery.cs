using MediatR;
using Riva.Dto.Admin;

namespace Riva.Service.Query.User;

public class GetCurrentUserQuery : IRequest<UserProfileDto>
{
    public int UserId { get; set; }
}
