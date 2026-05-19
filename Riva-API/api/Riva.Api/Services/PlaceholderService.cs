using System.Net;
using System.Text.Json;
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
            if (!fieldValues.TryGetValue(key, out var val)) return string.Empty;
            return IsHtmlEmbed(val) ? val : WebUtility.HtmlEncode(val);
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

            // HTML embed (e.g. Google Maps <iframe>) — insert raw
            if (fieldValues.TryGetValue(key, out var val) && !string.IsNullOrEmpty(val))
                return IsHtmlEmbed(val) ? val : WebUtility.HtmlEncode(val);

            return string.Empty;
        });
    }

    public string ReplaceForJs(string jsTemplate,
        IReadOnlyDictionary<string, string> fieldValues,
        IReadOnlyDictionary<string, string> mediaUrls)
    {
        if (string.IsNullOrEmpty(jsTemplate)) return jsTemplate;

        var withTokens = TokenRegex().Replace(jsTemplate, match =>
        {
            var key = match.Groups[1].Value;
            if (mediaUrls.TryGetValue(key, out var mediaUrl) && !string.IsNullOrEmpty(mediaUrl))
                return EscapeJs(mediaUrl);
            if (fieldValues.TryGetValue(key, out var val) && !string.IsNullOrEmpty(val))
                return EscapeJs(val);
            return string.Empty;
        });

        // Auto-replace const templateData = {...} for hardcoded templates
        return InjectTemplateData(withTokens, fieldValues, mediaUrls);
    }

    private static string InjectTemplateData(string js,
        IReadOnlyDictionary<string, string> fieldValues,
        IReadOnlyDictionary<string, string> mediaUrls)
    {
        const string marker = "const templateData";
        var startIdx = js.IndexOf(marker, StringComparison.Ordinal);
        if (startIdx == -1) return js;

        var openBrace = js.IndexOf('{', startIdx);
        if (openBrace == -1) return js;

        int depth = 1, i = openBrace + 1;
        while (i < js.Length && depth > 0)
        {
            if (js[i] == '{') depth++;
            else if (js[i] == '}') depth--;
            i++;
        }

        var allVals = new Dictionary<string, string>(fieldValues);
        foreach (var (k, v) in mediaUrls)
            if (!string.IsNullOrEmpty(v)) allVals[k] = v;

        var entries = string.Join(",\n", allVals
            .Where(kv => !string.IsNullOrEmpty(kv.Value))
            .Select(kv => $"  {kv.Key}: {JsonSerializer.Serialize(kv.Value)}"));

        return js[..startIdx] + $"const templateData = {{\n{entries}\n}}" + js[i..];
    }

    // JS-string escape: backslash, single-quote, double-quote, newlines
    private static string EscapeJs(string val)
        => val.Replace("\\", "\\\\")
              .Replace("'",  "\\'")
              .Replace("\"", "\\\"")
              .Replace("\r\n", "\\n")
              .Replace("\n",  "\\n")
              .Replace("\r",  "\\n");

    // Detects full HTML embed codes like <iframe ...> so they are not double-encoded
    private static bool IsHtmlEmbed(string val)
        => val.AsSpan().TrimStart().StartsWith("<", StringComparison.Ordinal);
}
