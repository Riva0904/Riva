using Riva.Service.Repository;
using Riva.Domain.Entity;
using Riva.Api.Data;
using System.Data.SqlClient;
using System.Data;

namespace Riva.Api.Repository;

public class PaymentRepository : IPaymentRepository
{
    private readonly DatabaseConnection _dbConnection;

    public PaymentRepository(DatabaseConnection dbConnection)
    {
        _dbConnection = dbConnection;
    }

    public async Task<int> CreatePaymentAsync(Payment payment)
    {
        using var connection = await _dbConnection.GetOpenConnectionAsync();
        using var command = new SqlCommand("sp_CreatePayment", connection);
        command.CommandType = CommandType.StoredProcedure;

        command.Parameters.AddWithValue("@UserId", payment.UserId);
        command.Parameters.AddWithValue("@Amount", payment.Amount);
        command.Parameters.AddWithValue("@Currency", payment.Currency);
        command.Parameters.AddWithValue("@Notes", (object?)payment.Notes ?? DBNull.Value);

        var idParam = new SqlParameter("@Id", SqlDbType.Int) { Direction = ParameterDirection.Output };
        command.Parameters.Add(idParam);

        await command.ExecuteNonQueryAsync();

        return (int)idParam.Value;
    }

    public async Task<Payment?> GetPaymentByIdAsync(int id)
    {
        using var connection = await _dbConnection.GetOpenConnectionAsync();
        using var command = new SqlCommand("SELECT * FROM Payments WHERE Id = @Id", connection);
        command.Parameters.AddWithValue("@Id", id);

        using var reader = await command.ExecuteReaderAsync();

        if (await reader.ReadAsync())
        {
            return new Payment
            {
                Id = reader.GetInt32(0),
                UserId = reader.GetInt32(1),
                Amount = reader.GetDecimal(2),
                Currency = reader.GetString(3),
                Status = reader.GetString(4),
                RazorpayOrderId = reader.IsDBNull(5) ? null : reader.GetString(5),
                RazorpayPaymentId = reader.IsDBNull(6) ? null : reader.GetString(6),
                RazorpaySignature = reader.IsDBNull(7) ? null : reader.GetString(7),
                CreatedAt = reader.GetDateTime(8),
                UpdatedAt = reader.IsDBNull(9) ? null : (DateTime?)reader.GetDateTime(9),
                Notes = reader.IsDBNull(10) ? null : reader.GetString(10)
            };
        }

        return null;
    }

    public async Task UpdatePaymentAsync(Payment payment)
    {
        using var connection = await _dbConnection.GetOpenConnectionAsync();
        using var command = new SqlCommand("sp_UpdatePaymentStatus", connection);
        command.CommandType = CommandType.StoredProcedure;

        command.Parameters.AddWithValue("@Id", payment.Id);
        command.Parameters.AddWithValue("@Status", payment.Status);
        command.Parameters.AddWithValue("@RazorpayOrderId", (object?)payment.RazorpayOrderId ?? DBNull.Value);
        command.Parameters.AddWithValue("@RazorpayPaymentId", (object?)payment.RazorpayPaymentId ?? DBNull.Value);
        command.Parameters.AddWithValue("@RazorpaySignature", (object?)payment.RazorpaySignature ?? DBNull.Value);

        await command.ExecuteNonQueryAsync();
    }

    public async Task<int> CreatePaymentOtpAsync(PaymentOtp otp)
    {
        using var connection = await _dbConnection.GetOpenConnectionAsync();
        using var command = new SqlCommand("sp_CreatePaymentOtp", connection);
        command.CommandType = CommandType.StoredProcedure;

        command.Parameters.AddWithValue("@PaymentId", otp.PaymentId);
        command.Parameters.AddWithValue("@Code", otp.Code);
        command.Parameters.AddWithValue("@ExpiresAt", otp.ExpiresAt);

        var idParam = new SqlParameter("@Id", SqlDbType.Int) { Direction = ParameterDirection.Output };
        command.Parameters.Add(idParam);

        await command.ExecuteNonQueryAsync();

        return (int)idParam.Value;
    }

    public async Task<bool> VerifyPaymentOtpAsync(int paymentId, string code)
    {
        using var connection = await _dbConnection.GetOpenConnectionAsync();
        using var command = new SqlCommand("sp_VerifyPaymentOtp", connection);
        command.CommandType = CommandType.StoredProcedure;

        command.Parameters.AddWithValue("@PaymentId", paymentId);
        command.Parameters.AddWithValue("@Code", code);

        var result = (int)await command.ExecuteScalarAsync();
        return result > 0;
    }

    public async Task<Payment?> GetPaymentByOrderIdAsync(string razorpayOrderId)
    {
        using var connection = await _dbConnection.GetOpenConnectionAsync();
        using var command = new SqlCommand("SELECT * FROM Payments WHERE RazorpayOrderId = @RazorpayOrderId", connection);
        command.Parameters.AddWithValue("@RazorpayOrderId", razorpayOrderId);

        using var reader = await command.ExecuteReaderAsync();
        if (await reader.ReadAsync())
        {
            return new Payment
            {
                Id = reader.GetInt32(0),
                UserId = reader.GetInt32(1),
                Amount = reader.GetDecimal(2),
                Currency = reader.GetString(3),
                Status = reader.GetString(4),
                RazorpayOrderId = reader.IsDBNull(5) ? null : reader.GetString(5),
                RazorpayPaymentId = reader.IsDBNull(6) ? null : reader.GetString(6),
                RazorpaySignature = reader.IsDBNull(7) ? null : reader.GetString(7),
                CreatedAt = reader.GetDateTime(8),
                UpdatedAt = reader.IsDBNull(9) ? null : (DateTime?)reader.GetDateTime(9),
                Notes = reader.IsDBNull(10) ? null : reader.GetString(10)
            };
        }

        return null;
    }

    public async Task<IEnumerable<Payment>> GetAllPaymentsAsync()
    {
        var payments = new List<Payment>();
        using var connection = await _dbConnection.GetOpenConnectionAsync();
        using var command = new SqlCommand("SELECT * FROM Payments", connection);

        using var reader = await command.ExecuteReaderAsync();

        while (await reader.ReadAsync())
        {
            payments.Add(new Payment
            {
                Id = reader.GetInt32(0),
                UserId = reader.GetInt32(1),
                Amount = reader.GetDecimal(2),
                Currency = reader.GetString(3),
                Status = reader.GetString(4),
                RazorpayOrderId = reader.IsDBNull(5) ? null : reader.GetString(5),
                RazorpayPaymentId = reader.IsDBNull(6) ? null : reader.GetString(6),
                RazorpaySignature = reader.IsDBNull(7) ? null : reader.GetString(7),
                CreatedAt = reader.GetDateTime(8),
                UpdatedAt = reader.IsDBNull(9) ? null : (DateTime?)reader.GetDateTime(9),
                Notes = reader.IsDBNull(10) ? null : reader.GetString(10)
            });
        }

        return payments;
    }
}