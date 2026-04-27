import React from 'react'

const Hero: React.FC = () => {
  return (
    <section className="relative overflow-hidden bg-slate-50 px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-2 lg:gap-16 lg:py-20">
        <div className="space-y-8 pt-6 lg:pt-12">
          <span className="inline-flex rounded-full bg-purple-100 px-4 py-1 text-sm font-semibold text-purple-700 ring-1 ring-purple-200">
            Digital Invitation Landing Page
          </span>
          <h1 className="text-4xl font-bold tracking-tight text-slate-950 sm:text-5xl lg:text-6xl">
            Create <span className="gradient-text">Beautiful Invitations</span>
          </h1>
          <p className="max-w-2xl text-lg leading-8 text-slate-600">
            Design a modern invitation experience for events and celebrations with premium templates, animated details, and fully responsive pages.
          </p>

          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <a href="#templates" className="inline-flex items-center justify-center rounded-full bg-purple-600 px-8 py-4 text-sm font-semibold text-white shadow-xl shadow-purple-500/20 transition hover:-translate-y-0.5 hover:bg-purple-700">
              Browse templates
            </a>
            <a href="#pricing" className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white px-8 py-4 text-sm font-semibold text-slate-900 transition hover:border-slate-300">
              View pricing
            </a>
          </div>
        </div>

        <div className="relative mx-auto w-full max-w-2xl">
          <div className="absolute inset-x-0 top-10 h-80 rounded-[2rem] bg-purple-500/10 blur-3xl"></div>
          <img
            src="https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=900&q=80&fm=jpg"
            alt="Beautiful Invitation"
            loading="lazy"
            className="relative z-10 mx-auto w-full rounded-[2rem] border border-white/90 bg-white/70 object-cover shadow-2xl shadow-slate-900/10"
          />
        </div>
      </div>
    </section>
  )
}

export default Hero
