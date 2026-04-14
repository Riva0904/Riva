-- Stored Procedure: Get admin action logs
CREATE PROCEDURE sp_GetAdminActionLogs
    @AdminUserId INT = NULL,
    @Action NVARCHAR(100) = NULL,
    @DateFrom DATETIME2 = NULL,
    @DateTo DATETIME2 = NULL,
    @PageNumber INT = 1,
    @PageSize INT = 20
AS
BEGIN
    DECLARE @SkipRows INT = (@PageNumber - 1) * @PageSize;

    SELECT 
        Id,
        AdminUserId,
        Action,
        TargetUserId,
        Details,
        IpAddress,
        Timestamp
    FROM AdminActions
    WHERE 
        (@AdminUserId IS NULL OR AdminUserId = @AdminUserId)
        AND (@Action IS NULL OR Action = @Action)
        AND (@DateFrom IS NULL OR Timestamp >= @DateFrom)
        AND (@DateTo IS NULL OR Timestamp <= @DateTo)
    ORDER BY Timestamp DESC
    OFFSET @SkipRows ROWS
    FETCH NEXT @PageSize ROWS ONLY;

    -- Return total count
    SELECT COUNT(*) AS TotalCount FROM AdminActions
    WHERE 
        (@AdminUserId IS NULL OR AdminUserId = @AdminUserId)
        AND (@Action IS NULL OR Action = @Action)
        AND (@DateFrom IS NULL OR Timestamp >= @DateFrom)
        AND (@DateTo IS NULL OR Timestamp <= @DateTo);
END;
GO