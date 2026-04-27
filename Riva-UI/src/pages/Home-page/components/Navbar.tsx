import React from 'react'

interface NavbarProps {
  onMenuToggle: () => void
}

const Navbar: React.FC<NavbarProps> = ({ onMenuToggle }) => {
  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/90 backdrop-blur-xl shadow-sm">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 lg:px-8">
        <a href="#" className="text-xl font-semibold tracking-tight text-slate-950">
          Digital<span className="text-purple-600">Invitation</span>
        </a>

        <nav className="hidden items-center gap-6 text-sm font-medium text-slate-600 md:flex">
          <a href="#" className="nav-link">
            Home
          </a>
          <a href="#templates" className="nav-link">
            Templates
          </a>
          <a href="#features" className="nav-link">
            Features
          </a>
          <a href="#pricing" className="nav-link">
            Pricing
          </a>
        </nav>

        <div className="flex items-center gap-3">
          <button className="hidden rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 md:inline-flex">
            Login
          </button>

          <button className="rounded-full bg-gradient-to-r from-purple-600 to-pink-500 px-5 py-2 text-sm font-semibold text-white shadow-lg shadow-purple-500/20 transition hover:opacity-95">
            Register
          </button>

          <button onClick={onMenuToggle} className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white p-2 text-slate-700 transition hover:bg-slate-100 md:hidden">
            ☰
          </button>
        </div>
      </div>
    </header>
  )
}

export default Navbar
