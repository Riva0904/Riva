namespace Riva.Dto.Payment;

public class PaymentDto
{
    public int Id { get; set; }
    public int UserId { get; set; }
    public decimal Amount { get; set; }
    public string Currency { get; set; } = "INR";
    public string Status { get; set; } = "Pending";
    public string? RazorpayOrderId { get; set; }
    public string? RazorpayPaymentId { get; set; }
    public string? RazorpaySignature { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
    public string? Notes { get; set; }
}

public class PaymentAdminRecord
{
    public int Id { get; set; }
    public int UserId { get; set; }
    public string Username { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public decimal Amount { get; set; }
    public string Currency { get; set; } = "INR";
    public string Status { get; set; } = string.Empty;
    public string? RazorpayPaymentId { get; set; }
    public DateTime TransactionDate { get; set; }
    public DateTime? CompletionDate { get; set; }
}

public class AdminPaymentStatsDto
{
    public decimal TotalAmount { get; set; }
    public int TotalPayments { get; set; }
    public int CompletedPayments { get; set; }
    public List<PaymentAdminRecord> Payments { get; set; } = new();
}