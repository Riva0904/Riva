using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Riva.Service.Query.Category;
using Riva.Service.Repository;

namespace Riva.Api.Controllers;

[ApiController]
[Route("api/category")]
public class CategoryController : ControllerBase
{
    private readonly IMediator _mediator;
    private readonly ICategoryRepository _categories;

    public CategoryController(IMediator mediator, ICategoryRepository categories)
    {
        _mediator   = mediator;
        _categories = categories;
    }

    // GET /api/category  (public — active only)
    [HttpGet]
    [AllowAnonymous]
    public async Task<IActionResult> GetAll()
    {
        var result = await _mediator.Send(new GetCategoriesQuery());
        return Ok(result);
    }

    // GET /api/category/admin  (admin — all statuses)
    [HttpGet("admin")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> GetAllAdmin()
    {
        var cats = await _categories.GetAllAsync();
        return Ok(cats.Select(c => new { c.CategoryId, c.Name, c.IsActive }));
    }

    // POST /api/category
    [HttpPost]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Create([FromBody] CategoryNameRequest req)
    {
        if (string.IsNullOrWhiteSpace(req.Name))
            return BadRequest(new { Message = "Category name is required." });

        var id = await _categories.CreateAsync(req.Name);
        return Ok(new { CategoryId = id, Name = req.Name.Trim(), Message = "Category created." });
    }

    // PATCH /api/category/{id}
    [HttpPatch("{id:int}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Update(int id, [FromBody] CategoryNameRequest req)
    {
        if (string.IsNullOrWhiteSpace(req.Name))
            return BadRequest(new { Message = "Category name is required." });

        var cat = await _categories.GetByIdAsync(id);
        if (cat is null) return NotFound(new { Message = "Category not found." });

        await _categories.UpdateAsync(id, req.Name);
        return Ok(new { Message = "Category updated." });
    }

    // DELETE /api/category/{id}
    [HttpDelete("{id:int}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Delete(int id)
    {
        var cat = await _categories.GetByIdAsync(id);
        if (cat is null) return NotFound(new { Message = "Category not found." });

        var deleted = await _categories.DeleteAsync(id);
        if (!deleted)
            return Conflict(new { Message = $"Cannot delete '{cat.Name}' — it has templates assigned. Remove or reassign templates first." });

        return Ok(new { Message = $"Category '{cat.Name}' deleted." });
    }

    // PATCH /api/category/{id}/toggle  — activate/deactivate
    [HttpPatch("{id:int}/toggle")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Toggle(int id)
    {
        var cat = await _categories.GetByIdAsync(id);
        if (cat is null) return NotFound(new { Message = "Category not found." });

        var newActive = !cat.IsActive;
        await _categories.SetActiveAsync(id, newActive);
        return Ok(new
        {
            CategoryId = id,
            Name       = cat.Name,
            IsActive   = newActive,
            Message    = $"Category '{cat.Name}' {(newActive ? "activated" : "deactivated")}."
        });
    }
}

public class CategoryNameRequest
{
    public string Name { get; set; } = string.Empty;
}
