-- Stored Procedure: Delete user
CREATE PROCEDURE sp_DeleteUser
    @UserId INT
AS
BEGIN
    BEGIN TRY
        IF NOT EXISTS (SELECT 1 FROM Users WHERE Id = @UserId)
        BEGIN
            RAISERROR('User not found', 16, 1);
            RETURN 1;
        END

        DELETE FROM AdminActions 
        WHERE AdminUserId = @UserId OR TargetUserId = @UserId;

        DELETE FROM Users 
        WHERE Id = @UserId;

        SELECT 'User deleted successfully' AS Message;
    END TRY
    BEGIN CATCH
        RAISERROR('Error deleting user', 16, 1);
        RETURN 1;
    END CATCH
END;
GO