-- Stored Procedure: Get all users with pagination
CREATE PROCEDURE sp_GetAllUsers
    @PageNumber INT = 1,
    @PageSize INT = 10
AS
BEGIN
    DECLARE @SkipRows INT = (@PageNumber - 1) * @PageSize;

    SELECT 
        Id,
        Username,
        Email,
        Role,
        IsActive,
        CreatedAt,
        LastLoginAt
    FROM Users
    ORDER BY CreatedAt DESC
    OFFSET @SkipRows ROWS
    FETCH NEXT @PageSize ROWS ONLY;

    SELECT COUNT(*) AS TotalCount FROM Users;
END;
GO