using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Riva.Service.Repository;

namespace Riva.Api.Controllers;

[ApiController]
[Route("api/wishlist")]
[Authorize]
public class WishlistController : ControllerBase
{
    private readonly IWishlistRepository _repo;
    public WishlistController(IWishlistRepository repo) => _repo = repo;

    private int CurrentUserId() => int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier) ?? "0");

    [HttpGet]
    public async Task<IActionResult> Get()
    {
        var ids = await _repo.GetWishlistIdsAsync(CurrentUserId());
        return Ok(new { templateIds = ids });
    }

    [HttpPost("toggle/{templateId:int}")]
    public async Task<IActionResult> Toggle(int templateId)
    {
        var added = await _repo.ToggleAsync(CurrentUserId(), templateId);
        return Ok(new { added, templateId });
    }
}
