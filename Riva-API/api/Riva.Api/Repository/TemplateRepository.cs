using Riva.Service.Repository;
using Riva.Domain.Entity;
using Riva.Api.Data;
using System.Data.SqlClient;
using System.Data;

namespace Riva.Api.Repository;

public class TemplateRepository : ITemplateRepository
{
    private readonly DatabaseConnection _dbConnection;

    public TemplateRepository(DatabaseConnection dbConnection)
    {
        _dbConnection = dbConnection;
    }

    public async Task<int> CreateTemplateAsync(Riva.Domain.Entity.Template template)
    {
        using var connection = await _dbConnection.GetOpenConnectionAsync();
        using var command = new SqlCommand("sp_CreateTemplate", connection);
        command.CommandType = CommandType.StoredProcedure;

        command.Parameters.AddWithValue("@TemplateId", template.TemplateId);
        command.Parameters.AddWithValue("@Title", template.Title);
        command.Parameters.AddWithValue("@RecipientName", (object?)template.RecipientName ?? DBNull.Value);
        command.Parameters.AddWithValue("@Greeting", (object?)template.Greeting ?? DBNull.Value);
        command.Parameters.AddWithValue("@Location", (object?)template.Location ?? DBNull.Value);
        command.Parameters.AddWithValue("@EventDate", (object?)template.EventDate ?? DBNull.Value);
        command.Parameters.AddWithValue("@PersonalMessage", (object?)template.PersonalMessage ?? DBNull.Value);
        command.Parameters.AddWithValue("@IncludeGoogleMaps", template.IncludeGoogleMaps);
        command.Parameters.AddWithValue("@UserId", (object?)template.UserId ?? DBNull.Value);

        var result = await command.ExecuteScalarAsync();
        return Convert.ToInt32(result);
    }

    public async Task<Riva.Domain.Entity.Template?> GetTemplateByIdAsync(int id)
    {
        using var connection = await _dbConnection.GetOpenConnectionAsync();
        using var command = new SqlCommand("SELECT * FROM Templates WHERE Id = @Id", connection);
        command.Parameters.AddWithValue("@Id", id);

        using var reader = await command.ExecuteReaderAsync();

        if (await reader.ReadAsync())
        {
            return new Riva.Domain.Entity.Template
            {
                Id = reader.GetInt32(reader.GetOrdinal("Id")),
                TemplateId = reader.GetInt32(reader.GetOrdinal("TemplateId")),
                Title = reader.GetString(reader.GetOrdinal("Title")),
                RecipientName = reader.IsDBNull(reader.GetOrdinal("RecipientName")) ? null : reader.GetString(reader.GetOrdinal("RecipientName")),
                Greeting = reader.IsDBNull(reader.GetOrdinal("Greeting")) ? null : reader.GetString(reader.GetOrdinal("Greeting")),
                Location = reader.IsDBNull(reader.GetOrdinal("Location")) ? null : reader.GetString(reader.GetOrdinal("Location")),
                EventDate = reader.IsDBNull(reader.GetOrdinal("EventDate")) ? null : (DateTime?)reader.GetDateTime(reader.GetOrdinal("EventDate")),
                PersonalMessage = reader.IsDBNull(reader.GetOrdinal("PersonalMessage")) ? null : reader.GetString(reader.GetOrdinal("PersonalMessage")),
                IncludeGoogleMaps = reader.GetBoolean(reader.GetOrdinal("IncludeGoogleMaps")),
                Tier = reader.IsDBNull(reader.GetOrdinal("Tier")) ? null : reader.GetString(reader.GetOrdinal("Tier")),
                MaxPhotos = reader.IsDBNull(reader.GetOrdinal("MaxPhotos")) ? null : (int?)reader.GetInt32(reader.GetOrdinal("MaxPhotos")),
                ShareToken = reader.IsDBNull(reader.GetOrdinal("ShareToken")) ? null : reader.GetString(reader.GetOrdinal("ShareToken")),
                IsPublic = reader.GetBoolean(reader.GetOrdinal("IsPublic")),
                ViewCount = reader.GetInt32(reader.GetOrdinal("ViewCount")),
                CreatedAt = reader.GetDateTime(reader.GetOrdinal("CreatedAt")),
                UserId = reader.IsDBNull(reader.GetOrdinal("UserId")) ? null : (int?)reader.GetInt32(reader.GetOrdinal("UserId"))
            };
        }

        return null;
    }

    public async Task<IEnumerable<Riva.Domain.Entity.Template>> GetTemplatesByUserIdAsync(int userId)
    {
        var templates = new List<Riva.Domain.Entity.Template>();
        using var connection = await _dbConnection.GetOpenConnectionAsync();
        using var command = new SqlCommand("SELECT * FROM Templates WHERE UserId = @UserId", connection);
        command.Parameters.AddWithValue("@UserId", userId);

        using var reader = await command.ExecuteReaderAsync();

        while (await reader.ReadAsync())
        {
            templates.Add(new Riva.Domain.Entity.Template
            {
                Id = reader.GetInt32(reader.GetOrdinal("Id")),
                TemplateId = reader.GetInt32(reader.GetOrdinal("TemplateId")),
                Title = reader.GetString(reader.GetOrdinal("Title")),
                RecipientName = reader.IsDBNull(reader.GetOrdinal("RecipientName")) ? null : reader.GetString(reader.GetOrdinal("RecipientName")),
                Greeting = reader.IsDBNull(reader.GetOrdinal("Greeting")) ? null : reader.GetString(reader.GetOrdinal("Greeting")),
                Location = reader.IsDBNull(reader.GetOrdinal("Location")) ? null : reader.GetString(reader.GetOrdinal("Location")),
                EventDate = reader.IsDBNull(reader.GetOrdinal("EventDate")) ? null : (DateTime?)reader.GetDateTime(reader.GetOrdinal("EventDate")),
                PersonalMessage = reader.IsDBNull(reader.GetOrdinal("PersonalMessage")) ? null : reader.GetString(reader.GetOrdinal("PersonalMessage")),
                IncludeGoogleMaps = reader.GetBoolean(reader.GetOrdinal("IncludeGoogleMaps")),
                Tier = reader.IsDBNull(reader.GetOrdinal("Tier")) ? null : reader.GetString(reader.GetOrdinal("Tier")),
                MaxPhotos = reader.IsDBNull(reader.GetOrdinal("MaxPhotos")) ? null : (int?)reader.GetInt32(reader.GetOrdinal("MaxPhotos")),
                ShareToken = reader.IsDBNull(reader.GetOrdinal("ShareToken")) ? null : reader.GetString(reader.GetOrdinal("ShareToken")),
                IsPublic = reader.GetBoolean(reader.GetOrdinal("IsPublic")),
                ViewCount = reader.GetInt32(reader.GetOrdinal("ViewCount")),
                CreatedAt = reader.GetDateTime(reader.GetOrdinal("CreatedAt")),
                UserId = reader.IsDBNull(reader.GetOrdinal("UserId")) ? null : (int?)reader.GetInt32(reader.GetOrdinal("UserId"))
            });
        }

        return templates;
    }

    public async Task<IEnumerable<Riva.Domain.Entity.Template>> GetAllTemplatesAsync()
    {
        var templates = new List<Riva.Domain.Entity.Template>();
        using var connection = await _dbConnection.GetOpenConnectionAsync();
        using var command = new SqlCommand("SELECT * FROM Templates", connection);

        using var reader = await command.ExecuteReaderAsync();

        while (await reader.ReadAsync())
        {
            templates.Add(new Riva.Domain.Entity.Template
            {
                Id = reader.GetInt32(reader.GetOrdinal("Id")),
                TemplateId = reader.GetInt32(reader.GetOrdinal("TemplateId")),
                Title = reader.GetString(reader.GetOrdinal("Title")),
                RecipientName = reader.IsDBNull(reader.GetOrdinal("RecipientName")) ? null : reader.GetString(reader.GetOrdinal("RecipientName")),
                Greeting = reader.IsDBNull(reader.GetOrdinal("Greeting")) ? null : reader.GetString(reader.GetOrdinal("Greeting")),
                Location = reader.IsDBNull(reader.GetOrdinal("Location")) ? null : reader.GetString(reader.GetOrdinal("Location")),
                EventDate = reader.IsDBNull(reader.GetOrdinal("EventDate")) ? null : (DateTime?)reader.GetDateTime(reader.GetOrdinal("EventDate")),
                PersonalMessage = reader.IsDBNull(reader.GetOrdinal("PersonalMessage")) ? null : reader.GetString(reader.GetOrdinal("PersonalMessage")),
                IncludeGoogleMaps = reader.GetBoolean(reader.GetOrdinal("IncludeGoogleMaps")),
                Tier = reader.IsDBNull(reader.GetOrdinal("Tier")) ? null : reader.GetString(reader.GetOrdinal("Tier")),
                MaxPhotos = reader.IsDBNull(reader.GetOrdinal("MaxPhotos")) ? null : (int?)reader.GetInt32(reader.GetOrdinal("MaxPhotos")),
                ShareToken = reader.IsDBNull(reader.GetOrdinal("ShareToken")) ? null : reader.GetString(reader.GetOrdinal("ShareToken")),
                IsPublic = reader.GetBoolean(reader.GetOrdinal("IsPublic")),
                ViewCount = reader.GetInt32(reader.GetOrdinal("ViewCount")),
                CreatedAt = reader.GetDateTime(reader.GetOrdinal("CreatedAt")),
                UserId = reader.IsDBNull(reader.GetOrdinal("UserId")) ? null : (int?)reader.GetInt32(reader.GetOrdinal("UserId"))
            });
        }

        return templates;
    }
}