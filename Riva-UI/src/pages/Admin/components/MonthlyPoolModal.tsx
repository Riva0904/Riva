import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getAllPlanSettings, savePlanSettings, type PlanSettings } from '../../../api/subscriptions';
import { getAdminTemplates, patchTemplatePrice, type TemplateListItem } from '../../../api/templates';

interface Props { onClose: () => void }

type ModalTab = 'plans' | 'prices';
type PlanKey  = 'premium' | 'pro';

const PLAN_INFO: Record<PlanKey, { label: string; icon: string; dbKey: 'Paid' | 'Pro'; access: string; color: string }> = {
  premium: {
    label: 'Premium', icon: '💎', dbKey: 'Paid',
    access: 'FREE + PRO + PREMIUM templates — unlimited tier access',
    color: 'bg-amber-50 border-amber-300',
  },
  pro: {
    label: 'Pro', icon: '🚀', dbKey: 'Pro',
    access: 'FREE + PRO templates only (Premium requires upgrade)',
    color: 'bg-purple-50 border-purple-300',
  },
};

const TIER_ORDER = ['Pro', 'Premium'] as const;
const TIER_STYLE: Record<string, { badge: string; label: string; icon: string }> = {
  Pro:     { badge: 'bg-purple-100 text-purple-700', label: 'Pro',     icon: '🚀' },
  Premium: { badge: 'bg-amber-100  text-amber-700',  label: 'Premium', icon: '💎' },
};

import { API_ORIGIN } from '../../../api/client';
const imgSrc = (t: TemplateListItem) => {
  const u = t.thumbnailUrl || t.previewImageUrl || '';
  return u.startsWith('/') ? `${API_ORIGIN}${u}` : u;
};

const MonthlyPoolModal: React.FC<Props> = ({ onClose }) => {
  const [tab, setTab] = useState<ModalTab>('plans');

  // ── Plan settings ──────────────────────────────────────────────────────────
  const [settings, setSettings] = useState<Record<PlanKey, PlanSettings>>({
    premium: { monthlyPrice: 799,  yearlyPrice: 2499, monthlyLimit: 0,  yearlyLimit: 0  },
    pro:     { monthlyPrice: 1499, yearlyPrice: 3499, monthlyLimit: 29, yearlyLimit: 365 },
  });
  const [loadingPlans, setLoadingPlans] = useState(true);
  const [savingPlan,   setSavingPlan]   = useState<PlanKey | null>(null);

  // ── Template prices ────────────────────────────────────────────────────────
  const [templates,    setTemplates]    = useState<TemplateListItem[]>([]);
  const [loadingTpls,  setLoadingTpls]  = useState(true);
  const [editPrices,   setEditPrices]   = useState<Record<number, string>>({});
  const [savingPrice,  setSavingPrice]  = useState<number | null>(null);

  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null);
  const showToast = (msg: string, ok = true) => {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 4000);
  };

  // Load plan settings
  useEffect(() => {
    getAllPlanSettings()
      .then(d => setSettings({ premium: d.premium, pro: d.pro }))
      .catch(() => showToast('Failed to load plan settings', false))
      .finally(() => setLoadingPlans(false));
  }, []);

  // Load published templates (paid only — no price for Free)
  useEffect(() => {
    getAdminTemplates()
      .then(res => {
        const paid = res.templates.filter(t => t.tierType !== 'Free' && t.status === 'Published');
        setTemplates(paid);
        const prices: Record<number, string> = {};
        paid.forEach(t => { prices[t.templateId] = String(t.price ?? 0); });
        setEditPrices(prices);
      })
      .catch(() => showToast('Failed to load templates', false))
      .finally(() => setLoadingTpls(false));
  }, []);

  const updateSetting = (plan: PlanKey, field: keyof PlanSettings, value: number) =>
    setSettings(prev => ({ ...prev, [plan]: { ...prev[plan], [field]: value } }));

  const savePlan = async (plan: PlanKey) => {
    setSavingPlan(plan);
    const info = PLAN_INFO[plan];
    const s    = settings[plan];
    try {
      await savePlanSettings(info.dbKey, s.monthlyPrice, s.yearlyPrice, s.monthlyLimit, s.yearlyLimit);
      showToast(`✅ ${info.label} plan saved`);
    } catch (e: unknown) {
      showToast(e instanceof Error ? e.message : 'Save failed', false);
    } finally { setSavingPlan(null); }
  };

  const savePrice = async (t: TemplateListItem) => {
    const price = parseFloat(editPrices[t.templateId] || '0');
    setSavingPrice(t.templateId);
    try {
      await patchTemplatePrice(t.templateId, price);
      setTemplates(prev => prev.map(x => x.templateId === t.templateId ? { ...x, price } : x));
      showToast(`✅ "${t.name}" price updated — ₹${price}`);
    } catch (e: unknown) {
      showToast(e instanceof Error ? e.message : 'Save failed', false);
    } finally { setSavingPrice(null); }
  };

  const groupedByTier = TIER_ORDER.map(tier => ({
    tier,
    items: templates.filter(t => t.tierType === tier),
  })).filter(g => g.items.length > 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)' }}
      onClick={onClose}>

      {/* Fixed toast — always visible above everything */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0,   scale: 1     }}
            exit={{    opacity: 0, y: -12,  scale: 0.97  }}
            transition={{ type: 'spring', stiffness: 400, damping: 28 }}
            className="fixed top-5 left-1/2 -translate-x-1/2 z-[60] flex items-center gap-3 rounded-2xl px-5 py-3 shadow-2xl text-sm font-black pointer-events-none"
            style={{
              background: toast.ok ? '#16a34a' : '#dc2626',
              color: 'white',
              minWidth: 260,
              boxShadow: toast.ok
                ? '0 8px 32px rgba(22,163,74,0.45)'
                : '0 8px 32px rgba(220,38,38,0.45)',
            }}>
            <span className="text-lg leading-none">{toast.ok ? '✅' : '⚠️'}</span>
            <span>{toast.msg.replace(/^✅\s*|^⚠️\s*/, '')}</span>
          </motion.div>
        )}
      </AnimatePresence>
      <div className="w-full max-w-3xl rounded-3xl bg-white shadow-2xl flex flex-col"
        style={{ maxHeight: '92vh' }}
        onClick={e => e.stopPropagation()}>

        {/* Sticky header — always visible */}
        <div className="flex-shrink-0 flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-white rounded-t-3xl">
          <div>
            <h2 className="text-xl font-black text-slate-900">🎯 Plan Manager</h2>
            <p className="text-xs text-slate-400 mt-0.5">Manage plan settings and template prices.</p>
          </div>
          <button onClick={onClose}
            className="h-9 w-9 flex items-center justify-center rounded-full bg-slate-100 hover:bg-red-100 hover:text-red-500 text-slate-500 font-black text-sm transition">
            ✕
          </button>
        </div>

        {/* Tab bar */}
        <div className="flex-shrink-0 flex gap-1 px-6 pt-3 border-b border-slate-100">
          {([
            { key: 'plans'  as ModalTab, label: '⚙️ Plan Settings',    desc: 'Prices & publish limits' },
            { key: 'prices' as ModalTab, label: '💰 Template Prices',   desc: 'Per-template price editor' },
          ]).map(t => (
            <button key={t.key} onClick={() => setTab(t.key)}
              className={`flex flex-col px-5 py-2.5 rounded-t-xl border-2 border-b-0 transition text-left ${
                tab === t.key
                  ? 'border-green-300 bg-green-50 text-green-800'
                  : 'border-transparent text-slate-500 hover:text-slate-700'}`}>
              <span className="text-xs font-black">{t.label}</span>
              <span className="text-[10px] opacity-60">{t.desc}</span>
            </button>
          ))}
        </div>


        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto">

          {/* ── Plan Settings tab ── */}
          {tab === 'plans' && (
            <div className="p-6 space-y-4">
              {loadingPlans ? (
                <div className="text-center py-10 text-slate-400">
                  <div className="inline-block h-7 w-7 animate-spin rounded-full border-4 border-slate-200 border-t-green-500" />
                </div>
              ) : (
                <>
                  {/* ── Total published templates strip ── */}
                  {!loadingTpls && (
                    <div className="grid grid-cols-3 gap-3">
                      {[
                        { label: 'Pro Templates',     count: templates.filter(t => t.tierType === 'Pro').length,     icon: '🚀', color: 'bg-purple-50 border-purple-200 text-purple-800' },
                        { label: 'Premium Templates', count: templates.filter(t => t.tierType === 'Premium').length, icon: '💎', color: 'bg-amber-50  border-amber-200  text-amber-800'  },
                        { label: 'Total Paid',        count: templates.length,                                       icon: '📦', color: 'bg-slate-50  border-slate-200  text-slate-700'  },
                      ].map(s => (
                        <div key={s.label} className={`rounded-xl border-2 px-4 py-3 text-center ${s.color}`}>
                          <p className="text-xl mb-0.5">{s.icon}</p>
                          <p className="text-2xl font-black">{s.count}</p>
                          <p className="text-[10px] font-bold opacity-70">{s.label}</p>
                          <p className="text-[9px] opacity-50">published</p>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* ── ℹ️ Rules info box ── */}
                  <div className="rounded-xl bg-blue-50 border border-blue-200 px-4 py-3 flex items-start gap-2.5">
                    <span className="text-base mt-0.5 flex-shrink-0">ℹ️</span>
                    <div className="text-xs text-blue-800 space-y-1">
                      <p className="font-black">Publish Limit Rules</p>
                      <p>• <strong>0 = Unlimited</strong> — user can publish as many invitations as they want in their plan period</p>
                      <p>• <strong>Any number</strong> (e.g. 30) — user can publish up to that many invitations in 30 days (monthly) or 365 days (yearly)</p>
                      <p>• <strong>Monthly plan</strong> resets every 30 days from payment date &nbsp;·&nbsp; <strong>Yearly plan</strong> resets every 365 days</p>
                    </div>
                  </div>

                  {/* ── Plan cards ── */}
                  {(Object.entries(PLAN_INFO) as [PlanKey, typeof PLAN_INFO[PlanKey]][]).map(([key, info]) => {
                    const s = settings[key];
                    // map plan key → template tier name
                    const tierName = info.dbKey === 'Paid' ? 'Premium' : 'Pro';
                    const publishedCount = templates.filter(t => t.tierType === tierName).length;

                    const LimitBadge = ({ val }: { val: number }) => (
                      val === 0
                        ? <span className="inline-flex items-center gap-1 rounded-full bg-green-100 text-green-700 px-2.5 py-0.5 text-xs font-black">♾️ Unlimited</span>
                        : <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 text-blue-700 px-2.5 py-0.5 text-xs font-black">{val} publishes</span>
                    );
                    return (
                      <div key={key} className={`rounded-2xl border-2 p-5 ${info.color}`}>
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <div className="flex items-center gap-2 mb-0.5">
                              <span>{info.icon}</span>
                              <span className="text-base font-black text-slate-900">{info.label}</span>
                              <span className="rounded-full bg-white/80 px-2 py-0.5 text-[10px] font-black text-slate-600">
                                {key === 'premium' ? 'TOP PLAN' : 'MIDDLE PLAN'}
                              </span>
                            </div>
                            <p className="text-xs text-slate-600 opacity-80">✓ {info.access}</p>
                          </div>
                          <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                            onClick={() => savePlan(key)} disabled={savingPlan === key}
                            className="rounded-xl bg-green-500 hover:bg-green-600 text-white text-xs font-black px-4 py-2 transition disabled:opacity-50">
                            {savingPlan === key ? '⏳ Saving…' : '💾 Save'}
                          </motion.button>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          {[
                            { label: '📅 Monthly (30 days)', priceField: 'monthlyPrice' as const, limitField: 'monthlyLimit' as const, priceSuffix: '/mo' },
                            { label: '⭐ Yearly (365 days)',  priceField: 'yearlyPrice'  as const, limitField: 'yearlyLimit'  as const, priceSuffix: '/yr' },
                          ].map(col => (
                            <div key={col.label} className="rounded-xl bg-white/70 p-3.5 space-y-2.5">
                              <p className="text-[10px] font-black text-slate-500 uppercase tracking-wide">{col.label}</p>
                              <div>
                                <label className="text-[10px] text-slate-400 block mb-1">Price (₹{col.priceSuffix})</label>
                                <div className="flex items-center gap-1.5">
                                  <span className="text-xs font-black text-slate-400">₹</span>
                                  <input type="number" min={0} value={s[col.priceField]}
                                    onChange={e => updateSetting(key, col.priceField, Number(e.target.value))}
                                    className="flex-1 rounded-lg border-2 border-slate-200 bg-white px-2 py-1.5 text-sm font-black outline-none focus:border-green-400 transition" />
                                </div>
                              </div>
                              <div>
                                <div className="flex items-center justify-between mb-1">
                                  <label className="text-[10px] text-slate-400">Publish limit</label>
                                  <LimitBadge val={s[col.limitField]} />
                                </div>
                                <input type="number" min={0} value={s[col.limitField]}
                                  onChange={e => updateSetting(key, col.limitField, Number(e.target.value))}
                                  placeholder="0 = unlimited"
                                  className="w-full rounded-lg border-2 border-slate-200 bg-white px-2 py-1.5 text-sm font-black outline-none focus:border-green-400 transition" />
                                {/* Published template count context */}
                                <div className="mt-1.5 flex items-center gap-1.5">
                                  <span className="text-[10px] text-slate-400">Available:</span>
                                  <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-black ${key === 'premium' ? 'bg-amber-100 text-amber-700' : 'bg-purple-100 text-purple-700'}`}>
                                    {info.icon} {publishedCount} {tierName} published
                                  </span>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Summary row */}
                        <div className="mt-3 flex items-center gap-3 flex-wrap">
                          <span className="text-[11px] text-slate-600 font-semibold">Summary:</span>
                          <span className="rounded-full bg-white/60 px-2.5 py-1 text-[11px] font-black text-slate-700">
                            Monthly ₹{s.monthlyPrice} · <LimitBadge val={s.monthlyLimit} />
                          </span>
                          <span className="text-slate-400 text-xs">·</span>
                          <span className="rounded-full bg-white/60 px-2.5 py-1 text-[11px] font-black text-slate-700">
                            Yearly ₹{s.yearlyPrice} · <LimitBadge val={s.yearlyLimit} />
                          </span>
                        </div>
                      </div>
                    );
                  })}

                  {/* Free plan */}
                  <div className="rounded-2xl border-2 border-green-100 bg-green-50 p-4 flex items-center gap-3">
                    <span className="text-xl">🆓</span>
                    <div>
                      <p className="text-sm font-black text-green-800">Free Plan</p>
                      <p className="text-xs text-green-600">Free templates only · No subscription required · Always free</p>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          {/* ── Template Prices tab ── */}
          {tab === 'prices' && (
            <div className="p-6">
              {loadingTpls ? (
                <div className="text-center py-10 text-slate-400">
                  <div className="inline-block h-7 w-7 animate-spin rounded-full border-4 border-slate-200 border-t-green-500" />
                </div>
              ) : templates.length === 0 ? (
                <div className="text-center py-16 text-slate-400">
                  <p className="text-5xl mb-3">💰</p>
                  <p className="font-black">No paid templates published yet</p>
                  <p className="text-sm mt-1">Publish Pro or Premium templates to set their prices here.</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {groupedByTier.map(({ tier, items }) => {
                    const ts = TIER_STYLE[tier];
                    return (
                      <div key={tier}>
                        <div className="flex items-center gap-2 mb-3">
                          <span className="text-lg">{ts.icon}</span>
                          <h3 className="font-black text-slate-800">{ts.label} Templates</h3>
                          <span className={`rounded-full px-2.5 py-0.5 text-xs font-black ${ts.badge}`}>
                            {items.length} published
                          </span>
                        </div>

                        <div className="space-y-2">
                          {items.map(t => {
                            const isSaving  = savingPrice === t.templateId;
                            const editedVal = editPrices[t.templateId] ?? String(t.price ?? 0);
                            const changed   = parseFloat(editedVal) !== (t.price ?? 0);
                            return (
                              <div key={t.templateId}
                                className="flex items-center gap-3 rounded-xl border-2 border-slate-100 bg-white p-3 hover:border-slate-200 transition">
                                {/* Thumbnail */}
                                <div className="h-12 w-16 flex-shrink-0 rounded-lg overflow-hidden bg-slate-100">
                                  {imgSrc(t) ? (
                                    <img src={imgSrc(t)} alt={t.name} className="w-full h-full object-cover" />
                                  ) : (
                                    <div className="w-full h-full flex items-center justify-center text-lg">🎨</div>
                                  )}
                                </div>

                                {/* Info */}
                                <div className="flex-1 min-w-0">
                                  <p className="font-black text-slate-800 text-sm truncate">{t.name}</p>
                                  <p className="text-xs text-slate-400">{t.categoryName}</p>
                                </div>

                                {/* Price input */}
                                <div className="flex items-center gap-2 flex-shrink-0">
                                  <div className="flex items-center gap-1.5 bg-slate-50 border-2 border-slate-200 rounded-xl px-3 py-1.5">
                                    <span className="text-xs font-black text-slate-400">₹</span>
                                    <input
                                      type="number" min={0} value={editedVal}
                                      onChange={e => setEditPrices(prev => ({ ...prev, [t.templateId]: e.target.value }))}
                                      className="w-20 text-sm font-black text-slate-900 bg-transparent outline-none"
                                    />
                                  </div>
                                  <motion.button
                                    whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                                    onClick={() => savePrice(t)}
                                    disabled={isSaving || !changed}
                                    className={`rounded-xl px-3 py-1.5 text-xs font-black transition ${
                                      changed && !isSaving
                                        ? 'bg-green-500 hover:bg-green-600 text-white'
                                        : 'bg-slate-100 text-slate-400 cursor-default'}`}>
                                    {isSaving ? '⏳' : '💾'}
                                  </motion.button>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Sticky footer close button */}
        <div className="flex-shrink-0 border-t border-slate-100 px-6 py-3 flex justify-end bg-white rounded-b-3xl">
          <button onClick={onClose}
            className="rounded-xl border-2 border-slate-200 bg-white px-5 py-2 text-sm font-black text-slate-600 hover:border-red-300 hover:text-red-500 transition">
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default MonthlyPoolModal;
