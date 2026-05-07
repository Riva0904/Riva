using System.Globalization;
using System.Text;
using System.Text.RegularExpressions;
using Riva.Service.Interfaces;

namespace Riva.Api.Services;

public partial class SlugGeneratorService : ISlugGeneratorService
{
    [GeneratedRegex(@"[^a-z0-9\-]")]
    private static partial Regex NonSlugChars();

    [GeneratedRegex(@"-{2,}")]
    private static partial Regex MultipleHyphens();

    public string Generate(string title)
    {
        var slug = Slugify(title);
        // Append a short random suffix for guaranteed uniqueness without DB check overhead
        var suffix = Convert.ToHexString(Guid.NewGuid().ToByteArray())[..8].ToLowerInvariant();
        return $"{slug}-{suffix}";
    }

    public string Slugify(string input)
    {
        if (string.IsNullOrWhiteSpace(input)) return "invitation";

        // Normalise unicode to ASCII equivalents
        var normalised = input.Normalize(NormalizationForm.FormD);
        var ascii = new StringBuilder();
        foreach (var c in normalised)
        {
            if (CharUnicodeInfo.GetUnicodeCategory(c) != UnicodeCategory.NonSpacingMark)
                ascii.Append(c);
        }

        var slug = ascii.ToString()
            .ToLowerInvariant()
            .Replace(' ', '-')
            .Replace("_", "-");

        slug = NonSlugChars().Replace(slug, string.Empty);
        slug = MultipleHyphens().Replace(slug, "-");
        slug = slug.Trim('-');

        return string.IsNullOrEmpty(slug) ? "invitation" : slug[..Math.Min(slug.Length, 80)];
    }
}
