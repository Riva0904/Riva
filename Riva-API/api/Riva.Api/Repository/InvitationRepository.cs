using System.Data.SqlClient;
using Riva.Api.Data;
using Riva.Domain.Entity;
using Riva.Service.Repository;

namespace Riva.Api.Repository;

public class InvitationRepository : IInvitationRepository
{
    private readonly DatabaseConnection _db;
    public InvitationRepository(DatabaseConnection db) => _db = db;

    // ── Create ────────────────────────────────────────────────────────────────

    public async Task<int> CreateAsync(InvitationInstance inv)
    {
        const string sql = """
            INSERT INTO InvitationInstances
                (UserId, TemplateId, Title, Slug, FieldValuesJson, Status, IsPublic,
                 SeoTitle, SeoDescription, CreatedAt)
            OUTPUT INSERTED.InvitationId
            VALUES (@UserId, @TemplateId, @Title, @Slug, @FieldValuesJson, @Status, @IsPublic,
                    @SeoTitle, @SeoDescription, @CreatedAt)
            """;

        await using var conn = await _db.GetOpenConnectionAsync();
        await using var cmd  = new SqlCommand(sql, conn);
        cmd.Parameters.AddWithValue("@UserId",          inv.UserId);
        cmd.Parameters.AddWithValue("@TemplateId",      inv.TemplateId);
        cmd.Parameters.AddWithValue("@Title",           inv.Title);
        cmd.Parameters.AddWithValue("@Slug",            inv.Slug);
        cmd.Parameters.AddWithValue("@FieldValuesJson", inv.FieldValuesJson);
        cmd.Parameters.AddWithValue("@Status",          inv.Status);
        cmd.Parameters.AddWithValue("@IsPublic",        inv.IsPublic);
        cmd.Parameters.AddWithValue("@SeoTitle",        (object?)inv.SeoTitle ?? DBNull.Value);
        cmd.Parameters.AddWithValue("@SeoDescription",  (object?)inv.SeoDescription ?? DBNull.Value);
        cmd.Parameters.AddWithValue("@CreatedAt",       inv.CreatedAt);

        return (int)await cmd.ExecuteScalarAsync();
    }

    // ── Update ────────────────────────────────────────────────────────────────

    public async Task UpdateAsync(InvitationInstance inv)
    {
        const string sql = """
            UPDATE InvitationInstances SET
                Title           = @Title,
                FieldValuesJson = @FieldValuesJson,
                Status          = @Status,
                IsPublic        = @IsPublic,
                SeoTitle        = @SeoTitle,
                SeoDescription  = @SeoDescription,
                ExpiresAt       = @ExpiresAt,
                PublishedAt     = @PublishedAt,
                UpdatedAt       = @UpdatedAt
            WHERE InvitationId = @InvitationId
            """;

        await using var conn = await _db.GetOpenConnectionAsync();
        await using var cmd  = new SqlCommand(sql, conn);
        cmd.Parameters.AddWithValue("@InvitationId",    inv.InvitationId);
        cmd.Parameters.AddWithValue("@Title",           inv.Title);
        cmd.Parameters.AddWithValue("@FieldValuesJson", inv.FieldValuesJson);
        cmd.Parameters.AddWithValue("@Status",          inv.Status);
        cmd.Parameters.AddWithValue("@IsPublic",        inv.IsPublic);
        cmd.Parameters.AddWithValue("@SeoTitle",        (object?)inv.SeoTitle        ?? DBNull.Value);
        cmd.Parameters.AddWithValue("@SeoDescription",  (object?)inv.SeoDescription  ?? DBNull.Value);
        cmd.Parameters.AddWithValue("@ExpiresAt",       (object?)inv.ExpiresAt        ?? DBNull.Value);
        cmd.Parameters.AddWithValue("@PublishedAt",     (object?)inv.PublishedAt      ?? DBNull.Value);
        cmd.Parameters.AddWithValue("@UpdatedAt",       (object?)inv.UpdatedAt        ?? DBNull.Value);
        await cmd.ExecuteNonQueryAsync();
    }

    // ── Reads ─────────────────────────────────────────────────────────────────

    public async Task<InvitationInstance?> GetByIdAsync(int invitationId)
    {
        const string sql = """
            SELECT i.InvitationId, i.UserId, i.TemplateId, i.Title, i.Slug,
                   i.FieldValuesJson, i.Status, i.IsPublic,
                   i.SeoTitle, i.SeoDescription, i.ExpiresAt,
                   i.PublishedAt, i.ViewCount, i.CreatedAt, i.UpdatedAt,
                   t.Name         AS TemplateName,
                   t.TemplateHtml, t.TemplateCss, t.TemplateJs,
                   t.SchemaJson,  t.ThumbnailUrl, t.Status AS TemplateStatus
            FROM InvitationInstances i
            INNER JOIN Templates t ON t.TemplateId = i.TemplateId
            WHERE i.InvitationId = @InvitationId
            """;

        await using var conn = await _db.GetOpenConnectionAsync();
        await using var cmd  = new SqlCommand(sql, conn);
        cmd.Parameters.AddWithValue("@InvitationId", invitationId);
        await using var r = await cmd.ExecuteReaderAsync();
        if (!await r.ReadAsync()) return null;

        var inv = MapInvitation(r);
        await r.CloseAsync();
        inv.Media = await GetMediaAsync(invitationId);
        return inv;
    }

    public async Task<InvitationInstance?> GetBySlugAsync(string slug)
    {
        const string sql = """
            SELECT i.InvitationId, i.UserId, i.TemplateId, i.Title, i.Slug,
                   i.FieldValuesJson, i.Status, i.IsPublic,
                   i.SeoTitle, i.SeoDescription, i.ExpiresAt,
                   i.PublishedAt, i.ViewCount, i.CreatedAt, i.UpdatedAt,
                   t.Name         AS TemplateName,
                   t.TemplateHtml, t.TemplateCss, t.TemplateJs,
                   t.SchemaJson,  t.ThumbnailUrl, t.Status AS TemplateStatus
            FROM InvitationInstances i
            INNER JOIN Templates t ON t.TemplateId = i.TemplateId
            WHERE i.Slug = @Slug
            """;

        await using var conn = await _db.GetOpenConnectionAsync();
        await using var cmd  = new SqlCommand(sql, conn);
        cmd.Parameters.AddWithValue("@Slug", slug);
        await using var r = await cmd.ExecuteReaderAsync();
        if (!await r.ReadAsync()) return null;

        var inv = MapInvitation(r);
        await r.CloseAsync();
        inv.Media = await GetMediaAsync(inv.InvitationId);
        return inv;
    }

    public async Task<List<InvitationInstance>> GetByUserIdAsync(int userId)
    {
        const string sql = """
            SELECT i.InvitationId, i.UserId, i.TemplateId, i.Title, i.Slug,
                   i.FieldValuesJson, i.Status, i.IsPublic,
                   i.SeoTitle, i.SeoDescription, i.ExpiresAt,
                   i.PublishedAt, i.ViewCount, i.CreatedAt, i.UpdatedAt,
                   t.Name AS TemplateName,
                   t.TemplateHtml, t.TemplateCss, t.TemplateJs,
                   t.SchemaJson, t.ThumbnailUrl, t.Status AS TemplateStatus
            FROM InvitationInstances i
            INNER JOIN Templates t ON t.TemplateId = i.TemplateId
            WHERE i.UserId = @UserId
            ORDER BY i.CreatedAt DESC
            """;

        await using var conn = await _db.GetOpenConnectionAsync();
        await using var cmd  = new SqlCommand(sql, conn);
        cmd.Parameters.AddWithValue("@UserId", userId);
        await using var r = await cmd.ExecuteReaderAsync();

        var list = new List<InvitationInstance>();
        while (await r.ReadAsync()) list.Add(MapInvitation(r));
        return list;
    }

    public async Task<bool> SlugExistsAsync(string slug)
    {
        const string sql = "SELECT COUNT(1) FROM InvitationInstances WHERE Slug = @Slug";
        await using var conn = await _db.GetOpenConnectionAsync();
        await using var cmd  = new SqlCommand(sql, conn);
        cmd.Parameters.AddWithValue("@Slug", slug);
        return (int)await cmd.ExecuteScalarAsync() > 0;
    }

    public async Task IncrementViewCountAsync(int invitationId)
    {
        const string sql = "UPDATE InvitationInstances SET ViewCount = ViewCount + 1 WHERE InvitationId = @Id";
        await using var conn = await _db.GetOpenConnectionAsync();
        await using var cmd  = new SqlCommand(sql, conn);
        cmd.Parameters.AddWithValue("@Id", invitationId);
        await cmd.ExecuteNonQueryAsync();
    }

    // ── Media ─────────────────────────────────────────────────────────────────

    public async Task AddMediaAsync(InvitationMedia media)
    {
        const string sql = """
            INSERT INTO InvitationMedia
                (InvitationId, FieldName, OriginalName, StoredName, FileUrl, MediaType, MimeType, FileSizeBytes, UploadedAt)
            VALUES
                (@InvitationId, @FieldName, @OriginalName, @StoredName, @FileUrl, @MediaType, @MimeType, @FileSizeBytes, @UploadedAt)
            """;

        await using var conn = await _db.GetOpenConnectionAsync();
        await using var cmd  = new SqlCommand(sql, conn);
        cmd.Parameters.AddWithValue("@InvitationId",  media.InvitationId);
        cmd.Parameters.AddWithValue("@FieldName",     media.FieldName);
        cmd.Parameters.AddWithValue("@OriginalName",  media.OriginalName);
        cmd.Parameters.AddWithValue("@StoredName",    media.StoredName);
        cmd.Parameters.AddWithValue("@FileUrl",       media.FileUrl);
        cmd.Parameters.AddWithValue("@MediaType",     media.MediaType);
        cmd.Parameters.AddWithValue("@MimeType",      media.MimeType);
        cmd.Parameters.AddWithValue("@FileSizeBytes", media.FileSizeBytes);
        cmd.Parameters.AddWithValue("@UploadedAt",    media.UploadedAt);
        await cmd.ExecuteNonQueryAsync();
    }

    public async Task<List<InvitationMedia>> GetMediaAsync(int invitationId)
    {
        const string sql = """
            SELECT MediaId, InvitationId, FieldName, OriginalName, StoredName,
                   FileUrl, MediaType, MimeType, FileSizeBytes, UploadedAt
            FROM InvitationMedia
            WHERE InvitationId = @InvitationId
            ORDER BY UploadedAt DESC
            """;

        await using var conn = await _db.GetOpenConnectionAsync();
        await using var cmd  = new SqlCommand(sql, conn);
        cmd.Parameters.AddWithValue("@InvitationId", invitationId);
        await using var r = await cmd.ExecuteReaderAsync();

        var list = new List<InvitationMedia>();
        while (await r.ReadAsync())
        {
            list.Add(new InvitationMedia
            {
                MediaId       = r.GetInt32(r.GetOrdinal("MediaId")),
                InvitationId  = r.GetInt32(r.GetOrdinal("InvitationId")),
                FieldName     = r.GetString(r.GetOrdinal("FieldName")),
                OriginalName  = r.GetString(r.GetOrdinal("OriginalName")),
                StoredName    = r.GetString(r.GetOrdinal("StoredName")),
                FileUrl       = r.GetString(r.GetOrdinal("FileUrl")),
                MediaType     = r.GetString(r.GetOrdinal("MediaType")),
                MimeType      = r.GetString(r.GetOrdinal("MimeType")),
                FileSizeBytes = r.GetInt64(r.GetOrdinal("FileSizeBytes")),
                UploadedAt    = r.GetDateTime(r.GetOrdinal("UploadedAt"))
            });
        }
        return list;
    }

    public async Task DeleteMediaAsync(int mediaId)
    {
        const string sql = "DELETE FROM InvitationMedia WHERE MediaId = @MediaId";
        await using var conn = await _db.GetOpenConnectionAsync();
        await using var cmd  = new SqlCommand(sql, conn);
        cmd.Parameters.AddWithValue("@MediaId", mediaId);
        await cmd.ExecuteNonQueryAsync();
    }

    // ── Mapper ────────────────────────────────────────────────────────────────

    private static InvitationInstance MapInvitation(SqlDataReader r)
    {
        var inv = new InvitationInstance
        {
            InvitationId    = r.GetInt32(r.GetOrdinal("InvitationId")),
            UserId          = r.GetInt32(r.GetOrdinal("UserId")),
            TemplateId      = r.GetInt32(r.GetOrdinal("TemplateId")),
            Title           = r.GetString(r.GetOrdinal("Title")),
            Slug            = r.GetString(r.GetOrdinal("Slug")),
            FieldValuesJson = r.GetString(r.GetOrdinal("FieldValuesJson")),
            Status          = r.GetString(r.GetOrdinal("Status")),
            IsPublic        = r.GetBoolean(r.GetOrdinal("IsPublic")),
            ViewCount       = r.GetInt32(r.GetOrdinal("ViewCount")),
            CreatedAt       = r.GetDateTime(r.GetOrdinal("CreatedAt")),
            SeoTitle        = r.IsDBNull(r.GetOrdinal("SeoTitle"))        ? null : r.GetString(r.GetOrdinal("SeoTitle")),
            SeoDescription  = r.IsDBNull(r.GetOrdinal("SeoDescription"))  ? null : r.GetString(r.GetOrdinal("SeoDescription")),
            ExpiresAt       = r.IsDBNull(r.GetOrdinal("ExpiresAt"))       ? null : r.GetDateTime(r.GetOrdinal("ExpiresAt")),
            PublishedAt     = r.IsDBNull(r.GetOrdinal("PublishedAt"))     ? null : r.GetDateTime(r.GetOrdinal("PublishedAt")),
            UpdatedAt       = r.IsDBNull(r.GetOrdinal("UpdatedAt"))       ? null : r.GetDateTime(r.GetOrdinal("UpdatedAt")),
        };

        // Populate embedded template data
        inv.Template = new Template
        {
            TemplateId   = inv.TemplateId,
            Name         = r.GetString(r.GetOrdinal("TemplateName")),
            TemplateHtml = r.GetString(r.GetOrdinal("TemplateHtml")),
            TemplateCss  = r.IsDBNull(r.GetOrdinal("TemplateCss")) ? null : r.GetString(r.GetOrdinal("TemplateCss")),
            TemplateJs   = r.IsDBNull(r.GetOrdinal("TemplateJs"))  ? null : r.GetString(r.GetOrdinal("TemplateJs")),
            SchemaJson   = r.GetString(r.GetOrdinal("SchemaJson")),
            ThumbnailUrl = r.IsDBNull(r.GetOrdinal("ThumbnailUrl")) ? null : r.GetString(r.GetOrdinal("ThumbnailUrl")),
            Status       = r.GetString(r.GetOrdinal("TemplateStatus"))
        };

        return inv;
    }
}
