import React, { useState } from 'react'
import Navbar from './components/Navbar'
import MobileMenu from './components/MobileMenu'
import Hero from './components/Hero'
import Templates from './components/Templates'
import Features from './components/Features'
import Pricing from './components/Pricing'
import Footer from './components/Footer'
import './styles.scss'

const HomePage: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const handleMenuToggle = () => {
    setIsMenuOpen(!isMenuOpen)
  }

  return (
    <div className="relative overflow-hidden">
      <Navbar onMenuToggle={handleMenuToggle} />
      <MobileMenu isOpen={isMenuOpen} />
      <main className="relative">
        <Hero />
        <Templates />
        <Features />
        <Pricing />
        <Footer />
      </main>
    </div>
  )
}

export default HomePage
