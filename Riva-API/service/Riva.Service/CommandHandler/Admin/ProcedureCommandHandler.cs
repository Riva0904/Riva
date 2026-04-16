using System.Data;
using System.Data.SqlClient;
using System.Reflection;
using MediatR;
using Riva.Service.Attributes;
using Riva.Service.Command.Admin;
using Riva.Service.Procedures;
using Riva.Service.Data;

namespace Riva.Service.CommandHandler.Admin;

/// <summary>
/// Generic handler for executing stored procedures using attributes
/// </summary>
public class ProcedureCommandHandler :
    IRequestHandler<BulkSetActivateUsersCommand, BulkSetActivateUsersResult>,
    IRequestHandler<BulkAssignRoleCommand, BulkAssignRoleResult>,
    IRequestHandler<LogAdminActionCommand, LogAdminActionResult>
{
    private readonly string _connectionString;

    public ProcedureCommandHandler(ConnectionStringProvider connectionStringProvider)
    {
        _connectionString = connectionStringProvider.ConnectionString;
    }

    public async Task<BulkSetActivateUsersResult> Handle(BulkSetActivateUsersCommand request, CancellationToken cancellationToken)
    {
        return await ExecuteProcedureAsync<BulkSetActivateUsersCommand, BulkSetActivateUsersResult>(request);
    }

    public async Task<BulkAssignRoleResult> Handle(BulkAssignRoleCommand request, CancellationToken cancellationToken)
    {
        return await ExecuteProcedureAsync<BulkAssignRoleCommand, BulkAssignRoleResult>(request);
    }

    public async Task<LogAdminActionResult> Handle(LogAdminActionCommand request, CancellationToken cancellationToken)
    {
        return await ExecuteProcedureAsync<LogAdminActionCommand, LogAdminActionResult>(request);
    }

    /// <summary>
    /// Generic procedure executor using reflection to read attributes
    /// </summary>
    private async Task<TResult> ExecuteProcedureAsync<TCommand, TResult>(TCommand request) 
        where TCommand : class
        where TResult : IProcedureResult, new()
    {
        var procedureNameAttr = typeof(TCommand).GetCustomAttribute<ProcedureNameAttribute>();
        if (procedureNameAttr == null)
            throw new InvalidOperationException($"Type {typeof(TCommand).Name} must have ProcedureNameAttribute");

        var procedureName = procedureNameAttr.ProcedureName;
        var result = new TResult();

        using (var connection = new SqlConnection(_connectionString))
        {
            await connection.OpenAsync();
            using (var command = new SqlCommand(procedureName, connection))
            {
                command.CommandType = CommandType.StoredProcedure;

                // Get all properties with ProcedureParameterAttribute
                var properties = typeof(TCommand).GetProperties();
                foreach (var prop in properties)
                {
                    var paramAttr = prop.GetCustomAttribute<ProcedureParameterAttribute>();
                    if (paramAttr != null)
                    {
                        var value = prop.GetValue(request);
                        var parameter = new SqlParameter(paramAttr.ParameterName, value ?? DBNull.Value)
                        {
                            Direction = paramAttr.Direction
                        };
                        command.Parameters.Add(parameter);
                    }
                }

                // Add return value parameter
                var returnParam = new SqlParameter("@ReturnValue", SqlDbType.Int)
                {
                    Direction = ParameterDirection.ReturnValue
                };
                command.Parameters.Add(returnParam);

                // Execute the procedure
                await command.ExecuteNonQueryAsync();

                // Set the return value
                result.ReturnValue = (int)(returnParam.Value ?? 0);

                // Map output parameters to result properties if needed
                MapOutputParameters(command, result);
            }
        }

        return result;
    }

    /// <summary>
    /// Maps output parameters from the SqlCommand to result properties
    /// </summary>
    private void MapOutputParameters<TResult>(SqlCommand command, TResult result) where TResult : IProcedureResult
    {
        var resultProperties = typeof(TResult).GetProperties();
        foreach (var prop in resultProperties)
        {
            var paramAttr = prop.GetCustomAttribute<ProcedureParameterAttribute>();
            if (paramAttr?.Direction == ParameterDirection.Output || 
                paramAttr?.Direction == ParameterDirection.InputOutput)
            {
                var parameter = command.Parameters[paramAttr.ParameterName];
                if (parameter != null && parameter.Value != DBNull.Value)
                {
                    prop.SetValue(result, Convert.ChangeType(parameter.Value, prop.PropertyType));
                }
            }
        }
    }
}
