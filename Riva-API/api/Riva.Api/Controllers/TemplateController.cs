using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Riva.Dto.Template;
using Riva.Service.Command.Template;
using Riva.Service.Interfaces;
using Riva.Service.Query.Template;
using System.Security.Claims;
using Riva.Service.Repository;

namespace Riva.Api.Controllers;

[ApiController]
[Route("api/template")]
public class TemplateController : ControllerBase
{
    private readonly IMediator           _mediator;
    private readonly ITemplateRepository _templates;
    private readonly IMediaUploadService _upload;

    public TemplateController(IMediator mediator, ITemplateRepository templates, IMediaUploadService upload)
    {
        _mediator  = mediator;
        _templates = templates;
        _upload    = upload;
    }

    // GET /api/template?categoryId=1&tierType=Premium
    [HttpGet]
    [AllowAnonymous]
    public async Task<IActionResult> GetAll([FromQuery] int? categoryId, [FromQuery] bool? isPaid, [FromQuery] string? tierType)
    {
        var result = await _mediator.Send(new GetTemplatesQuery
        {
            CategoryId = categoryId,
            IsPaid     = isPaid,
            TierType   = tierType,
        });
        return Ok(result);
    }

    // GET /api/template/{id}
    [HttpGet("{id:int}")]
    [AllowAnonymous]
    public async Task<IActionResult> GetById(int id)
    {
        var result = await _mediator.Send(new GetTemplateByIdQuery { TemplateId = id });
        return Ok(result);
    }

    // POST /api/template  [Admin only]
    [HttpPost]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> AddTemplate([FromBody] AddTemplateRequest request)
    {
        var adminId = GetCurrentUserId();
        if (adminId == null) return Unauthorized();

        var result = await _mediator.Send(new AddTemplateCommand
        {
            Name            = request.Name,
            Description     = request.Description,
            CategoryId      = request.CategoryId,
            IsPaid          = request.IsPaid,
            Price           = request.Price,
            TierType        = request.TierType,
            TemplateHtml    = request.TemplateHtml,
            TemplateCss     = request.TemplateCss,
            TemplateJs      = request.TemplateJs,
            SchemaJson      = request.SchemaJson,
            PreviewImageUrl = request.PreviewImageUrl,
            ThumbnailUrl    = request.ThumbnailUrl,
            Tags            = request.Tags,
            CreatedBy       = adminId.Value
        });
        return Ok(result);
    }

    // GET /api/template/admin  [Admin only — returns ALL statuses]
    [HttpGet("admin")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> GetAllAdmin([FromQuery] int? categoryId, [FromQuery] bool? isPaid)
    {
        var templates = await _templates.GetAllAdminAsync(categoryId, isPaid);
        var items = templates.Select(t => new TemplateListItemDto
        {
            TemplateId      = t.TemplateId,
            Name            = t.Name,
            Description     = t.Description,
            CategoryId      = t.CategoryId,
            CategoryName    = t.CategoryName ?? string.Empty,
            IsPaid          = t.IsPaid,
            Price           = t.Price,
            TierType        = t.TierType,
            PreviewImageUrl = t.PreviewImageUrl,
            ThumbnailUrl    = t.ThumbnailUrl,
            Status          = t.Status,
            CreatedDate     = t.CreatedDate
        });
        return Ok(new { templates = items, total = items.Count() });
    }

    // PATCH /api/template/{id}/status  [Admin only]
    [HttpPatch("{id:int}/status")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> UpdateStatus(int id, [FromBody] UpdateStatusRequest req)
    {
        await _mediator.Send(new UpdateTemplateStatusCommand { TemplateId = id, Status = req.Status });
        return Ok(new { Message = $"Template {id} status set to '{req.Status}'." });
    }

    // PUT /api/template/{id}  [Admin only]
    [HttpPut("{id:int}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> UpdateTemplate(int id, [FromBody] UpdateTemplateRequest req)
    {
        var existing = await _templates.GetByIdAsync(id);
        if (existing is null) return NotFound(new { Message = "Template not found." });

        var tier   = req.TierType is "Free" or "Premium" or "Pro" ? req.TierType : "Free";
        var isPaid = tier != "Free";
        await _templates.UpdateTemplateAsync(
            id, req.Name, req.CategoryId, isPaid, isPaid ? req.Price : null,
            req.TemplateHtml, req.TemplateCss, req.TemplateJs, req.SchemaJson,
            req.PreviewImageUrl, req.ThumbnailUrl, req.Description, tier);

        return Ok(new { Message = "Template updated successfully." });
    }

    // POST /api/template/upload-image  [Admin only]
    [HttpPost("upload-image")]
    [Authorize(Roles = "Admin")]
    [RequestSizeLimit(10_485_760)]
    public async Task<IActionResult> UploadImage(IFormFile file)
    {
        if (file is null || file.Length == 0)
            return BadRequest(new { Message = "No file provided." });

        var allowed = new[] { "image/jpeg", "image/png", "image/webp", "image/gif" };
        if (!allowed.Contains(file.ContentType))
            return BadRequest(new { Message = "Only JPG, PNG, WebP, or GIF allowed." });

        await using var stream = file.OpenReadStream();
        var (imageUrl, _) = await _upload.UploadAsync(stream, file.FileName, file.ContentType, "templates");
        return Ok(new { ImageUrl = imageUrl });
    }

    private int? GetCurrentUserId()
    {
        var claim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        return claim != null ? int.Parse(claim) : null;
    }
}
