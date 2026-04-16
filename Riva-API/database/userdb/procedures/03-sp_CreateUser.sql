-- Stored Procedure: Create new user (for registration)
CREATE PROCEDURE sp_CreateUser
    @Username NVARCHAR(50),
    @Email NVARCHAR(100),
    @PasswordHash NVARCHAR(255),
    @Role NVARCHAR(20) = 'User'
AS
BEGIN
    BEGIN TRY
        IF EXISTS (SELECT 1 FROM Users WHERE Username = @Username OR Email = @Email)
        BEGIN
            RAISERROR('Username or Email already exists', 16, 1);
            RETURN 1;
        END

        INSERT INTO Users (Username, Email, PasswordHash, Role, IsActive)
        VALUES (@Username, @Email, @PasswordHash, @Role, 1);

        SELECT SCOPE_IDENTITY() AS UserId;
    END TRY
    BEGIN CATCH
        RAISERROR('Error creating user', 16, 1);
        RETURN 1;
    END CATCH
END;
GO