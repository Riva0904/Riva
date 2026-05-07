import React from 'react';

const features = [
  { id: 1, icon: '🎉', title: 'Animated RSVP Cards', desc: 'Invite guests with interactive RSVP pages that look great on mobile and desktop.' },
  { id: 2, icon: '💌', title: 'Custom Messaging',    desc: 'Personalise every invitation with messages, images, and photo galleries.' },
  { id: 3, icon: '✨', title: 'Modern Themes',       desc: 'Choose from elegant templates with smooth glow and motion effects.' },
];

const extras = [['🌍','Global Reach'],['⚡','Instant Delivery'],['🔒','Secure & Private'],['📱','Mobile First']];

const Features: React.FC = () => (
  <section id="features" className="bg-dark-green py-24 px-4 sm:px-6 lg:px-8">
    <div className="mx-auto max-w-7xl">

      <div className="text-center mb-14">
        <span className="inline-block rounded-full px-4 py-1 text-sm font-black mb-4 border"
          style={{ background: 'rgba(74,222,128,0.15)', color: '#4ade80', borderColor: 'rgba(74,222,128,0.3)' }}>
          Feature Highlights
        </span>
        <h2 className="text-3xl font-black tracking-tight text-white sm:text-4xl">
          Everything you need for a<br />
          <span style={{ color: '#4ade80' }}>perfect invite</span>
        </h2>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {features.map(f => (
          <div key={f.id} className="feature-card relative overflow-hidden rounded-3xl p-8 text-center shadow-xl transition hover:-translate-y-2 duration-300"
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(74,222,128,0.2)' }}>
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl text-3xl"
              style={{ background: 'rgba(74,222,128,0.15)', border: '1px solid rgba(74,222,128,0.3)' }}>
              {f.icon}
            </div>
            <h3 className="text-xl font-black text-white">{f.title}</h3>
            <p className="mt-4 text-sm leading-7" style={{ color: '#86efac' }}>{f.desc}</p>
          </div>
        ))}
      </div>

      <div className="mt-16 grid grid-cols-2 gap-4 md:grid-cols-4">
        {extras.map(([icon, label]) => (
          <div key={label} className="flex flex-col items-center gap-2 rounded-2xl p-4 text-center"
            style={{ background: 'rgba(255,255,255,0.04)' }}>
            <span className="text-2xl">{icon}</span>
            <span className="text-sm font-black" style={{ color: '#a7f3d0' }}>{label}</span>
          </div>
        ))}
      </div>
    </div>
  </section>
);

export default Features;
