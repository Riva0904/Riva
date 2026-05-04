-- sp_UpdatePaymentStatus.sql
CREATE PROCEDURE [dbo].[sp_UpdatePaymentStatus]
    @Id INT,
    @Status NVARCHAR(20),
    @RazorpayOrderId NVARCHAR(100) = NULL,
    @RazorpayPaymentId NVARCHAR(100) = NULL,
    @RazorpaySignature NVARCHAR(200) = NULL
AS
BEGIN
    UPDATE [dbo].[Payments]
    SET [Status] = @Status,
        [RazorpayOrderId] = @RazorpayOrderId,
        [RazorpayPaymentId] = @RazorpayPaymentId,
        [RazorpaySignature] = @RazorpaySignature,
        [UpdatedAt] = GETUTCDATE()
    WHERE [Id] = @Id;
END;