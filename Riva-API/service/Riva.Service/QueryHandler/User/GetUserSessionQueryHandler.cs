using MediatR;
using Riva.Dto.User;
using Riva.Service.Query.User;
using Riva.Service.Repository;

namespace Riva.Service.QueryHandler.User;

public class GetUserSessionQueryHandler : IRequestHandler<GetUserSessionQuery, UserSessionDto>
{
    private readonly IUserRepository _userRepository;
    private readonly ITemplateRepository _templateRepository;
    private readonly ICategoryRepository _categoryRepository;

    public GetUserSessionQueryHandler(
        IUserRepository userRepository,
        ITemplateRepository templateRepository,
        ICategoryRepository categoryRepository)
    {
        _userRepository = userRepository;
        _templateRepository = templateRepository;
        _categoryRepository = categoryRepository;
    }

    public async Task<UserSessionDto> Handle(GetUserSessionQuery request, CancellationToken cancellationToken)
    {
        var user = await _userRepository.GetByIdAsync(request.UserId)
            ?? throw new KeyNotFoundException("User not found.");

        var templates = (await _templateRepository.GetAllAsync(null, null)).ToList();
        var categories = (await _categoryRepository.GetAllActiveAsync()).ToList();

        var categoryStats = categories.Select(c => new CategoryStat
        {
            CategoryId = c.CategoryId,
            Name = c.Name,
            FreeCount = templates.Count(t => t.CategoryId == c.CategoryId && !t.IsPaid),
            PaidCount = templates.Count(t => t.CategoryId == c.CategoryId && t.IsPaid),
            Total = templates.Count(t => t.CategoryId == c.CategoryId)
        }).ToList();

        return new UserSessionDto
        {
            UserId = user.Id,
            Username = user.Username,
            Email = user.Email,
            Role = user.Role,
            IsActive = user.IsActive,
            CreatedAt = user.CreatedAt,
            LastLoginAt = user.LastLoginAt,
            Templates = new TemplateStats
            {
                Free = templates.Count(t => !t.IsPaid),
                Paid = templates.Count(t => t.IsPaid),
                Total = templates.Count
            },
            Categories = categoryStats
        };
    }
}
