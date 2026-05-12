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

        var tier   = request.TierType is "Free" or "Premium" or "Pro" ? request.TierType : "Free";
        var isPaid = tier != "Free";

        if (isPaid && (request.Price == null || request.Price <= 0))
            throw new InvalidOperationException("A Premium or Pro template must have a price greater than zero.");

        var template = new Riva.Domain.Entity.Template
        {
            Name           = request.Name,
            Description    = request.Description,
            CategoryId     = request.CategoryId,
            TierType       = tier,
            IsPaid         = isPaid,
            Price          = isPaid ? request.Price : null,
            TemplateHtml   = request.TemplateHtml,
            TemplateCss    = request.TemplateCss,
            TemplateJs     = request.TemplateJs,
            SchemaJson     = request.SchemaJson,
            PreviewImageUrl = request.PreviewImageUrl,
            ThumbnailUrl   = request.ThumbnailUrl,
            Status         = "Published",   // Admin-created templates are immediately live
            Version        = 1,
            Tags           = request.Tags,
            CreatedBy      = request.CreatedBy,
            CreatedDate    = DateTime.UtcNow
        };

        var id = await _templateRepository.AddTemplateAsync(template);

        return new AddTemplateResponse
        {
            TemplateId = id,
            Message = $"Template '{request.Name}' added successfully."
        };
    }
}
