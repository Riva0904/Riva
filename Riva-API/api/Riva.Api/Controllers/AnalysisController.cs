using System.Runtime.InteropServices;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;

namespace Riva.Api.Controllers;

[ApiController]
[Route("postapi/[controller]")]
[AllowAnonymous]
public class AnalysisController : ControllerBase
{
    [HttpGet("summary")]
    public IActionResult GetSummary()
    {
        var summary = new
        {
            Status = "ok",
            ServerTimeUtc = DateTime.UtcNow.ToString("o"),
            Host = Environment.MachineName,
            Runtime = RuntimeInformation.FrameworkDescription,
            Message = "Backend analysis endpoint is available"
        };

        return Ok(summary);
    }
}
