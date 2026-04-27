import React from 'react'

const Footer: React.FC = () => {
  return (
    <footer className="border-t border-slate-200 bg-slate-950 px-4 py-10 text-slate-400 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 text-center md:flex-row md:items-center md:justify-between">
        <p className="text-sm">© 2026 Digital Invitation. Crafted for memorable celebrations.</p>
        <div className="flex flex-wrap items-center justify-center gap-4 text-sm text-slate-400">
          <a href="#" className="transition hover:text-white">Terms</a>
          <a href="#" className="transition hover:text-white">Privacy</a>
          <a href="#" className="transition hover:text-white">Support</a>
        </div>
      </div>
    </footer>
  )
}

export default Footer
