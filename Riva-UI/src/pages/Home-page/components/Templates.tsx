import React from 'react'

const Templates: React.FC = () => {
  const templates = [
    {
      id: 1,
      title: 'Birthday Glow',
      image: 'https://images.unsplash.com/photo-1530103043960-ef38714abb15?w=900&q=80&fm=jpg',
    },
    {
      id: 2,
      title: 'Wedding Classic',
      image: 'https://images.unsplash.com/photo-1522673607200-164d1b6ce486?w=900&q=80&fm=jpg',
    },
    {
      id: 3,
      title: 'Party Night',
      image: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=900&q=80&fm=jpg',
    },
  ]

  return (
    <section id="templates" className="bg-slate-50 px-4 py-16 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.28em] text-purple-600">Modern invitation themes</p>
          <h2 className="mt-4 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">Designed for celebration moments</h2>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 lg:gap-8">
          {templates.map((template) => (
            <div
              key={template.id}
              className="shine-card card-hover overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-lg transition duration-500 hover:-translate-y-2"
            >
              <div className="relative overflow-hidden pt-[80%]">
                <img
                  src={template.image}
                  alt={template.title}
                  loading="lazy"
                  className="absolute inset-0 h-full w-full object-cover"
                />
              </div>
              <div className="border-t border-slate-200 px-6 py-5 text-lg font-semibold text-slate-900">
                {template.title}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default Templates
