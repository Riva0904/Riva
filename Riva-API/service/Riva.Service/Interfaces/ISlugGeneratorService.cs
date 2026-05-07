namespace Riva.Service.Interfaces;

public interface ISlugGeneratorService
{
    /// <summary>
    /// Creates a URL-safe slug from <paramref name="title"/> plus a random suffix
    /// to guarantee uniqueness without a round-trip check.
    /// </summary>
    string Generate(string title);

    /// <summary>
    /// Converts a raw string to a slug (lowercase, hyphens, ASCII only).
    /// Does NOT add a uniqueness suffix.
    /// </summary>
    string Slugify(string input);
}
