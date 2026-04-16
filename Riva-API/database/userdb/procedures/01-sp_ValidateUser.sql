-- Stored Procedure: Validate user credentials (for login)
-- Note: Password comparison should be done in application layer with BCrypt
CREATE PROCEDURE sp_ValidateUser
    @Username NVARCHAR(50)
AS
BEGIN
    SELECT 
        Id,
        Username,
        Email,
        PasswordHash,
        Role,
        IsActive
    FROM Users
    WHERE Username = @Username AND IsActive = 1;
END;
GO