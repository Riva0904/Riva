namespace Riva.Dto.Admin;

public class BulkActivateUsersRequest
{
    public string UserIds { get; set; } = string.Empty;
    public bool IsActive { get; set; }
}

public class BulkAssignRoleRequest
{
    public string UserIds { get; set; } = string.Empty;
    public string RoleName { get; set; } = string.Empty;
}

public class LogAdminActionRequest
{
    public string Action { get; set; } = string.Empty;
    public int? TargetUserId { get; set; }
    public string? Details { get; set; }
}