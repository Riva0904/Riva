import React from 'react';

const templates = [
  { id: 1, title: 'Birthday Glow',   tag: 'Birthday',    image: 'https://images.unsplash.com/photo-1530103043960-ef38714abb15?w=900&q=80&fm=jpg' },
  { id: 2, title: 'Wedding Classic', tag: 'Wedding',     image: 'https://images.unsplash.com/photo-1522673607200-164d1b6ce486?w=900&q=80&fm=jpg' },
  { id: 3, title: 'Party Night',     tag: 'Celebration', image: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=900&q=80&fm=jpg' },
];

const Templates: React.FC = () => (
  <section id="templates" className="bg-templates-section px-4 py-20 sm:px-6 lg:px-8">
    <div className="mx-auto max-w-7xl">

      <div className="text-center mb-12">
        <span className="section-label">Modern Templates</span>
        <h2 className="text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">
          Designed for <span className="gradient-text">celebration moments</span>
        </h2>
        <p className="mt-3 text-slate-500 max-w-xl mx-auto">
          Pick from hundreds of stunning templates and customise them in minutes.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 lg:gap-8">
        {templates.map(t => (
          <div key={t.id} className="shine-card card-hover group card-green transition duration-500 hover:-translate-y-2">
            <div className="relative overflow-hidden" style={{ paddingTop: '75%' }}>
              <img src={t.image} alt={t.title} loading="lazy"
                className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-105" />
              <div className="absolute inset-0 bg-green-900/30 opacity-0 group-hover:opacity-100 transition duration-300" />
              <span className="section-label absolute top-4 left-4 mb-0 bg-green-700/80 text-white backdrop-blur-sm">
                {t.tag}
              </span>
            </div>
            <div className="flex items-center justify-between px-6 py-5 border-t-2 border-green-100">
              <span className="text-lg font-black text-slate-900">{t.title}</span>
              <span className="btn-green w-auto rounded-full px-4 py-1 text-xs">Use →</span>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-10 text-center">
        <a href="/register" className="btn-green inline-flex w-auto items-center justify-center rounded-full px-8">
          View All Templates →
        </a>
      </div>
    </div>
  </section>
);

export default Templates;
