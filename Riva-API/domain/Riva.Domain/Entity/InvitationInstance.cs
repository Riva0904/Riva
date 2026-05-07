namespace Riva.Domain.Entity;

public class InvitationInstance
{
    public int InvitationId { get; set; }
    public int UserId { get; set; }
    public int TemplateId { get; set; }

    public string Title { get; set; } = string.Empty;
    public string Slug { get; set; } = string.Empty;

    /// <summary>JSON map of field values: { "title": "...", "message": "..." }</summary>
    public string FieldValuesJson { get; set; } = "{}";

    public string Status { get; set; } = "Draft"; // Draft | Published

    public bool IsPublic { get; set; } = true;
    public string? SeoTitle { get; set; }
    public string? SeoDescription { get; set; }

    public DateTime? PublishedAt { get; set; }
    public DateTime? ExpiresAt { get; set; }
    public int ViewCount { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }

    // ── Navigation (populated by queries, not persisted separately) ──
    public Template? Template { get; set; }
    public List<InvitationMedia> Media { get; set; } = new();

    // ── Computed helpers ─────────────────────────────────────────────
    public bool IsPublished => Status == "Published";
    public bool IsExpired => ExpiresAt.HasValue && DateTime.UtcNow > ExpiresAt.Value;
}
