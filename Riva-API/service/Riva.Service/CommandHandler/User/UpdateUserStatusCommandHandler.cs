using MediatR;
using Riva.Service.Command.User;
using Riva.Service.Repository;

namespace Riva.Service.CommandHandler.User;

public class UpdateUserStatusCommandHandler : IRequestHandler<UpdateUserStatusCommand, Unit>
{
    private readonly IUserRepository _userRepository;

    public UpdateUserStatusCommandHandler(IUserRepository userRepository)
    {
        _userRepository = userRepository;
    }

    public async Task<Unit> Handle(UpdateUserStatusCommand request, CancellationToken cancellationToken)
    {
        var user = await _userRepository.GetByIdAsync(request.UserId);
        if (user == null)
        {
            throw new KeyNotFoundException("User not found");
        }

        user.IsActive = request.IsActive;
        user.UpdatedAt = DateTime.UtcNow;

        await _userRepository.UpdateAsync(user);
        await _userRepository.SaveChangesAsync();

        return Unit.Value;
    }
}
