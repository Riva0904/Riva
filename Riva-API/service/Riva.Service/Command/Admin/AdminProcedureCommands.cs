using Riva.Service.Attributes;
using Riva.Service.Procedures;

namespace Riva.Service.Command.Admin;

/// <summary>
/// Command to execute the sp_BulkSetActivateUsers stored procedure
/// Activates or deactivates multiple users in a single call
/// </summary>
[ProcedureName("[dbo].[sp_BulkSetActivateUsers]")]
public sealed record BulkSetActivateUsersCommand(string UserIds, bool IsActive) 
    : IProcedureCommand<BulkSetActivateUsersResult>
{
    [ProcedureParameter("@UserIds")]
    public string UserIds { get; init; } = UserIds;

    [ProcedureParameter("@IsActive")]
    public bool IsActive { get; init; } = IsActive;
}

/// <summary>
/// Result entity for bulk activating users
/// Returns 0 for success, 1 for error
/// </summary>
[ProcedureResult]
public sealed record BulkSetActivateUsersResult : IProcedureResult
{
    public int ReturnValue { get; set; }
    public string? Message { get; set; }
}

/// <summary>
/// Command to execute the sp_BulkAssignRole stored procedure
/// Assigns a role to multiple users
/// </summary>
[ProcedureName("[dbo].[sp_BulkAssignRole]")]
public sealed record BulkAssignRoleCommand(string UserIds, string RoleName) 
    : IProcedureCommand<BulkAssignRoleResult>
{
    [ProcedureParameter("@UserIds")]
    public string UserIds { get; init; } = UserIds;

    [ProcedureParameter("@RoleName")]
    public string RoleName { get; init; } = RoleName;
}

/// <summary>
/// Result entity for bulk assigning roles
/// </summary>
[ProcedureResult]
public sealed record BulkAssignRoleResult : IProcedureResult
{
    public int ReturnValue { get; set; }
    public int AffectedRows { get; set; }
    public string? Message { get; set; }
}

/// <summary>
/// Command to log an admin action to the AdminActions table
/// </summary>
[ProcedureName("[dbo].[sp_LogAdminAction]")]
public sealed record LogAdminActionCommand(int AdminUserId, string Action, int? TargetUserId = null, string? Details = null, string? IpAddress = null) 
    : IProcedureCommand<LogAdminActionResult>
{
    [ProcedureParameter("@AdminUserId")]
    public int AdminUserId { get; init; } = AdminUserId;

    [ProcedureParameter("@Action")]
    public string Action { get; init; } = Action;

    [ProcedureParameter("@TargetUserId")]
    public int? TargetUserId { get; init; } = TargetUserId;

    [ProcedureParameter("@Details")]
    public string? Details { get; init; } = Details;

    [ProcedureParameter("@IpAddress")]
    public string? IpAddress { get; init; } = IpAddress;
}

/// <summary>
/// Result entity for logging admin actions
/// </summary>
[ProcedureResult]
public sealed record LogAdminActionResult : IProcedureResult
{
    public int ReturnValue { get; set; }
    public int ActionId { get; set; }
    public string? Message { get; set; }
}
