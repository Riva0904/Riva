namespace Riva.Service.Interfaces;

public interface IMediaUploadService
{
    /// <summary>
    /// Saves the uploaded file and returns its public URL.
    /// Validates MIME type and file size before saving.
    /// </summary>
    Task<(string fileUrl, string storedName)> UploadAsync(
        Stream fileStream,
        string originalFileName,
        string mimeType,
        string folder = "invitations");

    /// <summary>Deletes a previously uploaded file by its stored name.</summary>
    Task DeleteAsync(string storedName, string folder = "invitations");
}
