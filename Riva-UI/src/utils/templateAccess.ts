import type { NavigateFunction } from 'react-router-dom';
import { getStoredAuthToken } from '../api/client';
import { checkTemplateAccess } from '../api/subscriptions';
import type { TemplateListItem } from '../api/templates';

/**
 * Unified "Use Template" logic used on every page.
 * - Not logged in         → /login
 * - Free template         → /invitation/new/{id}
 * - Paid + has access     → /invitation/new/{id}
 * - Paid + no access      → open payment modal via setPayTemplate
 */
export async function handleUseTemplate(
  template: TemplateListItem,
  navigate: NavigateFunction,
  setPayTemplate: (t: TemplateListItem) => void,
): Promise<void> {
  if (!getStoredAuthToken()) {
    navigate('/login');
    return;
  }

  if (template.tierType === 'Free' || !template.isPaid) {
    navigate(`/invitation/new/${template.templateId}`);
    return;
  }

  try {
    const { hasAccess } = await checkTemplateAccess(template.templateId);
    if (hasAccess) {
      navigate(`/invitation/new/${template.templateId}`);
      return;
    }
  } catch {
    // fall through to payment modal
  }

  setPayTemplate(template);
}
