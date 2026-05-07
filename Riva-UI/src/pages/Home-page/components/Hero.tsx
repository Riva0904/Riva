import React from 'react';

const Hero: React.FC = () => (
  <section className="bg-page relative overflow-hidden px-4 py-10 sm:px-6 lg:px-8">
    <div className="blob blob-green-1" />
    <div className="blob blob-green-2" />

    <div className="relative z-10 mx-auto grid max-w-7xl gap-10 lg:grid-cols-2 lg:gap-16 lg:py-20">

      <div className="space-y-8 pt-6 lg:pt-12">
        <span className="section-label">🌿 Digital Invitation Platform</span>

        <h1 className="text-4xl font-black tracking-tight text-slate-900 sm:text-5xl lg:text-6xl leading-tight">
          Create <span className="gradient-text">Beautiful</span><br />Invitations
        </h1>

        <p className="max-w-lg text-lg leading-8 text-slate-600">
          Design stunning invitation experiences for events and celebrations with premium templates, animated details, and fully responsive pages.
        </p>

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <a href="#templates" className="btn-green inline-flex w-auto items-center justify-center gap-2 rounded-full px-8">
            Browse Templates →
          </a>
          <a href="#pricing" className="btn-green-outline w-auto rounded-full px-8">
            View Pricing
          </a>
        </div>

        <div className="flex gap-8 pt-2">
          {[['500+', 'Templates'], ['10k+', 'Events'], ['99%', 'Satisfaction']].map(([num, label]) => (
            <div key={label}>
              <p className="text-2xl font-black text-green">{num}</p>
              <p className="text-xs font-semibold text-slate-500 mt-0.5">{label}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="relative mx-auto w-full max-w-2xl">
        <div className="blob blob-green-1 inset-x-0 top-10 h-80 rounded-3xl" />
        <img
          src="https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=900&q=80&fm=jpg"
          alt="Beautiful Invitation"
          loading="lazy"
          className="relative z-10 mx-auto w-full rounded-3xl object-cover shadow-2xl"
          style={{ border: '3px solid rgba(255,255,255,0.9)' }}
        />
        <div className="card-green absolute -bottom-4 -left-4 z-20 rounded-2xl px-4 py-3">
          <p className="text-xs font-bold text-slate-500">Guests invited</p>
          <p className="text-xl font-black text-green">2,847 ✓</p>
        </div>
      </div>
    </div>
  </section>
);

export default Hero;
