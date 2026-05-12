using MediatR;
using Riva.Dto.Payment;

namespace Riva.Service.Query.Admin;

public class GetAdminPaymentsQuery : IRequest<AdminPaymentStatsDto>
{
}
