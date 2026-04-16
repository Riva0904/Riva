namespace Riva.Api.Data;

public class ConnectionStringProvider
{
    public string ConnectionString { get; }

    public ConnectionStringProvider(DatabaseConnection dbConnection)
    {
        ConnectionString = dbConnection.ConnectionString;
    }
}