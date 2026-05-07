namespace Riva.Dto.Invitation;

// ── Request DTOs ──────────────────────────────────────────────────────────────

public class CreateInvitationRequest
{
    public int TemplateId { get; set; }
    public string Title { get; set; } = string.Empty;
    /// <summary>JSON object matching the template SchemaJson fields.</summary>
    public string FieldValuesJson { get; set; } = "{}";
    public string? SeoTitle { get; set; }
    public string? SeoDescription { get; set; }
}

public class UpdateInvitationRequest
{
    public string Title { get; set; } = string.Empty;
    public string FieldValuesJson { get; set; } = "{}";
    public string? SeoTitle { get; set; }
    public string? SeoDescription { get; set; }
}

public class PublishInvitationRequest
{
    public DateTime? ExpiresAt { get; set; }
    public bool IsPublic { get; set; } = true;
}

// ── Response DTOs ─────────────────────────────────────────────────────────────

public class InvitationSummaryDto
{
    public int InvitationId { get; set; }
    public int TemplateId { get; set; }
    public string TemplateName { get; set; } = string.Empty;
    public string? ThumbnailUrl { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Slug { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public bool IsPublic { get; set; }
    public DateTime? PublishedAt { get; set; }
    public DateTime CreatedAt { get; set; }
    public int ViewCount { get; set; }
    public string PublicUrl => $"/invite/{Slug}";
}

public class InvitationDetailDto : InvitationSummaryDto
{
    public string FieldValuesJson { get; set; } = "{}";
    public string? SeoTitle { get; set; }
    public string? SeoDescription { get; set; }
    public DateTime? ExpiresAt { get; set; }

    // Full template content needed for the live-preview editor
    public string TemplateHtml { get; set; } = string.Empty;
    public string? TemplateCss { get; set; }
    public string? TemplateJs { get; set; }
    public string SchemaJson { get; set; } = "[]";

    public List<InvitationMediaDto> Media { get; set; } = new();
}

public class InvitationMediaDto
{
    public int MediaId { get; set; }
    public string FieldName { get; set; } = string.Empty;
    public string OriginalName { get; set; } = string.Empty;
    public string FileUrl { get; set; } = string.Empty;
    public string MediaType { get; set; } = string.Empty;
    public long FileSizeBytes { get; set; }
    public DateTime UploadedAt { get; set; }
}

public class CreateInvitationResponse
{
    public int InvitationId { get; set; }
    public string Slug { get; set; } = string.Empty;
    public string Message { get; set; } = string.Empty;
}

public class PublishInvitationResponse
{
    public string Slug { get; set; } = string.Empty;
    public string PublicUrl { get; set; } = string.Empty;
    public string Message { get; set; } = string.Empty;
}

public class UploadMediaResponse
{
    public int MediaId { get; set; }
    public string FileUrl { get; set; } = string.Empty;
    public string FieldName { get; set; } = string.Empty;
    public string Message { get; set; } = string.Empty;
}
