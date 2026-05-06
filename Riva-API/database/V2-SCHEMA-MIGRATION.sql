-- Riva Database V2 Schema Migration
-- This script adds new tables and alters existing tables for the Admin OTP + Template management system
-- Run this script in SQL Server Management Studio

USE RivaDb
GO

-- =====================================================
-- 1. ALTER USERS TABLE (Add OTP support columns)
-- =====================================================

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'dbo.Users') AND name = 'OtpCode')
BEGIN
    ALTER TABLE [dbo].[Users]
    ADD [OtpCode] [nvarchar](6) NULL,
        [OtpExpiresAt] [datetime2](7) NULL,
        [OtpAttempts] [int] NOT NULL DEFAULT (0),
        [IsEmailVerified] [bit] NOT NULL DEFAULT ((0)),
        [TwoFactorEnabled] [bit] NOT NULL DEFAULT ((0)),
        [PhoneNumber] [nvarchar](20) NULL,
        [FirstName] [nvarchar](100) NULL,
        [LastName] [nvarchar](100) NULL,
        [ProfilePictureUrl] [nvarchar](500) NULL,
        [Tier] [nvarchar](20) NOT NULL DEFAULT ('Free'),
        [SubscriptionExpiresAt] [datetime2](7) NULL,
        [IsBanned] [bit] NOT NULL DEFAULT ((0)),
        [BanReason] [nvarchar](255) NULL,
        [BannedAt] [datetime2](7) NULL
    
    PRINT 'Users table altered successfully'
END
ELSE
BEGIN
    PRINT 'Users table already has OTP support columns'
END
GO

-- Create indexes on new columns
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'idx_otpCode' AND object_id = OBJECT_ID(N'dbo.Users'))
    CREATE INDEX [idx_otpCode] ON [dbo].[Users]([OtpCode] ASC)
GO

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'idx_isEmailVerified' AND object_id = OBJECT_ID(N'dbo.Users'))
    CREATE INDEX [idx_isEmailVerified] ON [dbo].[Users]([IsEmailVerified] ASC)
GO

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'idx_tier' AND object_id = OBJECT_ID(N'dbo.Users'))
    CREATE INDEX [idx_tier] ON [dbo].[Users]([Tier] ASC)
GO

-- =====================================================
-- 2. CREATE CATEGORIES TABLE
-- =====================================================

IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'dbo.Categories') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[Categories]
    (
        [Id] [int] IDENTITY(1,1) NOT NULL,
        [Name] [nvarchar](100) NOT NULL,
        [Description] [nvarchar](500) NULL,
        [Icon] [nvarchar](100) NULL,
        [Color] [nvarchar](7) NULL,
        [DisplayOrder] [int] NOT NULL DEFAULT ((0)),
        [IsActive] [bit] NOT NULL DEFAULT ((1)),
        [CreatedAt] [datetime2](7) NOT NULL DEFAULT (getutcdate()),
        [UpdatedAt] [datetime2](7) NULL,
        
        CONSTRAINT [PK_Categories] PRIMARY KEY CLUSTERED ([Id] ASC),
        CONSTRAINT [UQ_Categories_Name] UNIQUE NONCLUSTERED ([Name] ASC)
    )
    
    PRINT 'Categories table created successfully'
END
GO

-- Create indexes on Categories table
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'idx_categories_isActive' AND object_id = OBJECT_ID(N'dbo.Categories'))
    CREATE INDEX [idx_categories_isActive] ON [dbo].[Categories]([IsActive] ASC)
GO

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'idx_categories_displayOrder' AND object_id = OBJECT_ID(N'dbo.Categories'))
    CREATE INDEX [idx_categories_displayOrder] ON [dbo].[Categories]([DisplayOrder] ASC)
GO

-- =====================================================
-- 3. CREATE TEMPLATES TABLE
-- =====================================================

IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'dbo.Templates') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[Templates]
    (
        [Id] [int] IDENTITY(1,1) NOT NULL,
        [UserId] [int] NOT NULL,
        [CategoryId] [int] NOT NULL,
        [Name] [nvarchar](100) NOT NULL,
        [Description] [nvarchar](1000) NULL,
        [Content] [nvarchar](max) NOT NULL,
        [ThumbnailUrl] [nvarchar](500) NULL,
        [MinimumTier] [nvarchar](20) NOT NULL DEFAULT ('Free'),
        [IsPublic] [bit] NOT NULL DEFAULT ((0)),
        [ShareToken] [nvarchar](50) NULL,
        [ViewCount] [int] NOT NULL DEFAULT ((0)),
        [Rating] [decimal](3,2) NULL,
        [IsActive] [bit] NOT NULL DEFAULT ((1)),
        [CreatedAt] [datetime2](7) NOT NULL DEFAULT (getutcdate()),
        [UpdatedAt] [datetime2](7) NULL,
        
        CONSTRAINT [PK_Templates] PRIMARY KEY CLUSTERED ([Id] ASC),
        CONSTRAINT [FK_Templates_Users] FOREIGN KEY([UserId]) REFERENCES [dbo].[Users]([Id]) ON DELETE CASCADE,
        CONSTRAINT [FK_Templates_Categories] FOREIGN KEY([CategoryId]) REFERENCES [dbo].[Categories]([Id]) ON DELETE RESTRICT,
        CONSTRAINT [UQ_Templates_ShareToken] UNIQUE NONCLUSTERED ([ShareToken] ASC) WHERE ShareToken IS NOT NULL
    )
    
    PRINT 'Templates table created successfully'
END
GO

-- Create indexes on Templates table
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'idx_templates_userId' AND object_id = OBJECT_ID(N'dbo.Templates'))
    CREATE INDEX [idx_templates_userId] ON [dbo].[Templates]([UserId] ASC)
GO

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'idx_templates_categoryId' AND object_id = OBJECT_ID(N'dbo.Templates'))
    CREATE INDEX [idx_templates_categoryId] ON [dbo].[Templates]([CategoryId] ASC)
GO

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'idx_templates_isPublic' AND object_id = OBJECT_ID(N'dbo.Templates'))
    CREATE INDEX [idx_templates_isPublic] ON [dbo].[Templates]([IsPublic] ASC)
GO

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'idx_templates_minimumTier' AND object_id = OBJECT_ID(N'dbo.Templates'))
    CREATE INDEX [idx_templates_minimumTier] ON [dbo].[Templates]([MinimumTier] ASC)
GO

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'idx_templates_createdAt' AND object_id = OBJECT_ID(N'dbo.Templates'))
    CREATE INDEX [idx_templates_createdAt] ON [dbo].[Templates]([CreatedAt] DESC)
GO

-- =====================================================
-- 4. CREATE EMAILOTP TABLE
-- =====================================================

IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'dbo.EmailOtps') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[EmailOtps]
    (
        [Id] [int] IDENTITY(1,1) NOT NULL,
        [Email] [nvarchar](100) NOT NULL,
        [OtpCode] [nvarchar](6) NOT NULL,
        [Purpose] [nvarchar](50) NOT NULL,
        [ExpiresAt] [datetime2](7) NOT NULL,
        [Attempts] [int] NOT NULL DEFAULT ((0)),
        [IsVerified] [bit] NOT NULL DEFAULT ((0)),
        [VerifiedAt] [datetime2](7) NULL,
        [CreatedAt] [datetime2](7) NOT NULL DEFAULT (getutcdate()),
        
        CONSTRAINT [PK_EmailOtps] PRIMARY KEY CLUSTERED ([Id] ASC),
        CONSTRAINT [UQ_EmailOtps_Email_Purpose] UNIQUE NONCLUSTERED ([Email] ASC, [Purpose] ASC) WHERE IsVerified = 0
    )
    
    PRINT 'EmailOtps table created successfully'
END
GO

-- Create indexes on EmailOtps table
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'idx_emailotps_email' AND object_id = OBJECT_ID(N'dbo.EmailOtps'))
    CREATE INDEX [idx_emailotps_email] ON [dbo].[EmailOtps]([Email] ASC)
GO

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'idx_emailotps_purpose' AND object_id = OBJECT_ID(N'dbo.EmailOtps'))
    CREATE INDEX [idx_emailotps_purpose] ON [dbo].[EmailOtps]([Purpose] ASC)
GO

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'idx_emailotps_expiresAt' AND object_id = OBJECT_ID(N'dbo.EmailOtps'))
    CREATE INDEX [idx_emailotps_expiresAt] ON [dbo].[EmailOtps]([ExpiresAt] DESC)
GO

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'idx_emailotps_isVerified' AND object_id = OBJECT_ID(N'dbo.EmailOtps'))
    CREATE INDEX [idx_emailotps_isVerified] ON [dbo].[EmailOtps]([IsVerified] ASC)
GO

-- =====================================================
-- 5. CREATE TEMPLATE TAGS TABLE (Many-to-Many relationship)
-- =====================================================

IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'dbo.TemplateCategories') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[TemplateCategories]
    (
        [TemplateId] [int] NOT NULL,
        [CategoryId] [int] NOT NULL,
        [AddedAt] [datetime2](7) NOT NULL DEFAULT (getutcdate()),
        
        CONSTRAINT [PK_TemplateCategories] PRIMARY KEY CLUSTERED ([TemplateId], [CategoryId] ASC),
        CONSTRAINT [FK_TemplateCategories_Templates] FOREIGN KEY([TemplateId]) REFERENCES [dbo].[Templates]([Id]) ON DELETE CASCADE,
        CONSTRAINT [FK_TemplateCategories_Categories] FOREIGN KEY([CategoryId]) REFERENCES [dbo].[Categories]([Id]) ON DELETE CASCADE
    )
    
    PRINT 'TemplateCategories table created successfully'
END
GO

-- =====================================================
-- 6. INSERT DEFAULT CATEGORIES
-- =====================================================

IF NOT EXISTS (SELECT 1 FROM Categories WHERE Name = 'Business Letter')
BEGIN
    INSERT INTO [dbo].[Categories] (Name, Description, Icon, Color, DisplayOrder, IsActive)
    VALUES 
        ('Business Letter', 'Professional business correspondence', 'envelope', '#0066CC', 1, 1),
        ('Resume', 'CV and resume templates', 'file-text', '#FF6600', 2, 1),
        ('Invoice', 'Invoice and billing templates', 'receipt', '#00AA00', 3, 1),
        ('Contract', 'Legal contract templates', 'file-contract', '#9900CC', 4, 1),
        ('Report', 'Business report templates', 'bar-chart', '#FF0000', 5, 1),
        ('Email', 'Email message templates', 'mail', '#0099FF', 6, 1),
        ('Meeting Notes', 'Meeting agenda and notes', 'clipboard', '#FFCC00', 7, 1),
        ('Proposal', 'Business proposal templates', 'lightbulb', '#00CCCC', 8, 1)
    
    PRINT 'Default categories inserted successfully'
END
ELSE
BEGIN
    PRINT 'Categories already exist'
END
GO

-- =====================================================
-- 7. VERIFY SCHEMA
-- =====================================================

PRINT '=== SCHEMA MIGRATION COMPLETED ==='
PRINT '=== TABLES CREATED/UPDATED ==='
SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = 'dbo' ORDER BY TABLE_NAME
GO

PRINT 'V2 Schema migration completed successfully!'
GO
