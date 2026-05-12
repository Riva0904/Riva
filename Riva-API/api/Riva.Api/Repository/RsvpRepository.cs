using System.Data.SqlClient;
using Riva.Api.Data;
using Riva.Domain.Entity;
using Riva.Service.Repository;

namespace Riva.Api.Repository;

public class RsvpRepository : IRsvpRepository
{
    private readonly DatabaseConnection _db;
    public RsvpRepository(DatabaseConnection db) => _db = db;

    public async Task<int> CreateAsync(InvitationRsvp rsvp)
    {
        const string sql = """
            INSERT INTO InvitationRsvps
                (InvitationId, GuestName, GuestEmail, GuestPhone, Status, GuestCount, Message, IpAddress, RespondedAt)
            OUTPUT INSERTED.RsvpId
            VALUES
                (@InvitationId, @GuestName, @GuestEmail, @GuestPhone, @Status, @GuestCount, @Message, @IpAddress, @RespondedAt)
            """;

        await using var conn = await _db.GetOpenConnectionAsync();
        await using var cmd  = new SqlCommand(sql, conn);
        cmd.Parameters.AddWithValue("@InvitationId", rsvp.InvitationId);
        cmd.Parameters.AddWithValue("@GuestName",    rsvp.GuestName);
        cmd.Parameters.AddWithValue("@GuestEmail",   (object?)rsvp.GuestEmail  ?? DBNull.Value);
        cmd.Parameters.AddWithValue("@GuestPhone",   (object?)rsvp.GuestPhone  ?? DBNull.Value);
        cmd.Parameters.AddWithValue("@Status",       rsvp.Status);
        cmd.Parameters.AddWithValue("@GuestCount",   rsvp.GuestCount);
        cmd.Parameters.AddWithValue("@Message",      (object?)rsvp.Message     ?? DBNull.Value);
        cmd.Parameters.AddWithValue("@IpAddress",    (object?)rsvp.IpAddress   ?? DBNull.Value);
        cmd.Parameters.AddWithValue("@RespondedAt",  rsvp.RespondedAt);
        return (int)await cmd.ExecuteScalarAsync();
    }

    public async Task<List<InvitationRsvp>> GetByInvitationIdAsync(int invitationId)
    {
        const string sql = """
            SELECT RsvpId, InvitationId, GuestName, GuestEmail, GuestPhone,
                   Status, GuestCount, Message, IpAddress, RespondedAt
            FROM InvitationRsvps
            WHERE InvitationId = @InvitationId
            ORDER BY RespondedAt DESC
            """;

        await using var conn = await _db.GetOpenConnectionAsync();
        await using var cmd  = new SqlCommand(sql, conn);
        cmd.Parameters.AddWithValue("@InvitationId", invitationId);
        await using var r = await cmd.ExecuteReaderAsync();

        var list = new List<InvitationRsvp>();
        while (await r.ReadAsync())
        {
            list.Add(new InvitationRsvp
            {
                RsvpId       = r.GetInt32(r.GetOrdinal("RsvpId")),
                InvitationId = r.GetInt32(r.GetOrdinal("InvitationId")),
                GuestName    = r.GetString(r.GetOrdinal("GuestName")),
                GuestEmail   = r.IsDBNull(r.GetOrdinal("GuestEmail"))  ? null : r.GetString(r.GetOrdinal("GuestEmail")),
                GuestPhone   = r.IsDBNull(r.GetOrdinal("GuestPhone"))  ? null : r.GetString(r.GetOrdinal("GuestPhone")),
                Status       = r.GetString(r.GetOrdinal("Status")),
                GuestCount   = r.GetInt32(r.GetOrdinal("GuestCount")),
                Message      = r.IsDBNull(r.GetOrdinal("Message"))     ? null : r.GetString(r.GetOrdinal("Message")),
                IpAddress    = r.IsDBNull(r.GetOrdinal("IpAddress"))   ? null : r.GetString(r.GetOrdinal("IpAddress")),
                RespondedAt  = r.GetDateTime(r.GetOrdinal("RespondedAt")),
            });
        }
        return list;
    }

    public async Task<bool> ExistsAsync(int invitationId, string guestName)
    {
        const string sql = """
            SELECT COUNT(1) FROM InvitationRsvps
            WHERE InvitationId = @InvitationId
              AND LOWER(GuestName) = LOWER(@GuestName)
            """;
        await using var conn = await _db.GetOpenConnectionAsync();
        await using var cmd  = new SqlCommand(sql, conn);
        cmd.Parameters.AddWithValue("@InvitationId", invitationId);
        cmd.Parameters.AddWithValue("@GuestName",    guestName.Trim());
        return (int)(await cmd.ExecuteScalarAsync())! > 0;
    }
}
