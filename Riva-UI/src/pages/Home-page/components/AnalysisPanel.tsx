import React from 'react';

const AnalysisPanel: React.FC = () => {
  return (
    <section className="rounded-3xl border border-slate-200 bg-white/90 p-8 shadow-xl">
      <h2 className="text-2xl font-semibold text-slate-950 mb-2">Platform Analysis</h2>
      <p className="text-sm text-slate-500 mb-6">Login to view your session analysis and template access.</p>
      <a href="/dashboard"
        className="inline-flex items-center gap-2 rounded-full bg-purple-600 px-6 py-3 text-sm font-semibold text-white hover:bg-purple-700 transition">
        Go to Dashboard →
      </a>
    </section>
  );
};

export default AnalysisPanel;
