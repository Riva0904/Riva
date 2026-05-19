using System.Data.SqlClient;
using Riva.Api.Data;
using Riva.Domain.Entity;
using Riva.Service.Repository;

namespace Riva.Api.Repository;

public class TemplateRepository : ITemplateRepository
{
    private readonly DatabaseConnection _db;
    public TemplateRepository(DatabaseConnection db) => _db = db;

    public async Task<int> AddTemplateAsync(Template t)
    {
        const string sql = @"
            INSERT INTO Templates
                (Name, CategoryId, IsPaid, Price, TierType, TemplateHtml, TemplateCss, TemplateJs,
                 SchemaJson, PreviewImageUrl, ThumbnailUrl, Description, Status, Version,
                 CreatedBy, CreatedDate)
            OUTPUT INSERTED.TemplateId
            VALUES
                (@Name, @CategoryId, @IsPaid, @Price, @TierType, @TemplateHtml, @TemplateCss, @TemplateJs,
                 @SchemaJson, @PreviewImageUrl, @ThumbnailUrl, @Description, @Status, @Version,
                 @CreatedBy, @CreatedDate)";

        using var conn = await _db.GetOpenConnectionAsync();
        using var cmd  = new SqlCommand(sql, conn);
        cmd.Parameters.AddWithValue("@Name",           t.Name);
        cmd.Parameters.AddWithValue("@CategoryId",     t.CategoryId);
        cmd.Parameters.AddWithValue("@IsPaid",         t.IsPaid);
        cmd.Parameters.AddWithValue("@Price",          (object?)t.Price          ?? DBNull.Value);
        cmd.Parameters.AddWithValue("@TierType",       t.TierType);
        cmd.Parameters.AddWithValue("@TemplateHtml",   t.TemplateHtml);
        cmd.Parameters.AddWithValue("@TemplateCss",    (object?)t.TemplateCss    ?? DBNull.Value);
        cmd.Parameters.AddWithValue("@TemplateJs",     (object?)t.TemplateJs     ?? DBNull.Value);
        cmd.Parameters.AddWithValue("@SchemaJson",     t.SchemaJson);
        cmd.Parameters.AddWithValue("@PreviewImageUrl",(object?)t.PreviewImageUrl ?? DBNull.Value);
        cmd.Parameters.AddWithValue("@ThumbnailUrl",   (object?)t.ThumbnailUrl   ?? DBNull.Value);
        cmd.Parameters.AddWithValue("@Description",    (object?)t.Description    ?? DBNull.Value);
        cmd.Parameters.AddWithValue("@Status",         t.Status);
        cmd.Parameters.AddWithValue("@Version",        t.Version);
        cmd.Parameters.AddWithValue("@CreatedBy",      t.CreatedBy);
        cmd.Parameters.AddWithValue("@CreatedDate",    t.CreatedDate);

        return Convert.ToInt32(await cmd.ExecuteScalarAsync());
    }

    public async Task<Template?> GetByIdAsync(int templateId)
    {
        const string sql = @"
            SELECT t.TemplateId, t.Name, t.Description, t.CategoryId,
                   t.IsPaid, t.Price, t.TierType,
                   t.TemplateHtml, t.TemplateCss, t.TemplateJs, t.SchemaJson,
                   t.PreviewImageUrl, t.ThumbnailUrl,
                   t.Status, t.Version, t.CreatedBy, t.CreatedDate, t.UpdatedDate,
                   c.Name AS CategoryName
            FROM Templates t
            LEFT JOIN Categories c ON c.CategoryId = t.CategoryId
            WHERE t.TemplateId = @TemplateId";

        using var conn = await _db.GetOpenConnectionAsync();
        using var cmd  = new SqlCommand(sql, conn);
        cmd.Parameters.AddWithValue("@TemplateId", templateId);
        using var r = await cmd.ExecuteReaderAsync();
        return await r.ReadAsync() ? Map(r) : null;
    }

    public async Task<IEnumerable<Template>> GetAllAsync(int? categoryId, bool? isPaid, string? tierType = null)
    {
        var sql = @"
            SELECT t.TemplateId, t.Name, t.Description, t.CategoryId,
                   t.IsPaid, t.Price, t.TierType, t.SchemaJson,
                   t.PreviewImageUrl, t.ThumbnailUrl,
                   t.Status, t.Version, t.CreatedBy, t.CreatedDate,
                   c.Name AS CategoryName
            FROM Templates t
            LEFT JOIN Categories c ON c.CategoryId = t.CategoryId
            WHERE t.Status = 'Published'";

        if (categoryId.HasValue)                    sql += " AND t.CategoryId = @CategoryId";
        if (!string.IsNullOrEmpty(tierType))         sql += " AND t.TierType = @TierType";
        else if (isPaid.HasValue)                    sql += " AND t.IsPaid = @IsPaid";
        sql += " ORDER BY t.CreatedDate DESC";

        using var conn = await _db.GetOpenConnectionAsync();
        using var cmd  = new SqlCommand(sql, conn);
        if (categoryId.HasValue)               cmd.Parameters.AddWithValue("@CategoryId", categoryId.Value);
        if (!string.IsNullOrEmpty(tierType))    cmd.Parameters.AddWithValue("@TierType",   tierType);
        else if (isPaid.HasValue)               cmd.Parameters.AddWithValue("@IsPaid",     isPaid.Value);

        using var r = await cmd.ExecuteReaderAsync();
        var list = new List<Template>();
        while (await r.ReadAsync())
            list.Add(MapSummary(r));
        return list;
    }

    public async Task<IEnumerable<Template>> GetAllAdminAsync(int? categoryId, bool? isPaid)
    {
        var sql = @"
            SELECT t.TemplateId, t.Name, t.Description, t.CategoryId,
                   t.IsPaid, t.Price, t.TierType, t.SchemaJson,
                   t.PreviewImageUrl, t.ThumbnailUrl,
                   t.Status, t.Version, t.CreatedBy, t.CreatedDate,
                   c.Name AS CategoryName
            FROM Templates t
            LEFT JOIN Categories c ON c.CategoryId = t.CategoryId
            WHERE 1=1";

        if (categoryId.HasValue) sql += " AND t.CategoryId = @CategoryId";
        if (isPaid.HasValue)     sql += " AND t.IsPaid = @IsPaid";
        sql += " ORDER BY t.CreatedDate DESC";

        using var conn = await _db.GetOpenConnectionAsync();
        using var cmd  = new SqlCommand(sql, conn);
        if (categoryId.HasValue) cmd.Parameters.AddWithValue("@CategoryId", categoryId.Value);
        if (isPaid.HasValue)     cmd.Parameters.AddWithValue("@IsPaid",     isPaid.Value);

        using var r = await cmd.ExecuteReaderAsync();
        var list = new List<Template>();
        while (await r.ReadAsync()) list.Add(MapSummary(r));
        return list;
    }

    public async Task UpdateStatusAsync(int templateId, string status)
    {
        const string sql = @"
            UPDATE Templates SET Status = @Status, UpdatedDate = @UpdatedDate
            WHERE TemplateId = @TemplateId";
        using var conn = await _db.GetOpenConnectionAsync();
        using var cmd  = new SqlCommand(sql, conn);
        cmd.Parameters.AddWithValue("@TemplateId",  templateId);
        cmd.Parameters.AddWithValue("@Status",      status);
        cmd.Parameters.AddWithValue("@UpdatedDate", DateTime.UtcNow);
        await cmd.ExecuteNonQueryAsync();
    }

    public async Task UpdateTemplateAsync(int templateId, string name, int categoryId, bool isPaid, decimal? price,
        string templateHtml, string? templateCss, string? templateJs, string schemaJson,
        string? previewImageUrl, string? thumbnailUrl, string? description, string tierType = "Free")
    {
        const string sql = @"
            UPDATE Templates SET
                Name = @Name, CategoryId = @CategoryId, IsPaid = @IsPaid, Price = @Price,
                TierType = @TierType,
                TemplateHtml = @TemplateHtml, TemplateCss = @TemplateCss, TemplateJs = @TemplateJs,
                SchemaJson = @SchemaJson, PreviewImageUrl = @PreviewImageUrl, ThumbnailUrl = @ThumbnailUrl,
                Description = @Description, UpdatedDate = @UpdatedDate
            WHERE TemplateId = @TemplateId";
        using var conn = await _db.GetOpenConnectionAsync();
        using var cmd  = new SqlCommand(sql, conn);
        cmd.Parameters.AddWithValue("@TemplateId",      templateId);
        cmd.Parameters.AddWithValue("@Name",            name);
        cmd.Parameters.AddWithValue("@CategoryId",      categoryId);
        cmd.Parameters.AddWithValue("@IsPaid",          isPaid);
        cmd.Parameters.AddWithValue("@Price",           (object?)price          ?? DBNull.Value);
        cmd.Parameters.AddWithValue("@TierType",        tierType);
        cmd.Parameters.AddWithValue("@TemplateHtml",    templateHtml);
        cmd.Parameters.AddWithValue("@TemplateCss",     (object?)templateCss    ?? DBNull.Value);
        cmd.Parameters.AddWithValue("@TemplateJs",      (object?)templateJs     ?? DBNull.Value);
        cmd.Parameters.AddWithValue("@SchemaJson",      schemaJson);
        cmd.Parameters.AddWithValue("@PreviewImageUrl", (object?)previewImageUrl ?? DBNull.Value);
        cmd.Parameters.AddWithValue("@ThumbnailUrl",    (object?)thumbnailUrl   ?? DBNull.Value);
        cmd.Parameters.AddWithValue("@Description",     (object?)description    ?? DBNull.Value);
        cmd.Parameters.AddWithValue("@UpdatedDate",     DateTime.UtcNow);
        await cmd.ExecuteNonQueryAsync();
    }

    public async Task UpdatePriceAsync(int templateId, decimal? price)
    {
        const string sql = @"
            UPDATE Templates SET Price = @Price, IsPaid = @IsPaid, UpdatedDate = @UpdatedDate
            WHERE TemplateId = @TemplateId";
        using var conn = await _db.GetOpenConnectionAsync();
        using var cmd  = new SqlCommand(sql, conn);
        cmd.Parameters.AddWithValue("@TemplateId",  templateId);
        cmd.Parameters.AddWithValue("@Price",       (object?)price ?? DBNull.Value);
        cmd.Parameters.AddWithValue("@IsPaid",      price.HasValue && price > 0);
        cmd.Parameters.AddWithValue("@UpdatedDate", DateTime.UtcNow);
        await cmd.ExecuteNonQueryAsync();
    }

    // ── Mappers ───────────────────────────────────────────────────────────────

    private static Template Map(SqlDataReader r) => new()
    {
        TemplateId      = r.GetInt32(r.GetOrdinal("TemplateId")),
        Name            = r.GetString(r.GetOrdinal("Name")),
        Description     = r.IsDBNull(r.GetOrdinal("Description"))     ? null : r.GetString(r.GetOrdinal("Description")),
        CategoryId      = r.GetInt32(r.GetOrdinal("CategoryId")),
        IsPaid          = r.GetBoolean(r.GetOrdinal("IsPaid")),
        Price           = r.IsDBNull(r.GetOrdinal("Price"))           ? null : r.GetDecimal(r.GetOrdinal("Price")),
        TierType        = r.IsDBNull(r.GetOrdinal("TierType"))        ? "Free" : r.GetString(r.GetOrdinal("TierType")),
        TemplateHtml    = r.GetString(r.GetOrdinal("TemplateHtml")),
        TemplateCss     = r.IsDBNull(r.GetOrdinal("TemplateCss"))     ? null : r.GetString(r.GetOrdinal("TemplateCss")),
        TemplateJs      = r.IsDBNull(r.GetOrdinal("TemplateJs"))      ? null : r.GetString(r.GetOrdinal("TemplateJs")),
        SchemaJson      = r.GetString(r.GetOrdinal("SchemaJson")),
        PreviewImageUrl = r.IsDBNull(r.GetOrdinal("PreviewImageUrl")) ? null : r.GetString(r.GetOrdinal("PreviewImageUrl")),
        ThumbnailUrl    = r.IsDBNull(r.GetOrdinal("ThumbnailUrl"))    ? null : r.GetString(r.GetOrdinal("ThumbnailUrl")),
        Status          = r.GetString(r.GetOrdinal("Status")),
        Version         = r.GetInt32(r.GetOrdinal("Version")),
        CreatedBy       = r.GetInt32(r.GetOrdinal("CreatedBy")),
        CreatedDate     = r.GetDateTime(r.GetOrdinal("CreatedDate")),
        UpdatedDate     = r.IsDBNull(r.GetOrdinal("UpdatedDate"))     ? null : r.GetDateTime(r.GetOrdinal("UpdatedDate")),
        CategoryName    = r.IsDBNull(r.GetOrdinal("CategoryName"))    ? null : r.GetString(r.GetOrdinal("CategoryName")),
    };

    // Summary mapper — used by GetAllAsync (no Html/Css/Js columns selected)
    private static Template MapSummary(SqlDataReader r) => new()
    {
        TemplateId      = r.GetInt32(r.GetOrdinal("TemplateId")),
        Name            = r.GetString(r.GetOrdinal("Name")),
        Description     = r.IsDBNull(r.GetOrdinal("Description"))     ? null : r.GetString(r.GetOrdinal("Description")),
        CategoryId      = r.GetInt32(r.GetOrdinal("CategoryId")),
        IsPaid          = r.GetBoolean(r.GetOrdinal("IsPaid")),
        Price           = r.IsDBNull(r.GetOrdinal("Price"))           ? null : r.GetDecimal(r.GetOrdinal("Price")),
        TierType        = r.IsDBNull(r.GetOrdinal("TierType"))        ? "Free" : r.GetString(r.GetOrdinal("TierType")),
        SchemaJson      = r.GetString(r.GetOrdinal("SchemaJson")),
        PreviewImageUrl = r.IsDBNull(r.GetOrdinal("PreviewImageUrl")) ? null : r.GetString(r.GetOrdinal("PreviewImageUrl")),
        ThumbnailUrl    = r.IsDBNull(r.GetOrdinal("ThumbnailUrl"))    ? null : r.GetString(r.GetOrdinal("ThumbnailUrl")),
        Status          = r.GetString(r.GetOrdinal("Status")),
        Version         = r.GetInt32(r.GetOrdinal("Version")),
        CreatedBy       = r.GetInt32(r.GetOrdinal("CreatedBy")),
        CreatedDate     = r.GetDateTime(r.GetOrdinal("CreatedDate")),
        CategoryName    = r.IsDBNull(r.GetOrdinal("CategoryName"))    ? null : r.GetString(r.GetOrdinal("CategoryName")),
    };
}
