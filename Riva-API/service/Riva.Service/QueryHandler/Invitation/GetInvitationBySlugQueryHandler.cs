using MediatR;
using Riva.Dto.Invitation;
using Riva.Service.Query.Invitation;
using Riva.Service.Repository;

namespace Riva.Service.QueryHandler.Invitation;

public class GetInvitationBySlugQueryHandler
    : IRequestHandler<GetInvitationBySlugQuery, InvitationDetailDto>
{
    private readonly IInvitationRepository _invitations;

    public GetInvitationBySlugQueryHandler(IInvitationRepository invitations)
        => _invitations = invitations;

    public async Task<InvitationDetailDto> Handle(
        GetInvitationBySlugQuery request, CancellationToken cancellationToken)
    {
        var inv = await _invitations.GetBySlugAsync(request.Slug)
            ?? throw new KeyNotFoundException($"Invitation '{request.Slug}' not found.");

        if (inv.Status != "Published" || (!inv.IsPublic))
            throw new InvalidOperationException("This invitation is not publicly accessible.");

        if (inv.IsExpired)
            throw new InvalidOperationException("This invitation has expired.");

        // Increment view counter (fire-and-forget; never fails the request)
        _ = _invitations.IncrementViewCountAsync(inv.InvitationId);

        return MapToDetail(inv);
    }

    private static InvitationDetailDto MapToDetail(Domain.Entity.InvitationInstance inv) => new()
    {
        InvitationId    = inv.InvitationId,
        TemplateId      = inv.TemplateId,
        TemplateName    = inv.Template?.Name ?? string.Empty,
        ThumbnailUrl    = inv.Template?.ThumbnailUrl,
        Title           = inv.Title,
        Slug            = inv.Slug,
        Status          = inv.Status,
        IsPublic        = inv.IsPublic,
        PublishedAt     = inv.PublishedAt,
        CreatedAt       = inv.CreatedAt,
        ViewCount       = inv.ViewCount,
        FieldValuesJson = inv.FieldValuesJson,
        SeoTitle        = inv.SeoTitle,
        SeoDescription  = inv.SeoDescription,
        ExpiresAt       = inv.ExpiresAt,
        TemplateHtml    = inv.Template?.TemplateHtml ?? string.Empty,
        TemplateCss     = inv.Template?.TemplateCss,
        TemplateJs      = inv.Template?.TemplateJs,
        SchemaJson      = inv.Template?.SchemaJson ?? "[]",
        Media           = inv.Media.Select(m => new InvitationMediaDto
        {
            MediaId       = m.MediaId,
            FieldName     = m.FieldName,
            OriginalName  = m.OriginalName,
            FileUrl       = m.FileUrl,
            MediaType     = m.MediaType,
            FileSizeBytes = m.FileSizeBytes,
            UploadedAt    = m.UploadedAt
        }).ToList()
    };
}
