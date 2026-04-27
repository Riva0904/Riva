import React from 'react'

const Features: React.FC = () => {
  const features = [
    {
      id: 1,
      icon: '🎉',
      title: 'Animated RSVP cards',
      description: 'Invite guests with interactive RSVP pages that look great on mobile and desktop.',
    },
    {
      id: 2,
      icon: '💌',
      title: 'Custom messaging',
      description: 'Personalize every invitation with messages, images, and photo galleries.',
    },
    {
      id: 3,
      icon: '✨',
      title: 'Modern themes',
      description: 'Choose from elegant templates with smooth glow and motion effects.',
    },
  ]

  return (
    <section id="features" className="bg-slate-950 py-24 px-4 sm:px-6 lg:px-8 text-white">
      <div className="mx-auto max-w-7xl">
        <div className="text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-purple-400">Feature highlights</p>
          <h2 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">Everything you need for a perfect invite</h2>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {features.map((feature) => (
            <div key={feature.id} className="feature-card relative overflow-hidden rounded-[2rem] border border-slate-800 bg-slate-900/90 p-8 text-center shadow-xl shadow-slate-950/30 transition hover:shadow-purple-500/30">
              <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-white/10 text-3xl backdrop-blur-sm">
                {feature.icon}
              </div>
              <h3 className="text-xl font-semibold text-white">{feature.title}</h3>
              <p className="mt-4 text-sm leading-7 text-slate-300">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default Features
