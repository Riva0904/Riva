# SQL Server Connection Setup Guide

## Current Configuration

**Server Details from your system:**
- Server Name: TLTVVMT327\SQLEXPRESS
- Database: RivaDb
- Authentication: SQL Server Authentication
- User: sa
- Password: Apple123!
- Encryption: Disabled
- TOS: Disabled (for development)

## Connection String Used

```
Server=TLTVVMT327\SQLEXPRESS;Database=RivaDb;User Id=sa;Password=Apple123!;Encrypt=False;TrustServerCertificate=True;
```

## Configuration Files Updated

✅ **appsettings.json** - Updated with SQL Server connection
✅ **appsettings.Development.json** - Updated for development environment

## Database Migration Created

✅ **Migrations/\*_InitialCreate.cs** - Created migration with:
  - Users table
  - AdminActions table
  - Foreign key relationships
  - Indexes for optimization
  - Default admin user seed

## Troubleshooting Connection Issues

### Error: "A network-related or instance-specific error occurred"

**Solutions to try:**

1. **Verify SQL Server is running:**
   ```powershell
   Get-Service | Where-Object {$_.Name -like "*SQL*"} | Select-Object Status, Name
   ```

2. **Start SQL Server if stopped:**
   ```powershell
   Start-Service "MSSQL$SQLEXPRESS"
   Start-Service "SQLBrowser"
   ```

3. **Test connection with SQL Server Management Studio:**
   - Server name: `TLTVVMT327\SQLEXPRESS`
   - Authentication: SQL Server Authentication
   - Login: `sa`
   - Password: `Apple123!`

4. **Verify TCP/IP is enabled:**
   - Open SQL Server Configuration Manager
   - Navigate to: SQL Server Network Configuration > Protocols for SQLEXPRESS
   - Ensure TCP/IP is **Enabled**
   - Restart SQL Server service

5. **Alternative Connection Strings to Try:**

   **With connection timeout:**
   ```
   Server=TLTVVMT327\SQLEXPRESS;Database=RivaDb;User Id=sa;Password=Apple123!;Encrypt=False;TrustServerCertificate=True;Connection Timeout=30;
   ```

   **With Integrated Security (if windows auth works):**
   ```
   Server=TLTVVMT327\SQLEXPRESS;Database=RivaDb;Integrated Security=true;Encrypt=False;TrustServerCertificate=True;
   ```

   **Using IP Address (get from SQL Server):**
   ```
   Server=127.0.0.1,1433;Database=RivaDb;User Id=sa;Password=Apple123!;Encrypt=False;TrustServerCertificate=True;
   ```

6. **Check SQL Server services:**
   ```powershell
   New-Item -Path 'HKCU:' -Name 'MSSQLSupport'
   Get-ListenOnPort 1433
   ```

## Next Steps After Connection is Established

1. **Apply migrations:**
   ```bash
   dotnet ef database update --context RivaDbContext
   ```

2. **Verify tables created:**
   ```sql
   SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = 'dbo'
   ```

3. **Run the API:**
   ```bash
   dotnet run
   ```

4. **Test endpoints:**
   - API Base: http://localhost:5236
   - Swagger UI: http://localhost:5236/swagger
   - Health Check: http://localhost:5236/health (if implemented)

## Recommended Next Actions

1. ✅ Verify SQL Server is running (Check Windows Services)
2. ✅ Enable TCP/IP protocol (SQL Server Configuration Manager)
3. ✅ Test SSMS connection with your credentials
4. ✅ Run `dotnet ef database update` once connection confirmed
5. ✅ Start the API server with `dotnet run`
6. ✅ Test authentication endpoints

## Database Objects to be Created

**Tables:**
- `Users` - User accounts and profiles
- `AdminActions` - Admin audit trail
- `__EFMigrationsHistory` - EF Core migration tracking

**Indexes:**
- idx_username (Users)
- idx_email (Users)  
- idx_role (Users)
- idx_isActive (Users)
- idx_adminUserId (AdminActions)
- idx_action (AdminActions)
- idx_timestamp (AdminActions)

**Seeded Data:**
- Default Admin User:
  - Username: admin
  - Email: admin@riva.com
  - Password Hash: BCrypt (admin123)
  - Role: Admin

## Help Commands

```powershell
# Check if SQL Server running
Get-Service | grep -i sql

# Start SQL Server Express
Start-Service "MSSQL$SQLEXPRESS"

# Start SQL Browser
Start-Service "SQLBrowser"

# View SQL Server error logs
Get-Content "C:\Program Files\Microsoft SQL Server\MSSQL16.SQLEXPRESS\MSSQL\Log\ERRORLOG"
```

## Security Notes

⚠️ **For Development Only:**
- Encryption disabled (`Encrypt=False`)
- Trust server certificate enabled
- sa account credentials in config

✅ **For Production:**
- Enable encryption
- Use strong passwords
- Use service accounts instead of sa
- Store sensitive data in Azure Key Vault or similar
- Use appsettings.Production.json