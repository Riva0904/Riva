import { useState, useEffect, useCallback, useRef, type MouseEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchWishlistIds, toggleWishlist as apiToggle } from '../api/wishlist';
import { getStoredAuthToken } from '../api/client';
import { getStoredRole } from '../api/auth';

export function useWishlist() {
  const navigate  = useNavigate();
  const isAdmin   = getStoredRole() === 'Admin';
  const [ids, setIds] = useState<Set<number>>(new Set());
  const inflightRef   = useRef<Set<number>>(new Set());

  useEffect(() => {
    if (isAdmin) return;
    fetchWishlistIds().then(list => setIds(new Set(list)));
  }, [isAdmin]);

  const toggle = useCallback(async (templateId: number, e?: MouseEvent) => {
    e?.stopPropagation();

    // Guest users must log in first — redirect to login
    if (!getStoredAuthToken()) {
      navigate('/login');
      return;
    }

    if (isAdmin || inflightRef.current.has(templateId)) return;
    inflightRef.current.add(templateId);

    // Optimistic flip
    setIds(prev => {
      const next = new Set(prev);
      if (next.has(templateId)) next.delete(templateId);
      else next.add(templateId);
      return next;
    });

    try {
      const added = await apiToggle(templateId);
      setIds(prev => {
        const next = new Set(prev);
        if (added) next.add(templateId);
        else next.delete(templateId);
        return next;
      });
    } catch {
      // Revert optimistic update on failure
      setIds(prev => {
        const next = new Set(prev);
        if (next.has(templateId)) next.delete(templateId);
        else next.add(templateId);
        return next;
      });
    } finally {
      inflightRef.current.delete(templateId);
    }
  }, [navigate, isAdmin]);

  return { wishlistIds: ids, toggleWishlist: toggle };
}
