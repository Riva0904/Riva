namespace Riva.Service.Data;

public class ConnectionStringProvider
{
    public string ConnectionString { get; }

    public ConnectionStringProvider(string connectionString)
    {
        ConnectionString = connectionString;
    }
}