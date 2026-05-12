using Riva.Domain.Entity;

namespace Riva.Service.Repository;

public interface ITemplateRepository
{
    Task<int> AddTemplateAsync(Template template);
    Task<Template?> GetByIdAsync(int templateId);

    /// <summary>Returns Published templates for the user gallery.</summary>
    Task<IEnumerable<Template>> GetAllAsync(int? categoryId, bool? isPaid, string? tierType = null);

    /// <summary>Returns ALL templates (any status) for the admin dashboard.</summary>
    Task<IEnumerable<Template>> GetAllAdminAsync(int? categoryId, bool? isPaid);

    Task UpdateStatusAsync(int templateId, string status);
    Task UpdateTemplateAsync(int templateId, string name, int categoryId, bool isPaid, decimal? price,
        string templateHtml, string? templateCss, string? templateJs, string schemaJson,
        string? previewImageUrl, string? thumbnailUrl, string? description, string tierType = "Free");
}
