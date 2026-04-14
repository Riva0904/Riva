-- Stored Procedure: Search users by criteria
CREATE PROCEDURE sp_SearchUsers
    @SearchTerm NVARCHAR(100) = NULL,
    @Role NVARCHAR(20) = NULL,
    @IsActive BIT = NULL,
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
    WHERE 
        (@SearchTerm IS NULL OR Username LIKE '%' + @SearchTerm + '%' OR Email LIKE '%' + @SearchTerm + '%')
        AND (@Role IS NULL OR Role = @Role)
        AND (@IsActive IS NULL OR IsActive = @IsActive)
    ORDER BY CreatedAt DESC
    OFFSET @SkipRows ROWS
    FETCH NEXT @PageSize ROWS ONLY;

    SELECT COUNT(*) AS TotalCount FROM Users
    WHERE 
        (@SearchTerm IS NULL OR Username LIKE '%' + @SearchTerm + '%' OR Email LIKE '%' + @SearchTerm + '%')
        AND (@Role IS NULL OR Role = @Role)
        AND (@IsActive IS NULL OR IsActive = @IsActive);
END;
GO