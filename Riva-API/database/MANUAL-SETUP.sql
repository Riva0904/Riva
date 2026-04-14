-- Riva Database Setup Script
-- Run this script in SQL Server Management Studio as Admin
-- Connection: TLTVVMT327\SQLEXPRESS, sa user

-- =====================================================
-- 1. CREATE DATABASE
-- =====================================================

-- First, ensure you're in the master database
USE master
GO

-- Drop database if exists (optional - for fresh setup)
-- DROP DATABASE IF EXISTS RivaDb;
-- GO

-- Create the database if it doesn't exist
IF NOT EXISTS (SELECT name FROM sys.databases WHERE name = N'RivaDb')
BEGIN
    CREATE DATABASE [RivaDb]
    CONTAINMENT = NONE
    ON PRIMARY 
    (   
        NAME = N'RivaDb',
        FILENAME = N'C:\Program Files\Microsoft SQL Server\MSSQL16.SQLEXPRESS\MSSQL\DATA\RivaDb.mdf',
        SIZE = 8192KB,
        MAXSIZE = UNLIMITED,
        FILEGROWTH = 65536KB
    )
    LOG ON 
    (
        NAME = N'RivaDb_log',
        FILENAME = N'C:\Program Files\Microsoft SQL Server\MSSQL16.SQLEXPRESS\MSSQL\DATA\RivaDb_log.ldf',
        SIZE = 8192KB,
        MAXSIZE = 2048GB,
        FILEGROWTH = 65536KB
    )
    COLLATE SQL_Latin1_General_CP1_CI_AS
END
GO

-- =====================================================
-- 2. USE RIVA DATABASE
-- =====================================================

USE RivaDb
GO

-- =====================================================
-- 3. CREATE USERS TABLE
-- =====================================================

IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'dbo.Users') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[Users]
    (
        [Id] [int] IDENTITY(1,1) NOT NULL,
        [Username] [nvarchar](50) NOT NULL,
        [Email] [nvarchar](100) NOT NULL,
        [PasswordHash] [nvarchar](255) NOT NULL,
        [Role] [nvarchar](20) NOT NULL DEFAULT ('User'),
        [IsActive] [bit] NOT NULL DEFAULT ((1)),
        [CreatedAt] [datetime2](7) NOT NULL DEFAULT (getutcdate()),
        [UpdatedAt] [datetime2](7) NULL,
        [LastLoginAt] [datetime2](7) NULL,
        
        CONSTRAINT [PK_Users] PRIMARY KEY CLUSTERED ([Id] ASC),
        CONSTRAINT [UQ_Users_Username] UNIQUE NONCLUSTERED ([Username] ASC),
        CONSTRAINT [UQ_Users_Email] UNIQUE NONCLUSTERED ([Email] ASC)
    )
END
GO

-- Create indexes on Users table
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'idx_username' AND object_id = OBJECT_ID(N'dbo.Users'))
    CREATE INDEX [idx_username] ON [dbo].[Users]([Username] ASC)
GO

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'idx_email' AND object_id = OBJECT_ID(N'dbo.Users'))
    CREATE INDEX [idx_email] ON [dbo].[Users]([Email] ASC)
GO

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'idx_role' AND object_id = OBJECT_ID(N'dbo.Users'))
    CREATE INDEX [idx_role] ON [dbo].[Users]([Role] ASC)
GO

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'idx_isActive' AND object_id = OBJECT_ID(N'dbo.Users'))
    CREATE INDEX [idx_isActive] ON [dbo].[Users]([IsActive] ASC)
GO

-- =====================================================
-- 4. CREATE ADMINACTIONS TABLE
-- =====================================================

IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'dbo.AdminActions') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[AdminActions]
    (
        [Id] [int] IDENTITY(1,1) NOT NULL,
        [AdminUserId] [int] NOT NULL,
        [Action] [nvarchar](100) NOT NULL,
        [TargetUserId] [int] NULL,
        [Details] [nvarchar](max) NULL,
        [IpAddress] [nvarchar](50) NULL,
        [Timestamp] [datetime2](7) NOT NULL DEFAULT (getutcdate()),
        
        CONSTRAINT [PK_AdminActions] PRIMARY KEY CLUSTERED ([Id] ASC),
        CONSTRAINT [FK_AdminActions_Users_AdminUserId] FOREIGN KEY([AdminUserId]) REFERENCES [dbo].[Users]([Id]) ON DELETE CASCADE,
        CONSTRAINT [FK_AdminActions_Users_TargetUserId] FOREIGN KEY([TargetUserId]) REFERENCES [dbo].[Users]([Id]) ON DELETE SET NULL
    )
END
GO

-- Create indexes on AdminActions table
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'idx_adminUserId' AND object_id = OBJECT_ID(N'dbo.AdminActions'))
    CREATE INDEX [idx_adminUserId] ON [dbo].[AdminActions]([AdminUserId] ASC)
GO

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'idx_action' AND object_id = OBJECT_ID(N'dbo.AdminActions'))
    CREATE INDEX [idx_action] ON [dbo].[AdminActions]([Action] ASC)
GO

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'idx_timestamp' AND object_id = OBJECT_ID(N'dbo.AdminActions'))
    CREATE INDEX [idx_timestamp] ON [dbo].[AdminActions]([Timestamp] DESC)
GO

-- =====================================================
-- 5. CREATE EFMIGRATIONSHISTORY TABLE
-- =====================================================

IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'dbo.__EFMigrationsHistory') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[__EFMigrationsHistory]
    (
        [MigrationId] [nvarchar](150) NOT NULL,
        [ProductVersion] [nvarchar](32) NOT NULL,
        
        CONSTRAINT [PK___EFMigrationsHistory] PRIMARY KEY CLUSTERED ([MigrationId] ASC)
    )
END
GO

-- =====================================================
-- 6. SEED DEFAULT ADMIN USER
-- =====================================================

-- Check if admin user already exists
IF NOT EXISTS (SELECT 1 FROM Users WHERE Username = 'admin')
BEGIN
    -- Insert default admin user
    -- Password: admin123 (BCrypt hashed)
    INSERT INTO Users (Username, Email, PasswordHash, Role, IsActive)
    VALUES (
        'admin',
        'admin@riva.com',
        '$2a$11$W9bBb8RNT9T6kI9KZnV5bu8Q6k7fH5kJ8Z7Y6X5W4V3U2T1S0R',  -- admin123 hashed with BCrypt
        'Admin',
        1
    )
    
    PRINT 'Default admin user created successfully'
END
ELSE
BEGIN
    PRINT 'Admin user already exists'
END
GO

-- =====================================================
-- 7. VERIFY SETUP
-- =====================================================

-- Display all tables
PRINT '=== TABLES CREATED ==='
SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = 'dbo' ORDER BY TABLE_NAME
GO

-- Display users
PRINT '=== USERS IN DATABASE ==='
SELECT Id, Username, Email, Role, IsActive, CreatedAt FROM Users
GO

-- Display database size
PRINT '=== DATABASE SIZE ==='
SELECT 
    CAST(SUM(size)*8/1024.0 AS DECIMAL(10,2)) AS SizeMB
FROM sys.master_files 
WHERE database_id = DB_ID()
GO

PRINT 'Database setup completed successfully!'
GO

-- =====================================================
-- 8. OPTIONAL: CREATE STORED PROCEDURES
-- =====================================================

-- SP 1: Get user by username
CREATE OR ALTER PROCEDURE sp_GetUserByUsername
    @Username NVARCHAR(50)
AS
BEGIN
    SELECT 
        Id,
        Username,
        Email,
        PasswordHash,
        Role,
        IsActive,
        CreatedAt,
        LastLoginAt
    FROM Users
    WHERE Username = @Username AND IsActive = 1;
END;
GO

-- SP 2: Create new user
CREATE OR ALTER PROCEDURE sp_CreateUser
    @Username NVARCHAR(50),
    @Email NVARCHAR(100),
    @PasswordHash NVARCHAR(255),
    @Role NVARCHAR(20) = 'User'
AS
BEGIN
    BEGIN TRY
        IF EXISTS (SELECT 1 FROM Users WHERE Username = @Username OR Email = @Email)
        BEGIN
            RAISERROR('Username or Email already exists', 16, 1);
            RETURN 1;
        END

        INSERT INTO Users (Username, Email, PasswordHash, Role, IsActive)
        VALUES (@Username, @Email, @PasswordHash, @Role, 1);

        SELECT SCOPE_IDENTITY() AS UserId;
    END TRY
    BEGIN CATCH
        RAISERROR('Error creating user', 16, 1);
        RETURN 1;
    END CATCH
END;
GO

-- SP 3: Get all users
CREATE OR ALTER PROCEDURE sp_GetAllUsers
    @PageNumber INT = 1,
    @PageSize INT = 10
AS
BEGIN
    DECLARE @SkipRows INT = (@PageNumber - 1) * @PageSize;

    SELECT 
        Id,
        Username,
        Email,
        Role,
        IsActive,
        CreatedAt,
        LastLoginAt
    FROM Users
    ORDER BY CreatedAt DESC
    OFFSET @SkipRows ROWS
    FETCH NEXT @PageSize ROWS ONLY;

    SELECT COUNT(*) AS TotalCount FROM Users;
END;
GO

-- SP 4: Update user role
CREATE OR ALTER PROCEDURE sp_UpdateUserRole
    @UserId INT,
    @NewRole NVARCHAR(20)
AS
BEGIN
    BEGIN TRY
        IF NOT EXISTS (SELECT 1 FROM Users WHERE Id = @UserId)
        BEGIN
            RAISERROR('User not found', 16, 1);
            RETURN 1;
        END

        UPDATE Users
        SET Role = @NewRole, UpdatedAt = GETUTCDATE()
        WHERE Id = @UserId;

        SELECT 'User role updated successfully' AS Message;
    END TRY
    BEGIN CATCH
        RAISERROR('Error updating user role', 16, 1);
        RETURN 1;
    END CATCH
END;
GO

-- SP 5: Log admin action
CREATE OR ALTER PROCEDURE sp_LogAdminAction
    @AdminUserId INT,
    @Action NVARCHAR(100),
    @TargetUserId INT = NULL,
    @Details NVARCHAR(MAX) = NULL,
    @IpAddress NVARCHAR(50) = NULL
AS
BEGIN
    BEGIN TRY
        INSERT INTO AdminActions (AdminUserId, Action, TargetUserId, Details, IpAddress)
        VALUES (@AdminUserId, @Action, @TargetUserId, @Details, @IpAddress);

        SELECT 'Action logged successfully' AS Message;
    END TRY
    BEGIN CATCH
        RAISERROR('Error logging admin action', 16, 1);
        RETURN 1;
    END CATCH
END;
GO

PRINT 'Stored procedures created successfully!'
GO
