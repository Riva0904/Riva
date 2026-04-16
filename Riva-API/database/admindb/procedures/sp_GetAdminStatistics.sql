-- Stored Procedure: Get admin activity statistics
CREATE PROCEDURE sp_GetAdminStatistics
    @DateFrom DATETIME2 = NULL
AS
BEGIN
    DECLARE @DefaultDate DATETIME2 = DATEADD(DAY, -30, GETUTCDATE());
    
    SELECT 
        COUNT(*) AS TotalActions,
        COUNT(DISTINCT AdminUserId) AS ActiveAdmins,
        COUNT(DISTINCT Action) AS UniqueActionTypes,
        MAX(Timestamp) AS LastActionTime,
        MIN(Timestamp) AS FirstActionTime
    FROM AdminActions
    WHERE Timestamp >= ISNULL(@DateFrom, @DefaultDate);

    -- Get top actions
    SELECT TOP 10
        Action,
        COUNT(*) AS ActionCount
    FROM AdminActions
    WHERE Timestamp >= ISNULL(@DateFrom, @DefaultDate)
    GROUP BY Action
    ORDER BY ActionCount DESC;
END;
GO