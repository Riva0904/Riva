using MediatR;
using Riva.Domain.Entity;
using Riva.Dto.Invitation;
using Riva.Service.Command.Invitation;
using Riva.Service.Interfaces;
using Riva.Service.Repository;

namespace Riva.Service.CommandHandler.Invitation;

public class CreateInvitationCommandHandler
    : IRequestHandler<CreateInvitationCommand, CreateInvitationResponse>
{
    private readonly IInvitationRepository _invitations;
    private readonly ITemplateRepository _templates;
    private readonly ISlugGeneratorService _slug;

    public CreateInvitationCommandHandler(
        IInvitationRepository invitations,
        ITemplateRepository templates,
        ISlugGeneratorService slug)
    {
        _invitations = invitations;
        _templates   = templates;
        _slug        = slug;
    }

    public async Task<CreateInvitationResponse> Handle(
        CreateInvitationCommand request, CancellationToken cancellationToken)
    {
        var template = await _templates.GetByIdAsync(request.TemplateId)
            ?? throw new KeyNotFoundException($"Template {request.TemplateId} not found.");

        if (template.Status != "Published")
            throw new InvalidOperationException("Only published templates can be used.");

        if (string.IsNullOrWhiteSpace(request.Title))
            throw new ArgumentException("Invitation title is required.");

        // Generate a unique slug based on the invitation title
        string slug = _slug.Generate(request.Title);
        while (await _invitations.SlugExistsAsync(slug))
            slug = _slug.Generate(request.Title);

        var invitation = new InvitationInstance
        {
            UserId          = request.UserId,
            TemplateId      = request.TemplateId,
            Title           = request.Title.Trim(),
            Slug            = slug,
            FieldValuesJson = string.IsNullOrWhiteSpace(request.FieldValuesJson) ? "{}" : request.FieldValuesJson,
            SeoTitle        = request.SeoTitle,
            SeoDescription  = request.SeoDescription,
            Status          = "Draft",
            CreatedAt       = DateTime.UtcNow
        };

        int id = await _invitations.CreateAsync(invitation);
        return new CreateInvitationResponse
        {
            InvitationId = id,
            Slug         = slug,
            Message      = "Invitation created successfully."
        };
    }
}
