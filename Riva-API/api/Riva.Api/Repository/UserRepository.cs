using System.Data.SqlClient;
using Riva.Api.Data;
using Riva.Domain.Entity;
using Riva.Service.Repository;

namespace Riva.Api.Repository;

public class UserRepository : IUserRepository
{
    private readonly DatabaseConnection _db;

    private const string SelectColumns =
        "Id, Username, Email, DisplayName, PasswordHash, Role, IsVerified, IsActive, ProfileImageUrl, CreatedAt, UpdatedAt, LastLoginAt";

    public UserRepository(DatabaseConnection db) => _db = db;

    public async Task<User?> GetByUsernameAsync(string username)
    {
        var sql = $"SELECT {SelectColumns} FROM Users WHERE Username = @Username";
        await using var conn = await _db.GetOpenConnectionAsync();
        await using var cmd  = new SqlCommand(sql, conn);
        cmd.Parameters.AddWithValue("@Username", username);
        await using var r = await cmd.ExecuteReaderAsync();
        return await r.ReadAsync() ? Map(r) : null;
    }

    public async Task<User?> GetByEmailAsync(string email)
    {
        var sql = $"SELECT {SelectColumns} FROM Users WHERE Email = @Email";
        await using var conn = await _db.GetOpenConnectionAsync();
        await using var cmd  = new SqlCommand(sql, conn);
        cmd.Parameters.AddWithValue("@Email", email);
        await using var r = await cmd.ExecuteReaderAsync();
        return await r.ReadAsync() ? Map(r) : null;
    }

    public async Task<User?> GetByIdAsync(int id)
    {
        var sql = $"SELECT {SelectColumns} FROM Users WHERE Id = @Id";
        await using var conn = await _db.GetOpenConnectionAsync();
        await using var cmd  = new SqlCommand(sql, conn);
        cmd.Parameters.AddWithValue("@Id", id);
        await using var r = await cmd.ExecuteReaderAsync();
        return await r.ReadAsync() ? Map(r) : null;
    }

    public async Task<List<User>> GetAllAsync(int pageNumber, int pageSize)
    {
        var offset = (pageNumber - 1) * pageSize;
        var sql = $"SELECT {SelectColumns} FROM Users ORDER BY Id OFFSET @Offset ROWS FETCH NEXT @PageSize ROWS ONLY";
        await using var conn = await _db.GetOpenConnectionAsync();
        await using var cmd  = new SqlCommand(sql, conn);
        cmd.Parameters.AddWithValue("@Offset",   offset);
        cmd.Parameters.AddWithValue("@PageSize", pageSize);
        await using var r = await cmd.ExecuteReaderAsync();
        var list = new List<User>();
        while (await r.ReadAsync()) list.Add(Map(r));
        return list;
    }

    public async Task<List<User>> SearchAsync(string? searchTerm, string? role, bool? isActive, int pageNumber, int pageSize)
    {
        var offset = (pageNumber - 1) * pageSize;
        var sql = $"SELECT {SelectColumns} FROM Users WHERE 1=1";
        if (!string.IsNullOrWhiteSpace(searchTerm)) sql += " AND (Username LIKE @Search OR Email LIKE @Search)";
        if (!string.IsNullOrWhiteSpace(role))       sql += " AND Role = @Role";
        if (isActive.HasValue)                      sql += " AND IsActive = @IsActive";
        sql += " ORDER BY Id OFFSET @Offset ROWS FETCH NEXT @PageSize ROWS ONLY";

        await using var conn = await _db.GetOpenConnectionAsync();
        await using var cmd  = new SqlCommand(sql, conn);
        if (!string.IsNullOrWhiteSpace(searchTerm)) cmd.Parameters.AddWithValue("@Search",   $"%{searchTerm}%");
        if (!string.IsNullOrWhiteSpace(role))       cmd.Parameters.AddWithValue("@Role",     role);
        if (isActive.HasValue)                      cmd.Parameters.AddWithValue("@IsActive", isActive.Value);
        cmd.Parameters.AddWithValue("@Offset",   offset);
        cmd.Parameters.AddWithValue("@PageSize", pageSize);

        await using var r = await cmd.ExecuteReaderAsync();
        var list = new List<User>();
        while (await r.ReadAsync()) list.Add(Map(r));
        return list;
    }

    public async Task AddAsync(User user)
    {
        const string sql = @"
            INSERT INTO Users (Username, Email, PasswordHash, Role, IsVerified, IsActive, CreatedAt)
            VALUES (@Username, @Email, @PasswordHash, @Role, @IsVerified, @IsActive, @CreatedAt)";
        await using var conn = await _db.GetOpenConnectionAsync();
        await using var cmd  = new SqlCommand(sql, conn);
        cmd.Parameters.AddWithValue("@Username",     user.Username);
        cmd.Parameters.AddWithValue("@Email",        user.Email);
        cmd.Parameters.AddWithValue("@PasswordHash", user.PasswordHash);
        cmd.Parameters.AddWithValue("@Role",         user.Role);
        cmd.Parameters.AddWithValue("@IsVerified",   user.IsVerified);
        cmd.Parameters.AddWithValue("@IsActive",     user.IsActive);
        cmd.Parameters.AddWithValue("@CreatedAt",    user.CreatedAt);
        await cmd.ExecuteNonQueryAsync();
    }

    public async Task UpdateAsync(User user)
    {
        const string sql = @"
            UPDATE Users SET
                Username = @Username, Email = @Email,
                DisplayName = @DisplayName,
                PasswordHash = @PasswordHash,
                ProfileImageUrl = @ProfileImageUrl,
                Role = @Role, IsActive = @IsActive,
                UpdatedAt = @UpdatedAt, LastLoginAt = @LastLoginAt
            WHERE Id = @Id";
        await using var conn = await _db.GetOpenConnectionAsync();
        await using var cmd  = new SqlCommand(sql, conn);
        cmd.Parameters.AddWithValue("@Id",              user.Id);
        cmd.Parameters.AddWithValue("@Username",        user.Username);
        cmd.Parameters.AddWithValue("@Email",           user.Email);
        cmd.Parameters.AddWithValue("@DisplayName",     (object?)user.DisplayName      ?? DBNull.Value);
        cmd.Parameters.AddWithValue("@PasswordHash",    user.PasswordHash);
        cmd.Parameters.AddWithValue("@ProfileImageUrl", (object?)user.ProfileImageUrl  ?? DBNull.Value);
        cmd.Parameters.AddWithValue("@Role",            user.Role);
        cmd.Parameters.AddWithValue("@IsActive",        user.IsActive);
        cmd.Parameters.AddWithValue("@UpdatedAt",       (object?)user.UpdatedAt        ?? DBNull.Value);
        cmd.Parameters.AddWithValue("@LastLoginAt",     (object?)user.LastLoginAt      ?? DBNull.Value);
        await cmd.ExecuteNonQueryAsync();
    }

    public async Task UpdateLastLoginAsync(int userId)
    {
        const string sql = "UPDATE Users SET LastLoginAt = @Now WHERE Id = @Id";
        await using var conn = await _db.GetOpenConnectionAsync();
        await using var cmd  = new SqlCommand(sql, conn);
        cmd.Parameters.AddWithValue("@Id",  userId);
        cmd.Parameters.AddWithValue("@Now", DateTime.UtcNow);
        await cmd.ExecuteNonQueryAsync();
    }

    /// <summary>Returns per-user invitation/template usage stats.</summary>
    public async Task<(int freeUsed, int paidUsed)> GetTemplateUsageAsync(int userId)
    {
        const string sql = @"
            SELECT
                SUM(CASE WHEN t.IsPaid = 0 THEN 1 ELSE 0 END) AS FreeUsed,
                SUM(CASE WHEN t.IsPaid = 1 THEN 1 ELSE 0 END) AS PaidUsed
            FROM InvitationInstances i
            INNER JOIN Templates t ON t.TemplateId = i.TemplateId
            WHERE i.UserId = @UserId";

        await using var conn = await _db.GetOpenConnectionAsync();
        await using var cmd  = new SqlCommand(sql, conn);
        cmd.Parameters.AddWithValue("@UserId", userId);
        await using var r = await cmd.ExecuteReaderAsync();
        if (!await r.ReadAsync()) return (0, 0);
        int free = r.IsDBNull(0) ? 0 : r.GetInt32(0);
        int paid = r.IsDBNull(1) ? 0 : r.GetInt32(1);
        return (free, paid);
    }

    public async Task DeleteAsync(User user)
    {
        const string sql = "DELETE FROM Users WHERE Id = @Id";
        await using var conn = await _db.GetOpenConnectionAsync();
        await using var cmd  = new SqlCommand(sql, conn);
        cmd.Parameters.AddWithValue("@Id", user.Id);
        await cmd.ExecuteNonQueryAsync();
    }

    public async Task SetVerifiedAsync(string email)
    {
        const string sql = "UPDATE Users SET IsVerified = 1, UpdatedAt = @Now WHERE Email = @Email";
        await using var conn = await _db.GetOpenConnectionAsync();
        await using var cmd  = new SqlCommand(sql, conn);
        cmd.Parameters.AddWithValue("@Email", email);
        cmd.Parameters.AddWithValue("@Now",   DateTime.UtcNow);
        await cmd.ExecuteNonQueryAsync();
    }

    public async Task<bool> GetNotifyOnRsvpAsync(int userId)
    {
        try
        {
            const string sql = "SELECT NotifyOnRsvp FROM Users WHERE Id = @Id";
            await using var conn = await _db.GetOpenConnectionAsync();
            await using var cmd  = new SqlCommand(sql, conn);
            cmd.Parameters.AddWithValue("@Id", userId);
            var result = await cmd.ExecuteScalarAsync();
            return result is bool b ? b : true;
        }
        catch { return false; } // column not yet migrated — default to no email (respect unchecked)
    }

    public async Task UpdateNotifyOnRsvpAsync(int userId, bool notify)
    {
        const string sql = "UPDATE Users SET NotifyOnRsvp = @Notify, UpdatedAt = @Now WHERE Id = @Id";
        await using var conn = await _db.GetOpenConnectionAsync();
        await using var cmd  = new SqlCommand(sql, conn);
        cmd.Parameters.AddWithValue("@Id",     userId);
        cmd.Parameters.AddWithValue("@Notify", notify);
        cmd.Parameters.AddWithValue("@Now",    DateTime.UtcNow);
        await cmd.ExecuteNonQueryAsync();
    }

    public Task SaveChangesAsync() => Task.CompletedTask;

    private static User Map(SqlDataReader r) => new()
    {
        Id              = r.GetInt32(r.GetOrdinal("Id")),
        Username        = r.GetString(r.GetOrdinal("Username")),
        Email           = r.GetString(r.GetOrdinal("Email")),
        DisplayName     = r.IsDBNull(r.GetOrdinal("DisplayName"))     ? null : r.GetString(r.GetOrdinal("DisplayName")),
        PasswordHash    = r.GetString(r.GetOrdinal("PasswordHash")),
        Role            = r.GetString(r.GetOrdinal("Role")),
        IsVerified      = r.GetBoolean(r.GetOrdinal("IsVerified")),
        IsActive        = r.GetBoolean(r.GetOrdinal("IsActive")),
        ProfileImageUrl = r.IsDBNull(r.GetOrdinal("ProfileImageUrl")) ? null : r.GetString(r.GetOrdinal("ProfileImageUrl")),
        CreatedAt       = r.GetDateTime(r.GetOrdinal("CreatedAt")),
        UpdatedAt       = r.IsDBNull(r.GetOrdinal("UpdatedAt"))       ? null : r.GetDateTime(r.GetOrdinal("UpdatedAt")),
        LastLoginAt     = r.IsDBNull(r.GetOrdinal("LastLoginAt"))     ? null : r.GetDateTime(r.GetOrdinal("LastLoginAt")),
    };
}
