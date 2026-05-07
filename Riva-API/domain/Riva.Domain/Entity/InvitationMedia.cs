namespace Riva.Domain.Entity;

public class InvitationMedia
{
    public int MediaId { get; set; }
    public int InvitationId { get; set; }

    /// <summary>The SchemaJson field name this asset belongs to (e.g. "bannerImage").</summary>
    public string FieldName { get; set; } = string.Empty;

    public string OriginalName { get; set; } = string.Empty;
    public string StoredName { get; set; } = string.Empty;  // GUID-based filename
    public string FileUrl { get; set; } = string.Empty;     // Publicly accessible URL

    /// <summary>image | video | audio | document</summary>
    public string MediaType { get; set; } = "image";
    public string MimeType { get; set; } = string.Empty;
    public long FileSizeBytes { get; set; }
    public DateTime UploadedAt { get; set; } = DateTime.UtcNow;
}
