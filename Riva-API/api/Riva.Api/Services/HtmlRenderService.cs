using System.Net;
using System.Text.Json;
using Riva.Domain.Entity;
using Riva.Service.Interfaces;

namespace Riva.Api.Services;

public class HtmlRenderService : IHtmlRenderService
{
    private readonly IPlaceholderService _placeholder;

    public HtmlRenderService(IPlaceholderService placeholder)
        => _placeholder = placeholder;

    public string RenderInvitation(InvitationInstance invitation, Template template)
    {
        var fieldValues = ParseFieldValues(invitation.FieldValuesJson);

        var mediaUrls = invitation.Media
            .GroupBy(m => m.FieldName)
            .ToDictionary(g => g.Key, g => g.First().FileUrl);

        var body      = _placeholder.ReplaceWithMedia(template.TemplateHtml, fieldValues, mediaUrls);
        var title     = invitation.SeoTitle ?? fieldValues.GetValueOrDefault("title", invitation.Title);
        var desc      = invitation.SeoDescription ?? fieldValues.GetValueOrDefault("message", string.Empty);
        var safeTitle = WebUtility.HtmlEncode(title);
        var safeDesc  = WebUtility.HtmlEncode(desc.Length > 160 ? desc[..160] : desc);
        var css       = template.TemplateCss ?? string.Empty;
        var js        = SanitizeJs(template.TemplateJs ?? string.Empty);

        return $$"""
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8" />
                <meta name="viewport" content="width=device-width, initial-scale=1.0" />
                <title>{{safeTitle}}</title>
                <meta name="description" content="{{safeDesc}}" />
                <meta property="og:type"        content="website" />
                <meta property="og:title"       content="{{safeTitle}}" />
                <meta property="og:description" content="{{safeDesc}}" />
                <meta name="twitter:card"        content="summary_large_image" />
                <meta name="twitter:title"       content="{{safeTitle}}" />
                <meta name="twitter:description" content="{{safeDesc}}" />
                <style>
                    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
                    html, body { width: 100%; min-height: 100vh; }
                    img, video { max-width: 100%; display: block; }
                </style>
                <style>{{css}}</style>
            </head>
            <body>
                {{body}}
                <script>{{js}}</script>
            </body>
            </html>
            """;
    }

    private static Dictionary<string, string> ParseFieldValues(string json)
    {
        try { return JsonSerializer.Deserialize<Dictionary<string, string>>(json) ?? new(); }
        catch { return new(); }
    }

    private static string SanitizeJs(string js)
    {
        if (string.IsNullOrWhiteSpace(js)) return string.Empty;
        var blocked = new[] { "document.cookie", "localStorage.", "sessionStorage.",
                               "XMLHttpRequest", "fetch(", "eval(", "Function(",
                               "window.location.href =", "document.write" };
        foreach (var p in blocked)
            js = js.Replace(p, $"/* blocked:{p} */", StringComparison.OrdinalIgnoreCase);
        return js;
    }
}
