using MediatR;
using Microsoft.AspNetCore.Mvc;
using Riva.Service.Query.Category;

namespace Riva.Api.Controllers;

[ApiController]
[Route("api/category")]
public class CategoryController : ControllerBase
{
    private readonly IMediator _mediator;

    public CategoryController(IMediator mediator)
    {
        _mediator = mediator;
    }

    // GET /api/category
    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var result = await _mediator.Send(new GetCategoriesQuery());
        return Ok(result);
    }
}
