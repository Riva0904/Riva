import React from 'react'

const AppLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="app min-h-screen bg-slate-50 text-slate-900">
      {children}
    </div>
  )
}

export default AppLayout
