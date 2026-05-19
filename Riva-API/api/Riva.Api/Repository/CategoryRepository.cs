using System.Data.SqlClient;
using Riva.Api.Data;
using Riva.Domain.Entity;
using Riva.Service.Repository;

namespace Riva.Api.Repository;

public class CategoryRepository : ICategoryRepository
{
    private readonly DatabaseConnection _db;
    public CategoryRepository(DatabaseConnection db) => _db = db;

    public async Task<IEnumerable<Category>> GetAllActiveAsync()
    {
        const string sql = "SELECT CategoryId, Name, IsActive FROM Categories WHERE IsActive = 1 ORDER BY CategoryId";
        return await QueryAll(sql);
    }

    public async Task<IEnumerable<Category>> GetAllAsync()
    {
        const string sql = "SELECT CategoryId, Name, IsActive FROM Categories ORDER BY CategoryId";
        return await QueryAll(sql);
    }

    public async Task<Category?> GetByIdAsync(int id)
    {
        const string sql = "SELECT CategoryId, Name, IsActive FROM Categories WHERE CategoryId = @Id";
        await using var conn = await _db.GetOpenConnectionAsync();
        await using var cmd  = new SqlCommand(sql, conn);
        cmd.Parameters.AddWithValue("@Id", id);
        await using var r = await cmd.ExecuteReaderAsync();
        return await r.ReadAsync() ? Map(r) : null;
    }

    public async Task<int> CreateAsync(string name)
    {
        const string sql = "INSERT INTO Categories (Name) OUTPUT INSERTED.CategoryId VALUES (@Name)";
        await using var conn = await _db.GetOpenConnectionAsync();
        await using var cmd  = new SqlCommand(sql, conn);
        cmd.Parameters.AddWithValue("@Name", name.Trim());
        return (int)await cmd.ExecuteScalarAsync();
    }

    public async Task UpdateAsync(int categoryId, string name)
    {
        const string sql = "UPDATE Categories SET Name = @Name WHERE CategoryId = @Id";
        await using var conn = await _db.GetOpenConnectionAsync();
        await using var cmd  = new SqlCommand(sql, conn);
        cmd.Parameters.AddWithValue("@Name", name.Trim());
        cmd.Parameters.AddWithValue("@Id",   categoryId);
        await cmd.ExecuteNonQueryAsync();
    }

    public async Task SetActiveAsync(int categoryId, bool isActive)
    {
        const string sql = "UPDATE Categories SET IsActive = @IsActive WHERE CategoryId = @Id";
        await using var conn = await _db.GetOpenConnectionAsync();
        await using var cmd  = new SqlCommand(sql, conn);
        cmd.Parameters.AddWithValue("@IsActive", isActive);
        cmd.Parameters.AddWithValue("@Id",       categoryId);
        await cmd.ExecuteNonQueryAsync();
    }

    public async Task<bool> DeleteAsync(int categoryId)
    {
        await using var conn = await _db.GetOpenConnectionAsync();

        // Block delete if templates use this category
        await using var chkCmd = new SqlCommand(
            "SELECT COUNT(1) FROM Templates WHERE CategoryId = @Id", conn);
        chkCmd.Parameters.AddWithValue("@Id", categoryId);
        var count = (int)await chkCmd.ExecuteScalarAsync();
        if (count > 0) return false;

        await using var delCmd = new SqlCommand(
            "DELETE FROM Categories WHERE CategoryId = @Id", conn);
        delCmd.Parameters.AddWithValue("@Id", categoryId);
        await delCmd.ExecuteNonQueryAsync();
        return true;
    }

    private async Task<List<Category>> QueryAll(string sql)
    {
        await using var conn = await _db.GetOpenConnectionAsync();
        await using var cmd  = new SqlCommand(sql, conn);
        await using var r    = await cmd.ExecuteReaderAsync();
        var list = new List<Category>();
        while (await r.ReadAsync()) list.Add(Map(r));
        return list;
    }

    private static Category Map(SqlDataReader r) => new()
    {
        CategoryId = r.GetInt32(r.GetOrdinal("CategoryId")),
        Name       = r.GetString(r.GetOrdinal("Name")),
        IsActive   = r.GetBoolean(r.GetOrdinal("IsActive")),
    };
}
