import React from 'react'

interface MobileMenuProps {
  isOpen: boolean
}

const MobileMenu: React.FC<MobileMenuProps> = ({ isOpen }) => {
  return (
    <div className={`${isOpen ? 'block' : 'hidden'} md:hidden`}>
      <div className="border-b border-slate-200 bg-white px-6 py-4 shadow-sm">
        <nav className="flex flex-col gap-3 text-base font-medium text-slate-700">
          <a href="#" className="block rounded-xl px-4 py-3 transition hover:bg-slate-100">Home</a>
          <a href="#templates" className="block rounded-xl px-4 py-3 transition hover:bg-slate-100">Templates</a>
          <a href="#features" className="block rounded-xl px-4 py-3 transition hover:bg-slate-100">Features</a>
          <a href="#pricing" className="block rounded-xl px-4 py-3 transition hover:bg-slate-100">Pricing</a>
        </nav>
      </div>
    </div>
  )
}

export default MobileMenu
