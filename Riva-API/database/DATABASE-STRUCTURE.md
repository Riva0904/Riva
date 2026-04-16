# Database Structure - Entity Folder & Procedure Folder

## Folder Organization

```
database/
├── userdb/
│   ├── entity/
│   │   └── Users.sql                (Table definition)
│   └── procedures/                  (SQL Stored Procedures)
│       ├── 01-sp_ValidateUser.sql
│       ├── 02-sp_GetUserByUsername.sql
│       ├── 03-sp_CreateUser.sql
│       ├── 04-sp_GetUserById.sql
│       ├── 05-sp_GetAllUsers.sql
│       ├── 06-sp_SearchUsers.sql
│       ├── 07-sp_UpdateUserStatus.sql
│       ├── 08-sp_UpdateUserRole.sql
│       ├── 09-sp_UpdateUserPassword.sql
│       ├── 10-sp_UpdateLastLogin.sql
│       ├── 11-sp_DeleteUser.sql
│       └── 12-sp_GetUserStatistics.sql
│
├── admindb/
│   ├── entity/
│   │   └── 01-AdminActions-Table.sql (Table definition)
│   └── procedures/                  (SQL Stored Procedures)
│       ├── sp_LogAdminAction.sql
│       ├── sp_GetAdminActionLogs.sql
│       └── sp_GetAdminStatistics.sql
│
├── Complete-Setup.sql               (Full database setup)
└── PROCEDURES-DOCUMENTATION.md      (Documentation)
```

## C# Entity Classes

### Entity Folder: `/domain/Riva.Domain/Entity/`

#### 1. User.cs
```csharp
public class User
{
    public int Id { get; set; }
    public string Username { get; set; }
    public string Email { get; set; }
    public string PasswordHash { get; set; }
    public string Role { get; set; }
    public bool IsActive { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
    public DateTime? LastLoginAt { get; set; }
    
    // Navigation Properties
    public ICollection<AdminAction> AdminActions { get; set; }
    public ICollection<AdminAction> TargetAdminActions { get; set; }
}
```

#### 2. AdminAction.cs
```csharp
public class AdminAction
{
    public int Id { get; set; }
    public int AdminUserId { get; set; }
    public string Action { get; set; }
    public int? TargetUserId { get; set; }
    public string? Details { get; set; }
    public string? IpAddress { get; set; }
    public DateTime Timestamp { get; set; }
    
    // Navigation Properties
    public User? AdminUser { get; set; }
    public User? TargetUser { get; set; }
}
```

## DTO Classes

### DTO Folder: `/dto/Riva.Dto/Admin/`

#### 1. UserDto.cs
```csharp
public class UserDto
{
    public int Id { get; set; }
    public string Username { get; set; }
    public string Email { get; set; }
    public string Role { get; set; }
    public bool IsActive { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
    public DateTime? LastLoginAt { get; set; }
}
```

#### 2. AdminActionDto.cs
```csharp
public class AdminActionDto
{
    public int Id { get; set; }
    public int AdminUserId { get; set; }
    public string AdminUsername { get; set; }
    public string Action { get; set; }
    public int? TargetUserId { get; set; }
    public string? TargetUsername { get; set; }
    public string? Details { get; set; }
    public string? IpAddress { get; set; }
    public DateTime Timestamp { get; set; }
}
```

## Database Context

### RivaDbContext.cs Configuration
- **DbSet<User> Users** - User table mapping
- **DbSet<AdminAction> AdminActions** - AdminActions table mapping
- **Foreign Key Relations** - Configured with cascade delete
- **Indexes** - Created for optimized queries
- **Seeded Data** - Default admin user

## Stored Procedures Summary

### User Management (12 procedures)
1. **sp_ValidateUser** - Validate user for login
2. **sp_GetUserByUsername** - Get user by username
3. **sp_CreateUser** - Create new user
4. **sp_GetUserById** - Get user by ID
5. **sp_GetAllUsers** - Get all users with pagination
6. **sp_SearchUsers** - Search users by criteria
7. **sp_UpdateUserStatus** - Update user active status
8. **sp_UpdateUserRole** - Update user role
9. **sp_UpdateUserPassword** - Update password hash
10. **sp_UpdateLastLogin** - Update last login time
11. **sp_DeleteUser** - Delete user and related actions
12. **sp_GetUserStatistics** - Get user statistics

### Admin Operations (3 procedures)
1. **sp_LogAdminAction** - Log admin actions
2. **sp_GetAdminActionLogs** - Get admin action logs with filters
3. **sp_GetAdminStatistics** - Get admin activity statistics

## Database Tables

### Users Table
- Id (INT, PK, Identity)
- Username (NVARCHAR(50), Unique)
- Email (NVARCHAR(100), Unique)
- PasswordHash (NVARCHAR(255))
- Role (NVARCHAR(20), Default: 'User')
- IsActive (BIT, Default: 1)
- CreatedAt (DATETIME2)
- UpdatedAt (DATETIME2)
- LastLoginAt (DATETIME2)

**Indexes:** username, email, role, isActive

### AdminActions Table
- Id (INT, PK, Identity)
- AdminUserId (INT, FK)
- Action (NVARCHAR(100))
- TargetUserId (INT, FK, Nullable)
- Details (NVARCHAR(MAX))
- IpAddress (NVARCHAR(50))
- Timestamp (DATETIME2)

**Indexes:** adminUserId, action, timestamp

## Naming Convention

### Files
- **Entity SQL**: Numbered (01-, 02-, etc.)
- **Procedures**: Numbered (01-, 02-, etc.) with procedure names

### Database Objects
- **Tables**: PascalCase (Users, AdminActions)
- **Procedures**: sp_ prefix + PascalCase (sp_GetUserByUsername)
- **Columns**: PascalCase

### C# Classes
- **Entities**: PascalCase (User, AdminAction)
- **Properties**: PascalCase
- **DTOs**: PascalCase with Dto suffix (UserDto, AdminActionDto)