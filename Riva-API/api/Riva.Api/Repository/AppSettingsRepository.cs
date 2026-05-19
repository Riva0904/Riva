using System.Data.SqlClient;
using System.Threading;
using Riva.Api.Data;
using Riva.Service.Repository;

namespace Riva.Api.Repository;

public class AppSettingsRepository : IAppSettingsRepository
{
    private readonly DatabaseConnection _db;

    // Shared across all scoped instances — table is created once per process lifetime
    private static volatile bool _tableReady;
    private static readonly SemaphoreSlim _initLock = new(1, 1);

    public AppSettingsRepository(DatabaseConnection db) => _db = db;

    public async Task<string?> GetAsync(string key)
    {
        await EnsureTableReadyAsync();
        using var conn = await _db.GetOpenConnectionAsync();
        using var cmd  = new SqlCommand("SELECT [Value] FROM AppSettings WHERE [Key] = @Key", conn);
        cmd.Parameters.AddWithValue("@Key", key);
        return await cmd.ExecuteScalarAsync() as string;
    }

    public async Task SetAsync(string key, string value)
    {
        await EnsureTableReadyAsync();
        const string sql = """
            MERGE AppSettings AS target
            USING (SELECT @Key AS [Key], @Value AS [Value]) AS source
              ON  target.[Key] = source.[Key]
            WHEN MATCHED     THEN UPDATE SET [Value] = source.[Value], UpdatedAt = GETUTCDATE()
            WHEN NOT MATCHED THEN INSERT ([Key], [Value]) VALUES (source.[Key], source.[Value]);
            """;
        using var conn = await _db.GetOpenConnectionAsync();
        using var cmd  = new SqlCommand(sql, conn);
        cmd.Parameters.AddWithValue("@Key",   key);
        cmd.Parameters.AddWithValue("@Value", value);
        await cmd.ExecuteNonQueryAsync();
    }

    // Double-checked locking: runs exactly once per process, creates table + seeds defaults
    private async Task EnsureTableReadyAsync()
    {
        if (_tableReady) return;

        await _initLock.WaitAsync();
        try
        {
            if (_tableReady) return;

            using var conn = await _db.GetOpenConnectionAsync();

            using (var cmd = new SqlCommand(CreateTableSql, conn))
                await cmd.ExecuteNonQueryAsync();

            using (var cmd = new SqlCommand(SeedDefaultsSql, conn))
                await cmd.ExecuteNonQueryAsync();

            _tableReady = true;
        }
        finally
        {
            _initLock.Release();
        }
    }

    private const string CreateTableSql = """
        IF NOT EXISTS (
            SELECT 1 FROM INFORMATION_SCHEMA.TABLES
            WHERE TABLE_NAME = 'AppSettings'
        )
        BEGIN
            CREATE TABLE AppSettings (
                Id        INT           IDENTITY(1,1) PRIMARY KEY,
                [Key]     NVARCHAR(100) NOT NULL,
                [Value]   NVARCHAR(500) NOT NULL,
                UpdatedAt DATETIME2     NOT NULL DEFAULT GETUTCDATE(),
                CONSTRAINT UQ_AppSettings_Key UNIQUE ([Key])
            );
        END
        """;

    private const string SeedDefaultsSql = """
        IF NOT EXISTS (SELECT 1 FROM AppSettings WHERE [Key] = 'theme.colorStart')
        BEGIN
            INSERT INTO AppSettings ([Key], [Value]) VALUES
                ('theme.colorStart',  '#16a34a'),
                ('theme.colorEnd',    '#059669'),
                ('theme.gradientDir', '135deg'),
                ('theme.mode',        'light');
        END
        """;
}
