using System.Security.Claims;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Riva.Dto.Admin;
using Riva.Service.Command.Admin;

namespace Riva.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Admin")]
public class AdminActionsController : ControllerBase
{
    private readonly IMediator _mediator;

    public AdminActionsController(IMediator mediator)
    {
        _mediator = mediator;
    }

    /// <summary>
    /// Bulk activate or deactivate multiple users
    /// </summary>
    [HttpPost("users/activate")]
    public async Task<IActionResult> BulkSetActivateUsers([FromBody] BulkActivateUsersRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.UserIds))
            return BadRequest(new { message = "userIds parameter is required (comma-separated values)" });

        var command = new BulkSetActivateUsersCommand(request.UserIds, request.IsActive);
        var result = await _mediator.Send(command);

        if (result.ReturnValue != 0)
            return BadRequest(new { message = result.Message ?? "Failed to update user status" });

        return Ok(new { message = $"Successfully updated {request.UserIds.Split(',').Length} users", returnValue = result.ReturnValue });
    }

    /// <summary>
    /// Bulk assign a role to multiple users
    /// </summary>
    [HttpPost("users/assign-role")]
    public async Task<IActionResult> BulkAssignRole([FromBody] BulkAssignRoleRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.UserIds))
            return BadRequest(new { message = "userIds parameter is required" });

        if (string.IsNullOrWhiteSpace(request.RoleName))
            return BadRequest(new { message = "roleName parameter is required" });

        var command = new BulkAssignRoleCommand(request.UserIds, request.RoleName);
        var result = await _mediator.Send(command);

        if (result.ReturnValue != 0)
            return BadRequest(new { message = result.Message ?? "Failed to assign roles" });

        return Ok(new { message = $"Successfully assigned '{request.RoleName}' role to {result.AffectedRows} users", affectedRows = result.AffectedRows });
    }

    /// <summary>
    /// Log an administrative action for audit trail
    /// </summary>
    [HttpPost("log-action")]
    public async Task<IActionResult> LogAdminAction([FromBody] LogAdminActionRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Action))
            return BadRequest(new { message = "action parameter is required" });

        var adminUserId = GetCurrentUserId();
        if (adminUserId <= 0)
            return Unauthorized();

        var ipAddress = HttpContext.Connection.RemoteIpAddress?.ToString();

        var command = new LogAdminActionCommand(adminUserId, request.Action, request.TargetUserId, request.Details, ipAddress);
        var result = await _mediator.Send(command);

        if (result.ReturnValue != 0)
            return BadRequest(new { message = result.Message ?? "Failed to log action" });

        return Ok(new { message = "Action logged successfully", actionId = result.ActionId });
    }

    private int GetCurrentUserId()
    {
        var claimValue = User.FindFirstValue(ClaimTypes.NameIdentifier);
        return int.TryParse(claimValue, out var userId) ? userId : 0;
    }
}
