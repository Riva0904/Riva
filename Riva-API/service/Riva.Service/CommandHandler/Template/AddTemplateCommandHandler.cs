using MediatR;
using Riva.Dto.Template;
using Riva.Service.Command.Template;
using Riva.Service.Repository;

namespace Riva.Service.CommandHandler.Template;

public class AddTemplateCommandHandler : IRequestHandler<AddTemplateCommand, AddTemplateResponse>
{
    private readonly ITemplateRepository _templateRepository;
    private readonly ICategoryRepository _categoryRepository;

    public AddTemplateCommandHandler(ITemplateRepository templateRepository, ICategoryRepository categoryRepository)
    {
        _templateRepository = templateRepository;
        _categoryRepository = categoryRepository;
    }

    public async Task<AddTemplateResponse> Handle(AddTemplateCommand request, CancellationToken cancellationToken)
    {
        var category = await _categoryRepository.GetByIdAsync(request.CategoryId)
            ?? throw new InvalidOperationException($"Category {request.CategoryId} not found.");

        if (request.IsPaid && (request.Price == null || request.Price <= 0))
            throw new InvalidOperationException("A paid template must have a price greater than zero.");

        var template = new Riva.Domain.Entity.Template
        {
            Name = request.Name,
            CategoryId = request.CategoryId,
            IsPaid = request.IsPaid,
            Price = request.IsPaid ? request.Price : null,
            TemplateHtml = request.TemplateHtml,
            TemplateCss = request.TemplateCss,
            TemplateJs = request.TemplateJs,
            SchemaJson = request.SchemaJson,
            PreviewImageUrl = request.PreviewImageUrl,
            CreatedBy = request.CreatedBy,
            CreatedDate = DateTime.UtcNow
        };

        var id = await _templateRepository.AddTemplateAsync(template);

        return new AddTemplateResponse
        {
            TemplateId = id,
            Message = $"Template '{request.Name}' added successfully."
        };
    }
}
