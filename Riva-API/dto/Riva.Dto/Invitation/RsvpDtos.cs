namespace Riva.Dto.Invitation;

public class SubmitRsvpRequest
{
    public string GuestName { get; set; } = string.Empty;
    public string? GuestEmail { get; set; }
    public string? GuestPhone { get; set; }

    /// <summary>Accepted | Declined | Maybe</summary>
    public string Status { get; set; } = "Accepted";

    public int GuestCount { get; set; } = 1;
    public string? Message { get; set; }
}

public class RsvpDto
{
    public int RsvpId { get; set; }
    public string GuestName { get; set; } = string.Empty;
    public string? GuestEmail { get; set; }
    public string Status { get; set; } = string.Empty;
    public int GuestCount { get; set; }
    public string? Message { get; set; }
    public DateTime RespondedAt { get; set; }
}

public class RsvpSummaryDto
{
    public int TotalResponses { get; set; }
    public int Accepted { get; set; }
    public int Declined { get; set; }
    public int Maybe { get; set; }
    public int TotalGuests { get; set; }
    public List<RsvpDto> Responses { get; set; } = new();
}
