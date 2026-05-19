using System.Security.Claims;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Riva.Dto.Admin;
using Riva.Dto.User;
using Riva.Service.Command.User;
using Riva.Service.Interfaces;
using Riva.Service.Query.Admin;
using Riva.Service.Query.User;
using Riva.Service.Repository;

namespace Riva.Api.Controllers;

[ApiController]
[Route("api/users")]
[Authorize]
public class UsersController : ControllerBase
{
    private readonly IMediator           _mediator;
    private readonly IMediaUploadService _upload;
    private readonly IEmailService       _email;
    private readonly IUserRepository     _users;

    public UsersController(IMediator mediator, IMediaUploadService upload, IEmailService email, IUserRepository users)
    {
        _mediator = mediator;
        _upload   = upload;
        _email    = email;
        _users    = users;
    }

    // ── Current user ──────────────────────────────────────────────────────────

    /// <summary>GET /api/users/profile — full profile with usage stats</summary>
    [HttpGet("profile")]
    public async Task<IActionResult> GetProfile()
    {
        var result = await _mediator.Send(new GetCurrentUserQuery { UserId = GetUserId() });
        return Ok(result);
    }

    /// <summary>POST /api/users/me — legacy alias</summary>
    [HttpPost("me")]
    public async Task<IActionResult> GetCurrentUser()
    {
        var result = await _mediator.Send(new GetCurrentUserQuery { UserId = GetUserId() });
        return Ok(result);
    }

    /// <summary>GET /api/users/session — legacy alias</summary>
    [HttpGet("session")]
    public async Task<IActionResult> GetSession()
    {
        var result = await _mediator.Send(new GetUserSessionQuery { UserId = GetUserId() });
        return Ok(result);
    }

    // ── Profile management ────────────────────────────────────────────────────

    [HttpPatch("profile")]
    public async Task<IActionResult> UpdateProfile([FromBody] UpdateProfileRequest req)
    {
        if (string.IsNullOrWhiteSpace(req.Username))
            return BadRequest(new { Message = "Username is required." });
        if (string.IsNullOrWhiteSpace(req.Email))
            return BadRequest(new { Message = "Email is required." });

        await _mediator.Send(new UpdateProfileCommand
        {
            UserId      = GetUserId(),
            Username    = req.Username,
            Email       = req.Email,
            DisplayName = req.DisplayName,
        });
        return Ok(new { Message = "Profile updated successfully." });
    }

    [HttpPost("change-password")]
    public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordRequest req)
    {
        if (req.NewPassword != req.ConfirmPassword)
            return BadRequest(new { Message = "New password and confirm password do not match." });

        await _mediator.Send(new ChangePasswordCommand
        {
            UserId          = GetUserId(),
            CurrentPassword = req.CurrentPassword,
            NewPassword     = req.NewPassword,
        });

        // Security alert — email and username both available from JWT claims
        try
        {
            var email    = User.FindFirstValue(ClaimTypes.Email)    ?? "";
            var username = User.FindFirstValue(ClaimTypes.Name)     ?? email;
            await _email.SendPasswordChangedAlertAsync(email, username);
        }
        catch { }

        return Ok(new { Message = "Password changed successfully." });
    }

    [HttpPost("profile-image")]
    [RequestSizeLimit(10_485_760)]
    public async Task<IActionResult> UploadProfileImage(IFormFile file)
    {
        if (file is null || file.Length == 0)
            return BadRequest(new { Message = "No file provided." });

        var allowed = new[] { "image/jpeg", "image/png", "image/webp", "image/gif" };
        if (!allowed.Contains(file.ContentType))
            return BadRequest(new { Message = "Only JPG, PNG, WebP, or GIF allowed." });

        await using var stream = file.OpenReadStream();
        var (imageUrl, _) = await _upload.UploadAsync(stream, file.FileName, file.ContentType, "profiles");

        await _mediator.Send(new UpdateProfileImageCommand
        {
            UserId   = GetUserId(),
            ImageUrl = imageUrl,
        });
        return Ok(new { ImageUrl = imageUrl, Message = "Profile image updated." });
    }

    // ── Admin endpoints ───────────────────────────────────────────────────────

    [HttpPost("getbyid")]
    public async Task<IActionResult> GetById([FromBody] GetUserByIdRequest request)
    {
        var uid  = GetUserId();
        var role = User.FindFirstValue(ClaimTypes.Role);
        if (role != "Admin" && uid != request.Id) return Forbid();
        var result = await _mediator.Send(new GetUserByIdQuery { UserId = request.Id });
        return Ok(result);
    }

    [HttpPost("getall")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> GetAllUsers()
    {
        return Ok(await _mediator.Send(new GetAllUsersQuery()));
    }

    [HttpPost("search")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> SearchUsers([FromBody] SearchUsersRequest request)
    {
        return Ok(await _mediator.Send(new SearchUsersQuery
        {
            SearchTerm = request.SearchTerm,
            Role       = request.Role,
            IsActive   = request.IsActive,
            PageNumber = request.PageNumber,
            PageSize   = request.PageSize,
        }));
    }

    [HttpPost("updatestatus")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> UpdateStatus([FromBody] UpdateUserStatusRequest request)
    {
        await _mediator.Send(new UpdateUserStatusCommand { UserId = request.Id, IsActive = request.IsActive });
        return NoContent();
    }

    [HttpPost("updaterole")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> UpdateRole([FromBody] UpdateUserRoleRequest request)
    {
        await _mediator.Send(new UpdateUserRoleCommand { UserId = request.Id, NewRole = request.NewRole });
        return NoContent();
    }

    [HttpPost("delete")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> DeleteUser([FromBody] DeleteUserRequest request)
    {
        await _mediator.Send(new DeleteUserCommand { UserId = request.Id });
        return NoContent();
    }

    /// <summary>Save notification preferences for the current user.</summary>
    [HttpPatch("notification-prefs")]
    public async Task<IActionResult> SaveNotifPrefs([FromBody] NotifPrefsRequest req)
    {
        await _users.UpdateNotifyOnRsvpAsync(GetUserId(), req.NotifyOnRsvp);
        return Ok(new { Message = "Preferences saved." });
    }

    private int GetUserId()
    {
        var v = User.FindFirstValue(ClaimTypes.NameIdentifier);
        return int.TryParse(v, out var id) ? id : 0;
    }
}

public record NotifPrefsRequest(bool NotifyOnRsvp);
