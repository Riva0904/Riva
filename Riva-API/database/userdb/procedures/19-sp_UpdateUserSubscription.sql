-- sp_UpdateUserSubscription.sql
CREATE PROCEDURE [dbo].[sp_UpdateUserSubscription]
    @UserId INT,
    @SubscriptionTier NVARCHAR(20),
    @SubscriptionExpiry DATETIME2 = NULL
AS
BEGIN
    UPDATE [dbo].[Users]
    SET SubscriptionTier = @SubscriptionTier,
        SubscriptionExpiry = @SubscriptionExpiry,
        UpdatedAt = GETUTCDATE()
    WHERE Id = @UserId;

    SELECT 'User subscription updated successfully' AS Message;
END;