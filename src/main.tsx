import React from 'react'
import ReactDOM from 'react-dom/client'
import BrunoChat from './components/ai/BrunoChat'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <div className="min-h-screen bg-gradient-to-br from-[#F8F5F2] to-[#EDE6DD]">
      {/* Landing Page Header */}
      <header className="pt-12 pb-8 px-4 text-center">
        <h1 className="text-[clamp(2rem,5vw,3rem)] font-bold text-tz-dark">
          Meet Bruno 
        </h1>
        <p className="mt-3 max-w-xl mx-auto text-[15px] md:text-base text-tz-earth/70 leading-relaxed">
          Your friendly, knowledgeable companion who knows everything about Tanzania history, culture, geography, people, and more.
        </p>
      </header>

      {/* Main Chat Section */}
      <main className="flex justify-center pb-20">
        <BrunoChat />
      </main>

      {/* Footer */}
      <footer className="text-center pb-6 text-[12px] text-tz-earth/50">
      Open Source
      </footer>
    </div>
  </React.StrictMode>,
)