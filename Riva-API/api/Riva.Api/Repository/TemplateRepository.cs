using System.Data;
using System.Data.SqlClient;
using Riva.Api.Data;
using Riva.Domain.Entity;
using Riva.Service.Repository;

namespace Riva.Api.Repository;

public class TemplateRepository : ITemplateRepository
{
    private readonly DatabaseConnection _db;

    public TemplateRepository(DatabaseConnection db)
    {
        _db = db;
    }

    public async Task<int> AddTemplateAsync(Template t)
    {
        const string sql = @"
            INSERT INTO Templates
                (Name, CategoryId, IsPaid, Price, TemplateHtml, TemplateCss, TemplateJs, SchemaJson, PreviewImageUrl, CreatedBy, CreatedDate)
            OUTPUT INSERTED.TemplateId
            VALUES
                (@Name, @CategoryId, @IsPaid, @Price, @TemplateHtml, @TemplateCss, @TemplateJs, @SchemaJson, @PreviewImageUrl, @CreatedBy, @CreatedDate)";

        using var conn = await _db.GetOpenConnectionAsync();
        using var cmd = new SqlCommand(sql, conn);
        cmd.Parameters.AddWithValue("@Name", t.Name);
        cmd.Parameters.AddWithValue("@CategoryId", t.CategoryId);
        cmd.Parameters.AddWithValue("@IsPaid", t.IsPaid);
        cmd.Parameters.AddWithValue("@Price", (object?)t.Price ?? DBNull.Value);
        cmd.Parameters.AddWithValue("@TemplateHtml", t.TemplateHtml);
        cmd.Parameters.AddWithValue("@TemplateCss", (object?)t.TemplateCss ?? DBNull.Value);
        cmd.Parameters.AddWithValue("@TemplateJs", (object?)t.TemplateJs ?? DBNull.Value);
        cmd.Parameters.AddWithValue("@SchemaJson", t.SchemaJson);
        cmd.Parameters.AddWithValue("@PreviewImageUrl", (object?)t.PreviewImageUrl ?? DBNull.Value);
        cmd.Parameters.AddWithValue("@CreatedBy", t.CreatedBy);
        cmd.Parameters.AddWithValue("@CreatedDate", t.CreatedDate);

        var result = await cmd.ExecuteScalarAsync();
        return Convert.ToInt32(result);
    }

    public async Task<Template?> GetByIdAsync(int templateId)
    {
        const string sql = @"
            SELECT t.*, c.Name AS CategoryName
            FROM Templates t
            LEFT JOIN Categories c ON c.CategoryId = t.CategoryId
            WHERE t.TemplateId = @TemplateId";

        using var conn = await _db.GetOpenConnectionAsync();
        using var cmd = new SqlCommand(sql, conn);
        cmd.Parameters.AddWithValue("@TemplateId", templateId);
        using var reader = await cmd.ExecuteReaderAsync();

        if (await reader.ReadAsync())
            return Map(reader);

        return null;
    }

    public async Task<IEnumerable<Template>> GetAllAsync(int? categoryId, bool? isPaid)
    {
        var sql = @"
            SELECT t.TemplateId, t.Name, t.CategoryId, t.IsPaid, t.Price,
                   t.SchemaJson, t.PreviewImageUrl, t.CreatedBy, t.CreatedDate,
                   c.Name AS CategoryName
            FROM Templates t
            LEFT JOIN Categories c ON c.CategoryId = t.CategoryId
            WHERE 1=1";

        if (categoryId.HasValue) sql += " AND t.CategoryId = @CategoryId";
        if (isPaid.HasValue) sql += " AND t.IsPaid = @IsPaid";
        sql += " ORDER BY t.CreatedDate DESC";

        using var conn = await _db.GetOpenConnectionAsync();
        using var cmd = new SqlCommand(sql, conn);
        if (categoryId.HasValue) cmd.Parameters.AddWithValue("@CategoryId", categoryId.Value);
        if (isPaid.HasValue) cmd.Parameters.AddWithValue("@IsPaid", isPaid.Value);

        using var reader = await cmd.ExecuteReaderAsync();
        var list = new List<Template>();
        while (await reader.ReadAsync())
        {
            list.Add(new Template
            {
                TemplateId = reader.GetInt32(reader.GetOrdinal("TemplateId")),
                Name = reader.GetString(reader.GetOrdinal("Name")),
                CategoryId = reader.GetInt32(reader.GetOrdinal("CategoryId")),
                IsPaid = reader.GetBoolean(reader.GetOrdinal("IsPaid")),
                Price = reader.IsDBNull(reader.GetOrdinal("Price")) ? null : reader.GetDecimal(reader.GetOrdinal("Price")),
                SchemaJson = reader.GetString(reader.GetOrdinal("SchemaJson")),
                PreviewImageUrl = reader.IsDBNull(reader.GetOrdinal("PreviewImageUrl")) ? null : reader.GetString(reader.GetOrdinal("PreviewImageUrl")),
                CreatedBy = reader.GetInt32(reader.GetOrdinal("CreatedBy")),
                CreatedDate = reader.GetDateTime(reader.GetOrdinal("CreatedDate")),
                CategoryName = reader.IsDBNull(reader.GetOrdinal("CategoryName")) ? null : reader.GetString(reader.GetOrdinal("CategoryName"))
            });
        }
        return list;
    }

    private static Template Map(SqlDataReader r) => new()
    {
        TemplateId = r.GetInt32(r.GetOrdinal("TemplateId")),
        Name = r.GetString(r.GetOrdinal("Name")),
        CategoryId = r.GetInt32(r.GetOrdinal("CategoryId")),
        IsPaid = r.GetBoolean(r.GetOrdinal("IsPaid")),
        Price = r.IsDBNull(r.GetOrdinal("Price")) ? null : r.GetDecimal(r.GetOrdinal("Price")),
        TemplateHtml = r.GetString(r.GetOrdinal("TemplateHtml")),
        TemplateCss = r.IsDBNull(r.GetOrdinal("TemplateCss")) ? null : r.GetString(r.GetOrdinal("TemplateCss")),
        TemplateJs = r.IsDBNull(r.GetOrdinal("TemplateJs")) ? null : r.GetString(r.GetOrdinal("TemplateJs")),
        SchemaJson = r.GetString(r.GetOrdinal("SchemaJson")),
        PreviewImageUrl = r.IsDBNull(r.GetOrdinal("PreviewImageUrl")) ? null : r.GetString(r.GetOrdinal("PreviewImageUrl")),
        CreatedBy = r.GetInt32(r.GetOrdinal("CreatedBy")),
        CreatedDate = r.GetDateTime(r.GetOrdinal("CreatedDate")),
        CategoryName = r.IsDBNull(r.GetOrdinal("CategoryName")) ? null : r.GetString(r.GetOrdinal("CategoryName"))
    };
}
