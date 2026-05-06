using System.Security.Claims;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Riva.Dto.Admin;
using Riva.Dto.User;
using Riva.Service.Command.User;
using Riva.Service.Query.Admin;
using Riva.Service.Query.User;

namespace Riva.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class UsersController : ControllerBase
{
    private readonly IMediator _mediator;

    public UsersController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpPost("me")]
    [Authorize]
    public async Task<IActionResult> GetCurrentUser()
    {
        var userId = GetCurrentUserId();
        var query = new GetCurrentUserQuery { UserId = userId };
        var response = await _mediator.Send(query);
        return Ok(response);
    }

    [HttpGet("session")]
    [Authorize]
    public async Task<IActionResult> GetSession()
    {
        var userId = GetCurrentUserId();
        var query = new GetUserSessionQuery { UserId = userId };
        var response = await _mediator.Send(query);
        return Ok(response);
    }

    [HttpPost("getbyid")]
    [Authorize]
    public async Task<IActionResult> GetById([FromBody] GetUserByIdRequest request)
    {
        var currentUserId = GetCurrentUserId();
        var currentUserRole = User.FindFirstValue(ClaimTypes.Role);

        if (currentUserRole != "Admin" && currentUserId != request.Id)
        {
            return Forbid();
        }

        var query = new GetUserByIdQuery { UserId = request.Id };
        var response = await _mediator.Send(query);
        return Ok(response);
    }

    [HttpPost("getall")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> GetAllUsers()
    {
        var query = new GetAllUsersQuery();
        var response = await _mediator.Send(query);
        return Ok(response);
    }

    [HttpPost("search")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> SearchUsers([FromBody] SearchUsersRequest request)
    {
        var query = new SearchUsersQuery
        {
            SearchTerm = request.SearchTerm,
            Role = request.Role,
            IsActive = request.IsActive,
            PageNumber = request.PageNumber,
            PageSize = request.PageSize
        };

        var response = await _mediator.Send(query);
        return Ok(response);
    }

    [HttpPost("updatestatus")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> UpdateStatus([FromBody] UpdateUserStatusRequest request)
    {
        var command = new UpdateUserStatusCommand
        {
            UserId = request.Id,
            IsActive = request.IsActive
        };

        await _mediator.Send(command);
        return NoContent();
    }

    [HttpPost("updaterole")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> UpdateRole([FromBody] UpdateUserRoleRequest request)
    {
        var command = new UpdateUserRoleCommand
        {
            UserId = request.Id,
            NewRole = request.NewRole
        };

        await _mediator.Send(command);
        return NoContent();
    }

    [HttpPost("delete")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> DeleteUser([FromBody] DeleteUserRequest request)
    {
        var command = new DeleteUserCommand { UserId = request.Id };
        await _mediator.Send(command);
        return NoContent();
    }

    private int GetCurrentUserId()
    {
        var claimValue = User.FindFirstValue(ClaimTypes.NameIdentifier);
        return int.TryParse(claimValue, out var userId) ? userId : 0;
    }
}
