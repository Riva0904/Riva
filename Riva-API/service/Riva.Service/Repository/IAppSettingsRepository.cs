namespace Riva.Service.Repository;

public interface IAppSettingsRepository
{
    Task<string?> GetAsync(string key);
    Task SetAsync(string key, string value);
}
