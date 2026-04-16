using System.Data.SqlClient;
using Riva.Domain.Entity;
using Riva.Service.Repository;
using Riva.Api.Data;

namespace Riva.Api.Repository;

public class UserRepository : IUserRepository
{
    private readonly DatabaseConnection _dbConnection;

    public UserRepository(DatabaseConnection dbConnection)
    {
        _dbConnection = dbConnection;
    }

    public async Task<User?> GetByUsernameAsync(string username)
    {
        using (var connection = await _dbConnection.GetOpenConnectionAsync())
        {
            using (var command = new SqlCommand("SELECT * FROM Users WHERE Username = @Username", connection))
            {
                command.Parameters.AddWithValue("@Username", username);
                using (var reader = await command.ExecuteReaderAsync())
                {
                    if (await reader.ReadAsync())
                    {
                        return MapUserFromReader(reader);
                    }
                }
            }
        }
        return null;
    }

    public async Task<User?> GetByEmailAsync(string email)
    {
        using (var connection = await _dbConnection.GetOpenConnectionAsync())
        {
            using (var command = new SqlCommand("SELECT * FROM Users WHERE Email = @Email", connection))
            {
                command.Parameters.AddWithValue("@Email", email);
                using (var reader = await command.ExecuteReaderAsync())
                {
                    if (await reader.ReadAsync())
                    {
                        return MapUserFromReader(reader);
                    }
                }
            }
        }
        return null;
    }

    public async Task<User?> GetByIdAsync(int id)
    {
        using (var connection = await _dbConnection.GetOpenConnectionAsync())
        {
            using (var command = new SqlCommand("SELECT * FROM Users WHERE Id = @Id", connection))
            {
                command.Parameters.AddWithValue("@Id", id);
                using (var reader = await command.ExecuteReaderAsync())
                {
                    if (await reader.ReadAsync())
                    {
                        return MapUserFromReader(reader);
                    }
                }
            }
        }
        return null;
    }

    public async Task<List<User>> GetAllAsync(int pageNumber, int pageSize)
    {
        var users = new List<User>();
        var offset = (pageNumber - 1) * pageSize;

        using (var connection = await _dbConnection.GetOpenConnectionAsync())
        {
            using (var command = new SqlCommand(
                "SELECT * FROM Users ORDER BY Id OFFSET @Offset ROWS FETCH NEXT @PageSize ROWS ONLY", 
                connection))
            {
                command.Parameters.AddWithValue("@Offset", offset);
                command.Parameters.AddWithValue("@PageSize", pageSize);
                using (var reader = await command.ExecuteReaderAsync())
                {
                    while (await reader.ReadAsync())
                    {
                        users.Add(MapUserFromReader(reader));
                    }
                }
            }
        }
        return users;
    }

    public async Task<List<User>> SearchAsync(string? searchTerm, string? role, bool? isActive, int pageNumber, int pageSize)
    {
        var users = new List<User>();
        var offset = (pageNumber - 1) * pageSize;

        var query = "SELECT * FROM Users WHERE 1=1";
        if (!string.IsNullOrWhiteSpace(searchTerm))
            query += " AND (Username LIKE @SearchTerm OR Email LIKE @SearchTerm)";
        if (!string.IsNullOrWhiteSpace(role))
            query += " AND Role = @Role";
        if (isActive.HasValue)
            query += " AND IsActive = @IsActive";

        query += " ORDER BY Id OFFSET @Offset ROWS FETCH NEXT @PageSize ROWS ONLY";

        using (var connection = await _dbConnection.GetOpenConnectionAsync())
        {
            using (var command = new SqlCommand(query, connection))
            {
                if (!string.IsNullOrWhiteSpace(searchTerm))
                    command.Parameters.AddWithValue("@SearchTerm", $"%{searchTerm}%");
                if (!string.IsNullOrWhiteSpace(role))
                    command.Parameters.AddWithValue("@Role", role);
                if (isActive.HasValue)
                    command.Parameters.AddWithValue("@IsActive", isActive.Value);

                command.Parameters.AddWithValue("@Offset", offset);
                command.Parameters.AddWithValue("@PageSize", pageSize);

                using (var reader = await command.ExecuteReaderAsync())
                {
                    while (await reader.ReadAsync())
                    {
                        users.Add(MapUserFromReader(reader));
                    }
                }
            }
        }
        return users;
    }

    public async Task AddAsync(User user)
    {
        using (var connection = await _dbConnection.GetOpenConnectionAsync())
        {
            using (var command = new SqlCommand(
                "INSERT INTO Users (Username, Email, PasswordHash, Role, IsActive, CreatedAt) " +
                "VALUES (@Username, @Email, @PasswordHash, @Role, @IsActive, @CreatedAt)", 
                connection))
            {
                AddUserParameters(command, user);
                await command.ExecuteNonQueryAsync();
            }
        }
    }

    public async Task UpdateAsync(User user)
    {
        using (var connection = await _dbConnection.GetOpenConnectionAsync())
        {
            using (var command = new SqlCommand(
                "UPDATE Users SET Username=@Username, Email=@Email, PasswordHash=@PasswordHash, " +
                "Role=@Role, IsActive=@IsActive, UpdatedAt=@UpdatedAt, LastLoginAt=@LastLoginAt " +
                "WHERE Id=@Id", 
                connection))
            {
                command.Parameters.AddWithValue("@Id", user.Id);
                AddUserParameters(command, user);
                await command.ExecuteNonQueryAsync();
            }
        }
    }

    public async Task DeleteAsync(User user)
    {
        using (var connection = await _dbConnection.GetOpenConnectionAsync())
        {
            using (var command = new SqlCommand("DELETE FROM Users WHERE Id = @Id", connection))
            {
                command.Parameters.AddWithValue("@Id", user.Id);
                await command.ExecuteNonQueryAsync();
            }
        }
    }

    public async Task SaveChangesAsync()
    {
        await Task.CompletedTask;
    }

    private User MapUserFromReader(SqlDataReader reader)
    {
        return new User
        {
            Id = reader.GetInt32(0),
            Username = reader.GetString(1),
            Email = reader.GetString(2),
            PasswordHash = reader.GetString(3),
            Role = reader.GetString(4),
            IsActive = reader.GetBoolean(5),
            CreatedAt = reader.GetDateTime(6),
            UpdatedAt = reader.IsDBNull(7) ? null : reader.GetDateTime(7),
            LastLoginAt = reader.IsDBNull(8) ? null : reader.GetDateTime(8)
        };
    }

    private void AddUserParameters(SqlCommand command, User user)
    {
        command.Parameters.AddWithValue("@Username", user.Username);
        command.Parameters.AddWithValue("@Email", user.Email);
        command.Parameters.AddWithValue("@PasswordHash", user.PasswordHash);
        command.Parameters.AddWithValue("@Role", user.Role);
        command.Parameters.AddWithValue("@IsActive", user.IsActive);
        command.Parameters.AddWithValue("@CreatedAt", user.CreatedAt);
        command.Parameters.AddWithValue("@UpdatedAt", (object?)user.UpdatedAt ?? DBNull.Value);
        command.Parameters.AddWithValue("@LastLoginAt", (object?)user.LastLoginAt ?? DBNull.Value);
    }
}