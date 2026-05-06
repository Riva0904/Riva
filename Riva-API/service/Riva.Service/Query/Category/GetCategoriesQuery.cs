using MediatR;
using Riva.Dto.Category;

namespace Riva.Service.Query.Category;

public class GetCategoriesQuery : IRequest<List<CategoryDto>>
{
}
