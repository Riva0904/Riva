-- Stored Procedure: Get user statistics
CREATE PROCEDURE sp_GetUserStatistics
AS
BEGIN
    SELECT 
        COUNT(*) AS TotalUsers,
        SUM(CASE WHEN IsActive = 1 THEN 1 ELSE 0 END) AS ActiveUsers,
        SUM(CASE WHEN IsActive = 0 THEN 1 ELSE 0 END) AS InactiveUsers,
        SUM(CASE WHEN Role = 'Admin' THEN 1 ELSE 0 END) AS AdminCount,
        SUM(CASE WHEN Role = 'User' THEN 1 ELSE 0 END) AS UserCount,
        SUM(CASE WHEN Role = 'Moderator' THEN 1 ELSE 0 END) AS ModeratorCount,
        SUM(CASE WHEN CAST(CreatedAt AS DATE) = CAST(GETUTCDATE() AS DATE) THEN 1 ELSE 0 END) AS NewUsersToday
    FROM Users;
END;
GO