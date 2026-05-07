import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  getAdminCategories, createCategory, updateCategory, toggleCategory,
  type CategoryDto
} from '../../../api/categories';

const CategoryManager: React.FC = () => {
  const [categories, setCategories] = useState<CategoryDto[]>([]);
  const [loading,    setLoading]    = useState(true);
  const [newName,    setNewName]    = useState('');
  const [adding,     setAdding]     = useState(false);
  const [editId,     setEditId]     = useState<number | null>(null);
  const [editName,   setEditName]   = useState('');
  const [saving,     setSaving]     = useState<number | null>(null);
  const [toggling,   setToggling]   = useState<number | null>(null);
  const [toast,      setToast]      = useState<string | null>(null);

  const flash = (msg: string) => { setToast(msg); setTimeout(() => setToast(null), 3000); };

  const load = async () => {
    setLoading(true);
    try { setCategories(await getAdminCategories()); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    setAdding(true);
    try {
      const res = await createCategory(newName.trim());
      setCategories(prev => [...prev, { categoryId: res.categoryId, name: res.name, isActive: true }]);
      setNewName('');
      flash(`✅ Category "${res.name}" created!`);
    } catch (err: unknown) {
      flash(`⚠️ ${err instanceof Error ? err.message : 'Failed to create'}`);
    } finally { setAdding(false); }
  };

  const handleUpdate = async (id: number) => {
    if (!editName.trim()) return;
    setSaving(id);
    try {
      await updateCategory(id, editName.trim());
      setCategories(prev => prev.map(c => c.categoryId === id ? { ...c, name: editName.trim() } : c));
      setEditId(null);
      flash('✅ Category renamed!');
    } catch (err: unknown) {
      flash(`⚠️ ${err instanceof Error ? err.message : 'Failed to update'}`);
    } finally { setSaving(null); }
  };

  const handleToggle = async (cat: CategoryDto) => {
    setToggling(cat.categoryId);
    try {
      const res = await toggleCategory(cat.categoryId);
      setCategories(prev => prev.map(c => c.categoryId === cat.categoryId ? { ...c, isActive: res.isActive } : c));
      flash(`${res.isActive ? '✅ Activated' : '⛔ Deactivated'}: "${cat.name}"`);
    } catch (err: unknown) {
      flash(`⚠️ ${err instanceof Error ? err.message : 'Failed to toggle'}`);
    } finally { setToggling(null); }
  };

  const active   = categories.filter(c => c.isActive);
  const inactive = categories.filter(c => !c.isActive);

  return (
    <div className="relative space-y-6">

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
            className="fixed top-5 right-5 z-50 rounded-2xl bg-slate-900 px-5 py-3 text-sm font-black text-white shadow-2xl">
            {toast}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Total',    value: categories.length, color: 'bg-slate-50 text-slate-700' },
          { label: 'Active',   value: active.length,     color: 'bg-green-50 text-green-700' },
          { label: 'Inactive', value: inactive.length,   color: 'bg-red-50 text-red-600' },
        ].map(s => (
          <div key={s.label} className={`rounded-2xl px-4 py-3 text-center ${s.color}`}>
            <p className="text-2xl font-black">{s.value}</p>
            <p className="text-xs font-bold opacity-70">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Add new */}
      <form onSubmit={handleCreate} className="flex gap-3">
        <input
          className="input-green flex-1"
          placeholder="New category name…"
          value={newName}
          onChange={e => setNewName(e.target.value)}
          required />
        <motion.button type="submit" disabled={adding || !newName.trim()}
          whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
          className="btn-green w-auto px-5 py-2.5 flex-shrink-0">
          {adding ? '⏳' : '+ Add'}
        </motion.button>
      </form>

      {/* Category list */}
      {loading ? (
        <div className="space-y-2">
          {[1,2,3].map(i => <div key={i} className="h-14 animate-pulse rounded-xl bg-slate-100" />)}
        </div>
      ) : (
        <div className="space-y-2">
          <AnimatePresence>
            {categories.map(cat => (
              <motion.div key={cat.categoryId}
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className={`flex items-center gap-3 rounded-2xl border-2 p-3 transition ${
                  cat.isActive ? 'border-green-100 bg-white' : 'border-slate-100 bg-slate-50 opacity-60'}`}>

                {/* Status dot */}
                <div className={`h-2.5 w-2.5 flex-shrink-0 rounded-full ${cat.isActive ? 'bg-green-500' : 'bg-slate-300'}`} />

                {/* Name / edit */}
                {editId === cat.categoryId ? (
                  <form onSubmit={e => { e.preventDefault(); handleUpdate(cat.categoryId); }}
                    className="flex flex-1 gap-2">
                    <input className="input-green flex-1 py-1.5" autoFocus
                      value={editName} onChange={e => setEditName(e.target.value)} />
                    <button type="submit" disabled={saving === cat.categoryId}
                      className="btn-green w-auto px-3 py-1.5 text-xs">
                      {saving === cat.categoryId ? '⏳' : '✓ Save'}
                    </button>
                    <button type="button" onClick={() => setEditId(null)}
                      className="btn-green-outline w-auto px-3 py-1.5 text-xs">✕</button>
                  </form>
                ) : (
                  <>
                    <span className="flex-1 font-black text-slate-800">{cat.name}</span>
                    <span className={`rounded-full px-2 py-0.5 text-xs font-black ${
                      cat.isActive ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>
                      {cat.isActive ? 'Active' : 'Inactive'}
                    </span>

                    {/* Edit button */}
                    <button onClick={() => { setEditId(cat.categoryId); setEditName(cat.name); }}
                      className="rounded-xl border-2 border-slate-200 bg-white px-2.5 py-1.5 text-xs font-black text-slate-600 hover:border-green-300 hover:text-green-700 transition">
                      ✏️ Rename
                    </button>

                    {/* Toggle active/inactive */}
                    <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                      disabled={toggling === cat.categoryId}
                      onClick={() => handleToggle(cat)}
                      className={`rounded-xl px-2.5 py-1.5 text-xs font-black transition disabled:opacity-40 ${
                        cat.isActive
                          ? 'bg-red-100 text-red-600 hover:bg-red-200'
                          : 'bg-green-100 text-green-700 hover:bg-green-200'}`}>
                      {toggling === cat.categoryId ? '⏳' : cat.isActive ? '⛔ Deactivate' : '✅ Activate'}
                    </motion.button>
                  </>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      <p className="text-xs text-slate-400 text-center">
        Inactive categories are hidden from users. Existing templates keep their category.
      </p>
    </div>
  );
};

export default CategoryManager;
