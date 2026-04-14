using Microsoft.EntityFrameworkCore;
using Riva.Domain.Entity;

namespace Riva.Api;

public class RivaDbContext : DbContext
{
    public RivaDbContext(DbContextOptions<RivaDbContext> options) : base(options) { }

    public DbSet<User> Users { get; set; }
    public DbSet<AdminAction> AdminActions { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Configure User entity
        modelBuilder.Entity<User>()
            .HasMany(u => u.AdminActions)
            .WithOne(a => a.AdminUser)
            .HasForeignKey(a => a.AdminUserId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<User>()
            .HasMany(u => u.TargetAdminActions)
            .WithOne(a => a.TargetUser)
            .HasForeignKey(a => a.TargetUserId)
            .OnDelete(DeleteBehavior.SetNull);

        // Create indexes
        modelBuilder.Entity<User>()
            .HasIndex(u => u.Username);

        modelBuilder.Entity<User>()
            .HasIndex(u => u.Email);

        modelBuilder.Entity<User>()
            .HasIndex(u => u.Role);

        modelBuilder.Entity<User>()
            .HasIndex(u => u.IsActive);

        modelBuilder.Entity<AdminAction>()
            .HasIndex(a => a.AdminUserId);

        modelBuilder.Entity<AdminAction>()
            .HasIndex(a => a.Action);

        modelBuilder.Entity<AdminAction>()
            .HasIndex(a => a.Timestamp)
            .IsDescending();

        // Seed admin user
        modelBuilder.Entity<User>().HasData(new User
        {
            Id = 1,
            Username = "admin",
            Email = "admin@riva.com",
            PasswordHash = BCrypt.Net.BCrypt.HashPassword("admin123"),
            Role = "Admin",
            IsActive = true,
            CreatedAt = DateTime.UtcNow
        });
    }
}