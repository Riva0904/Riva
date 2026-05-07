using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Riva.Domain.Entity;
using Riva.Dto.Invitation;
using Riva.Service.Repository;
using System.Security.Claims;

namespace Riva.Api.Controllers;

[ApiController]
[Route("api/rsvp")]
public class RsvpController : ControllerBase
{
    private readonly IRsvpRepository _rsvps;
    private readonly IInvitationRepository _invitations;

    public RsvpController(IRsvpRepository rsvps, IInvitationRepository invitations)
    {
        _rsvps       = rsvps;
        _invitations = invitations;
    }

    /// <summary>Submit an RSVP for a public invitation (no auth required).</summary>
    [HttpPost("{slug}")]
    [AllowAnonymous]
    public async Task<IActionResult> Submit(string slug, [FromBody] SubmitRsvpRequest req)
    {
        if (string.IsNullOrWhiteSpace(req.GuestName))
            return BadRequest(new { Message = "Guest name is required." });

        var validStatuses = new[] { "Accepted", "Declined", "Maybe" };
        if (!validStatuses.Contains(req.Status))
            return BadRequest(new { Message = "Status must be Accepted, Declined, or Maybe." });

        var invitation = await _invitations.GetBySlugAsync(slug);
        if (invitation is null || invitation.Status != "Published")
            return NotFound(new { Message = "Invitation not found." });

        var rsvp = new InvitationRsvp
        {
            InvitationId = invitation.InvitationId,
            GuestName    = req.GuestName.Trim(),
            GuestEmail   = req.GuestEmail?.Trim(),
            GuestPhone   = req.GuestPhone?.Trim(),
            Status       = req.Status,
            GuestCount   = Math.Max(1, req.GuestCount),
            Message      = req.Message?.Trim(),
            IpAddress    = HttpContext.Connection.RemoteIpAddress?.ToString(),
            RespondedAt  = DateTime.UtcNow
        };

        var id = await _rsvps.CreateAsync(rsvp);
        return Ok(new { RsvpId = id, Message = $"Thank you, {req.GuestName}! Your RSVP has been recorded." });
    }

    /// <summary>Get RSVP summary for a host's invitation.</summary>
    [HttpGet("{invitationId:int}")]
    [Authorize]
    public async Task<IActionResult> GetSummary(int invitationId)
    {
        var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)
                     ?? throw new UnauthorizedAccessException());

        var invitation = await _invitations.GetByIdAsync(invitationId);
        if (invitation is null || invitation.UserId != userId)
            return NotFound(new { Message = "Invitation not found." });

        var rsvps = await _rsvps.GetByInvitationIdAsync(invitationId);

        var summary = new RsvpSummaryDto
        {
            TotalResponses = rsvps.Count,
            Accepted       = rsvps.Count(r => r.Status == "Accepted"),
            Declined       = rsvps.Count(r => r.Status == "Declined"),
            Maybe          = rsvps.Count(r => r.Status == "Maybe"),
            TotalGuests    = rsvps.Where(r => r.Status == "Accepted").Sum(r => r.GuestCount),
            Responses      = rsvps.Select(r => new RsvpDto
            {
                RsvpId      = r.RsvpId,
                GuestName   = r.GuestName,
                GuestEmail  = r.GuestEmail,
                Status      = r.Status,
                GuestCount  = r.GuestCount,
                Message     = r.Message,
                RespondedAt = r.RespondedAt
            }).ToList()
        };

        return Ok(summary);
    }
}
