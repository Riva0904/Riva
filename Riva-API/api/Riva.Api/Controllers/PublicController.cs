using MediatR;
using Microsoft.AspNetCore.Mvc;
using Riva.Service.Interfaces;
using Riva.Service.Query.Invitation;
using Riva.Service.Repository;

namespace Riva.Api.Controllers;

[ApiController]
[Route("api/public")]
public class PublicController : ControllerBase
{
    private readonly IMediator _mediator;
    private readonly IHtmlRenderService _renderer;
    private readonly IInvitationRepository _invitations;

    public PublicController(
        IMediator mediator,
        IHtmlRenderService renderer,
        IInvitationRepository invitations)
    {
        _mediator    = mediator;
        _renderer    = renderer;
        _invitations = invitations;
    }

    /// <summary>Returns the fully-rendered HTML mini-website for a published invitation.</summary>
    [HttpGet("invite/{slug}")]
    [ResponseCache(Duration = 60)]
    public async Task<IActionResult> GetRenderedInvitation(string slug)
    {
        var invitation = await _invitations.GetBySlugAsync(slug);

        if (invitation is null)
            return NotFound(ErrorPage("Invitation Not Found",
                "This invitation link does not exist or has been removed."));

        if (invitation.Status != "Published" || !invitation.IsPublic)
            return NotFound(ErrorPage("Not Available",
                "This invitation is not publicly available."));

        if (invitation.IsExpired)
        {
            Response.StatusCode = 410;
            return Content(ErrorPage("Invitation Expired", "This invitation link has expired."),
                           "text/html; charset=utf-8");
        }

        _ = _invitations.IncrementViewCountAsync(invitation.InvitationId);

        var html = _renderer.RenderInvitation(invitation, invitation.Template!);
        return Content(html, "text/html; charset=utf-8");
    }

    /// <summary>Returns invitation JSON metadata (for React preview iframe).</summary>
    [HttpGet("invite/{slug}/meta")]
    public async Task<IActionResult> GetMeta(string slug)
    {
        var result = await _mediator.Send(new GetInvitationBySlugQuery { Slug = slug });
        return Ok(result);
    }

    private static string ErrorPage(string title, string message) => $$"""
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8" />
            <meta name="viewport" content="width=device-width, initial-scale=1.0" />
            <title>{{title}}</title>
            <style>
                body { font-family: system-ui, sans-serif; display: flex; align-items: center;
                       justify-content: center; min-height: 100vh; margin: 0;
                       background: linear-gradient(135deg, #f0fdf4, #dcfce7); }
                .box { text-align: center; padding: 3rem; background: white;
                       border-radius: 1.5rem; box-shadow: 0 8px 32px rgba(0,0,0,.08); max-width: 480px; }
                h1 { color: #15803d; margin-bottom: 1rem; }
                p  { color: #64748b; }
            </style>
        </head>
        <body>
            <div class="box">
                <h1>🌿 {{title}}</h1>
                <p>{{message}}</p>
            </div>
        </body>
        </html>
        """;
}
