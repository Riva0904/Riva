using System.Data.SqlClient;
using Riva.Api.Data;
using Riva.Domain.Entity;
using Riva.Service.Repository;

namespace Riva.Api.Repository;

public class CategoryRepository : ICategoryRepository
{
    private readonly DatabaseConnection _db;

    public CategoryRepository(DatabaseConnection db)
    {
        _db = db;
    }

    public async Task<IEnumerable<Category>> GetAllActiveAsync()
    {
        const string sql = "SELECT CategoryId, Name, IsActive FROM Categories WHERE IsActive = 1 ORDER BY CategoryId";
        using var conn = await _db.GetOpenConnectionAsync();
        using var cmd = new SqlCommand(sql, conn);
        using var reader = await cmd.ExecuteReaderAsync();

        var list = new List<Category>();
        while (await reader.ReadAsync())
        {
            list.Add(new Category
            {
                CategoryId = reader.GetInt32(reader.GetOrdinal("CategoryId")),
                Name = reader.GetString(reader.GetOrdinal("Name")),
                IsActive = reader.GetBoolean(reader.GetOrdinal("IsActive"))
            });
        }
        return list;
    }

    public async Task<Category?> GetByIdAsync(int categoryId)
    {
        const string sql = "SELECT CategoryId, Name, IsActive FROM Categories WHERE CategoryId = @Id";
        using var conn = await _db.GetOpenConnectionAsync();
        using var cmd = new SqlCommand(sql, conn);
        cmd.Parameters.AddWithValue("@Id", categoryId);
        using var reader = await cmd.ExecuteReaderAsync();

        if (await reader.ReadAsync())
        {
            return new Category
            {
                CategoryId = reader.GetInt32(reader.GetOrdinal("CategoryId")),
                Name = reader.GetString(reader.GetOrdinal("Name")),
                IsActive = reader.GetBoolean(reader.GetOrdinal("IsActive"))
            };
        }
        return null;
    }
}
