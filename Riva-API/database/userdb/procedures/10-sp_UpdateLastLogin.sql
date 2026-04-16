-- Stored Procedure: Update last login time
CREATE PROCEDURE sp_UpdateLastLogin
    @UserId INT
AS
BEGIN
    BEGIN TRY
        UPDATE Users
        SET LastLoginAt = GETUTCDATE()
        WHERE Id = @UserId;

        SELECT 'Last login updated successfully' AS Message;
    END TRY
    BEGIN CATCH
        RAISERROR('Error updating last login', 16, 1);
        RETURN 1;
    END CATCH
END;
GO