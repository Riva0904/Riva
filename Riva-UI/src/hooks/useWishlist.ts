import { useState, useEffect, useCallback } from 'react';
import { fetchWishlistIds, toggleWishlist } from '../api/wishlist';

export function useWishlist() {
  const [ids, setIds] = useState<Set<number>>(new Set());
  const [pending, setPending] = useState<Set<number>>(new Set());

  useEffect(() => {
    fetchWishlistIds().then(list => setIds(new Set(list)));
  }, []);

  const toggle = useCallback(async (templateId: number, e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (pending.has(templateId)) return;

    // Optimistic update
    setIds(prev => {
      const next = new Set(prev);
      if (next.has(templateId)) next.delete(templateId);
      else next.add(templateId);
      return next;
    });
    setPending(prev => new Set(prev).add(templateId));

    try {
      const added = await toggleWishlist(templateId);
      // Reconcile with server truth
      setIds(prev => {
        const next = new Set(prev);
        if (added) next.add(templateId); else next.delete(templateId);
        return next;
      });
    } catch {
      // Revert optimistic update on error
      setIds(prev => {
        const next = new Set(prev);
        if (next.has(templateId)) next.delete(templateId);
        else next.add(templateId);
        return next;
      });
    } finally {
      setPending(prev => { const n = new Set(prev); n.delete(templateId); return n; });
    }
  }, [pending]);

  return { wishlistIds: ids, toggleWishlist: toggle, isWishlisted: (id: number) => ids.has(id) };
}
