import React from 'react'

const Pricing: React.FC = () => {
  const pricingPlans = [
    {
      id: 1,
      name: 'Starter',
      price: '$0',
      description: 'Basic invitation page for small events',
      buttonText: 'Get started',
      isPremium: false,
    },
    {
      id: 2,
      name: 'Premium',
      price: '$19',
      description: 'Everything for a premium wedding or party invite',
      buttonText: 'Choose premium',
      isPremium: true,
    },
    {
      id: 3,
      name: 'Business',
      price: '$45',
      description: 'Custom branding and corporate invitation support',
      buttonText: 'Contact sales',
      isPremium: false,
    },
  ]

  return (
    <section id="pricing" className="bg-white px-4 py-20 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl text-center">
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-purple-600">Pricing plans</p>
        <h2 className="mt-4 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">Simple pricing for every celebration</h2>
      </div>

      <div className="mt-12 grid gap-6 md:grid-cols-3">
        {pricingPlans.map((plan) => (
          <div
            key={plan.id}
            className={`price-card rounded-[2rem] border p-8 shadow-xl transition duration-500 ${
              plan.isPremium
                ? 'border-purple-300 bg-purple-50 shadow-purple-200/40 pulse-glow'
                : 'border-slate-200 bg-white'
            }`}
          >
            <h3 className={`text-2xl font-semibold ${plan.isPremium ? 'text-purple-700' : 'text-slate-900'}`}>
              {plan.name}
            </h3>
            <p className="mt-4 text-5xl font-bold tracking-tight text-slate-950">{plan.price}</p>
            <p className="mt-4 text-sm leading-7 text-slate-600">{plan.description}</p>
            <button className={`mt-10 inline-flex w-full justify-center rounded-full px-6 py-3 text-sm font-semibold transition ${
              plan.isPremium
                ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/20 hover:bg-purple-700'
                : 'border border-slate-300 bg-white text-slate-900 hover:bg-slate-50'
            }`}>
              {plan.buttonText}
            </button>
          </div>
        ))}
      </div>
    </section>
  )
}

export default Pricing
