using Riva.Domain.Entity;

namespace Riva.Service.Interfaces;

public interface IJwtService
{
    string GenerateToken(User user);
}