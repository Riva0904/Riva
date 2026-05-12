import React, { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getAdminTemplates, type TemplateListItem } from '../../../api/templates';
import { getAdminPool, setAdminPool, setYearlyQuota } from '../../../api/subscriptions';

type MainTab  = 'monthly' | 'yearly';
type PlanType = 'Paid' | 'Pro';

const PLAN: Record<PlanType, {
  label: string; icon: string; tierType: string;
  activeCls: string; badgeCls: string; ringCls: string;
  monthly: string; yearly: string; yearlyDesc: string;
}> = {
  Paid: {
    label:      'Premium',
    icon:       '💎',
    tierType:   'Premium',
    activeCls:  'border-blue-400 bg-blue-50 text-blue-700',
    badgeCls:   'bg-blue-100 text-blue-700',
    ringCls:    'ring-blue-300',
    monthly:    '₹799 / month',
    yearly:     '₹2,499 / year',
    yearlyDesc: 'Images & animations — no map integration',
  },
  Pro: {
    label:      'Pro',
    icon:       '🚀',
    tierType:   'Pro',
    activeCls:  'border-purple-400 bg-purple-50 text-purple-700',
    badgeCls:   'bg-purple-100 text-purple-700',
    ringCls:    'ring-purple-300',
    monthly:    '₹1,499 / month',
    yearly:     '₹3,499 / year',
    yearlyDesc: 'Map integration + all pro features',
  },
};

const API_ORIGIN = (import.meta.env.VITE_API_BASE ?? 'http://localhost:5236/api').replace(/\/api$/, '');
const imgUrl = (t: TemplateListItem) => {
  const u = t.thumbnailUrl || t.previewImageUrl || '';
  return u.startsWith('/') ? `${API_ORIGIN}${u}` : u;
};

interface Props { onClose: () => void }

const MonthlyPoolModal: React.FC<Props> = ({ onClose }) => {
  const [mainTab,  setMainTab]  = useState<MainTab>('monthly');
  const [planType, setPlanType] = useState<PlanType>('Paid');
  const [allTpls,  setAllTpls]  = useState<TemplateListItem[]>([]);
  const [poolIds,  setPoolIds]  = useState<Set<number>>(new Set());
  const [quota,        setQuota]        = useState(30);
  const [yearlyQuota,  setYearlyQuota_] = useState(0);   // 0 = unlimited
  const [savingYearly, setSavingYearly] = useState(false);
  const [loading,  setLoading]  = useState(true);
  const [saving,   setSaving]   = useState(false);
  const [search,   setSearch]   = useState('');
  const [toast,    setToast]    = useState<{ msg: string; ok: boolean } | null>(null);

  const saveYearlyQuota = async () => {
    setSavingYearly(true);
    try {
      await setYearlyQuota(planType, yearlyQuota);
      showToast(`✅ ${p.label} yearly quota saved — ${yearlyQuota === 0 ? 'Unlimited' : yearlyQuota + ' templates'}`);
    } catch (e: unknown) {
      showToast(e instanceof Error ? e.message : 'Save failed', false);
    } finally { setSavingYearly(false); }
  };

  const showToast = (msg: string, ok = true) => {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 3500);
  };

  const load = useCallback(async (plan: PlanType) => {
    setLoading(true);
    setSearch('');
    try {
      const tier = PLAN[plan].tierType;
      const [tRes, pool] = await Promise.all([
        getAdminTemplates(),
        getAdminPool(plan),
      ]);
      const published = tRes.templates.filter(t => t.tierType === tier && t.status === 'Published');
      setAllTpls(published);
      setPoolIds(new Set(pool.templateIds));
      setQuota(pool.monthlyQuota ?? 30);
      setYearlyQuota_(pool.yearlyQuota ?? 0);
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { load(planType); }, [planType, load]);

  const toggle = (id: number) => {
    setPoolIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        if (next.size >= quota) {
          showToast(`⚠️ Quota reached (${quota}). Remove a template first or increase the quota.`, false);
          return prev;
        }
        next.add(id);
      }
      return next;
    });
  };

  const save = async () => {
    if (poolIds.size > quota) {
      showToast(`⚠️ ${poolIds.size} selected exceeds quota of ${quota}. Reduce selection or increase quota.`, false);
      return;
    }
    setSaving(true);
    try {
      await setAdminPool(planType, [...poolIds], quota);
      showToast(`✅ Saved — ${poolIds.size} / ${quota} ${PLAN[planType].label} templates in monthly pool`);
    } catch (e: unknown) {
      showToast(e instanceof Error ? e.message : 'Save failed', false);
    } finally { setSaving(false); }
  };

  const filtered = search.trim()
    ? allTpls.filter(t =>
        t.name.toLowerCase().includes(search.toLowerCase()) ||
        t.categoryName?.toLowerCase().includes(search.toLowerCase()))
    : allTpls;

  const p = PLAN[planType];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(8px)' }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-5xl rounded-3xl bg-white shadow-2xl flex flex-col"
        style={{ maxHeight: '94vh' }}
        onClick={e => e.stopPropagation()}
      >
        {/* ── Header ── */}
        <div className="flex items-start justify-between px-6 py-5 border-b border-slate-100 flex-shrink-0">
          <div>
            <h2 className="text-xl font-black text-slate-900">Plan Template Manager</h2>
            <p className="text-xs text-slate-400 mt-1">
              💎 <strong>Premium</strong> — images & animations, no map &nbsp;·&nbsp;
              🚀 <strong>Pro</strong> — map integration + all features
            </p>
          </div>
          <button onClick={onClose}
            className="h-8 w-8 flex items-center justify-center rounded-full border border-slate-200 hover:bg-red-50 hover:border-red-300 text-slate-400 hover:text-red-500 font-black text-sm transition">
            ✕
          </button>
        </div>

        {/* ── Main tabs ── */}
        <div className="flex gap-3 px-6 pt-4 flex-shrink-0">
          {([
            { key: 'monthly' as MainTab, icon: '📅', label: 'Monthly Plans',  hint: 'Admin selects pool of templates' },
            { key: 'yearly'  as MainTab, icon: '⭐', label: 'Yearly Plans',   hint: 'All templates — unlimited' },
          ]).map(t => (
            <button key={t.key} onClick={() => setMainTab(t.key)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl border-2 transition ${
                mainTab === t.key
                  ? 'border-green-500 bg-green-50 text-green-800'
                  : 'border-slate-200 text-slate-500 hover:border-slate-300'}`}>
              <span className="text-lg">{t.icon}</span>
              <div className="text-left">
                <p className="text-xs font-black">{t.label}</p>
                <p className="text-[10px] opacity-60">{t.hint}</p>
              </div>
            </button>
          ))}
        </div>

        {/* ── Plan sub-tabs ── */}
        <div className="flex items-center gap-3 px-6 pt-3 pb-3 border-b border-slate-100 flex-shrink-0">
          {(['Paid', 'Pro'] as PlanType[]).map(pt => {
            const m = PLAN[pt];
            return (
              <button key={pt} onClick={() => setPlanType(pt)}
                className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl border-2 transition ${
                  planType === pt ? m.activeCls + ' shadow-sm' : 'border-slate-200 bg-white text-slate-500 hover:border-slate-300'}`}>
                <span className="text-lg">{m.icon}</span>
                <div className="text-left">
                  <p className="text-xs font-black">{m.label}</p>
                  <p className="text-[10px] opacity-60">{mainTab === 'monthly' ? m.monthly : m.yearly}</p>
                </div>
              </button>
            );
          })}

          {/* ── Monthly: quota + counters + save ── */}
          {mainTab === 'monthly' && (
            <div className="ml-auto flex items-center gap-4">
              {/* Quota input */}
              <div className="flex items-center gap-2 bg-slate-50 border-2 border-slate-200 rounded-xl px-3 py-2">
                <span className="text-xs font-black text-slate-500">Monthly Quota</span>
                <input
                  type="number"
                  min={1}
                  max={allTpls.length || 9999}
                  value={quota}
                  onChange={e => setQuota(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-16 text-center text-sm font-black text-slate-900 bg-white border border-slate-200 rounded-lg px-2 py-1 outline-none focus:border-green-400"
                />
                <span className="text-xs text-slate-400">/ {allTpls.length} total</span>
              </div>

              {/* Selected / quota counter */}
              <div className={`flex flex-col items-center rounded-xl px-4 py-2 font-black text-sm ${
                poolIds.size >= quota && quota > 0
                  ? 'bg-green-100 text-green-700'
                  : poolIds.size > 0
                  ? p.badgeCls
                  : 'bg-slate-100 text-slate-500'
              }`}>
                <div className="flex items-center gap-1">
                  <span className="text-lg">{poolIds.size}</span>
                  <span className="opacity-50 font-normal">/</span>
                  <span className="text-lg">{quota}</span>
                </div>
                <span className="text-[10px] font-normal opacity-70">in pool / quota</span>
              </div>

              <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                onClick={save} disabled={saving}
                className="btn-green px-5 py-2.5 text-sm">
                {saving ? '⏳ Saving…' : '💾 Save Pool'}
              </motion.button>
            </div>
          )}

          {/* ── Yearly: quota input + save ── */}
          {mainTab === 'yearly' && (
            <div className="ml-auto flex items-center gap-3">
              <div className="flex items-center gap-2 bg-slate-50 border-2 border-slate-200 rounded-xl px-3 py-2">
                <span className="text-xs font-black text-slate-500">Yearly Quota</span>
                <input
                  type="number"
                  min={0}
                  max={allTpls.length || 9999}
                  value={yearlyQuota}
                  onChange={e => setYearlyQuota_(Math.max(0, parseInt(e.target.value) || 0))}
                  className="w-16 text-center text-sm font-black text-slate-900 bg-white border border-slate-200 rounded-lg px-2 py-1 outline-none focus:border-green-400"
                />
                <span className="text-xs text-slate-400">/ {loading ? '…' : allTpls.length} total</span>
              </div>
              <span className={`rounded-full px-3 py-1.5 text-xs font-black ${
                yearlyQuota === 0 ? 'bg-green-100 text-green-700' : p.badgeCls}`}>
                {yearlyQuota === 0 ? '∞ Unlimited' : `${yearlyQuota} templates`}
              </span>
              <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                onClick={saveYearlyQuota} disabled={savingYearly}
                className="btn-green px-4 py-2 text-sm">
                {savingYearly ? '⏳' : '💾 Save Quota'}
              </motion.button>
            </div>
          )}
        </div>

        {/* ── Toast ── */}
        <AnimatePresence>
          {toast && (
            <motion.div
              initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className={`mx-6 mt-3 rounded-xl px-4 py-3 text-sm font-semibold flex-shrink-0 ${
                toast.ok ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
              {toast.msg}
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Monthly tab content ── */}
        {mainTab === 'monthly' && (
          <>
            {/* Search */}
            {!loading && allTpls.length > 0 && (
              <div className="px-6 pt-3 flex-shrink-0">
                <input
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder={`Search ${p.label} templates by name or category…`}
                  className="w-full rounded-xl border-2 border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none focus:border-green-400 focus:bg-white transition"
                />
                {search && (
                  <p className="text-xs text-slate-400 mt-1 px-1">
                    {filtered.length} result{filtered.length !== 1 ? 's' : ''} · click to add/remove from pool
                  </p>
                )}
              </div>
            )}

            <div className="flex-1 overflow-y-auto p-6" style={{ minHeight: 0 }}>

              {/* Guide banner — shown when templates exist but none selected */}
              {!loading && allTpls.length > 0 && poolIds.size === 0 && (
                <div className="mb-4 rounded-2xl bg-amber-50 border-2 border-amber-200 px-5 py-3 flex items-center gap-3">
                  <span className="text-2xl">👇</span>
                  <p className="text-sm font-semibold text-amber-800">
                    Quota set to <strong>{quota}</strong>. Now click templates below to add them to the monthly pool.
                    You can add up to <strong>{quota}</strong> out of <strong>{allTpls.length}</strong> total {p.label} templates.
                  </p>
                </div>
              )}

              {/* Progress bar */}
              {!loading && allTpls.length > 0 && quota > 0 && (
                <div className="mb-4">
                  <div className="flex justify-between text-xs font-black text-slate-500 mb-1.5">
                    <span>{poolIds.size} of {quota} slots filled</span>
                    <span>{allTpls.length - poolIds.size} templates not yet added</span>
                  </div>
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${
                        poolIds.size >= quota ? 'bg-green-500' : p.activeCls.split(' ')[0].replace('border', 'bg')
                      }`}
                      style={{ width: `${Math.min(100, (poolIds.size / quota) * 100)}%` }}
                    />
                  </div>
                </div>
              )}

              {loading ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {Array.from({ length: 10 }).map((_, i) => (
                    <div key={i} className="h-44 animate-pulse rounded-2xl bg-slate-100" />
                  ))}
                </div>
              ) : allTpls.length === 0 ? (
                <div className="text-center py-16 text-slate-400">
                  <p className="text-5xl mb-4">{p.icon}</p>
                  <p className="font-black text-lg">No published {p.label} templates yet</p>
                  <div className="mt-4 mx-auto max-w-sm rounded-2xl bg-slate-50 border-2 border-dashed border-slate-200 p-4 text-left">
                    <p className="text-sm font-black text-slate-600 mb-2">How to add {p.label} templates:</p>
                    <ol className="text-xs text-slate-500 space-y-1.5 list-decimal list-inside">
                      <li>Go to <strong>Admin → Templates</strong></li>
                      <li>Click <strong>Add Template</strong></li>
                      <li>In Template Tier, select <strong>{p.icon} {p.label}</strong></li>
                      <li>Fill details and publish</li>
                      <li>Come back here to add to pool</li>
                    </ol>
                  </div>
                </div>
              ) : filtered.length === 0 ? (
                <div className="text-center py-10 text-slate-400">
                  <p className="text-3xl mb-2">🔍</p>
                  <p className="font-semibold">No results for "{search}"</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {filtered.map(t => {
                    const inPool  = poolIds.has(t.templateId);
                    const atLimit = !inPool && poolIds.size >= quota;
                    return (
                      <motion.button key={t.templateId}
                        whileHover={atLimit ? {} : { y: -4 }}
                        whileTap={atLimit ? {} : { scale: 0.96 }}
                        onClick={() => toggle(t.templateId)}
                        title={atLimit ? `Quota reached (${quota}). Remove a template or increase quota.` : undefined}
                        className={`rounded-2xl border-2 overflow-hidden text-left transition ${
                          inPool
                            ? p.activeCls + ` shadow-lg ring-2 ring-offset-2 ${p.ringCls}`
                            : atLimit
                            ? 'border-slate-100 bg-slate-50 opacity-40 cursor-not-allowed'
                            : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm cursor-pointer'
                        }`}>
                        {/* Thumbnail */}
                        <div className="relative bg-slate-100 overflow-hidden" style={{ height: 90 }}>
                          {imgUrl(t) ? (
                            <img src={imgUrl(t)} alt={t.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="flex items-center justify-center h-full text-3xl bg-slate-50">🎨</div>
                          )}
                          {inPool && (
                            <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                              <div className="h-8 w-8 rounded-full bg-white shadow flex items-center justify-center text-lg">✅</div>
                            </div>
                          )}
                          <span className={`absolute top-1.5 right-1.5 rounded-full px-2 py-0.5 text-[10px] font-black ${p.badgeCls}`}>
                            ₹{t.price}
                          </span>
                        </div>
                        {/* Info */}
                        <div className="p-2.5">
                          <p className="font-black text-slate-800 text-xs truncate">{t.name}</p>
                          <p className="text-[10px] text-slate-400 mt-0.5">{t.categoryName}</p>
                          <p className={`text-[10px] font-black mt-1 ${inPool ? p.activeCls.split(' ')[2] : 'text-slate-300'}`}>
                            {inPool ? '✓ In pool' : '+ Add to pool'}
                          </p>
                        </div>
                      </motion.button>
                    );
                  })}
                </div>
              )}
            </div>
          </>
        )}

        {/* ── Yearly tab content ── */}
        {mainTab === 'yearly' && (
          <div className="flex-1 overflow-y-auto p-6" style={{ minHeight: 0 }}>
            {loading ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {Array.from({ length: 8 }).map((_, i) => <div key={i} className="h-44 animate-pulse rounded-2xl bg-slate-100" />)}
              </div>
            ) : allTpls.length === 0 ? (
              <div className="text-center py-20 text-slate-400">
                <p className="text-5xl mb-4">{p.icon}</p>
                <p className="font-black text-lg">No published {p.label} templates yet</p>
              </div>
            ) : (
              <>
                {/* Info banner */}
                <div className={`mb-5 rounded-2xl border-2 p-4 flex items-center gap-4 ${p.activeCls}`}>
                  <span className="text-3xl">⭐</span>
                  <div>
                    <p className="font-black">
                      Yearly {p.label} — {yearlyQuota === 0
                        ? `ALL ${allTpls.length} templates included`
                        : `${yearlyQuota} of ${allTpls.length} templates`}
                    </p>
                    <p className="text-xs opacity-70 mt-0.5">{p.yearlyDesc} · {p.yearly}</p>
                  </div>
                  <div className="ml-auto text-right">
                    <p className="text-2xl font-black">{yearlyQuota === 0 ? '∞' : yearlyQuota}</p>
                    <p className="text-xs opacity-60">{yearlyQuota === 0 ? 'unlimited' : 'templates'}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {allTpls.map(t => (
                    <div key={t.templateId} className={`rounded-2xl border-2 overflow-hidden ${p.activeCls} opacity-75`}>
                      <div className="relative bg-slate-100 overflow-hidden" style={{ height: 90 }}>
                        {imgUrl(t) ? (
                          <img src={imgUrl(t)} alt={t.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="flex items-center justify-center h-full text-3xl bg-slate-50">🎨</div>
                        )}
                        <span className={`absolute top-1.5 right-1.5 rounded-full px-2 py-0.5 text-[10px] font-black ${p.badgeCls}`}>
                          ₹{t.price}
                        </span>
                      </div>
                      <div className="p-2.5">
                        <p className="font-black text-slate-800 text-xs truncate">{t.name}</p>
                        <p className="text-[10px] text-slate-400 mt-0.5">{t.categoryName}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        {/* ── Footer ── */}
        <div className="px-6 py-3 border-t border-slate-100 text-xs text-slate-400 flex-shrink-0 flex justify-between items-center">
          <span>
            Click a template to <strong>add / remove</strong> from the pool one by one
          </span>
          {mainTab === 'monthly' && !loading && (
            <span className={`font-black text-xs ${poolIds.size > 0 ? p.activeCls.split(' ')[2] : 'text-slate-400'}`}>
              {poolIds.size} in pool · quota: {quota} slots · {allTpls.length - poolIds.size} {p.label} templates not added yet
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default MonthlyPoolModal;
