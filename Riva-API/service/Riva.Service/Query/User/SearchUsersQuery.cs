using MediatR;
using Riva.Dto.Admin;

namespace Riva.Service.Query.User;

public class SearchUsersQuery : IRequest<List<UserDto>>
{
    public string? SearchTerm { get; set; }
    public string? Role { get; set; }
    public bool? IsActive { get; set; }
    public int PageNumber { get; set; } = 1;
    public int PageSize { get; set; } = 10;
}
