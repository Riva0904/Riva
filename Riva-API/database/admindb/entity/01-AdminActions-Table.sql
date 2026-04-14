-- AdminActions table - logs all admin operations
CREATE TABLE AdminActions (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    AdminUserId INT NOT NULL,
    Action NVARCHAR(100) NOT NULL,
    TargetUserId INT NULL,
    Details NVARCHAR(MAX),
    IpAddress NVARCHAR(50),
    Timestamp DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    FOREIGN KEY (AdminUserId) REFERENCES Users(Id),
    FOREIGN KEY (TargetUserId) REFERENCES Users(Id)
);

-- Create indexes
CREATE INDEX idx_adminUserId ON AdminActions(AdminUserId);
CREATE INDEX idx_action ON AdminActions(Action);
CREATE INDEX idx_timestamp ON AdminActions(Timestamp DESC);