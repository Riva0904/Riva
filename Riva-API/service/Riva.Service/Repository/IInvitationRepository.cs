using Riva.Domain.Entity;

namespace Riva.Service.Repository;

public interface IInvitationRepository
{
    Task<int> CreateAsync(InvitationInstance invitation);
    Task UpdateAsync(InvitationInstance invitation);
    Task<InvitationInstance?> GetByIdAsync(int invitationId);
    Task<InvitationInstance?> GetBySlugAsync(string slug);
    Task<List<InvitationInstance>> GetByUserIdAsync(int userId);
    Task<bool> SlugExistsAsync(string slug);
    Task IncrementViewCountAsync(int invitationId);

    Task AddMediaAsync(InvitationMedia media);
    Task<List<InvitationMedia>> GetMediaAsync(int invitationId);
    Task DeleteMediaAsync(int mediaId);
}
