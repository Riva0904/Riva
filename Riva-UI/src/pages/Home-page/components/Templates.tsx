import React from 'react';
import { motion } from 'framer-motion';

const TEMPLATES = [
  { id: 1, title: 'Birthday Glow',   tag: 'Birthday',    image: 'https://images.unsplash.com/photo-1530103043960-ef38714abb15?w=900&q=80&fm=jpg' },
  { id: 2, title: 'Wedding Classic', tag: 'Wedding',     image: 'https://images.unsplash.com/photo-1522673607200-164d1b6ce486?w=900&q=80&fm=jpg' },
  { id: 3, title: 'Party Night',     tag: 'Celebration', image: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=900&q=80&fm=jpg' },
];

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.15 } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' as const } },
};

const Templates: React.FC = () => (
  <section id="templates" className="bg-templates-section px-4 py-20 sm:px-6 lg:px-8">
    <div className="mx-auto max-w-7xl">

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.55 }}
        className="text-center mb-12">
        <span className="section-label">Modern Templates</span>
        <h2 className="text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">
          Designed for <span className="gradient-text">celebration moments</span>
        </h2>
        <p className="mt-3 text-slate-500 max-w-xl mx-auto">
          Pick from hundreds of stunning templates and customise them in minutes.
        </p>
      </motion.div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 lg:gap-8">
        {TEMPLATES.map(t => (
          <motion.div
            key={t.id}
            variants={cardVariants}
            whileHover={{ y: -10, transition: { type: 'spring', stiffness: 300, damping: 18 } }}
            className="shine-card card-green group overflow-hidden rounded-2xl cursor-pointer">
            <div className="relative overflow-hidden" style={{ paddingTop: '75%' }}>
              <motion.img
                src={t.image} alt={t.title} loading="lazy"
                className="absolute inset-0 h-full w-full object-cover"
                whileHover={{ scale: 1.07 }}
                transition={{ duration: 0.5 }} />
              <motion.div
                className="absolute inset-0 bg-green-900/30"
                initial={{ opacity: 0 }}
                whileHover={{ opacity: 1 }}
                transition={{ duration: 0.3 }} />
              <span className="section-label absolute top-4 left-4 mb-0 bg-green-700/80 text-white backdrop-blur-sm">
                {t.tag}
              </span>
            </div>
            <div className="flex items-center justify-between px-6 py-5 border-t-2 border-green-100">
              <span className="text-lg font-black text-slate-900">{t.title}</span>
              <motion.a
                href="/register"
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.95 }}
                transition={{ type: 'spring', stiffness: 400, damping: 17 }}
                className="btn-green w-auto rounded-full px-4 py-1 text-xs">
                Use →
              </motion.a>
            </div>
          </motion.div>
        ))}
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="mt-10 text-center">
        <motion.a
          href="/register"
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.97 }}
          transition={{ type: 'spring', stiffness: 350, damping: 18 }}
          className="btn-green inline-flex w-auto items-center justify-center rounded-full px-8">
          View All Templates →
        </motion.a>
      </motion.div>
    </div>
  </section>
);

export default Templates;
