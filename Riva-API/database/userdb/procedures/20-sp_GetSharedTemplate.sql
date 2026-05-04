-- sp_GetSharedTemplate.sql
CREATE PROCEDURE [dbo].[sp_GetSharedTemplate]
    @ShareToken NVARCHAR(100)
AS
BEGIN
    -- Update view count
    UPDATE [dbo].[Templates]
    SET ViewCount = ViewCount + 1
    WHERE ShareToken = @ShareToken AND IsPublic = 1;

    -- Return template data
    SELECT
        t.Id,
        t.TemplateId,
        t.Title,
        t.RecipientName,
        t.Greeting,
        t.Location,
        t.EventDate,
        t.PersonalMessage,
        t.IncludeGoogleMaps,
        t.ViewCount,
        t.CreatedAt,
        u.Username as CreatorName
    FROM [dbo].[Templates] t
    LEFT JOIN [dbo].[Users] u ON t.UserId = u.Id
    WHERE t.ShareToken = @ShareToken AND t.IsPublic = 1;
END;