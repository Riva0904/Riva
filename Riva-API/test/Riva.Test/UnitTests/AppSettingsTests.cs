using Microsoft.AspNetCore.Mvc;
using Moq;
using Riva.Api.Controllers;
using Riva.Service.Repository;

namespace Riva.Test.UnitTests;

public class AppSettingsControllerTests
{
    private readonly Mock<IAppSettingsRepository> _repo = new();

    private AppSettingsController CreateSut() => new(_repo.Object);

    // ── GetTheme ──────────────────────────────────────────────────────────────

    [Fact]
    public async Task GetTheme_ReturnsStoredValues_WhenTableHasData()
    {
        _repo.Setup(r => r.GetAsync("theme.colorStart")).ReturnsAsync("#b8860b");
        _repo.Setup(r => r.GetAsync("theme.colorEnd")).ReturnsAsync("#d4af37");
        _repo.Setup(r => r.GetAsync("theme.gradientDir")).ReturnsAsync("to right");
        _repo.Setup(r => r.GetAsync("theme.mode")).ReturnsAsync("dark");

        var result = await CreateSut().GetTheme() as OkObjectResult;

        Assert.NotNull(result);
        dynamic data = result!.Value!;
        Assert.Equal("#b8860b", (string)data.colorStart);
        Assert.Equal("#d4af37", (string)data.colorEnd);
        Assert.Equal("to right", (string)data.gradientDir);
        Assert.Equal("dark", (string)data.mode);
    }

    [Fact]
    public async Task GetTheme_ReturnsGreenDefaults_WhenTableIsEmpty()
    {
        _repo.Setup(r => r.GetAsync(It.IsAny<string>())).ReturnsAsync((string?)null);

        var result = await CreateSut().GetTheme() as OkObjectResult;

        Assert.NotNull(result);
        dynamic data = result!.Value!;
        Assert.Equal("#16a34a", (string)data.colorStart);
        Assert.Equal("#059669", (string)data.colorEnd);
        Assert.Equal("135deg",  (string)data.gradientDir);
        Assert.Equal("light",   (string)data.mode);
    }

    [Fact]
    public async Task GetTheme_ReturnsPartialDefaults_WhenOnlySomeKeysAreMissing()
    {
        _repo.Setup(r => r.GetAsync("theme.colorStart")).ReturnsAsync("#b8860b");
        _repo.Setup(r => r.GetAsync("theme.colorEnd")).ReturnsAsync((string?)null);
        _repo.Setup(r => r.GetAsync("theme.gradientDir")).ReturnsAsync((string?)null);
        _repo.Setup(r => r.GetAsync("theme.mode")).ReturnsAsync("dark");

        var result = await CreateSut().GetTheme() as OkObjectResult;

        Assert.NotNull(result);
        dynamic data = result!.Value!;
        Assert.Equal("#b8860b", (string)data.colorStart);
        Assert.Equal("#059669", (string)data.colorEnd);   // default
        Assert.Equal("135deg",  (string)data.gradientDir); // default
        Assert.Equal("dark",    (string)data.mode);
    }

    // ── SetTheme ──────────────────────────────────────────────────────────────

    [Fact]
    public async Task SetTheme_SavesAllFourKeys_WhenRequestIsValid()
    {
        var req = new ThemeRequest
        {
            ColorStart  = "#b8860b",
            ColorEnd    = "#d4af37",
            GradientDir = "to right",
            Mode        = "dark",
        };

        await CreateSut().SetTheme(req);

        _repo.Verify(r => r.SetAsync("theme.colorStart",  "#b8860b"),   Times.Once);
        _repo.Verify(r => r.SetAsync("theme.colorEnd",    "#d4af37"),   Times.Once);
        _repo.Verify(r => r.SetAsync("theme.gradientDir", "to right"),  Times.Once);
        _repo.Verify(r => r.SetAsync("theme.mode",        "dark"),      Times.Once);
    }

    [Fact]
    public async Task SetTheme_DefaultsGradientDirTo135deg_WhenNotProvided()
    {
        var req = new ThemeRequest { ColorStart = "#b8860b", ColorEnd = "#d4af37", GradientDir = null };

        await CreateSut().SetTheme(req);

        _repo.Verify(r => r.SetAsync("theme.gradientDir", "135deg"), Times.Once);
    }

    [Fact]
    public async Task SetTheme_DefaultsModeToLight_WhenInvalidModeProvided()
    {
        var req = new ThemeRequest { ColorStart = "#b8860b", ColorEnd = "#d4af37", Mode = "invalid" };

        await CreateSut().SetTheme(req);

        _repo.Verify(r => r.SetAsync("theme.mode", "light"), Times.Once);
    }

    [Fact]
    public async Task SetTheme_ReturnsBadRequest_WhenColorStartIsEmpty()
    {
        var req = new ThemeRequest { ColorStart = "", ColorEnd = "#d4af37" };

        var result = await CreateSut().SetTheme(req);

        Assert.IsType<BadRequestObjectResult>(result);
        _repo.Verify(r => r.SetAsync(It.IsAny<string>(), It.IsAny<string>()), Times.Never);
    }

    [Fact]
    public async Task SetTheme_ReturnsBadRequest_WhenColorEndIsEmpty()
    {
        var req = new ThemeRequest { ColorStart = "#b8860b", ColorEnd = "  " };

        var result = await CreateSut().SetTheme(req);

        Assert.IsType<BadRequestObjectResult>(result);
        _repo.Verify(r => r.SetAsync(It.IsAny<string>(), It.IsAny<string>()), Times.Never);
    }

    [Fact]
    public async Task SetTheme_ReturnsOk_WithEchoedColorStart()
    {
        var req = new ThemeRequest { ColorStart = "#b8860b", ColorEnd = "#d4af37" };

        var result = await CreateSut().SetTheme(req) as OkObjectResult;

        Assert.NotNull(result);
        dynamic data = result!.Value!;
        Assert.Equal("#b8860b", (string)data.colorStart);
    }

    [Fact]
    public async Task SetTheme_TrimsWhitespace_FromColorValues()
    {
        var req = new ThemeRequest { ColorStart = "  #b8860b  ", ColorEnd = "  #d4af37  " };

        await CreateSut().SetTheme(req);

        _repo.Verify(r => r.SetAsync("theme.colorStart", "#b8860b"), Times.Once);
        _repo.Verify(r => r.SetAsync("theme.colorEnd",   "#d4af37"), Times.Once);
    }

    // ── Round-trip ────────────────────────────────────────────────────────────

    [Fact]
    public async Task RoundTrip_SavedValuesAreReturnedOnNextGet()
    {
        var stored = new Dictionary<string, string>();

        _repo.Setup(r => r.SetAsync(It.IsAny<string>(), It.IsAny<string>()))
             .Callback<string, string>((k, v) => stored[k] = v)
             .Returns(Task.CompletedTask);

        _repo.Setup(r => r.GetAsync(It.IsAny<string>()))
             .ReturnsAsync((string key) => stored.TryGetValue(key, out var v) ? v : null);

        var sut = CreateSut();

        // Save
        await sut.SetTheme(new ThemeRequest
        {
            ColorStart  = "#800020",
            ColorEnd    = "#c0392b",
            GradientDir = "135deg",
            Mode        = "dark",
        });

        // Read back
        var getResult = await sut.GetTheme() as OkObjectResult;
        Assert.NotNull(getResult);
        dynamic data = getResult!.Value!;
        Assert.Equal("#800020", (string)data.colorStart);
        Assert.Equal("#c0392b", (string)data.colorEnd);
        Assert.Equal("dark",    (string)data.mode);
    }
}
