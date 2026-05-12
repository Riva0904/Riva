namespace Riva.Service.Repository;

public interface IWishlistRepository
{
    Task<List<int>> GetWishlistIdsAsync(int userId);
    Task<bool> ToggleAsync(int userId, int templateId);  // returns true if added, false if removed
}
