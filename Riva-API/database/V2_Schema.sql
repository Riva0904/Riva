-- ============================================================
-- Riva Digital Invitation Platform - V2 Schema
-- Run this against your RivaDb database
-- ============================================================

USE RivaDb;
GO

-- ============================================================
-- 1. ALTER Users table: add IsVerified and SubscriptionTier columns
-- ============================================================
IF NOT EXISTS (
    SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_NAME = 'Users' AND COLUMN_NAME = 'IsVerified'
)
BEGIN
    ALTER TABLE Users ADD IsVerified BIT NOT NULL DEFAULT 0;
    -- existing users (regular users) are auto-verified
    UPDATE Users SET IsVerified = 1 WHERE Role = 'User';
    UPDATE Users SET IsVerified = 1 WHERE Role = 'Admin';
END
GO

IF NOT EXISTS (
    SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_NAME = 'Users' AND COLUMN_NAME = 'SubscriptionTier'
)
BEGIN
    ALTER TABLE Users ADD SubscriptionTier NVARCHAR(20) NOT NULL DEFAULT 'Free';
END
GO

IF NOT EXISTS (
    SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_NAME = 'Users' AND COLUMN_NAME = 'SubscriptionExpiryDate'
)
BEGIN
    ALTER TABLE Users ADD SubscriptionExpiryDate DATETIME2 NULL;
END
GO

-- ============================================================
-- 2. UserEmailOtpGenerate - stores OTPs for admin email verification
-- ============================================================
IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'UserEmailOtpGenerate')
BEGIN
    CREATE TABLE UserEmailOtpGenerate (
        Id         INT IDENTITY(1,1) PRIMARY KEY,
        Email      NVARCHAR(100)  NOT NULL,
        OtpCode    NVARCHAR(10)   NOT NULL,
        ExpiryTime DATETIME2      NOT NULL,
        Status     NVARCHAR(20)   NOT NULL DEFAULT 'Pending',  -- Pending | Used | Expired
        CreatedAt  DATETIME2      NOT NULL DEFAULT GETUTCDATE()
    );

    CREATE INDEX IX_EmailOtp_Email ON UserEmailOtpGenerate(Email);
END
GO

-- ============================================================
-- 3. Categories
-- ============================================================
IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'Categories')
BEGIN
    CREATE TABLE Categories (
        CategoryId INT IDENTITY(1,1) PRIMARY KEY,
        Name       NVARCHAR(100) NOT NULL,
        IsActive   BIT           NOT NULL DEFAULT 1
    );

    -- Seed categories
    INSERT INTO Categories (Name) VALUES
        ('Birthday'),
        ('Marriage'),
        ('First Holy Communion');
END
GO

-- ============================================================
-- 4. Drop and recreate Templates (schema completely changed)
-- ============================================================
IF EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'Templates')
BEGIN
    DROP TABLE Templates;
END
GO

CREATE TABLE Templates (
    TemplateId      INT IDENTITY(1,1) PRIMARY KEY,
    Name            NVARCHAR(200)  NOT NULL,
    CategoryId      INT            NOT NULL,
    IsPaid          BIT            NOT NULL DEFAULT 0,
    Price           DECIMAL(10,2)  NULL,
    TemplateHtml    NVARCHAR(MAX)  NOT NULL,
    TemplateCss     NVARCHAR(MAX)  NULL,
    TemplateJs      NVARCHAR(MAX)  NULL,
    SchemaJson      NVARCHAR(MAX)  NOT NULL,
    PreviewImageUrl NVARCHAR(500)  NULL,
    CreatedBy       INT            NOT NULL,
    CreatedDate     DATETIME2      NOT NULL DEFAULT GETUTCDATE(),

    CONSTRAINT FK_Templates_Categories FOREIGN KEY (CategoryId) REFERENCES Categories(CategoryId),
    CONSTRAINT FK_Templates_Users      FOREIGN KEY (CreatedBy)  REFERENCES Users(Id)
);

CREATE INDEX IX_Templates_CategoryId ON Templates(CategoryId);
CREATE INDEX IX_Templates_IsPaid     ON Templates(IsPaid);
GO

-- ============================================================
-- 5. Sample template: Birthday (free)
-- ============================================================
-- Note: CreatedBy must be a valid admin user Id.
-- Run this AFTER creating your first admin user.
-- DECLARE @AdminId INT = (SELECT TOP 1 Id FROM Users WHERE Role = 'Admin');
-- IF @AdminId IS NOT NULL
-- BEGIN
--     INSERT INTO Templates (Name, CategoryId, IsPaid, Price, TemplateHtml, TemplateCss, TemplateJs, SchemaJson, CreatedBy)
--     VALUES (
--         'Classic Birthday Card', 1, 0, NULL,
--         '<!DOCTYPE html><html><head><meta charset="UTF-8"><style>{{css}}</style></head><body>
-- <div class="card">
--   <div class="banner">🎂 You are Invited!</div>
--   <h1 class="title">{{title}}</h1>
--   <p class="message">{{message}}</p>
--   <div class="details">
--     <p><strong>Date:</strong> {{date}}</p>
--     <p><strong>Venue:</strong> {{venue}}</p>
--   </div>
-- </div></body></html>',
--         '.card { max-width: 600px; margin: 40px auto; font-family: Georgia, serif; border: 2px solid #f6c90e; border-radius: 16px; padding: 32px; background: #fffdf0; }
-- .banner { font-size: 1.3rem; color: #c98a00; margin-bottom: 12px; }
-- .title { font-size: 2rem; color: #222; margin: 0 0 16px; }
-- .message { font-size: 1.1rem; color: #555; line-height: 1.6; }
-- .details { margin-top: 24px; background: #fff7cc; padding: 16px; border-radius: 8px; }',
--         NULL,
--         '[{"key":"title","label":"Event Title","type":"text","required":true},{"key":"message","label":"Personal Message","type":"textarea","required":true},{"key":"date","label":"Event Date","type":"date","required":true},{"key":"venue","label":"Venue","type":"text","required":true}]',
--         @AdminId
--     );
-- END
-- GO

-- ============================================================
-- 6. Payments table for Razorpay integration
-- ============================================================
IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'Payments')
BEGIN
    CREATE TABLE Payments (
        PaymentId       INT IDENTITY(1,1) PRIMARY KEY,
        UserId          INT            NOT NULL,
        TemplateId      INT            NULL,
        RazorpayOrderId NVARCHAR(100)  NULL,
        RazorpayPaymentId NVARCHAR(100) NULL,
        RazorpaySignature NVARCHAR(200) NULL,
        Amount          DECIMAL(10,2)  NOT NULL,
        Currency        NVARCHAR(10)   NOT NULL DEFAULT 'INR',
        Status          NVARCHAR(20)   NOT NULL DEFAULT 'Pending', -- Pending | Completed | Failed | Cancelled
        SubscriptionTierPurchased NVARCHAR(20) NULL, -- Premium, Enterprise, etc.
        TransactionDate DATETIME2      NOT NULL DEFAULT GETUTCDATE(),
        CompletionDate  DATETIME2      NULL,

        CONSTRAINT FK_Payments_Users FOREIGN KEY (UserId) REFERENCES Users(Id) ON DELETE CASCADE,
        CONSTRAINT FK_Payments_Templates FOREIGN KEY (TemplateId) REFERENCES Templates(TemplateId) ON DELETE SET NULL
    );

    CREATE INDEX IX_Payments_UserId ON Payments(UserId);
    CREATE INDEX IX_Payments_Status ON Payments(Status);
    CREATE INDEX IX_Payments_TransactionDate ON Payments(TransactionDate);
END
GO

-- ============================================================
-- 7. PaymentOtps table for payment verification
-- ============================================================
IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'PaymentOtps')
BEGIN
    CREATE TABLE PaymentOtps (
        Id          INT IDENTITY(1,1) PRIMARY KEY,
        UserId      INT            NOT NULL,
        Email       NVARCHAR(100)  NOT NULL,
        OtpCode     NVARCHAR(10)   NOT NULL,
        ExpiryTime  DATETIME2      NOT NULL,
        Status      NVARCHAR(20)   NOT NULL DEFAULT 'Pending', -- Pending | Used | Expired
        CreatedAt   DATETIME2      NOT NULL DEFAULT GETUTCDATE(),

        CONSTRAINT FK_PaymentOtps_Users FOREIGN KEY (UserId) REFERENCES Users(Id) ON DELETE CASCADE
    );

    CREATE INDEX IX_PaymentOtps_UserId ON PaymentOtps(UserId);
    CREATE INDEX IX_PaymentOtps_Email ON PaymentOtps(Email);
    CREATE INDEX IX_PaymentOtps_Status ON PaymentOtps(Status);
END
GO

-- ============================================================
-- 8. Indexes for performance optimization
-- ============================================================
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_Users_IsVerified' AND object_id = OBJECT_ID('Users'))
    CREATE INDEX IX_Users_IsVerified ON Users(IsVerified);
GO

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_Users_SubscriptionTier' AND object_id = OBJECT_ID('Users'))
    CREATE INDEX IX_Users_SubscriptionTier ON Users(SubscriptionTier);
GO

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_UserEmailOtpGenerate_Status' AND object_id = OBJECT_ID('UserEmailOtpGenerate'))
    CREATE INDEX IX_UserEmailOtpGenerate_Status ON UserEmailOtpGenerate(Status);
GO

-- ============================================================
-- 9. Schema initialization complete
-- ============================================================
PRINT 'V2 Schema upgrade completed successfully!'
GO
