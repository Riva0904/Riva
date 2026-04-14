-- Stored Procedure: Get user by username (for login)
CREATE PROCEDURE sp_GetUserByUsername
    @Username NVARCHAR(50)
AS
BEGIN
    SELECT 
        Id,
        Username,
        Email,
        PasswordHash,
        Role,
        IsActive,
        CreatedAt,
        LastLoginAt
    FROM Users
    WHERE Username = @Username AND IsActive = 1;
END;
GO