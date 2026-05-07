using System.Data.SqlClient;
using Riva.Api.Data;
using Riva.Domain.Entity;
using Riva.Service.Repository;

namespace Riva.Api.Repository;

public class OtpRepository : IOtpRepository
{
    private readonly DatabaseConnection _db;

    public OtpRepository(DatabaseConnection db)
    {
        _db = db;
    }

    public async Task SaveOtpAsync(EmailOtp otp)
    {
        const string sql = @"
            INSERT INTO UserEmailOtpGenerate (Email, OtpCode, ExpiryTime, Status, Type, CreatedAt)
            VALUES (@Email, @OtpCode, @ExpiryTime, @Status, @Type, @CreatedAt)";
        using var conn = await _db.GetOpenConnectionAsync();
        using var cmd = new SqlCommand(sql, conn);
        cmd.Parameters.AddWithValue("@Email", otp.Email);
        cmd.Parameters.AddWithValue("@OtpCode", otp.OtpCode);
        cmd.Parameters.AddWithValue("@ExpiryTime", otp.ExpiryTime);
        cmd.Parameters.AddWithValue("@Status", otp.Status);
        cmd.Parameters.AddWithValue("@Type", otp.Type);
        cmd.Parameters.AddWithValue("@CreatedAt", otp.CreatedAt);
        await cmd.ExecuteNonQueryAsync();
    }

    public async Task<EmailOtp?> GetLatestPendingOtpAsync(string email, string type = "Registration")
    {
        const string sql = @"
            SELECT TOP 1 Id, Email, OtpCode, ExpiryTime, Status, Type, CreatedAt
            FROM UserEmailOtpGenerate
            WHERE Email = @Email AND Status = 'Pending' AND Type = @Type
            ORDER BY CreatedAt DESC";
        using var conn = await _db.GetOpenConnectionAsync();
        using var cmd = new SqlCommand(sql, conn);
        cmd.Parameters.AddWithValue("@Email", email);
        cmd.Parameters.AddWithValue("@Type", type);
        using var r = await cmd.ExecuteReaderAsync();
        if (!await r.ReadAsync()) return null;
        return new EmailOtp
        {
            Id         = r.GetInt32(r.GetOrdinal("Id")),
            Email      = r.GetString(r.GetOrdinal("Email")),
            OtpCode    = r.GetString(r.GetOrdinal("OtpCode")),
            ExpiryTime = r.GetDateTime(r.GetOrdinal("ExpiryTime")),
            Status     = r.GetString(r.GetOrdinal("Status")),
            Type       = r.GetString(r.GetOrdinal("Type")),
            CreatedAt  = r.GetDateTime(r.GetOrdinal("CreatedAt"))
        };
    }

    public async Task MarkOtpUsedAsync(int otpId)
    {
        const string sql = "UPDATE UserEmailOtpGenerate SET Status = 'Used' WHERE Id = @Id";
        using var conn = await _db.GetOpenConnectionAsync();
        using var cmd = new SqlCommand(sql, conn);
        cmd.Parameters.AddWithValue("@Id", otpId);
        await cmd.ExecuteNonQueryAsync();
    }

    public async Task ExpireAllPendingForEmailAsync(string email, string type = "Registration")
    {
        const string sql = @"
            UPDATE UserEmailOtpGenerate
            SET Status = 'Expired'
            WHERE Email = @Email AND Status = 'Pending' AND Type = @Type";
        using var conn = await _db.GetOpenConnectionAsync();
        using var cmd = new SqlCommand(sql, conn);
        cmd.Parameters.AddWithValue("@Email", email);
        cmd.Parameters.AddWithValue("@Type", type);
        await cmd.ExecuteNonQueryAsync();
    }

    public async Task<bool> HasVerifiedOtpAsync(string email)
    {
        const string sql = @"
            SELECT COUNT(1) FROM UserEmailOtpGenerate
            WHERE Email = @Email AND Status = 'Used' AND Type = 'Registration'";
        using var conn = await _db.GetOpenConnectionAsync();
        using var cmd = new SqlCommand(sql, conn);
        cmd.Parameters.AddWithValue("@Email", email);
        var count = (int)await cmd.ExecuteScalarAsync();
        return count > 0;
    }
}
