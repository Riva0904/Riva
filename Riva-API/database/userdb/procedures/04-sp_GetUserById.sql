-- Stored Procedure: Get user by ID
CREATE PROCEDURE sp_GetUserById
    @UserId INT
AS
BEGIN
    SELECT 
        Id,
        Username,
        Email,
        Role,
        IsActive,
        CreatedAt,
        UpdatedAt,
        LastLoginAt
    FROM Users
    WHERE Id = @UserId;
END;
GO