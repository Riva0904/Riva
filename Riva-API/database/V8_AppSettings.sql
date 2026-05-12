-- V8: App Settings table for admin-controlled global config (e.g. theme colors)

IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'AppSettings')
BEGIN
    CREATE TABLE AppSettings (
        Id        INT           IDENTITY(1,1) PRIMARY KEY,
        [Key]     NVARCHAR(100) NOT NULL,
        [Value]   NVARCHAR(500) NOT NULL,
        UpdatedAt DATETIME2     NOT NULL DEFAULT GETUTCDATE(),
        CONSTRAINT UQ_AppSettings_Key UNIQUE ([Key])
    );

    -- Default theme: Riva green
    INSERT INTO AppSettings ([Key], [Value]) VALUES ('theme.primaryColor',   '#16a34a');
    INSERT INTO AppSettings ([Key], [Value]) VALUES ('theme.secondaryColor', '#059669');

    PRINT 'AppSettings table created with default theme.';
END
GO
