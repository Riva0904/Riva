using Riva.Domain.Entity;

namespace Riva.Service.Repository;

public interface IUserRepository
{
    Task<User?> GetByUsernameAsync(string username);
    Task<User?> GetByEmailAsync(string email);
    Task<User?> GetByIdAsync(int id);
    Task<List<User>> GetAllAsync(int pageNumber, int pageSize);
    Task<List<User>> SearchAsync(string? searchTerm, string? role, bool? isActive, int pageNumber, int pageSize);
    Task AddAsync(User user);
    Task UpdateAsync(User user);
    Task DeleteAsync(User user);
    Task SetVerifiedAsync(string email);
    Task SaveChangesAsync();
}
