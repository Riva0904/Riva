-- Templates Table
CREATE TABLE [dbo].[Templates] (
    [Id] INT IDENTITY(1,1) PRIMARY KEY,
    [TemplateId] INT NOT NULL, -- Reference to predefined template
    [Title] NVARCHAR(255) NOT NULL,
    [RecipientName] NVARCHAR(255),
    [Greeting] NVARCHAR(500),
    [Location] NVARCHAR(255),
    [EventDate] DATETIME2,
    [PersonalMessage] NVARCHAR(MAX),
    [IncludeGoogleMaps] BIT DEFAULT 0,
    [Tier] NVARCHAR(20) DEFAULT 'Free',
    [MaxPhotos] INT DEFAULT 3,
    [ShareToken] NVARCHAR(100) UNIQUE,
    [IsPublic] BIT DEFAULT 0,
    [ViewCount] INT DEFAULT 0,
    [CreatedAt] DATETIME2 DEFAULT GETUTCDATE(),
    [UserId] INT NULL, -- Nullable for public submissions
    FOREIGN KEY ([UserId]) REFERENCES [dbo].[Users]([Id])
);