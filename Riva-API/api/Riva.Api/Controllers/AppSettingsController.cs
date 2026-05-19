using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Riva.Service.Repository;

namespace Riva.Api.Controllers;

[ApiController]
[Route("api/app-settings")]
public class AppSettingsController : ControllerBase
{
    private readonly IAppSettingsRepository _settings;

    public AppSettingsController(IAppSettingsRepository settings)
    {
        _settings = settings;
    }

    /// <summary>GET /api/app-settings/theme — public, used by frontend on load</summary>
    [HttpGet("theme")]
    [AllowAnonymous]
    public async Task<IActionResult> GetTheme()
    {
        var colorStart   = await _settings.GetAsync("theme.colorStart")   ?? "#16a34a";
        var colorEnd     = await _settings.GetAsync("theme.colorEnd")     ?? "#059669";
        var gradientDir  = await _settings.GetAsync("theme.gradientDir")  ?? "135deg";
        var mode         = await _settings.GetAsync("theme.mode")         ?? "light";
        var gradientText = await _settings.GetAsync("theme.gradientText") ?? "auto";
        return Ok(new { colorStart, colorEnd, gradientDir, mode, gradientText });
    }

    /// <summary>POST /api/app-settings/theme — admin only</summary>
    [HttpPost("theme")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> SetTheme([FromBody] ThemeRequest req)
    {
        if (string.IsNullOrWhiteSpace(req.ColorStart) || string.IsNullOrWhiteSpace(req.ColorEnd))
            return BadRequest(new { Message = "Both color start and color end are required." });

        var dir  = string.IsNullOrWhiteSpace(req.GradientDir)  ? "135deg" : req.GradientDir.Trim();
        var mode = req.Mode == "dark" ? "dark" : "light";
        var gradientText = req.GradientText is "light" or "dark" ? req.GradientText : "auto";

        await _settings.SetAsync("theme.colorStart",   req.ColorStart.Trim());
        await _settings.SetAsync("theme.colorEnd",     req.ColorEnd.Trim());
        await _settings.SetAsync("theme.gradientDir",  dir);
        await _settings.SetAsync("theme.mode",         mode);
        await _settings.SetAsync("theme.gradientText", gradientText);

        return Ok(new { Message = "Theme updated.", colorStart = req.ColorStart, mode, gradientText });
    }
}

public class ThemeRequest
{
    public string  ColorStart    { get; set; } = "#16a34a";
    public string  ColorEnd      { get; set; } = "#059669";
    public string? GradientDir   { get; set; } = "135deg";
    public string? Mode          { get; set; } = "light";
    public string? GradientText  { get; set; } = "auto";
}
