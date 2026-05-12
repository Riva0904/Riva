namespace Riva.Service.Repository;

public interface IUserDeviceRepository
{
    Task<bool> IsKnownDeviceAsync(int userId, string deviceHash);
    Task AddDeviceAsync(int userId, string deviceHash, string deviceLabel);
}
