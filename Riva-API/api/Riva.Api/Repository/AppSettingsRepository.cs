using System.Data.SqlClient;
using Riva.Api.Data;
using Riva.Service.Repository;

namespace Riva.Api.Repository;

public class AppSettingsRepository : IAppSettingsRepository
{
    private readonly DatabaseConnection _db;
    public AppSettingsRepository(DatabaseConnection db) => _db = db;

    public async Task<string?> GetAsync(string key)
    {
        const string sql = "SELECT [Value] FROM AppSettings WHERE [Key] = @Key";
        await using var conn = await _db.GetOpenConnectionAsync();
        await using var cmd  = new SqlCommand(sql, conn);
        cmd.Parameters.AddWithValue("@Key", key);
        var result = await cmd.ExecuteScalarAsync();
        return result as string;
    }

    public async Task SetAsync(string key, string value)
    {
        const string sql = """
            MERGE AppSettings AS target
            USING (SELECT @Key AS [Key], @Value AS [Value]) AS source
            ON target.[Key] = source.[Key]
            WHEN MATCHED THEN
                UPDATE SET [Value] = source.[Value], UpdatedAt = GETUTCDATE()
            WHEN NOT MATCHED THEN
                INSERT ([Key], [Value]) VALUES (source.[Key], source.[Value]);
            """;
        await using var conn = await _db.GetOpenConnectionAsync();
        await using var cmd  = new SqlCommand(sql, conn);
        cmd.Parameters.AddWithValue("@Key",   key);
        cmd.Parameters.AddWithValue("@Value", value);
        await cmd.ExecuteNonQueryAsync();
    }
}
