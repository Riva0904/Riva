-- sp_CreatePayment.sql
CREATE PROCEDURE [dbo].[sp_CreatePayment]
    @UserId INT,
    @Amount DECIMAL(18,2),
    @Currency NVARCHAR(10) = 'INR',
    @Notes NVARCHAR(MAX) = NULL
AS
BEGIN
    INSERT INTO [dbo].[Payments] (
        [UserId], [Amount], [Currency], [Notes]
    )
    VALUES (
        @UserId, @Amount, @Currency, @Notes
    );

    SELECT SCOPE_IDENTITY() AS Id;
END;