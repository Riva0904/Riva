import { apiFetch, getStoredAuthToken } from './client';

const LOCAL_KEY = 'riva_wishlist_ids';

// ── Local storage fallback ────────────────────────────────────────────────────
const localGet = (): number[] => {
  try { return JSON.parse(localStorage.getItem(LOCAL_KEY) || '[]'); }
  catch { return []; }
};
const localSet = (ids: number[]) => localStorage.setItem(LOCAL_KEY, JSON.stringify(ids));

// ── API calls (only when logged in) ──────────────────────────────────────────
export async function fetchWishlistIds(): Promise<number[]> {
  if (!getStoredAuthToken()) return localGet();
  try {
    const { templateIds } = await apiFetch<{ templateIds: number[] }>('wishlist');
    localSet(templateIds);
    return templateIds;
  } catch {
    return localGet();
  }
}

export async function toggleWishlist(templateId: number): Promise<boolean> {
  if (!getStoredAuthToken()) {
    const ids = localGet();
    const idx = ids.indexOf(templateId);
    let added: boolean;
    if (idx === -1) { ids.push(templateId); added = true; }
    else            { ids.splice(idx, 1);   added = false; }
    localSet(ids);
    return added;
  }
  try {
    const { added } = await apiFetch<{ added: boolean }>(`wishlist/toggle/${templateId}`, { method: 'POST' });
    // Sync local copy
    const ids = localGet();
    if (added && !ids.includes(templateId)) ids.push(templateId);
    if (!added) { const i = ids.indexOf(templateId); if (i !== -1) ids.splice(i, 1); }
    localSet(ids);
    return added;
  } catch {
    return false;
  }
}
