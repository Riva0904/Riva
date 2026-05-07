-- ============================================================
-- Riva V3 Migration: Add Type column to UserEmailOtpGenerate
-- Run this against your RivaDb database
-- ============================================================

USE RivaDb;
GO

IF NOT EXISTS (
    SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_NAME = 'UserEmailOtpGenerate' AND COLUMN_NAME = 'Type'
)
BEGIN
    -- Existing rows automatically receive 'Registration' via the DEFAULT
    ALTER TABLE UserEmailOtpGenerate
        ADD Type NVARCHAR(20) NOT NULL DEFAULT 'Registration';
END
GO
