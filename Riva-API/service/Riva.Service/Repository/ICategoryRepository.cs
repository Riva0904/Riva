using Riva.Domain.Entity;

namespace Riva.Service.Repository;

public interface ICategoryRepository
{
    Task<IEnumerable<Category>> GetAllActiveAsync();
    Task<Category?> GetByIdAsync(int categoryId);
}
