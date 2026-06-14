import { Link, useNavigate } from 'react-router-dom';
import { Search, Phone, ChevronDown, Sparkles } from 'lucide-react';

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen font-sans bg-white text-slate-900 overflow-x-hidden relative selection:bg-[#ccff00] selection:text-slate-900">
      {/* Background Gradient Blob */}
      <div className="absolute top-0 inset-x-0 h-[800px] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-100/80 via-blue-50/30 to-white -z-10 pointer-events-none"></div>

      {/* Navbar */}
      <header className="relative z-10 max-w-[1400px] mx-auto px-6 py-6 flex items-center justify-between">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
          <div className="bg-slate-900 p-1.5 rounded-lg flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-2xl tracking-tight">Xeno</span>
        </div>

        <nav className="hidden lg:flex items-center gap-8 text-sm font-medium text-slate-600">
          <button className="hover:text-slate-900 flex items-center gap-1 transition-colors">Products <ChevronDown className="w-4 h-4" /></button>
          <button className="hover:text-slate-900 flex items-center gap-1 transition-colors">Solutions <ChevronDown className="w-4 h-4" /></button>
          <button className="hover:text-slate-900 transition-colors">Pricing</button>
          <button className="hover:text-slate-900 flex items-center gap-1 transition-colors">Resources <ChevronDown className="w-4 h-4" /></button>
          <button className="hover:text-slate-900 flex items-center gap-1 transition-colors">Company <ChevronDown className="w-4 h-4" /></button>
        </nav>

        <div className="flex items-center gap-4">
          <button className="hidden sm:flex items-center justify-center w-10 h-10 rounded-full border border-slate-200 hover:border-slate-300 text-slate-600 transition-colors">
            <Search className="w-4 h-4" />
          </button>
          <button className="hidden sm:flex items-center justify-center w-10 h-10 rounded-full border border-slate-200 hover:border-slate-300 text-slate-600 transition-colors">
            <Phone className="w-4 h-4" />
          </button>
          <Link to="/dashboard" className="hidden sm:block px-5 py-2.5 rounded-full border border-slate-200 text-sm font-medium hover:border-slate-300 transition-colors">
            Log in
          </Link>
          <Link to="/dashboard" className="px-5 py-2.5 rounded-full bg-slate-900 text-white text-sm font-medium hover:bg-slate-800 transition-colors shadow-lg shadow-slate-900/20">
            Sign up for free
          </Link>
        </div>
      </header>

      {/* Main Video Presentation - Full Width Faded */}
      <div className="relative w-full h-screen overflow-hidden bg-slate-50 mb-12">
        <video
          className="absolute inset-0 w-full h-full object-cover opacity-80"
          autoPlay
          muted
          loop
          playsInline
        >
          <source src="/media/xeno-landing-video.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-50/40 via-white/40 to-transparent"></div>
      </div>

      {/* Hero Content */}
      <main className="relative z-10 max-w-6xl mx-auto px-6 pt-20 pb-16 text-center">
        <div className="inline-flex items-center px-4 py-1.5 rounded-full border border-slate-200 bg-white/50 backdrop-blur-sm text-xs font-semibold tracking-wider text-slate-500 uppercase mb-8 shadow-sm">
          10,000+ BRANDS POWERED WORLDWIDE
        </div>

        <h1 className="text-5xl md:text-6xl lg:text-[72px] font-medium tracking-tight text-slate-900 leading-[1.1] mb-4">
          Super Charge <span className="bg-[#ccff00] px-4 py-1 rounded-xl inline-block -rotate-1 shadow-sm">Engagement</span><br />
          with Smart Automation AI
        </h1>

        <p className="max-w-2xl mx-auto text-slate-500 text-lg mb-10 leading-relaxed">
          Speed up customer reach with AI-powered insights, predictive forecasts,<br className="hidden sm:block" />
          and seamless workflows—all on a trusted platform
        </p>

        <div className="flex items-center justify-center gap-4">
          <Link to="/dashboard" className="px-8 py-3.5 rounded-full bg-[#ccff00] text-slate-900 font-semibold hover:bg-[#bfee00] transition-colors shadow-lg shadow-[#ccff00]/20">
            Start Free Trial
          </Link>
          <button className="px-8 py-3.5 rounded-full border border-slate-200 text-slate-900 font-semibold hover:border-slate-300 bg-white/50 backdrop-blur-sm transition-colors">
            Request Demo
          </button>
        </div>
      </main>

      {/* Visuals Section */}
      <div className="relative z-10 w-full max-w-[1200px] mx-auto h-[400px] sm:h-[500px] mt-10 mb-32 flex justify-center perspective-[1200px]">

        {/* Outer Left: Line Chart */}
        <div className="absolute left-[5%] top-10 w-[240px] h-[340px] bg-white rounded-3xl shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)] border border-slate-100 p-6 flex flex-col z-0 transition-transform duration-500 hover:-translate-y-4" style={{ transform: 'rotateY(15deg) rotateZ(-5deg) translateZ(-50px)' }}>
          <div className="flex justify-between items-center mb-10">
            <div className="flex gap-1">
              <div className="w-8 h-2 bg-slate-100 rounded-full"></div>
              <div className="w-4 h-2 bg-slate-100 rounded-full"></div>
            </div>
            <div className="w-6 h-4 bg-slate-100 rounded flex items-center justify-center">
              <span className="text-[6px] text-slate-400">...</span>
            </div>
          </div>
          <div className="bg-emerald-50 text-emerald-600 text-[10px] font-bold px-2 py-1 rounded-full w-fit mb-1 border border-emerald-100">
            ↑ 12% vs last month
          </div>

          <div className="flex-1 mt-6 relative">
            <svg viewBox="0 0 100 50" className="w-full h-full overflow-visible">
              {/* Grid lines */}
              <line x1="0" y1="25" x2="100" y2="25" stroke="#f1f5f9" strokeWidth="1" />
              <line x1="0" y1="50" x2="100" y2="50" stroke="#f1f5f9" strokeWidth="1" />
              {/* Chart Line */}
              <path d="M 0 40 L 40 40 L 60 10 L 100 20" fill="none" stroke="#0f172a" strokeWidth="2" strokeLinejoin="round" />
              {/* Highlight Point */}
              <circle cx="60" cy="10" r="4" fill="#ccff00" stroke="#0f172a" strokeWidth="1.5" />
            </svg>
          </div>
          <div className="flex justify-between text-[10px] text-slate-400 font-medium mt-4 px-2">
            <span>17-21</span>
            <span className="bg-slate-900 text-white px-2 py-0.5 rounded-full">24-28</span>
          </div>
        </div>

        {/* Inner Left: Holographic Wave */}
        <div className="absolute left-[22%] top-20 w-[240px] h-[280px] rounded-[32px] overflow-hidden shadow-[0_20px_50px_-12px_rgba(0,0,0,0.15)] z-10 transition-transform duration-500 hover:-translate-y-4">
          <img src="/holo_wave.png" alt="Holographic background" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-white/60 via-transparent to-transparent"></div>
          <div className="absolute top-6 left-6 right-6">
            <h3 className="text-2xl font-bold text-slate-900 tracking-tight">150,000+</h3>
            <p className="text-sm font-medium text-slate-600/90 mt-1">Users rely daily</p>
          </div>
        </div>

        {/* Center: Portrait Pointing */}
        <div className="absolute left-1/2 -translate-x-1/2 top-4 w-[280px] h-[340px] rounded-[32px] overflow-hidden shadow-[0_25px_50px_-12px_rgba(0,0,0,0.25)] z-20 transition-transform duration-500 hover:-translate-y-4">
          <img src="/guy_pointing.png" alt="Professional pointing" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-white/90 via-white/20 to-transparent"></div>
          <div className="absolute bottom-6 left-0 right-0 text-center px-4">
            <p className="text-[15px] font-semibold text-slate-800">
              <span className="font-bold text-slate-900 text-lg">500+</span> Enterprises onboarded
            </p>
          </div>
        </div>

        {/* Inner Right: VR Head */}
        <div className="absolute right-[22%] top-20 w-[240px] h-[280px] rounded-[32px] overflow-hidden shadow-[0_20px_50px_-12px_rgba(0,0,0,0.15)] z-10 transition-transform duration-500 hover:-translate-y-4">
          <img src="/vr_head.png" alt="VR Head" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-white/80 via-white/10 to-transparent"></div>
          <div className="absolute bottom-6 left-6 right-6 text-center">
            <h3 className="text-2xl font-bold text-slate-900 tracking-tight">10,000+</h3>
            <p className="text-sm font-medium text-slate-600/90 mt-1 leading-snug">Teams powered<br />worldwide</p>
          </div>
        </div>

        {/* Outer Right: Balance UI */}
        <div className="absolute right-[5%] top-10 w-[240px] h-[340px] bg-white rounded-3xl shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)] border border-slate-100 p-6 flex flex-col z-0 transition-transform duration-500 hover:-translate-y-4" style={{ transform: 'rotateY(-15deg) rotateZ(5deg) translateZ(-50px)' }}>
          <p className="text-slate-500 font-medium text-sm text-center mt-2">Balance</p>
          <div className="text-center mt-12 mb-10">
            <h2 className="text-3xl font-medium tracking-tight text-slate-900">$72,840.00</h2>
            <div className="w-16 h-1 bg-slate-200 mx-auto rounded-full mt-4"></div>
          </div>
          <div className="mt-auto bg-[#ccff00] rounded-xl p-3 flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-slate-900"></div>
            <span className="text-slate-900 text-xs font-semibold">Active</span>
          </div>
        </div>

      </div>

      {/* Logos Section */}
      <div className="py-16 border-t border-slate-100 bg-[#f8f9fa] flex flex-wrap justify-center xl:justify-between items-center gap-10 px-12 xl:px-32">
        <p className="text-sm font-bold tracking-widest text-slate-500 uppercase mr-4">
          TRUSTED BY
        </p>

        {/* Google */}
        <div className="text-2xl font-bold flex items-center transition-all duration-300 hover:drop-shadow-[0_0_12px_rgba(66,133,244,0.6)] hover:scale-105 cursor-pointer">
          <span className="text-[#4285F4]">G</span>
          <span className="text-[#EA4335]">o</span>
          <span className="text-[#FBBC05]">o</span>
          <span className="text-[#4285F4]">g</span>
          <span className="text-[#34A853]">l</span>
          <span className="text-[#EA4335]">e</span>
        </div>

        {/* Meta */}
        <div className="text-3xl font-medium text-[#1C2B33] flex items-center gap-1 transition-all duration-300 hover:drop-shadow-[0_0_12px_rgba(0,100,224,0.5)] hover:scale-105 cursor-pointer">
          <span className="text-[#0064E0] text-4xl -mt-1 font-bold">∞</span> Meta
        </div>

        {/* Netflix */}
        <div className="text-3xl font-bold text-[#E50914] tracking-tighter scale-y-110 transition-all duration-300 hover:drop-shadow-[0_0_12px_rgba(229,9,20,0.6)] hover:scale-105 cursor-pointer">
          NETFLIX
        </div>

        {/* Airbnb */}
        <div className="text-2xl font-bold text-[#FF5A5F] tracking-tight flex items-center gap-1.5 transition-all duration-300 hover:drop-shadow-[0_0_12px_rgba(255,90,95,0.6)] hover:scale-105 cursor-pointer">
          <svg className="w-8 h-8 fill-current" viewBox="0 0 1000 1000">
            <path d="M499.3 736.7c-51-64-81-120.1-91-168.1-10-39-6-70 11-93 18-27 45-40 80-40s62 13 80 40c17 23 21 54 11 93-11 49-41 105-91 168.1zm362.2 43c-7 47-39 86-83 105-85 37-169.1-22-241.1-102 119.1-149.1 141.1-265.1 90-340.2-30-43-73-64-128.1-64-55 0-98 21-128.1 64-51 75.1-29 191.1 90 340.2-72 80-156.1 139-241.1 102-44-19-76-58-83-105-9-61 14-127 63-187 40-49 93-102 153-157 78-70 120.1-118.1 129.1-150.1 10-39-6-70-11-93-18-27-45-40-80-40s-62 13-80 40c-17 23-21 54-11 93 11 49 41 105 91 168.1 7 47 39 86 83 105 85-37 169.1 22 241.1 102-119.1 149.1-141.1 265.1-90 340.2 30 43 73 64 128.1 64 55 0 98-21 128.1-64 51-75.1 29-191.1-90-340.2 72-80 156.1-139 241.1-102 44 19 76 58 83 105z" />
          </svg>
          airbnb
        </div>

        {/* PayPal */}
        <div className="text-2xl font-bold text-[#003087] italic flex items-center transition-all duration-300 hover:drop-shadow-[0_0_12px_rgba(0,121,193,0.6)] hover:scale-105 cursor-pointer">
          <span className="text-[#0079C1] font-extrabold text-3xl">P</span>
          PayPal
        </div>
      </div>

    </div>
  );
}
