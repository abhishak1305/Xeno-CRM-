import { NavLink, Outlet, useLocation, Link } from 'react-router-dom';
import { BarChart3, Users, Layers, Send, Sparkles, Settings } from 'lucide-react';

const navItems = [
  { to: '/dashboard', icon: BarChart3, label: 'Dashboard' },
  { to: '/customers', icon: Users, label: 'Shoppers' },
  { to: '/segments', icon: Layers, label: 'Segments' },
  { to: '/campaigns', icon: Send, label: 'Campaigns' },
  { to: '/copilot', icon: Sparkles, label: 'AI Copilot' },
];

export default function Layout() {
  const location = useLocation();
  // Don't wrap landing page in the sidebar layout
  if (location.pathname === '/') {
    return <Outlet />;
  }

  return (
    <div className="min-h-screen flex bg-[#f8f9fa] text-slate-800 font-sans">
      {/* Sidebar - Collapsible */}
      <aside className="w-[72px] hover:w-64 group bg-white border-r border-slate-200 flex flex-col fixed h-full z-30 transition-all duration-300 ease-in-out overflow-hidden shadow-sm">
        
        {/* Brand */}
        <div className="h-20 flex items-center px-5 border-b border-slate-100 whitespace-nowrap">
          <Link to="/" className="flex items-center gap-3 w-full cursor-pointer hover:opacity-80 transition-opacity">
            <div className="flex-shrink-0 bg-slate-900 p-2 rounded-xl flex items-center justify-center">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 w-full">
              <h1 className="font-extrabold text-lg tracking-tight text-slate-900">
                Xeno
              </h1>
            </div>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-6 space-y-2">
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/dashboard'}
              className={({ isActive }) =>
                `flex items-center gap-4 px-5 py-3 relative whitespace-nowrap transition-colors duration-200 ${
                  isActive
                    ? 'text-slate-900 bg-slate-50'
                    : 'text-slate-400 hover:text-slate-900 hover:bg-slate-50/50'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  {isActive && (
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#f97316] rounded-r-full" />
                  )}
                  <Icon className={`h-6 w-6 flex-shrink-0 ${isActive ? 'text-[#f97316]' : ''}`} strokeWidth={isActive ? 2.5 : 2} />
                  <span className={`text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${isActive ? 'font-bold' : ''}`}>
                    {label}
                  </span>
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Footer Settings Icon */}
        <div className="p-5 border-t border-slate-100 flex items-center gap-4 text-slate-400 whitespace-nowrap hover:text-slate-900 cursor-pointer transition-colors duration-200">
           <Settings className="h-6 w-6 flex-shrink-0" />
           <span className="text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-300">
             Settings
           </span>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-[72px]">
        <div className="max-w-[1600px] mx-auto p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
