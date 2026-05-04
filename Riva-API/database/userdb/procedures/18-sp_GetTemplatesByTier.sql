-- sp_GetTemplatesByTier.sql
CREATE PROCEDURE [dbo].[sp_GetTemplatesByTier]
    @UserTier NVARCHAR(20) = 'Free'
AS
BEGIN
    SELECT
        tc.TemplateId,
        tc.Name,
        tc.Description,
        tc.ImageUrl,
        tc.Tier,
        tc.MaxPhotos,
        tc.SortOrder
    FROM TemplateCategories tc
    WHERE tc.IsActive = 1
    AND (tc.Tier = 'Free' OR tc.Tier = @UserTier)
    ORDER BY tc.SortOrder, tc.TemplateId;
END;