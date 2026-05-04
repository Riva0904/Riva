-- sp_MakeTemplatePublic.sql
CREATE PROCEDURE [dbo].[sp_MakeTemplatePublic]
    @TemplateId INT,
    @UserId INT
AS
BEGIN
    -- Verify ownership
    IF EXISTS (SELECT 1 FROM Templates WHERE Id = @TemplateId AND UserId = @UserId)
    BEGIN
        UPDATE [dbo].[Templates]
        SET IsPublic = 1
        WHERE Id = @TemplateId AND UserId = @UserId;

        SELECT 'Template made public successfully' AS Message, ShareToken
        FROM Templates
        WHERE Id = @TemplateId;
    END
    ELSE
    BEGIN
        RAISERROR('Template not found or access denied', 16, 1);
    END
END;