# SQL Server Connection Troubleshooting Guide

## Your Setup
- **Server:** TLTVVMT327\SQLEXPRESS
- **User:** sa
- **Password:** Apple123!
- **Database:** RivaDb

## Current Issue
- SQL Server is running but connection fails
- Likely cause: TCP protocol not enabled or firewall issue

## Solution Steps

### Option 1: Manual Database Setup (RECOMMENDED ✅)

1. **Open SQL Server Management Studio**
   - Server: `TLTVVMT327\SQLEXPRESS`
   - Auth: SQL Server Authentication
   - Login: `sa`
   - Password: `Apple123!`

2. **Run the setup script:**
   - Open: [MANUAL-SETUP.sql](MANUAL-SETUP.sql)
   - Execute (F5)
   - This creates all tables, indexes, and stored procedures

3. **Verify in SSMS:**
   ```sql
   USE RivaDb
   SELECT * FROM Users
   SELECT * FROM AdminActions
   ```

4. **Then run the .NET application:**
   ```bash
   cd c:\Riva\Riva-API\api\Riva.Api
   dotnet run
   ```

---

### Option 2: Enable TCP/IP Protocol (For Automatic Connections)

**Follow these steps to enable TCP/IP:**

1. **Open SQL Server Configuration Manager:**
   - Press `Win + R`
   - Type: `SQLServerManager16` (for SQL Server 2022)
   - Click OK

2. **Navigate to:**
   - SQL Server Network Configuration
   - Protocols for SQLEXPRESS

3. **Enable TCP/IP:**
   - Right-click `TCP/IP`
   - Click `Enable`

4. **Configure TCP/IP Port:**
   - Right-click `TCP/IP`
   - Click `Properties`
   - Go to `IP Addresses` tab
   - Find `IPALL` section
   - Set `TCP Port: 1433`
   - Click OK

5. **Restart SQL Server:**
   - Go to: SQL Server Services
   - Right-click: SQL Server (SQLEXPRESS)
   - Click: Restart

6. **Test connection:**
   ```powershell
   Test-NetConnection -ComputerName localhost -Port 1433
   ```

---

### Option 3: Connection Strings to Try

**Current (in appsettings.json):**
```
Server=localhost,1433;Database=RivaDb;User Id=sa;Password=Apple123!;Encrypt=False;TrustServerCertificate=True;Connection Timeout=30;
```

**Alternative 1 - With Named Instance:**
```
Server=TLTVVMT327\SQLEXPRESS;Database=RivaDb;User Id=sa;Password=Apple123!;Encrypt=False;TrustServerCertificate=True;
```

**Alternative 2 - Named Pipes:**
```
Server=\\.\pipe\MSSQL$SQLEXPRESS\sql\query;Database=RivaDb;User Id=sa;Password=Apple123!;Encrypt=False;TrustServerCertificate=True;
```

**Alternative 3 - Shared Memory:**
```
Server=localhost\SQLEXPRESS;Database=RivaDb;User Id=sa;Password=Apple123!;Encrypt=False;TrustServerCertificate=True;Protocol=SharedMemory;
```

---

## Quick Diagnostic Commands

### Check SQL Server Status
```powershell
Get-Service | Where-Object {$_.Name -like "*SQL*"} | Select-Object Name, Status
```

### Check if TCP Port 1433 is Listening
```powershell
netstat -an | findstr :1433
```

### Test Connection to Database
```powershell
# Using SQL Server Management Studio
# Or use PowerShell:
$ConnectionString = "Server=TLTVVMT327\SQLEXPRESS;Database=master;User Id=sa;Password=Apple123!;Connection Timeout=5;"
$Connection = New-Object System.Data.SqlClient.SqlConnection($ConnectionString)
$Connection.Open()
Write-Host "Connection successful!"
$Connection.Close()
```

---

## Files Generated

| File | Purpose |
|------|---------|
| **MANUAL-SETUP.sql** | Run manually in SSMS to create database and tables |
| **Complete-Setup.sql** | Alternative complete setup with all procedures |
| **appsettings.json** | Production connection string |
| **appsettings.Development.json** | Development connection string |

---

## Next Steps After Database Setup

1. ✅ Create database using MANUAL-SETUP.sql
2. ✅ Verify tables created in SSMS
3. ✅ Build the .NET application:
   ```bash
   dotnet build
   ```

4. ✅ Run the API:
   ```bash
   dotnet run
   ```

5. ✅ Test endpoints:
   - Swagger: http://localhost:5236/swagger
   - Login: `POST /api/auth/login`
   - Register: `POST /api/auth/register`

---

## Support

If you still have connection issues:

1. **Check SQL Server Event Log:**
   - Open Event Viewer
   - Windows Logs > System
   - Look for SQL Server errors

2. **Check SQL Server Error Log:**
   ```
   C:\Program Files\Microsoft SQL Server\MSSQL16.SQLEXPRESS\MSSQL\Log\
   ```

3. **Rebuild Authentication:**
   - Restart SQL Server service
   - Clear Application Insights logs
   - Try connecting with new connection string

4. **Alternative:** Use Azure SQL Express or LocalDB instead of SQLEXPRESS