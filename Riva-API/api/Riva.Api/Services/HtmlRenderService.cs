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

    public string RenderInvitation(InvitationInstance invitation, Template template, bool showBranding = true)
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
        // Replace {{tokens}} in JS (JS-data templates like templateData = { title: "{{title}}" })
        var rawJs     = _placeholder.ReplaceForJs(template.TemplateJs ?? string.Empty, fieldValues, mediaUrls);
        var js        = SanitizeJs(rawJs);

        // Branding footer: always shown for Free/Pro templates, never for Premium
        var brandingHtml = showBranding ? RivaBrandingFooter() : string.Empty;

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
                {{brandingHtml}}
                <script>{{js}}</script>
            </body>
            </html>
            """;
    }

    // ── Riva branding footer ──────────────────────────────────────────────────
    private static string RivaBrandingFooter() => """
        <div id="riva-branding" style="
            display:flex; align-items:center; justify-content:center; gap:6px;
            padding:10px 16px; background:rgba(0,0,0,0.55); backdrop-filter:blur(8px);
            font-family:system-ui,sans-serif; font-size:12px; color:rgba(255,255,255,0.75);
            position:fixed; bottom:0; left:0; right:0; z-index:9999;
            border-top:1px solid rgba(255,255,255,0.10);">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                 style="flex-shrink:0" xmlns="http://www.w3.org/2000/svg">
                <circle cx="12" cy="12" r="11" fill="url(#rg)"/>
                <text x="12" y="16" text-anchor="middle" font-size="11"
                      font-weight="900" fill="white" font-family="system-ui">R</text>
                <defs>
                    <linearGradient id="rg" x1="0" y1="0" x2="24" y2="24" gradientUnits="userSpaceOnUse">
                        <stop offset="0%" stop-color="#7c3aed"/>
                        <stop offset="100%" stop-color="#db2777"/>
                    </linearGradient>
                </defs>
            </svg>
            Made with&nbsp;<a href="/" target="_parent"
                style="color:#a78bfa; font-weight:700; text-decoration:none;"
                title="Go to Riva Digital Invitations">Riva</a>
            &nbsp;·&nbsp;
            <a href="/register" target="_parent"
                style="color:#f9a8d4; font-weight:700; text-decoration:none;"
                title="Create your own free invitation">Create yours free →</a>
        </div>
        """;

    // ── Helpers ───────────────────────────────────────────────────────────────
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
