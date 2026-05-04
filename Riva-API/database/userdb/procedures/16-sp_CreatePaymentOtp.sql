-- sp_CreatePaymentOtp.sql
CREATE PROCEDURE [dbo].[sp_CreatePaymentOtp]
    @PaymentId INT,
    @Code NVARCHAR(10),
    @ExpiresAt DATETIME2
AS
BEGIN
    INSERT INTO [dbo].[PaymentOtps] (
        [PaymentId], [Code], [ExpiresAt]
    )
    VALUES (
        @PaymentId, @Code, @ExpiresAt
    );

    SELECT SCOPE_IDENTITY() AS Id;
END;