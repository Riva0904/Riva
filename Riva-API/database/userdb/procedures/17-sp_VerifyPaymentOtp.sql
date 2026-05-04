-- sp_VerifyPaymentOtp.sql
CREATE PROCEDURE [dbo].[sp_VerifyPaymentOtp]
    @PaymentId INT,
    @Code NVARCHAR(10)
AS
BEGIN
    DECLARE @IsValid BIT = 0;
    DECLARE @OtpId INT;

    SELECT @OtpId = Id, @IsValid = CASE WHEN ExpiresAt > GETUTCDATE() AND IsUsed = 0 THEN 1 ELSE 0 END
    FROM [dbo].[PaymentOtps]
    WHERE PaymentId = @PaymentId AND Code = @Code;

    IF @IsValid = 1
    BEGIN
        UPDATE [dbo].[PaymentOtps] SET IsUsed = 1 WHERE Id = @OtpId;
    END

    SELECT @IsValid AS IsValid;
END;