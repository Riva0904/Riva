-- PaymentOtps Table
CREATE TABLE [dbo].[PaymentOtps] (
    [Id] INT IDENTITY(1,1) PRIMARY KEY,
    [PaymentId] INT NOT NULL,
    [Code] NVARCHAR(10) NOT NULL,
    [ExpiresAt] DATETIME2 NOT NULL,
    [IsUsed] BIT NOT NULL DEFAULT 0,
    [CreatedAt] DATETIME2 DEFAULT GETUTCDATE(),
    FOREIGN KEY ([PaymentId]) REFERENCES [dbo].[Payments]([Id])
);