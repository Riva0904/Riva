namespace Riva.Service.Interfaces;

public interface IPlaceholderService
{
    /// <summary>
    /// Replaces {{fieldName}} tokens in <paramref name="template"/> with values
    /// from <paramref name="fieldValues"/>.  Values are HTML-encoded for safety.
    /// </summary>
    string Replace(string template, IReadOnlyDictionary<string, string> fieldValues);

    /// <summary>
    /// Replaces {{fieldName}} tokens for media fields with their public URLs.
    /// Media fields use raw URLs (no HTML encoding) so they can be used in src= attributes.
    /// </summary>
    string ReplaceWithMedia(string template,
        IReadOnlyDictionary<string, string> fieldValues,
        IReadOnlyDictionary<string, string> mediaUrls);

    /// <summary>
    /// Replaces {{fieldName}} tokens inside JavaScript code.
    /// Values are JS-string-escaped (quotes and backslashes) instead of HTML-encoded.
    /// </summary>
    string ReplaceForJs(string jsTemplate,
        IReadOnlyDictionary<string, string> fieldValues,
        IReadOnlyDictionary<string, string> mediaUrls);
}
