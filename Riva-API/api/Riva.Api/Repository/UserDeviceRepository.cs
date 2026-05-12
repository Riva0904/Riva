using System.Data.SqlClient;
using Riva.Api.Data;
using Riva.Service.Repository;

namespace Riva.Api.Repository;

public class UserDeviceRepository : IUserDeviceRepository
{
    private readonly DatabaseConnection _db;
    public UserDeviceRepository(DatabaseConnection db) => _db = db;

    public async Task<bool> IsKnownDeviceAsync(int userId, string deviceHash)
    {
        const string sql = "SELECT COUNT(1) FROM UserKnownDevices WHERE UserId=@UserId AND DeviceHash=@Hash";
        await using var conn = await _db.GetOpenConnectionAsync();
        await using var cmd  = new SqlCommand(sql, conn);
        cmd.Parameters.AddWithValue("@UserId", userId);
        cmd.Parameters.AddWithValue("@Hash",   deviceHash);
        var count = (int)await cmd.ExecuteScalarAsync();
        if (count > 0)
        {
            // Update LastSeenAt
            const string upd = "UPDATE UserKnownDevices SET LastSeenAt=GETUTCDATE() WHERE UserId=@UserId AND DeviceHash=@Hash";
            await using var upCmd = new SqlCommand(upd, conn);
            upCmd.Parameters.AddWithValue("@UserId", userId);
            upCmd.Parameters.AddWithValue("@Hash",   deviceHash);
            await upCmd.ExecuteNonQueryAsync();
            return true;
        }
        return false;
    }

    public async Task AddDeviceAsync(int userId, string deviceHash, string deviceLabel)
    {
        const string sql = """
            IF NOT EXISTS (SELECT 1 FROM UserKnownDevices WHERE UserId=@UserId AND DeviceHash=@Hash)
                INSERT INTO UserKnownDevices (UserId, DeviceHash, DeviceLabel)
                VALUES (@UserId, @Hash, @Label)
            """;
        await using var conn = await _db.GetOpenConnectionAsync();
        await using var cmd  = new SqlCommand(sql, conn);
        cmd.Parameters.AddWithValue("@UserId", userId);
        cmd.Parameters.AddWithValue("@Hash",   deviceHash);
        cmd.Parameters.AddWithValue("@Label",  (object?)deviceLabel ?? DBNull.Value);
        await cmd.ExecuteNonQueryAsync();
    }
}
