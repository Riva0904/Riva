using Riva.Domain.Entity;

namespace Riva.Service.Interfaces;

public interface IHtmlRenderService
{
    /// <summary>
    /// Builds the complete HTML page for a published invitation.
    /// Injects CSS, JS, replaces placeholders, adds SEO meta tags.
    /// </summary>
    string RenderInvitation(InvitationInstance invitation, Template template);
}
