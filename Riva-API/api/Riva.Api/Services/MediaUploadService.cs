using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using Riva.Service.Interfaces;

namespace Riva.Api.Services;

/// <summary>
/// Local-disk implementation of <see cref="IMediaUploadService"/>.
/// Swap for AzureBlobMediaUploadService when moving to production Azure.
/// Configuration key: "MediaStorage:BasePath" (defaults to wwwroot/uploads).
/// </summary>
public class MediaUploadService : IMediaUploadService
{
    private static readonly HashSet<string> AllowedMimeTypes = new(StringComparer.OrdinalIgnoreCase)
    {
        // Images
        "image/jpeg", "image/png", "image/gif", "image/webp", "image/svg+xml",
        // Video
        "video/mp4", "video/webm", "video/ogg",
        // Audio
        "audio/mpeg", "audio/ogg", "audio/wav", "audio/webm"
    };

    private const long MaxFileSizeBytes = 50 * 1024 * 1024; // 50 MB

    private readonly string _basePath;
    private readonly string _baseUrl;
    private readonly ILogger<MediaUploadService> _logger;

    public MediaUploadService(IConfiguration config, ILogger<MediaUploadService> logger)
    {
        _logger   = logger;
        _basePath = config["MediaStorage:BasePath"]
                    ?? Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "uploads");
        _baseUrl  = config["MediaStorage:BaseUrl"] ?? "/uploads";
    }

    public async Task<(string fileUrl, string storedName)> UploadAsync(
        Stream fileStream, string originalFileName, string mimeType, string folder = "invitations")
    {
        if (!AllowedMimeTypes.Contains(mimeType))
            throw new InvalidOperationException($"File type '{mimeType}' is not allowed.");

        if (fileStream.Length > MaxFileSizeBytes)
            throw new InvalidOperationException("File exceeds the 50 MB size limit.");

        var ext = Path.GetExtension(originalFileName).ToLowerInvariant();
        var storedName = $"{Guid.NewGuid():N}{ext}";
        var dir = Path.Combine(_basePath, folder);
        Directory.CreateDirectory(dir);

        var fullPath = Path.Combine(dir, storedName);
        await using var fs = File.Create(fullPath);
        await fileStream.CopyToAsync(fs);

        var fileUrl = $"{_baseUrl}/{folder}/{storedName}";
        _logger.LogInformation("Uploaded media {Original} → {StoredName}", originalFileName, storedName);

        return (fileUrl, storedName);
    }

    public Task DeleteAsync(string storedName, string folder = "invitations")
    {
        var fullPath = Path.Combine(_basePath, folder, storedName);
        if (File.Exists(fullPath))
        {
            File.Delete(fullPath);
            _logger.LogInformation("Deleted media {StoredName}", storedName);
        }
        return Task.CompletedTask;
    }
}
