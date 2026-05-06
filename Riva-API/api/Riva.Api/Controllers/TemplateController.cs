using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Riva.Dto.Template;
using Riva.Service.Command.Template;
using Riva.Service.Query.Template;
using System.Security.Claims;

namespace Riva.Api.Controllers;

[ApiController]
[Route("api/template")]
public class TemplateController : ControllerBase
{
    private readonly IMediator _mediator;

    public TemplateController(IMediator mediator)
    {
        _mediator = mediator;
    }

    // GET /api/template?categoryId=1&isPaid=false
    [HttpGet]
    [AllowAnonymous]
    public async Task<IActionResult> GetAll([FromQuery] int? categoryId, [FromQuery] bool? isPaid)
    {
        var result = await _mediator.Send(new GetTemplatesQuery
        {
            CategoryId = categoryId,
            IsPaid = isPaid
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
            Name = request.Name,
            CategoryId = request.CategoryId,
            IsPaid = request.IsPaid,
            Price = request.Price,
            TemplateHtml = request.TemplateHtml,
            TemplateCss = request.TemplateCss,
            TemplateJs = request.TemplateJs,
            SchemaJson = request.SchemaJson,
            PreviewImageUrl = request.PreviewImageUrl,
            CreatedBy = adminId.Value
        });
        return Ok(result);
    }

    private int? GetCurrentUserId()
    {
        var claim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        return claim != null ? int.Parse(claim) : null;
    }
}
