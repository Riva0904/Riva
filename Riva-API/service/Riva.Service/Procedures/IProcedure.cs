using MediatR;

namespace Riva.Service.Procedures;

/// <summary>
/// Base interface for database procedure commands
/// </summary>
/// <typeparam name="TResult">The result type returned by the procedure</typeparam>
public interface IProcedureCommand<out TResult> : IRequest<TResult>
{
}

/// <summary>
/// Base interface for procedure result entities
/// </summary>
public interface IProcedureResult
{
    int ReturnValue { get; set; }
}
