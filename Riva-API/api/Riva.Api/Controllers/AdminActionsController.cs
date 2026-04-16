using System.Security.Claims;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
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
    /// <param name="userIds">Comma-separated list of user IDs (e.g., "1,2,3,4")</param>
    /// <param name="isActive">True to activate, False to deactivate</param>
    [HttpPost("users/activate")]
    public async Task<IActionResult> BulkSetActivateUsers(
        [FromQuery] string userIds,
        [FromQuery] bool isActive)
    {
        if (string.IsNullOrWhiteSpace(userIds))
            return BadRequest(new { message = "userIds parameter is required (comma-separated values)" });

        var command = new BulkSetActivateUsersCommand(userIds, isActive);
        var result = await _mediator.Send(command);

        if (result.ReturnValue != 0)
            return BadRequest(new { message = result.Message ?? "Failed to update user status" });

        return Ok(new { message = $"Successfully updated {userIds.Split(',').Length} users", returnValue = result.ReturnValue });
    }

    /// <summary>
    /// Bulk assign a role to multiple users
    /// </summary>
    /// <param name="userIds">Comma-separated list of user IDs</param>
    /// <param name="roleName">Role name to assign (e.g., "Admin", "User", "Moderator")</param>
    [HttpPost("users/assign-role")]
    public async Task<IActionResult> BulkAssignRole(
        [FromQuery] string userIds,
        [FromQuery] string roleName)
    {
        if (string.IsNullOrWhiteSpace(userIds))
            return BadRequest(new { message = "userIds parameter is required" });

        if (string.IsNullOrWhiteSpace(roleName))
            return BadRequest(new { message = "roleName parameter is required" });

        var command = new BulkAssignRoleCommand(userIds, roleName);
        var result = await _mediator.Send(command);

        if (result.ReturnValue != 0)
            return BadRequest(new { message = result.Message ?? "Failed to assign roles" });

        return Ok(new { message = $"Successfully assigned '{roleName}' role to {result.AffectedRows} users", affectedRows = result.AffectedRows });
    }

    /// <summary>
    /// Log an administrative action for audit trail
    /// </summary>
    [HttpPost("log-action")]
    public async Task<IActionResult> LogAdminAction(
        [FromQuery] string action,
        [FromQuery] int? targetUserId = null,
        [FromQuery] string? details = null)
    {
        if (string.IsNullOrWhiteSpace(action))
            return BadRequest(new { message = "action parameter is required" });

        var adminUserId = GetCurrentUserId();
        if (adminUserId <= 0)
            return Unauthorized();

        var ipAddress = HttpContext.Connection.RemoteIpAddress?.ToString();

        var command = new LogAdminActionCommand(adminUserId, action, targetUserId, details, ipAddress);
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
