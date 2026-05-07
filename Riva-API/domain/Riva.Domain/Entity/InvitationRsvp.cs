namespace Riva.Domain.Entity;

public class InvitationRsvp
{
    public int RsvpId { get; set; }
    public int InvitationId { get; set; }

    public string GuestName { get; set; } = string.Empty;
    public string? GuestEmail { get; set; }
    public string? GuestPhone { get; set; }

    /// <summary>Accepted | Declined | Maybe | Pending</summary>
    public string Status { get; set; } = "Pending";

    public int GuestCount { get; set; } = 1;
    public string? Message { get; set; }
    public string? IpAddress { get; set; }
    public DateTime RespondedAt { get; set; } = DateTime.UtcNow;
}
