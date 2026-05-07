using System.Security.Claims;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Riva.Dto.Invitation;
using Riva.Service.Command.Invitation;
using Riva.Service.Interfaces;
using Riva.Service.Query.Invitation;
using Riva.Service.Repository;

namespace Riva.Api.Controllers;

[ApiController]
[Route("api/invitation")]
[Authorize]
public class InvitationController : ControllerBase
{
    private readonly IMediator _mediator;
    private readonly IMediaUploadService _upload;
    private readonly IInvitationRepository _invitations;

    public InvitationController(
        IMediator mediator,
        IMediaUploadService upload,
        IInvitationRepository invitations)
    {
        _mediator    = mediator;
        _upload      = upload;
        _invitations = invitations;
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    private int GetUserId() =>
        int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)
                  ?? throw new UnauthorizedAccessException("User ID not found in token."));

    // ── CRUD ──────────────────────────────────────────────────────────────────

    /// <summary>Create a new invitation from a published template.</summary>
    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateInvitationRequest req)
    {
        var result = await _mediator.Send(new CreateInvitationCommand
        {
            UserId          = GetUserId(),
            TemplateId      = req.TemplateId,
            Title           = req.Title,
            FieldValuesJson = req.FieldValuesJson,
            SeoTitle        = req.SeoTitle,
            SeoDescription  = req.SeoDescription
        });
        return Ok(result);
    }

    /// <summary>Get all invitations belonging to the authenticated user.</summary>
    [HttpGet("my")]
    public async Task<IActionResult> GetMy()
    {
        var result = await _mediator.Send(new GetUserInvitationsQuery { UserId = GetUserId() });
        return Ok(result);
    }

    /// <summary>Get a single invitation (must be owned by the caller).</summary>
    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetById(int id)
    {
        var result = await _mediator.Send(new GetInvitationByIdQuery
        {
            InvitationId = id,
            UserId       = GetUserId()
        });
        return Ok(result);
    }

    /// <summary>Update invitation content / field values.</summary>
    [HttpPut("{id:int}")]
    public async Task<IActionResult> Update(int id, [FromBody] UpdateInvitationRequest req)
    {
        await _mediator.Send(new UpdateInvitationCommand
        {
            InvitationId    = id,
            UserId          = GetUserId(),
            Title           = req.Title,
            FieldValuesJson = req.FieldValuesJson,
            SeoTitle        = req.SeoTitle,
            SeoDescription  = req.SeoDescription
        });
        return Ok(new { Message = "Invitation updated." });
    }

    /// <summary>Publish an invitation to make it publicly accessible via its slug URL.</summary>
    [HttpPost("{id:int}/publish")]
    public async Task<IActionResult> Publish(int id, [FromBody] PublishInvitationRequest req)
    {
        var result = await _mediator.Send(new PublishInvitationCommand
        {
            InvitationId = id,
            UserId       = GetUserId(),
            IsPublic     = req.IsPublic,
            ExpiresAt    = req.ExpiresAt
        });
        return Ok(result);
    }

    // ── Media ─────────────────────────────────────────────────────────────────

    /// <summary>
    /// Upload a media file (image/video/audio) for a specific schema field.
    /// multipart/form-data: file + fieldName.
    /// </summary>
    [HttpPost("{id:int}/media")]
    [RequestSizeLimit(52_428_800)] // 50 MB
    public async Task<IActionResult> UploadMedia(int id, IFormFile file, [FromForm] string fieldName)
    {
        if (file is null || file.Length == 0)
            return BadRequest(new { Message = "No file provided." });

        var userId = GetUserId();
        var invitation = await _invitations.GetByIdAsync(id);
        if (invitation is null || invitation.UserId != userId)
            return NotFound(new { Message = "Invitation not found." });

        await using var stream = file.OpenReadStream();
        var (fileUrl, storedName) = await _upload.UploadAsync(stream, file.FileName, file.ContentType);

        var mediaType = file.ContentType.StartsWith("image/") ? "image"
                      : file.ContentType.StartsWith("video/") ? "video"
                      : file.ContentType.StartsWith("audio/") ? "audio"
                      : "document";

        var media = new Domain.Entity.InvitationMedia
        {
            InvitationId  = id,
            FieldName     = fieldName,
            OriginalName  = file.FileName,
            StoredName    = storedName,
            FileUrl       = fileUrl,
            MediaType     = mediaType,
            MimeType      = file.ContentType,
            FileSizeBytes = file.Length,
            UploadedAt    = DateTime.UtcNow
        };

        await _invitations.AddMediaAsync(media);

        return Ok(new UploadMediaResponse
        {
            MediaId   = media.MediaId,
            FileUrl   = fileUrl,
            FieldName = fieldName,
            Message   = "File uploaded successfully."
        });
    }
}
