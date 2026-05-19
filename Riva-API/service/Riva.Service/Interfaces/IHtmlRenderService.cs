using Riva.Domain.Entity;

namespace Riva.Service.Interfaces;

public interface IHtmlRenderService
{
    /// <summary>
    /// Builds the complete HTML page for a published invitation.
    /// Injects CSS, JS, replaces placeholders, adds SEO meta tags.
    /// </summary>
    /// <param name="showBranding">
    /// When true a "Made with Riva" footer is injected automatically.
    /// Free / Pro templates always receive branding; Premium templates never do.
    /// </param>
    string RenderInvitation(InvitationInstance invitation, Template template, bool showBranding = true);
}
