-- sp_CreateTemplate.sql
CREATE PROCEDURE [dbo].[sp_CreateTemplate]
    @TemplateId INT,
    @Title NVARCHAR(255),
    @RecipientName NVARCHAR(255) = NULL,
    @Greeting NVARCHAR(500) = NULL,
    @Location NVARCHAR(255) = NULL,
    @EventDate DATETIME2 = NULL,
    @PersonalMessage NVARCHAR(MAX) = NULL,
    @IncludeGoogleMaps BIT = 0,
    @UserId INT = NULL,
    @ShareToken NVARCHAR(100) = NULL
AS
BEGIN
    -- Generate share token if not provided
    IF @ShareToken IS NULL
    BEGIN
        SET @ShareToken = LOWER(NEWID());
    END

    INSERT INTO [dbo].[Templates] (
        [TemplateId], [Title], [RecipientName], [Greeting], [Location], [EventDate], [PersonalMessage], [IncludeGoogleMaps], [UserId], [ShareToken]
    )
    VALUES (
        @TemplateId, @Title, @RecipientName, @Greeting, @Location, @EventDate, @PersonalMessage, @IncludeGoogleMaps, @UserId, @ShareToken
    );

    SELECT SCOPE_IDENTITY() AS Id;
END;