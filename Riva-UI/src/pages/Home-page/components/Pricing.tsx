import React from 'react';

const plans = [
  { id:1, name:'Starter',  price:'$0',  period:'/mo', desc:'Basic invitation page for small events.',           features:['3 templates','Basic customisation','Email delivery','Guest RSVP'],                                        cta:'Get Started Free', premium:false },
  { id:2, name:'Premium',  price:'$19', period:'/mo', desc:'Everything for a premium wedding or party invite.', features:['Unlimited templates','Full customisation','Priority delivery','Analytics dashboard','Custom domain'], cta:'Choose Premium',   premium:true  },
  { id:3, name:'Business', price:'$45', period:'/mo', desc:'Custom branding and corporate invitation support.',  features:['All Premium features','White-label branding','API access','Dedicated support','SLA guarantee'],       cta:'Contact Sales',    premium:false },
];

const Pricing: React.FC = () => (
  <section id="pricing" className="bg-pricing-section px-4 py-20 sm:px-6 lg:px-8">
    <div className="mx-auto max-w-7xl">

      <div className="text-center mb-14">
        <span className="section-label">Pricing Plans</span>
        <h2 className="text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">
          Simple pricing for every <span className="gradient-text">celebration</span>
        </h2>
        <p className="mt-3 text-slate-500">No hidden fees. Cancel any time.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-3 items-start">
        {plans.map(p => (
          <div key={p.id} className={`price-card rounded-3xl p-8 shadow-xl transition duration-500 ${p.premium ? 'pulse-glow bg-dark-green' : 'bg-white border-2 border-green-100'}`}>

            {p.premium && (
              <div className="mb-4 inline-block rounded-full px-3 py-1 text-xs font-black"
                style={{ background: 'rgba(74,222,128,0.25)', color: '#4ade80' }}>
                ⭐ Most Popular
              </div>
            )}

            <h3 className={`text-2xl font-black ${p.premium ? 'text-white' : 'text-slate-900'}`}>{p.name}</h3>
            <div className="mt-3 flex items-end gap-1">
              <span className={`text-5xl font-black ${p.premium ? 'text-white' : 'text-slate-900'}`}>{p.price}</span>
              <span className={`mb-1.5 text-sm font-bold ${p.premium ? 'text-green-300' : 'text-slate-400'}`}>{p.period}</span>
            </div>
            <p className={`mt-3 text-sm leading-6 ${p.premium ? 'text-green-200' : 'text-slate-500'}`}>{p.desc}</p>

            <ul className="mt-6 space-y-2.5">
              {p.features.map(f => (
                <li key={f} className={`flex items-center gap-2 text-sm font-medium ${p.premium ? 'text-green-100' : 'text-slate-700'}`}>
                  <span className="flex-shrink-0" style={{ color: p.premium ? '#4ade80' : '#16a34a' }}>✓</span>
                  {f}
                </li>
              ))}
            </ul>

            <button className={`mt-8 w-full rounded-full py-3.5 text-sm font-black transition hover:opacity-90 ${p.premium ? '' : 'btn-green'}`}
              style={p.premium ? { background: 'linear-gradient(135deg,#4ade80,#22c55e)', color: '#052e16' } : {}}>
              {p.cta}
            </button>
          </div>
        ))}
      </div>
    </div>
  </section>
);

export default Pricing;
