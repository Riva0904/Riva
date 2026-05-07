-- ================================================================
-- Riva V5 Migration: RSVP System
-- Run against RivaDb database
-- ================================================================

USE RivaDb;
GO

IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME='InvitationRsvps')
BEGIN
    CREATE TABLE InvitationRsvps (
        RsvpId          INT IDENTITY(1,1) PRIMARY KEY,
        InvitationId    INT            NOT NULL,
        GuestName       NVARCHAR(200)  NOT NULL,
        GuestEmail      NVARCHAR(300)  NULL,
        GuestPhone      NVARCHAR(50)   NULL,
        Status          NVARCHAR(20)   NOT NULL DEFAULT 'Pending', -- Accepted | Declined | Maybe | Pending
        GuestCount      INT            NOT NULL DEFAULT 1,         -- number of people attending
        Message         NVARCHAR(500)  NULL,                       -- guest's personal note
        RespondedAt     DATETIME2      NOT NULL DEFAULT GETUTCDATE(),
        IpAddress       NVARCHAR(50)   NULL,
        CONSTRAINT FK_InvitationRsvps_Invitations FOREIGN KEY (InvitationId)
            REFERENCES InvitationInstances(InvitationId) ON DELETE CASCADE
    );
    CREATE INDEX IX_InvitationRsvps_InvitationId ON InvitationRsvps(InvitationId);
    CREATE INDEX IX_InvitationRsvps_Status       ON InvitationRsvps(Status);
END
GO

PRINT 'V5 RSVP migration complete.';
GO
