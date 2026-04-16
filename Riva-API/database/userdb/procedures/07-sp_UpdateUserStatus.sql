-- Stored Procedure: Update user status
CREATE PROCEDURE sp_UpdateUserStatus
    @UserId INT,
    @IsActive BIT
AS
BEGIN
    BEGIN TRY
        IF NOT EXISTS (SELECT 1 FROM Users WHERE Id = @UserId)
        BEGIN
            RAISERROR('User not found', 16, 1);
            RETURN 1;
        END

        UPDATE Users
        SET IsActive = @IsActive,
            UpdatedAt = GETUTCDATE()
        WHERE Id = @UserId;

        SELECT 'User status updated successfully' AS Message;
    END TRY
    BEGIN CATCH
        RAISERROR('Error updating user status', 16, 1);
        RETURN 1;
    END CATCH
END;
GO