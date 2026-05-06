using Riva.Domain.Entity;

namespace Riva.Service.Repository;

public interface ITemplateRepository
{
    Task<int> AddTemplateAsync(Template template);
    Task<Template?> GetByIdAsync(int templateId);
    Task<IEnumerable<Template>> GetAllAsync(int? categoryId, bool? isPaid);
}
