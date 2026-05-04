using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using MediatR;
using Riva.Dto.Template;
using Riva.Service.Command.Template;
using Riva.Service.Query.Template;
using System.Security.Claims;

namespace Riva.Api.Controllers;

[ApiController]
[Route("postapi/[controller]")]
[AllowAnonymous]
public class TemplateController : ControllerBase
{
    private readonly IMediator _mediator;

    public TemplateController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpGet]
    [Authorize]
    public async Task<IActionResult> GetTemplates()
    {
        var userTier = GetCurrentUserTier();
        var query = new GetTemplatesByTierQuery { UserTier = userTier };
        var response = await _mediator.Send(query);
        return Ok(response);
    }

    [HttpGet("categories")]
    [AllowAnonymous]
    public async Task<IActionResult> GetTemplateCategories()
    {
        var query = new GetTemplateCategoriesQuery();
        var response = await _mediator.Send(query);
        return Ok(response);
    }

    [HttpGet("shared/{shareToken}")]
    [AllowAnonymous]
    public async Task<IActionResult> GetSharedTemplate(string shareToken)
    {
        var query = new GetSharedTemplateQuery { ShareToken = shareToken };
        var response = await _mediator.Send(query);
        return Ok(response);
    }

    [HttpPost("submit")]
    [Authorize]
    public async Task<IActionResult> SubmitTemplate([FromBody] TemplateRequestDto request)
    {
        var userId = GetCurrentUserId();
        var command = new SubmitTemplateCommand
        {
            Request = request,
            UserId = userId
        };

        var response = await _mediator.Send(command);
        return Ok(response);
    }

    [HttpPost("{id}/share")]
    [Authorize]
    public async Task<IActionResult> ShareTemplate(int id)
    {
        var userId = GetCurrentUserId();
        var command = new ShareTemplateCommand
        {
            TemplateId = id,
            UserId = userId
        };

        var response = await _mediator.Send(command);
        return Ok(response);
    }

    private int? GetCurrentUserId()
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        return userIdClaim != null ? int.Parse(userIdClaim) : null;
    }

    private string GetCurrentUserTier()
    {
        var tierClaim = User.FindFirst("SubscriptionTier")?.Value;
        return tierClaim ?? "Free";
    }
}
