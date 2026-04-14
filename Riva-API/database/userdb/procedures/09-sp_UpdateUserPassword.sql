-- Stored Procedure: Update user password
CREATE PROCEDURE sp_UpdateUserPassword
    @UserId INT,
    @NewPasswordHash NVARCHAR(255)
AS
BEGIN
    BEGIN TRY
        IF NOT EXISTS (SELECT 1 FROM Users WHERE Id = @UserId)
        BEGIN
            RAISERROR('User not found', 16, 1);
            RETURN 1;
        END

        UPDATE Users
        SET PasswordHash = @NewPasswordHash,
            UpdatedAt = GETUTCDATE()
        WHERE Id = @UserId;

        SELECT 'Password updated successfully' AS Message;
    END TRY
    BEGIN CATCH
        RAISERROR('Error updating password', 16, 1);
        RETURN 1;
    END CATCH
END;
GO