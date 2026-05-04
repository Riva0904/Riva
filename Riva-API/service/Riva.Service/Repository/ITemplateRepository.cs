using Riva.Domain.Entity;

namespace Riva.Service.Repository;

public interface ITemplateRepository
{
    Task<int> CreateTemplateAsync(Template template);
    Task<Template?> GetTemplateByIdAsync(int id);
    Task<IEnumerable<Template>> GetTemplatesByUserIdAsync(int userId);
    Task<IEnumerable<Template>> GetAllTemplatesAsync();
}