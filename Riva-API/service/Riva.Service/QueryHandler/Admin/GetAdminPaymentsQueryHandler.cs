using MediatR;
using Riva.Dto.Payment;
using Riva.Service.Query.Admin;
using Riva.Service.Repository;

namespace Riva.Service.QueryHandler.Admin;

public class GetAdminPaymentsQueryHandler : IRequestHandler<GetAdminPaymentsQuery, AdminPaymentStatsDto>
{
    private readonly IPaymentRepository _paymentRepository;
    private readonly IUserRepository _userRepository;

    public GetAdminPaymentsQueryHandler(IPaymentRepository paymentRepository, IUserRepository userRepository)
    {
        _paymentRepository = paymentRepository;
        _userRepository = userRepository;
    }

    public async Task<AdminPaymentStatsDto> Handle(GetAdminPaymentsQuery request, CancellationToken cancellationToken)
    {
        var payments = (await _paymentRepository.GetAllPaymentsAsync()).ToList();
        var users = await _userRepository.GetAllAsync(1, int.MaxValue);
        var userDict = users.ToDictionary(u => u.Id);

        var records = payments.Select(p =>
        {
            userDict.TryGetValue(p.UserId, out var user);
            return new PaymentAdminRecord
            {
                Id = p.Id,
                UserId = p.UserId,
                Username = user?.Username ?? "Unknown",
                Email = user?.Email ?? "Unknown",
                Amount = p.Amount,
                Currency = p.Currency,
                Status = p.Status,
                RazorpayPaymentId = p.RazorpayPaymentId,
                TransactionDate = p.TransactionDate,
                CompletionDate = p.CompletionDate,
            };
        }).ToList();

        var completed = records.Where(r => r.Status == "Completed").ToList();

        return new AdminPaymentStatsDto
        {
            TotalAmount = completed.Sum(r => r.Amount),
            TotalPayments = records.Count,
            CompletedPayments = completed.Count,
            Payments = records,
        };
    }
}
