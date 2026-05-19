using Riva.Domain.Entity;

namespace Riva.Service.Repository;

public interface ICategoryRepository
{
    Task<IEnumerable<Category>> GetAllActiveAsync();
    Task<IEnumerable<Category>> GetAllAsync();       // admin — all statuses
    Task<Category?> GetByIdAsync(int categoryId);
    Task<int> CreateAsync(string name);
    Task UpdateAsync(int categoryId, string name);
    Task SetActiveAsync(int categoryId, bool isActive);
    Task<bool> DeleteAsync(int categoryId);   // false if category has templates
}
