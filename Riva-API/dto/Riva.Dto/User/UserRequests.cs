namespace Riva.Dto.User;

public class GetUserByIdRequest
{
    public int Id { get; set; }
}

public class SearchUsersRequest
{
    public string? SearchTerm { get; set; }
    public string? Role { get; set; }
    public bool? IsActive { get; set; }
    public int PageNumber { get; set; } = 1;
    public int PageSize { get; set; } = 10;
}

public class UpdateUserStatusRequest
{
    public int Id { get; set; }
    public bool IsActive { get; set; }
}

public class UpdateUserRoleRequest
{
    public int Id { get; set; }
    public string NewRole { get; set; } = string.Empty;
}

public class DeleteUserRequest
{
    public int Id { get; set; }
}