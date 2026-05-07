using Riva.Domain.Entity;

namespace Riva.Service.Repository;

public interface IRsvpRepository
{
    Task<int> CreateAsync(InvitationRsvp rsvp);
    Task<List<InvitationRsvp>> GetByInvitationIdAsync(int invitationId);
}
