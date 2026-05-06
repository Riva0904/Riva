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
            INSERT INTO UserEmailOtpGenerate (Email, OtpCode, ExpiryTime, Status, CreatedAt)
            VALUES (@Email, @OtpCode, @ExpiryTime, @Status, @CreatedAt)";

        using var conn = await _db.GetOpenConnectionAsync();
        using var cmd = new SqlCommand(sql, conn);
        cmd.Parameters.AddWithValue("@Email", otp.Email);
        cmd.Parameters.AddWithValue("@OtpCode", otp.OtpCode);
        cmd.Parameters.AddWithValue("@ExpiryTime", otp.ExpiryTime);
        cmd.Parameters.AddWithValue("@Status", otp.Status);
        cmd.Parameters.AddWithValue("@CreatedAt", otp.CreatedAt);
        await cmd.ExecuteNonQueryAsync();
    }

    public async Task<EmailOtp?> GetLatestPendingOtpAsync(string email)
    {
        const string sql = @"
            SELECT TOP 1 Id, Email, OtpCode, ExpiryTime, Status, CreatedAt
            FROM UserEmailOtpGenerate
            WHERE Email = @Email AND Status = 'Pending'
            ORDER BY CreatedAt DESC";

        using var conn = await _db.GetOpenConnectionAsync();
        using var cmd = new SqlCommand(sql, conn);
        cmd.Parameters.AddWithValue("@Email", email);
        using var reader = await cmd.ExecuteReaderAsync();

        if (await reader.ReadAsync())
        {
            return new EmailOtp
            {
                Id = reader.GetInt32(reader.GetOrdinal("Id")),
                Email = reader.GetString(reader.GetOrdinal("Email")),
                OtpCode = reader.GetString(reader.GetOrdinal("OtpCode")),
                ExpiryTime = reader.GetDateTime(reader.GetOrdinal("ExpiryTime")),
                Status = reader.GetString(reader.GetOrdinal("Status")),
                CreatedAt = reader.GetDateTime(reader.GetOrdinal("CreatedAt"))
            };
        }

        return null;
    }

    public async Task MarkOtpUsedAsync(int otpId)
    {
        const string sql = "UPDATE UserEmailOtpGenerate SET Status = 'Used' WHERE Id = @Id";
        using var conn = await _db.GetOpenConnectionAsync();
        using var cmd = new SqlCommand(sql, conn);
        cmd.Parameters.AddWithValue("@Id", otpId);
        await cmd.ExecuteNonQueryAsync();
    }

    public async Task ExpireAllPendingForEmailAsync(string email)
    {
        const string sql = "UPDATE UserEmailOtpGenerate SET Status = 'Expired' WHERE Email = @Email AND Status = 'Pending'";
        using var conn = await _db.GetOpenConnectionAsync();
        using var cmd = new SqlCommand(sql, conn);
        cmd.Parameters.AddWithValue("@Email", email);
        await cmd.ExecuteNonQueryAsync();
    }
}
