import React from 'react';

const Footer: React.FC = () => (
  <footer className="bg-dark-green px-4 py-14 sm:px-6 lg:px-8">
    <div className="mx-auto max-w-7xl">

      <div className="mb-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <div className="flex items-center gap-2.5 mb-4">
            <div className="logo-icon text-base" style={{ background: 'linear-gradient(135deg,#4ade80,#22c55e)', color: '#052e16' }}>R</div>
            <span className="text-lg font-black text-white">Digital<span style={{ color: '#4ade80' }}>Invitation</span></span>
          </div>
          <p className="text-sm leading-6" style={{ color: '#86efac' }}>
            Create beautiful digital invitations for every celebration.
          </p>
        </div>

        {[
          { title: 'Product',  links: [['Templates','#templates'],['Features','#features'],['Pricing','#pricing']] },
          { title: 'Account',  links: [['Login','/login'],['Register','/register'],['Dashboard','/dashboard']] },
          { title: 'Legal',    links: [['Terms','#'],['Privacy','#'],['Support','#']] },
        ].map(col => (
          <div key={col.title}>
            <h4 className="text-sm font-black text-white mb-4">{col.title}</h4>
            <ul className="space-y-2.5 text-sm" style={{ color: '#86efac' }}>
              {col.links.map(([label, href]) => (
                <li key={label}><a href={href} className="hover:text-white transition">{label}</a></li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="flex flex-col items-center justify-between gap-4 border-t pt-8 sm:flex-row"
        style={{ borderColor: 'rgba(74,222,128,0.2)' }}>
        <p className="text-sm" style={{ color: '#86efac' }}>
          © 2025 Riva Digital Invitation Platform. All rights reserved.
        </p>
        <span className="rounded-full px-3 py-1 text-xs font-black border"
          style={{ background: 'rgba(74,222,128,0.1)', color: '#4ade80', borderColor: 'rgba(74,222,128,0.3)' }}>
          🌱 Green by design
        </span>
      </div>
    </div>
  </footer>
);

export default Footer;
