using Riva.Domain.Entity;

namespace Riva.Service.Repository;

public interface IPaymentRepository
{
    Task<int> CreatePaymentAsync(Payment payment);
    Task<Payment?> GetPaymentByIdAsync(int id);
    Task<Payment?> GetPaymentByOrderIdAsync(string razorpayOrderId);
    Task<IEnumerable<Payment>> GetAllPaymentsAsync();
    Task UpdatePaymentAsync(Payment payment);
    Task<int> CreatePaymentOtpAsync(PaymentOtp otp);
    Task<bool> VerifyPaymentOtpAsync(int paymentId, string code);
}