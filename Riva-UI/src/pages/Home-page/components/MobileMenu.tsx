import React from 'react';

interface MobileMenuProps { isOpen: boolean; }

const MobileMenu: React.FC<MobileMenuProps> = ({ isOpen }) => (
  <div className={`${isOpen ? 'block' : 'hidden'} md:hidden`}>
    <div className="border-b border-green-100 bg-white px-6 py-4 shadow-sm">
      <nav className="flex flex-col gap-2">
        <a href="/"          className="navbar-link block rounded-xl px-4 py-3 hover:bg-green-50">Home</a>
        <a href="#templates" className="navbar-link block rounded-xl px-4 py-3 hover:bg-green-50">Templates</a>
        <a href="#features"  className="navbar-link block rounded-xl px-4 py-3 hover:bg-green-50">Features</a>
        <a href="#pricing"   className="navbar-link block rounded-xl px-4 py-3 hover:bg-green-50">Pricing</a>
        <div className="mt-2 flex flex-col gap-2 border-t border-green-100 pt-3">
          <a href="/login"    className="btn-green-outline">Login</a>
          <a href="/register" className="btn-green text-center">Get Started</a>
        </div>
      </nav>
    </div>
  </div>
);

export default MobileMenu;
