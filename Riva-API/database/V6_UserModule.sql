-- ================================================================
-- Riva V6 Migration: Enhanced User Module
-- Run against RivaDb database
-- ================================================================

USE RivaDb;
GO

-- ── 1. Add ProfileImageUrl to Users ────────────────────────────────
IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS
               WHERE TABLE_NAME='Users' AND COLUMN_NAME='ProfileImageUrl')
    ALTER TABLE Users ADD ProfileImageUrl NVARCHAR(1000) NULL;
GO

-- ── 2. Add Bio / Display Name ─────────────────────────────────────
IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS
               WHERE TABLE_NAME='Users' AND COLUMN_NAME='DisplayName')
    ALTER TABLE Users ADD DisplayName NVARCHAR(100) NULL;
GO

-- ── 3. Ensure LastLoginAt is updated on login (column already exists) ──
-- LoginCommandHandler handles this; column already present.

-- ── 4. Add IsActive column to Categories (if missing) ──────────────
IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS
               WHERE TABLE_NAME='Categories' AND COLUMN_NAME='IsActive')
    ALTER TABLE Categories ADD IsActive BIT NOT NULL DEFAULT 1;
GO

-- ── 5. Ensure SortOrder on Categories ──────────────────────────────
IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS
               WHERE TABLE_NAME='Categories' AND COLUMN_NAME='SortOrder')
    ALTER TABLE Categories ADD SortOrder INT NOT NULL DEFAULT 0;
GO

PRINT 'V6 UserModule migration complete.';
GO
