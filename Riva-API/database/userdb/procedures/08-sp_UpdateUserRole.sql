-- Stored Procedure: Update user role
CREATE PROCEDURE sp_UpdateUserRole
    @UserId INT,
    @NewRole NVARCHAR(20)
AS
BEGIN
    BEGIN TRY
        IF NOT EXISTS (SELECT 1 FROM Users WHERE Id = @UserId)
        BEGIN
            RAISERROR('User not found', 16, 1);
            RETURN 1;
        END

        IF @NewRole NOT IN ('User', 'Admin', 'Moderator', 'Guest')
        BEGIN
            RAISERROR('Invalid role specified', 16, 1);
            RETURN 1;
        END

        UPDATE Users
        SET Role = @NewRole,
            UpdatedAt = GETUTCDATE()
        WHERE Id = @UserId;

        SELECT 'User role updated successfully' AS Message;
    END TRY
    BEGIN CATCH
        RAISERROR('Error updating user role', 16, 1);
        RETURN 1;
    END CATCH
END;
GO