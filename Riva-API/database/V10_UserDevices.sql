-- V10: Track known user devices for new-device security alerts

IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'UserKnownDevices')
BEGIN
    CREATE TABLE UserKnownDevices (
        Id          INT           IDENTITY(1,1) PRIMARY KEY,
        UserId      INT           NOT NULL,
        DeviceHash  NVARCHAR(64)  NOT NULL,   -- SHA256 of UserAgent+IP
        DeviceLabel NVARCHAR(200) NULL,        -- human-readable hint
        FirstSeenAt DATETIME2     NOT NULL DEFAULT GETUTCDATE(),
        LastSeenAt  DATETIME2     NOT NULL DEFAULT GETUTCDATE(),
        CONSTRAINT FK_UserKnownDevices_Users FOREIGN KEY (UserId) REFERENCES Users(Id) ON DELETE CASCADE,
        CONSTRAINT UQ_UserDevice UNIQUE (UserId, DeviceHash)
    );

    CREATE INDEX IX_UserKnownDevices_UserId ON UserKnownDevices(UserId);
    PRINT 'UserKnownDevices table created.';
END
GO
