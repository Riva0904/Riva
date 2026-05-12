import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const reviews = [
  { name: 'Priya Sharma', loc: 'Mumbai', avatar: '👩', rating: 5, event: 'Wedding',
    text: 'We used the Pro Wedding template for our invitation. Guests loved the countdown timer and Google Maps link. Got 200+ RSVPs in 48 hours!' },
  { name: 'Arjun Patel', loc: 'Bangalore', avatar: '👨', rating: 5, event: 'Birthday',
    text: 'The neon birthday template was a huge hit at my daughter\'s party. Everyone was asking how we made such a cool digital invite. So easy to set up!' },
  { name: 'Meera Nair', loc: 'Chennai', avatar: '👩‍🦱', rating: 5, event: 'House Warming',
    text: 'Used the Grand Housewarming Pro template. The map integration saved so many calls asking for directions. Absolutely worth it!' },
  { name: 'Rahul Gupta', loc: 'Delhi', avatar: '🧑', rating: 5, event: 'Anniversary',
    text: 'Free templates are genuinely great quality. Created a beautiful anniversary invitation in under 10 minutes. My wife was impressed!' },
  { name: 'Sunita Reddy', loc: 'Hyderabad', avatar: '👩‍💼', rating: 5, event: 'Wedding',
    text: 'The floral wedding template is gorgeous. The falling petals animation made everyone want to know which app we used. Highly recommend!' },
];

const Testimonials: React.FC = () => {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setCurrent(c => (c + 1) % reviews.length), 4000);
    return () => clearInterval(t);
  }, []);

  return (
    <section className="px-4 py-20 sm:px-6 lg:px-8 overflow-hidden"
      style={{ background: 'var(--bg-card)' }}>
      <div className="mx-auto max-w-7xl">

        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }} className="text-center mb-12">
          <span className="section-label">Testimonials</span>
          <h2 className="text-3xl font-black tracking-tight sm:text-4xl"
            style={{ color: 'var(--text-heading)' }}>
            Loved by <span className="gradient-text">thousands of hosts</span>
          </h2>
          <div className="flex items-center justify-center gap-1 mt-3">
            {[1,2,3,4,5].map(i => <span key={i} className="text-amber-400 text-xl">★</span>)}
            <span className="ml-2 text-sm font-black" style={{ color: 'var(--text-muted)' }}>4.9 / 5 · 10k+ events created</span>
          </div>
        </motion.div>

        {/* Auto-sliding review */}
        <div className="max-w-2xl mx-auto mb-12">
          <AnimatePresence mode="wait">
            <motion.div key={current}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
              className="rounded-3xl p-8 text-center"
              style={{ background: 'var(--bg-page)', border: '1px solid var(--border-base)' }}>

              <div className="flex items-center justify-center gap-1 mb-4">
                {[1,2,3,4,5].map(i => (
                  <span key={i} className={`text-lg ${i <= reviews[current].rating ? 'text-amber-400' : 'text-slate-300'}`}>★</span>
                ))}
              </div>

              <p className="text-lg leading-7 font-medium mb-6"
                style={{ color: 'var(--text-body)' }}>
                "{reviews[current].text}"
              </p>

              <div className="flex items-center justify-center gap-3">
                <span className="text-3xl">{reviews[current].avatar}</span>
                <div className="text-left">
                  <p className="font-black text-sm" style={{ color: 'var(--text-heading)' }}>
                    {reviews[current].name}
                  </p>
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                    {reviews[current].loc} · {reviews[current].event}
                  </p>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Dots */}
          <div className="flex justify-center gap-2 mt-4">
            {reviews.map((_, i) => (
              <button key={i} onClick={() => setCurrent(i)}
                className="rounded-full transition-all duration-300"
                style={{
                  width: i === current ? 24 : 8,
                  height: 8,
                  background: i === current ? 'var(--color-primary)' : 'var(--border-base)',
                }} />
            ))}
          </div>
        </div>

        {/* All reviews grid (static) */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {reviews.slice(0, 3).map((r, i) => (
            <motion.div key={r.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="rounded-2xl p-5"
              style={{ background: 'var(--bg-page)', border: '1px solid var(--border-base)' }}>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{r.avatar}</span>
                  <div>
                    <p className="font-black text-xs" style={{ color: 'var(--text-heading)' }}>{r.name}</p>
                    <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{r.loc}</p>
                  </div>
                </div>
                <span className="rounded-full px-2 py-0.5 text-[10px] font-black"
                  style={{ background: 'rgba(var(--color-primary-rgb),0.1)', color: 'var(--color-primary)' }}>
                  {r.event}
                </span>
              </div>
              <div className="flex gap-0.5 mb-2">
                {[1,2,3,4,5].map(s => <span key={s} className="text-amber-400 text-xs">★</span>)}
              </div>
              <p className="text-xs leading-5" style={{ color: 'var(--text-muted)' }}>"{r.text}"</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
