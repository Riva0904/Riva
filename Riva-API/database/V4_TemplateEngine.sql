-- ================================================================
-- Riva V4 Migration: Dynamic Template Engine
-- Run against RivaDb database
-- ================================================================

USE RivaDb;
GO

-- ----------------------------------------------------------------
-- 1. Enhance existing Templates table
-- ----------------------------------------------------------------
IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME='Templates' AND COLUMN_NAME='Description')
    ALTER TABLE Templates ADD Description NVARCHAR(500) NULL;
GO
IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME='Templates' AND COLUMN_NAME='ThumbnailUrl')
    ALTER TABLE Templates ADD ThumbnailUrl NVARCHAR(1000) NULL;
GO
IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME='Templates' AND COLUMN_NAME='Status')
    ALTER TABLE Templates ADD Status NVARCHAR(20) NOT NULL DEFAULT 'Draft';  -- Draft | Published | Archived
GO
IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME='Templates' AND COLUMN_NAME='Version')
    ALTER TABLE Templates ADD Version INT NOT NULL DEFAULT 1;
GO
IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME='Templates' AND COLUMN_NAME='UpdatedDate')
    ALTER TABLE Templates ADD UpdatedDate DATETIME2 NULL;
GO
IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME='Templates' AND COLUMN_NAME='Tags')
    ALTER TABLE Templates ADD Tags NVARCHAR(500) NULL;
GO

-- Publish existing templates so they appear in the gallery
UPDATE Templates SET Status = 'Published' WHERE Status = 'Draft';
GO

-- ----------------------------------------------------------------
-- 2. TemplateVersions — audit trail for template edits
-- ----------------------------------------------------------------
IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME='TemplateVersions')
BEGIN
    CREATE TABLE TemplateVersions (
        VersionId    INT IDENTITY(1,1) PRIMARY KEY,
        TemplateId   INT            NOT NULL,
        Version      INT            NOT NULL,
        HtmlContent  NVARCHAR(MAX)  NULL,
        CssContent   NVARCHAR(MAX)  NULL,
        JsContent    NVARCHAR(MAX)  NULL,
        SchemaJson   NVARCHAR(MAX)  NULL,
        ChangedBy    NVARCHAR(200)  NULL,
        ChangeNote   NVARCHAR(500)  NULL,
        ChangedAt    DATETIME2      NOT NULL DEFAULT GETUTCDATE(),
        CONSTRAINT FK_TemplateVersions_Templates FOREIGN KEY (TemplateId)
            REFERENCES Templates(TemplateId) ON DELETE CASCADE
    );
    CREATE INDEX IX_TemplateVersions_TemplateId ON TemplateVersions(TemplateId);
END
GO

-- ----------------------------------------------------------------
-- 3. InvitationInstances — a user's customised copy of a template
-- ----------------------------------------------------------------
IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME='InvitationInstances')
BEGIN
    CREATE TABLE InvitationInstances (
        InvitationId     INT IDENTITY(1,1) PRIMARY KEY,
        UserId           INT            NOT NULL,
        TemplateId       INT            NOT NULL,
        Title            NVARCHAR(200)  NOT NULL,
        Slug             NVARCHAR(300)  NOT NULL,
        FieldValuesJson  NVARCHAR(MAX)  NOT NULL DEFAULT '{}',  -- {"title":"...", "message":"..."}
        Status           NVARCHAR(20)   NOT NULL DEFAULT 'Draft', -- Draft | Published
        IsPublic         BIT            NOT NULL DEFAULT 1,
        SeoTitle         NVARCHAR(200)  NULL,
        SeoDescription   NVARCHAR(500)  NULL,
        PublishedAt      DATETIME2      NULL,
        ExpiresAt        DATETIME2      NULL,
        ViewCount        INT            NOT NULL DEFAULT 0,
        CreatedAt        DATETIME2      NOT NULL DEFAULT GETUTCDATE(),
        UpdatedAt        DATETIME2      NULL,
        CONSTRAINT UQ_InvitationInstances_Slug UNIQUE (Slug),
        CONSTRAINT FK_InvitationInstances_Templates FOREIGN KEY (TemplateId)
            REFERENCES Templates(TemplateId)
    );
    CREATE INDEX IX_InvitationInstances_UserId    ON InvitationInstances(UserId);
    CREATE INDEX IX_InvitationInstances_TemplateId ON InvitationInstances(TemplateId);
    CREATE INDEX IX_InvitationInstances_Slug      ON InvitationInstances(Slug);
    CREATE INDEX IX_InvitationInstances_Status    ON InvitationInstances(Status);
END
GO

-- ----------------------------------------------------------------
-- 4. InvitationMedia — images / video / audio uploaded per invitation
-- ----------------------------------------------------------------
IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME='InvitationMedia')
BEGIN
    CREATE TABLE InvitationMedia (
        MediaId         INT IDENTITY(1,1) PRIMARY KEY,
        InvitationId    INT            NOT NULL,
        FieldName       NVARCHAR(100)  NOT NULL,   -- maps to SchemaJson field name
        OriginalName    NVARCHAR(300)  NOT NULL,
        StoredName      NVARCHAR(300)  NOT NULL,   -- GUID-based filename on disk / blob
        FileUrl         NVARCHAR(1000) NOT NULL,
        MediaType       NVARCHAR(50)   NOT NULL,   -- image | video | audio | document
        MimeType        NVARCHAR(100)  NOT NULL,
        FileSizeBytes   BIGINT         NOT NULL DEFAULT 0,
        UploadedAt      DATETIME2      NOT NULL DEFAULT GETUTCDATE(),
        CONSTRAINT FK_InvitationMedia_Invitations FOREIGN KEY (InvitationId)
            REFERENCES InvitationInstances(InvitationId) ON DELETE CASCADE
    );
    CREATE INDEX IX_InvitationMedia_InvitationId ON InvitationMedia(InvitationId);
END
GO

PRINT 'V4 TemplateEngine migration complete.';
GO
