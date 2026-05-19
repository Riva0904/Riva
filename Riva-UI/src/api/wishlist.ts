import { apiFetch, getStoredAuthToken } from './client';

const LOCAL_KEY = 'riva_wishlist_ids';

// ── Local cache helpers (used only for logged-in users) ───────────────────────
const localGet = (): number[] => {
  try { return JSON.parse(localStorage.getItem(LOCAL_KEY) || '[]'); }
  catch { return []; }
};
const localSet = (ids: number[]) => localStorage.setItem(LOCAL_KEY, JSON.stringify(ids));

// ── API calls ─────────────────────────────────────────────────────────────────

/** Returns wishlist IDs for the logged-in user. Guests always get []. */
export async function fetchWishlistIds(): Promise<number[]> {
  if (!getStoredAuthToken()) return [];          // guests have no wishlist
  try {
    const { templateIds } = await apiFetch<{ templateIds: number[] }>('wishlist');
    localSet(templateIds);
    return templateIds;
  } catch {
    return [];
  }
}

/**
 * Toggle a template in the wishlist.
 * Throws if the user is not authenticated — callers must guard before calling.
 */
export async function toggleWishlist(templateId: number): Promise<boolean> {
  if (!getStoredAuthToken()) {
    throw new Error('AUTH_REQUIRED');
  }
  try {
    const { added } = await apiFetch<{ added: boolean }>(`wishlist/toggle/${templateId}`, { method: 'POST' });
    // Keep local cache in sync
    const ids = localGet();
    if (added && !ids.includes(templateId)) ids.push(templateId);
    if (!added) { const i = ids.indexOf(templateId); if (i !== -1) ids.splice(i, 1); }
    localSet(ids);
    return added;
  } catch (err) {
    throw err;
  }
}
