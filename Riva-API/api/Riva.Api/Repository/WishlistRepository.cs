using Riva.Api.Data;
using Riva.Service.Repository;
using System.Data.SqlClient;

namespace Riva.Api.Repository;

public class WishlistRepository : IWishlistRepository
{
    private readonly DatabaseConnection _db;
    public WishlistRepository(DatabaseConnection db) => _db = db;

    public async Task<List<int>> GetWishlistIdsAsync(int userId)
    {
        const string sql = "SELECT TemplateId FROM UserWishlists WHERE UserId = @UserId";
        using var conn = await _db.GetOpenConnectionAsync();
        using var cmd  = new SqlCommand(sql, conn);
        cmd.Parameters.AddWithValue("@UserId", userId);
        using var r = await cmd.ExecuteReaderAsync();
        var ids = new List<int>();
        while (await r.ReadAsync()) ids.Add(r.GetInt32(0));
        return ids;
    }

    public async Task<bool> ToggleAsync(int userId, int templateId)
    {
        using var conn = await _db.GetOpenConnectionAsync();

        const string check = "SELECT COUNT(1) FROM UserWishlists WHERE UserId=@UserId AND TemplateId=@TplId";
        using var checkCmd = new SqlCommand(check, conn);
        checkCmd.Parameters.AddWithValue("@UserId", userId);
        checkCmd.Parameters.AddWithValue("@TplId", templateId);
        var exists = (int)(await checkCmd.ExecuteScalarAsync() ?? 0) > 0;

        if (exists)
        {
            const string del = "DELETE FROM UserWishlists WHERE UserId=@UserId AND TemplateId=@TplId";
            using var delCmd = new SqlCommand(del, conn);
            delCmd.Parameters.AddWithValue("@UserId", userId);
            delCmd.Parameters.AddWithValue("@TplId", templateId);
            await delCmd.ExecuteNonQueryAsync();
            return false;
        }
        else
        {
            const string ins = "INSERT INTO UserWishlists (UserId, TemplateId) VALUES (@UserId, @TplId)";
            using var insCmd = new SqlCommand(ins, conn);
            insCmd.Parameters.AddWithValue("@UserId", userId);
            insCmd.Parameters.AddWithValue("@TplId", templateId);
            await insCmd.ExecuteNonQueryAsync();
            return true;
        }
    }
}
