import type { NavigateFunction } from 'react-router-dom';
import { getStoredAuthToken } from '../api/client';
import { getStoredRole } from '../api/auth';
import { checkTemplateAccess } from '../api/subscriptions';
import type { TemplateListItem } from '../api/templates';

export async function handleUseTemplate(
  template: TemplateListItem,
  navigate: NavigateFunction,
  setPayTemplate: (t: TemplateListItem) => void,
): Promise<void> {
  if (!getStoredAuthToken()) { navigate('/login'); return; }

  // Admin users go to the admin template editor, not invitation creation
  if (getStoredRole() === 'Admin') {
    navigate('/admin');
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
