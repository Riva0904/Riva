using System.Net;
using System.Text.RegularExpressions;
using Riva.Service.Interfaces;

namespace Riva.Api.Services;

/// <summary>
/// Replaces {{fieldName}} tokens in template HTML with user-supplied values.
/// If a token has no value, it is left as-is (preserves CSS/JS correctness).
/// Media URLs are inserted raw so they can appear inside src= attributes.
/// </summary>
public partial class PlaceholderService : IPlaceholderService
{
    [GeneratedRegex(@"\{\{(\w+)\}\}", RegexOptions.Compiled)]
    private static partial Regex TokenRegex();

    public string Replace(string template, IReadOnlyDictionary<string, string> fieldValues)
    {
        if (string.IsNullOrEmpty(template)) return template;

        return TokenRegex().Replace(template, match =>
        {
            var key = match.Groups[1].Value;
            return fieldValues.TryGetValue(key, out var val)
                ? WebUtility.HtmlEncode(val)
                : string.Empty;   // empty for unfilled tokens on the public page
        });
    }

    public string ReplaceWithMedia(string template,
        IReadOnlyDictionary<string, string> fieldValues,
        IReadOnlyDictionary<string, string> mediaUrls)
    {
        if (string.IsNullOrEmpty(template)) return template;

        return TokenRegex().Replace(template, match =>
        {
            var key = match.Groups[1].Value;

            // Media URL — insert raw (used in src= attributes)
            if (mediaUrls.TryGetValue(key, out var mediaUrl) && !string.IsNullOrEmpty(mediaUrl))
                return mediaUrl;

            // Text value — HTML-encode for safety
            if (fieldValues.TryGetValue(key, out var val) && !string.IsNullOrEmpty(val))
                return WebUtility.HtmlEncode(val);

            // Nothing filled — return empty so design CSS still renders correctly
            return string.Empty;
        });
    }
}
