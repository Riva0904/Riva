using MediatR;
using Riva.Service.Command.Template;
using Riva.Dto.Template;
using Riva.Service.Repository;
using Riva.Domain.Entity;

namespace Riva.Service.CommandHandler.Template;

public class SubmitTemplateCommandHandler : IRequestHandler<SubmitTemplateCommand, TemplateResponseDto>
{
    private readonly ITemplateRepository _templateRepository;

    public SubmitTemplateCommandHandler(ITemplateRepository templateRepository)
    {
        _templateRepository = templateRepository;
    }

    public async Task<TemplateResponseDto> Handle(SubmitTemplateCommand request, CancellationToken cancellationToken)
    {
        var template = new Riva.Domain.Entity.Template
        {
            TemplateId = request.Request.TemplateId,
            Title = request.Request.Title,
            RecipientName = request.Request.RecipientName,
            Greeting = request.Request.Greeting,
            Location = request.Request.Location,
            EventDate = DateTime.TryParse(request.Request.EventDate, out var eventDate) ? eventDate : null,
            PersonalMessage = request.Request.PersonalMessage,
            IncludeGoogleMaps = request.Request.IncludeGoogleMaps,
            UserId = request.UserId
        };

        var id = await _templateRepository.CreateTemplateAsync(template);

        var previewHtml = BuildPreviewHtml(request.Request);

        return new TemplateResponseDto
        {
            TemplateId = request.Request.TemplateId,
            PreviewHtml = previewHtml,
            Message = $"Template successfully saved with ID {id}. You can now preview or copy the design."
        };
    }

    private static string BuildPreviewHtml(TemplateRequestDto request)
    {
        var mapSection = request.IncludeGoogleMaps
            ? $"<p><strong>Map:</strong> Location preview will show a Google Maps embed for {request.Location}.</p>"
            : string.Empty;

        return $@"
<div style='font-family: system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif; line-height:1.6; color:#111;'>
  <h1 style='margin-bottom:0.5rem;'>{request.Title}</h1>
  <p style='margin:0.5rem 0; font-size:1.1rem;'>{request.Greeting}, {request.RecipientName}!</p>
  <p style='margin:0.5rem 0;'>&quot;{request.PersonalMessage}&quot;</p>
  <p style='margin:0.5rem 0;'><strong>When:</strong> {request.EventDate}</p>
  <p style='margin:0.5rem 0;'><strong>Where:</strong> {request.Location}</p>
  {mapSection}
</div>";
    }
}