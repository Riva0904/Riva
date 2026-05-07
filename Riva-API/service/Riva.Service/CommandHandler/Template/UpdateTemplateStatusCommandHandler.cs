using MediatR;
using Riva.Service.Command.Template;
using Riva.Service.Repository;

namespace Riva.Service.CommandHandler.Template;

public class UpdateTemplateStatusCommandHandler : IRequestHandler<UpdateTemplateStatusCommand, Unit>
{
    private readonly ITemplateRepository _templates;
    public UpdateTemplateStatusCommandHandler(ITemplateRepository templates) => _templates = templates;

    public async Task<Unit> Handle(UpdateTemplateStatusCommand request, CancellationToken cancellationToken)
    {
        var template = await _templates.GetByIdAsync(request.TemplateId)
            ?? throw new KeyNotFoundException($"Template {request.TemplateId} not found.");

        var validStatuses = new[] { "Published", "Draft", "Archived" };
        if (!validStatuses.Contains(request.Status))
            throw new ArgumentException($"Invalid status '{request.Status}'.");

        template.Status      = request.Status;
        template.UpdatedDate = DateTime.UtcNow;
        await _templates.UpdateStatusAsync(template.TemplateId, request.Status);
        return Unit.Value;
    }
}
