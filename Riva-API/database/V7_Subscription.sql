-- V7_Subscription.sql
-- Adds subscription plans, user subscription columns, and template access tracking
-- Run after all previous migrations on RivaDb

USE RivaDb
GO

-- ── 1. Subscription Plans Table ───────────────────────────────────────────────
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'dbo.SubscriptionPlans') AND type = 'U')
BEGIN
    CREATE TABLE [dbo].[SubscriptionPlans]
    (
        [Id]               INT            IDENTITY(1,1) NOT NULL,
        [Name]             NVARCHAR(50)   NOT NULL,
        [PriceUsd]         DECIMAL(10,2)  NOT NULL DEFAULT 0,
        [PriceInr]         DECIMAL(10,2)  NOT NULL DEFAULT 0,
        [TemplatesAccess]  NVARCHAR(20)   NOT NULL DEFAULT 'free_only', -- 'free_only' | 'all'
        [MaxInvitations]   INT            NULL,                          -- NULL = unlimited
        [IsActive]         BIT            NOT NULL DEFAULT 1,
        [CreatedAt]        DATETIME2      NOT NULL DEFAULT GETUTCDATE(),

        CONSTRAINT [PK_SubscriptionPlans] PRIMARY KEY CLUSTERED ([Id] ASC)
    )
    PRINT 'Created SubscriptionPlans table'
END
GO

-- Seed the three plans (idempotent)
IF NOT EXISTS (SELECT 1 FROM [dbo].[SubscriptionPlans] WHERE [Name] = 'Starter')
    INSERT INTO [dbo].[SubscriptionPlans] (Name, PriceUsd, PriceInr, TemplatesAccess, MaxInvitations)
    VALUES ('Starter', 0, 0, 'free_only', 10)
GO
IF NOT EXISTS (SELECT 1 FROM [dbo].[SubscriptionPlans] WHERE [Name] = 'Premium')
    INSERT INTO [dbo].[SubscriptionPlans] (Name, PriceUsd, PriceInr, TemplatesAccess, MaxInvitations)
    VALUES ('Premium', 19, 1590, 'all', NULL)
GO
IF NOT EXISTS (SELECT 1 FROM [dbo].[SubscriptionPlans] WHERE [Name] = 'Business')
    INSERT INTO [dbo].[SubscriptionPlans] (Name, PriceUsd, PriceInr, TemplatesAccess, MaxInvitations)
    VALUES ('Business', 45, 3750, 'all', NULL)
GO

-- ── 2. Add subscription columns to Users (if not already from earlier migration) ──
IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID(N'dbo.Users') AND name = 'SubscriptionTier')
BEGIN
    ALTER TABLE [dbo].[Users] ADD [SubscriptionTier] NVARCHAR(20) NOT NULL CONSTRAINT [DF_Users_SubscriptionTier] DEFAULT 'Starter'
    PRINT 'Added SubscriptionTier column to Users'
END
GO

IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID(N'dbo.Users') AND name = 'SubscriptionExpiry')
BEGIN
    ALTER TABLE [dbo].[Users] ADD [SubscriptionExpiry] DATETIME2 NULL
    PRINT 'Added SubscriptionExpiry column to Users'
END
GO

-- ── 3. UserTemplateAccess Table ───────────────────────────────────────────────
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'dbo.UserTemplateAccess') AND type = 'U')
BEGIN
    CREATE TABLE [dbo].[UserTemplateAccess]
    (
        [Id]          INT       IDENTITY(1,1) NOT NULL,
        [UserId]      INT       NOT NULL,
        [TemplateId]  INT       NOT NULL,
        [PaymentId]   INT       NOT NULL,
        [PurchasedAt] DATETIME2 NOT NULL DEFAULT GETUTCDATE(),

        CONSTRAINT [PK_UserTemplateAccess] PRIMARY KEY CLUSTERED ([Id] ASC),
        CONSTRAINT [FK_UTA_Users]    FOREIGN KEY ([UserId])   REFERENCES [dbo].[Users]([Id])    ON DELETE CASCADE,
        CONSTRAINT [FK_UTA_Payments] FOREIGN KEY ([PaymentId]) REFERENCES [dbo].[Payments]([Id])
    )

    CREATE UNIQUE INDEX [UQ_UserTemplateAccess_UserTemplate]
        ON [dbo].[UserTemplateAccess] ([UserId], [TemplateId])

    PRINT 'Created UserTemplateAccess table'
END
GO

-- ── 4. Stored procedure: check template access ─────────────────────────────────
CREATE OR ALTER PROCEDURE [dbo].[sp_CheckTemplateAccess]
    @UserId     INT,
    @TemplateId INT
AS
BEGIN
    -- Returns 1 if user has access (free template, active subscription, or direct purchase)
    DECLARE @IsPaid         BIT
    DECLARE @UserTier       NVARCHAR(20)
    DECLARE @SubscriptionExpiry DATETIME2
    DECLARE @DirectAccess   INT

    SELECT @IsPaid = IsPaid FROM Templates WHERE Id = @TemplateId
    SELECT @UserTier = SubscriptionTier, @SubscriptionExpiry = SubscriptionExpiry
    FROM Users WHERE Id = @UserId

    -- Free template: always accessible
    IF @IsPaid = 0
    BEGIN
        SELECT 1 AS HasAccess
        RETURN
    END

    -- Active Premium/Business subscription
    IF @UserTier IN ('Premium', 'Business')
       AND (@SubscriptionExpiry IS NULL OR @SubscriptionExpiry > GETUTCDATE())
    BEGIN
        SELECT 1 AS HasAccess
        RETURN
    END

    -- Direct purchase
    SELECT @DirectAccess = COUNT(1) FROM UserTemplateAccess
    WHERE UserId = @UserId AND TemplateId = @TemplateId
    IF @DirectAccess > 0
    BEGIN
        SELECT 1 AS HasAccess
        RETURN
    END

    SELECT 0 AS HasAccess
END
GO

-- ── 5. Stored procedure: grant template access after payment ───────────────────
CREATE OR ALTER PROCEDURE [dbo].[sp_GrantTemplateAccess]
    @UserId     INT,
    @TemplateId INT,
    @PaymentId  INT
AS
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM UserTemplateAccess WHERE UserId = @UserId AND TemplateId = @TemplateId
    )
    BEGIN
        INSERT INTO UserTemplateAccess (UserId, TemplateId, PaymentId)
        VALUES (@UserId, @TemplateId, @PaymentId)
    END
    SELECT 'Template access granted' AS Message
END
GO

PRINT 'V7_Subscription migration completed successfully'
GO
