using MediatR;
using Riva.Dto.User;

namespace Riva.Service.Query.User;

public class GetUserSessionQuery : IRequest<UserSessionDto>
{
    public int UserId { get; set; }
}
