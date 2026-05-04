-- Payments Table
CREATE TABLE [dbo].[Payments] (
    [Id] INT IDENTITY(1,1) PRIMARY KEY,
    [UserId] INT NOT NULL,
    [Amount] DECIMAL(18,2) NOT NULL,
    [Currency] NVARCHAR(10) NOT NULL DEFAULT 'INR',
    [Status] NVARCHAR(20) NOT NULL DEFAULT 'Pending',
    [RazorpayOrderId] NVARCHAR(100),
    [RazorpayPaymentId] NVARCHAR(100),
    [RazorpaySignature] NVARCHAR(200),
    [CreatedAt] DATETIME2 DEFAULT GETUTCDATE(),
    [UpdatedAt] DATETIME2,
    [Notes] NVARCHAR(MAX),
    FOREIGN KEY ([UserId]) REFERENCES [dbo].[Users]([Id])
);