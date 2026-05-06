using System.Data.SqlClient;
using Riva.Api.Data;
using Riva.Domain.Entity;
using Riva.Service.Repository;

namespace Riva.Api.Repository;

public class UserRepository : IUserRepository
{
    private readonly DatabaseConnection _db;

    // Does NOT include IsVerified — handled separately via OTP table
    private const string SelectColumns =
        "Id, Username, Email, PasswordHash, Role, IsActive, CreatedAt, UpdatedAt, LastLoginAt";

    public UserRepository(DatabaseConnection db)
    {
        _db = db;
    }

    public async Task<User?> GetByUsernameAsync(string username)
    {
        var sql = $"SELECT {SelectColumns} FROM Users WHERE Username = @Username";
        using var conn = await _db.GetOpenConnectionAsync();
        using var cmd = new SqlCommand(sql, conn);
        cmd.Parameters.AddWithValue("@Username", username);
        using var r = await cmd.ExecuteReaderAsync();
        return await r.ReadAsync() ? Map(r) : null;
    }

    public async Task<User?> GetByEmailAsync(string email)
    {
        var sql = $"SELECT {SelectColumns} FROM Users WHERE Email = @Email";
        using var conn = await _db.GetOpenConnectionAsync();
        using var cmd = new SqlCommand(sql, conn);
        cmd.Parameters.AddWithValue("@Email", email);
        using var r = await cmd.ExecuteReaderAsync();
        return await r.ReadAsync() ? Map(r) : null;
    }

    public async Task<User?> GetByIdAsync(int id)
    {
        var sql = $"SELECT {SelectColumns} FROM Users WHERE Id = @Id";
        using var conn = await _db.GetOpenConnectionAsync();
        using var cmd = new SqlCommand(sql, conn);
        cmd.Parameters.AddWithValue("@Id", id);
        using var r = await cmd.ExecuteReaderAsync();
        return await r.ReadAsync() ? Map(r) : null;
    }

    public async Task<List<User>> GetAllAsync(int pageNumber, int pageSize)
    {
        var offset = (pageNumber - 1) * pageSize;
        var sql = $"SELECT {SelectColumns} FROM Users ORDER BY Id OFFSET @Offset ROWS FETCH NEXT @PageSize ROWS ONLY";
        using var conn = await _db.GetOpenConnectionAsync();
        using var cmd = new SqlCommand(sql, conn);
        cmd.Parameters.AddWithValue("@Offset", offset);
        cmd.Parameters.AddWithValue("@PageSize", pageSize);
        using var r = await cmd.ExecuteReaderAsync();
        var list = new List<User>();
        while (await r.ReadAsync()) list.Add(Map(r));
        return list;
    }

    public async Task<List<User>> SearchAsync(string? searchTerm, string? role, bool? isActive, int pageNumber, int pageSize)
    {
        var offset = (pageNumber - 1) * pageSize;
        var sql = $"SELECT {SelectColumns} FROM Users WHERE 1=1";
        if (!string.IsNullOrWhiteSpace(searchTerm)) sql += " AND (Username LIKE @Search OR Email LIKE @Search)";
        if (!string.IsNullOrWhiteSpace(role)) sql += " AND Role = @Role";
        if (isActive.HasValue) sql += " AND IsActive = @IsActive";
        sql += " ORDER BY Id OFFSET @Offset ROWS FETCH NEXT @PageSize ROWS ONLY";

        using var conn = await _db.GetOpenConnectionAsync();
        using var cmd = new SqlCommand(sql, conn);
        if (!string.IsNullOrWhiteSpace(searchTerm)) cmd.Parameters.AddWithValue("@Search", $"%{searchTerm}%");
        if (!string.IsNullOrWhiteSpace(role)) cmd.Parameters.AddWithValue("@Role", role);
        if (isActive.HasValue) cmd.Parameters.AddWithValue("@IsActive", isActive.Value);
        cmd.Parameters.AddWithValue("@Offset", offset);
        cmd.Parameters.AddWithValue("@PageSize", pageSize);

        using var r = await cmd.ExecuteReaderAsync();
        var list = new List<User>();
        while (await r.ReadAsync()) list.Add(Map(r));
        return list;
    }

    public async Task AddAsync(User user)
    {
        const string sql = @"
            INSERT INTO Users (Username, Email, PasswordHash, Role, IsActive, CreatedAt)
            VALUES (@Username, @Email, @PasswordHash, @Role, @IsActive, @CreatedAt)";
        using var conn = await _db.GetOpenConnectionAsync();
        using var cmd = new SqlCommand(sql, conn);
        cmd.Parameters.AddWithValue("@Username", user.Username);
        cmd.Parameters.AddWithValue("@Email", user.Email);
        cmd.Parameters.AddWithValue("@PasswordHash", user.PasswordHash);
        cmd.Parameters.AddWithValue("@Role", user.Role);
        cmd.Parameters.AddWithValue("@IsActive", user.IsActive);
        cmd.Parameters.AddWithValue("@CreatedAt", user.CreatedAt);
        await cmd.ExecuteNonQueryAsync();
    }

    public async Task UpdateAsync(User user)
    {
        const string sql = @"
            UPDATE Users SET
                Username = @Username, Email = @Email, PasswordHash = @PasswordHash,
                Role = @Role, IsActive = @IsActive,
                UpdatedAt = @UpdatedAt, LastLoginAt = @LastLoginAt
            WHERE Id = @Id";
        using var conn = await _db.GetOpenConnectionAsync();
        using var cmd = new SqlCommand(sql, conn);
        cmd.Parameters.AddWithValue("@Id", user.Id);
        cmd.Parameters.AddWithValue("@Username", user.Username);
        cmd.Parameters.AddWithValue("@Email", user.Email);
        cmd.Parameters.AddWithValue("@PasswordHash", user.PasswordHash);
        cmd.Parameters.AddWithValue("@Role", user.Role);
        cmd.Parameters.AddWithValue("@IsActive", user.IsActive);
        cmd.Parameters.AddWithValue("@UpdatedAt", (object?)user.UpdatedAt ?? DBNull.Value);
        cmd.Parameters.AddWithValue("@LastLoginAt", (object?)user.LastLoginAt ?? DBNull.Value);
        await cmd.ExecuteNonQueryAsync();
    }

    public async Task DeleteAsync(User user)
    {
        const string sql = "DELETE FROM Users WHERE Id = @Id";
        using var conn = await _db.GetOpenConnectionAsync();
        using var cmd = new SqlCommand(sql, conn);
        cmd.Parameters.AddWithValue("@Id", user.Id);
        await cmd.ExecuteNonQueryAsync();
    }

    public Task SetVerifiedAsync(string email) => Task.CompletedTask; // handled via OTP table

    public Task SaveChangesAsync() => Task.CompletedTask;

    private static User Map(SqlDataReader r) => new()
    {
        Id           = r.GetInt32(r.GetOrdinal("Id")),
        Username     = r.GetString(r.GetOrdinal("Username")),
        Email        = r.GetString(r.GetOrdinal("Email")),
        PasswordHash = r.GetString(r.GetOrdinal("PasswordHash")),
        Role         = r.GetString(r.GetOrdinal("Role")),
        IsVerified   = true, // verification tracked via OTP table
        IsActive     = r.GetBoolean(r.GetOrdinal("IsActive")),
        CreatedAt    = r.GetDateTime(r.GetOrdinal("CreatedAt")),
        UpdatedAt    = r.IsDBNull(r.GetOrdinal("UpdatedAt"))   ? null : r.GetDateTime(r.GetOrdinal("UpdatedAt")),
        LastLoginAt  = r.IsDBNull(r.GetOrdinal("LastLoginAt")) ? null : r.GetDateTime(r.GetOrdinal("LastLoginAt"))
    };
}
