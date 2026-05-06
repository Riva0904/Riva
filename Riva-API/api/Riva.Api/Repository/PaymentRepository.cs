using System.Data;
using System.Data.SqlClient;
using Riva.Api.Data;
using Riva.Domain.Entity;
using Riva.Service.Repository;

namespace Riva.Api.Repository;

public class PaymentRepository : IPaymentRepository
{
    private readonly DatabaseConnection _db;

    public PaymentRepository(DatabaseConnection db)
    {
        _db = db;
    }

    public async Task<int> CreatePaymentAsync(Payment payment)
    {
        const string sql = @"
            INSERT INTO Payments (UserId, Amount, Currency, Status, TransactionDate)
            OUTPUT INSERTED.Id
            VALUES (@UserId, @Amount, @Currency, @Status, @TransactionDate)";

        using var conn = await _db.GetOpenConnectionAsync();
        using var cmd = new SqlCommand(sql, conn);
        cmd.Parameters.AddWithValue("@UserId", payment.UserId);
        cmd.Parameters.AddWithValue("@Amount", payment.Amount);
        cmd.Parameters.AddWithValue("@Currency", payment.Currency);
        cmd.Parameters.AddWithValue("@Status", payment.Status);
        cmd.Parameters.AddWithValue("@TransactionDate", payment.TransactionDate);
        return Convert.ToInt32(await cmd.ExecuteScalarAsync());
    }

    public async Task<Payment?> GetPaymentByIdAsync(int id)
    {
        const string sql = "SELECT * FROM Payments WHERE Id = @Id";
        using var conn = await _db.GetOpenConnectionAsync();
        using var cmd = new SqlCommand(sql, conn);
        cmd.Parameters.AddWithValue("@Id", id);
        using var r = await cmd.ExecuteReaderAsync();
        return await r.ReadAsync() ? MapPayment(r) : null;
    }

    public async Task<Payment?> GetPaymentByOrderIdAsync(string razorpayOrderId)
    {
        const string sql = "SELECT * FROM Payments WHERE RazorpayOrderId = @OrderId";
        using var conn = await _db.GetOpenConnectionAsync();
        using var cmd = new SqlCommand(sql, conn);
        cmd.Parameters.AddWithValue("@OrderId", razorpayOrderId);
        using var r = await cmd.ExecuteReaderAsync();
        return await r.ReadAsync() ? MapPayment(r) : null;
    }

    public async Task UpdatePaymentAsync(Payment payment)
    {
        const string sql = @"
            UPDATE Payments SET
                Status = @Status,
                RazorpayOrderId = @RazorpayOrderId,
                RazorpayPaymentId = @RazorpayPaymentId,
                RazorpaySignature = @RazorpaySignature,
                CompletionDate = @CompletionDate
            WHERE Id = @Id";

        using var conn = await _db.GetOpenConnectionAsync();
        using var cmd = new SqlCommand(sql, conn);
        cmd.Parameters.AddWithValue("@Id", payment.Id);
        cmd.Parameters.AddWithValue("@Status", payment.Status);
        cmd.Parameters.AddWithValue("@RazorpayOrderId", (object?)payment.RazorpayOrderId ?? DBNull.Value);
        cmd.Parameters.AddWithValue("@RazorpayPaymentId", (object?)payment.RazorpayPaymentId ?? DBNull.Value);
        cmd.Parameters.AddWithValue("@RazorpaySignature", (object?)payment.RazorpaySignature ?? DBNull.Value);
        cmd.Parameters.AddWithValue("@CompletionDate", (object?)payment.CompletionDate ?? DBNull.Value);
        await cmd.ExecuteNonQueryAsync();
    }

    public async Task<int> CreatePaymentOtpAsync(PaymentOtp otp)
    {
        const string sql = @"
            INSERT INTO PaymentOtps (UserId, Email, OtpCode, ExpiryTime, Status, CreatedAt)
            OUTPUT INSERTED.Id
            VALUES (@UserId, @Email, @OtpCode, @ExpiryTime, @Status, @CreatedAt)";

        using var conn = await _db.GetOpenConnectionAsync();
        using var cmd = new SqlCommand(sql, conn);
        cmd.Parameters.AddWithValue("@UserId", otp.UserId);
        cmd.Parameters.AddWithValue("@Email", otp.Email);
        cmd.Parameters.AddWithValue("@OtpCode", otp.OtpCode);
        cmd.Parameters.AddWithValue("@ExpiryTime", otp.ExpiryTime);
        cmd.Parameters.AddWithValue("@Status", otp.Status);
        cmd.Parameters.AddWithValue("@CreatedAt", otp.CreatedAt);
        return Convert.ToInt32(await cmd.ExecuteScalarAsync());
    }

    public async Task<bool> VerifyPaymentOtpAsync(int paymentId, string code)
    {
        // Stub – full Razorpay OTP flow implemented in next phase
        return await Task.FromResult(false);
    }

    public async Task<IEnumerable<Payment>> GetAllPaymentsAsync()
    {
        const string sql = "SELECT * FROM Payments ORDER BY TransactionDate DESC";
        using var conn = await _db.GetOpenConnectionAsync();
        using var cmd = new SqlCommand(sql, conn);
        using var r = await cmd.ExecuteReaderAsync();
        var list = new List<Payment>();
        while (await r.ReadAsync()) list.Add(MapPayment(r));
        return list;
    }

    private static Payment MapPayment(SqlDataReader r) => new()
    {
        Id = r.GetInt32(r.GetOrdinal("Id")),
        UserId = r.GetInt32(r.GetOrdinal("UserId")),
        Amount = r.GetDecimal(r.GetOrdinal("Amount")),
        Currency = r.GetString(r.GetOrdinal("Currency")),
        Status = r.GetString(r.GetOrdinal("Status")),
        RazorpayOrderId = r.IsDBNull(r.GetOrdinal("RazorpayOrderId")) ? null : r.GetString(r.GetOrdinal("RazorpayOrderId")),
        RazorpayPaymentId = r.IsDBNull(r.GetOrdinal("RazorpayPaymentId")) ? null : r.GetString(r.GetOrdinal("RazorpayPaymentId")),
        RazorpaySignature = r.IsDBNull(r.GetOrdinal("RazorpaySignature")) ? null : r.GetString(r.GetOrdinal("RazorpaySignature")),
        TransactionDate = r.GetDateTime(r.GetOrdinal("TransactionDate")),
        CompletionDate = r.IsDBNull(r.GetOrdinal("CompletionDate")) ? null : r.GetDateTime(r.GetOrdinal("CompletionDate"))
    };
}
