-- Stored Procedure: Log admin action
CREATE PROCEDURE sp_LogAdminAction
    @AdminUserId INT,
    @Action NVARCHAR(100),
    @TargetUserId INT = NULL,
    @Details NVARCHAR(MAX) = NULL,
    @IpAddress NVARCHAR(50) = NULL
AS
BEGIN
    BEGIN TRY
        INSERT INTO AdminActions (AdminUserId, Action, TargetUserId, Details, IpAddress)
        VALUES (@AdminUserId, @Action, @TargetUserId, @Details, @IpAddress);

        SELECT 'Action logged successfully' AS Message;
    END TRY
    BEGIN CATCH
        RAISERROR('Error logging admin action', 16, 1);
        RETURN 1;
    END CATCH
END;
GO
GO