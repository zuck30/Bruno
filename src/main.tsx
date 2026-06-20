import React from 'react'
import ReactDOM from 'react-dom/client'
import BrunoChat from './components/ai/BrunoChat'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <div className="min-h-screen kitenge-bg bg-[#F8F5F2] relative">
      {/* Kitenge Border Top */}
      <div className="h-1.5 w-full kitenge-border-top" />
      
      {/* Kitenge Border Bottom */}
      <div className="h-1.5 w-full kitenge-border-bottom fixed bottom-0" />

      {/* Landing Page Header */}
      <header className="pt-12 pb-8 px-4 text-center relative">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-[clamp(2rem,5vw,3rem)] font-bold text-tz-dark">
            Meet <span className="text-tz-kitenge-brown">Bruno</span>
          </h1>
          
          {/* Kitenge decorative line */}
          <div className="flex items-center justify-center gap-3 my-4">
            <div className="h-px w-12 bg-gradient-to-r from-transparent to-tz-kitenge-brown/30" />
            <div className="flex gap-1">
              <div className="w-1.5 h-1.5 rounded-full bg-tz-kitenge-brown" />
              <div className="w-1.5 h-1.5 rounded-full bg-tz-kitenge-orange" />
              <div className="w-1.5 h-1.5 rounded-full bg-tz-kitenge-gold" />
              <div className="w-1.5 h-1.5 rounded-full bg-tz-kitenge-tan" />
            </div>
            <div className="h-px w-12 bg-gradient-to-l from-transparent to-tz-kitenge-brown/30" />
          </div>
          
          <p className="mt-3 max-w-xl mx-auto text-[15px] md:text-base text-tz-earth/70 leading-relaxed">
            Your friendly, knowledgeable companion who knows everything about Tanzania history, culture, geography, people, and more.
          </p>
        </div>
      </header>

      {/* Main Chat Section */}
      <main className="flex justify-center pb-20">
        <BrunoChat />
      </main>

      {/* Footer */}
      <footer className="text-center pb-6 text-[12px] text-tz-earth/40 relative">
        <div className="flex items-center justify-center gap-3">
          <div className="h-px w-8 bg-tz-kitenge-brown/20" />
          <span>Open Source</span>
          <div className="h-px w-8 bg-tz-kitenge-brown/20" />
        </div>
      </footer>
    </div>
  </React.StrictMode>,
)