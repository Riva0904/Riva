using System.Data.SqlClient;

namespace Riva.Api.Data;

/// <summary>Runs once at startup to ensure required tables exist.</summary>
public static class DatabaseInitializer
{
    public static async Task EnsureTablesAsync(DatabaseConnection db)
    {
        using var conn = await db.GetOpenConnectionAsync();
        await RunMigration(conn, AppSettingsDdl,  "AppSettings table");
        await RunMigration(conn, UserColumnsDdl,  "Users.NotifyOnRsvp column");
    }

    private static async Task RunMigration(System.Data.SqlClient.SqlConnection conn, string sql, string name)
    {
        try
        {
            using var cmd = new System.Data.SqlClient.SqlCommand(sql, conn);
            await cmd.ExecuteNonQueryAsync();
        }
        catch (Exception ex)
        {
            Serilog.Log.Warning(ex, "Startup migration failed: {Name}", name);
        }
    }

    // Add NotifyOnRsvp column to Users if it doesn't exist yet
    private const string UserColumnsDdl = """
        IF NOT EXISTS (
            SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS
            WHERE TABLE_NAME = 'Users' AND COLUMN_NAME = 'NotifyOnRsvp'
        )
        BEGIN
            ALTER TABLE Users ADD NotifyOnRsvp BIT NOT NULL DEFAULT 1;
        END
        """;

    private const string AppSettingsDdl = """
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
            INSERT INTO AppSettings ([Key], [Value]) VALUES
                ('theme.colorStart',  '#16a34a'),
                ('theme.colorEnd',    '#059669'),
                ('theme.gradientDir', '135deg'),
                ('theme.mode',        'light');
        END
        """;
}
