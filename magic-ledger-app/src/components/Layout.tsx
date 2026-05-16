import { ReactNode } from 'react';
import { NavLink, Link, useLocation } from 'react-router-dom';
import clsx from 'clsx';

function NavItem({ to, icon, label, fillIcon = false }: { to: string, icon: string, label: string, fillIcon?: boolean }) {
  const location = useLocation();
  const isActive = location.pathname === to;

  return (
    <NavLink
      to={to}
      className={({ isActive }) => clsx(
        "px-4 py-3 flex items-center gap-3 transition-all duration-300 rounded-xl",
        isActive 
          ? "bg-secondary-container text-on-secondary-container shadow-md transform -translate-y-1 scale-95" 
          : "text-castle-gray hover:text-sorcerer-blue hover:bg-surface-container-low hover:translate-x-2"
      )}
    >
      <span 
        className="material-symbols-outlined" 
        style={isActive || fillIcon ? { fontVariationSettings: "'FILL' 1" } : undefined}
      >
        {icon}
      </span>
      <span className="text-sm font-bold tracking-wider">{label}</span>
      {/* Hide label on mobile sometimes? We'll make separate bottom nav */}
    </NavLink>
  );
}

function MobileNavItem({ to, icon, label }: { to: string, icon: string, label: string }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) => clsx(
        "flex flex-col items-center justify-center p-2 transition-colors",
        isActive ? "text-sorcerer-blue" : "text-castle-gray hover:text-sorcerer-blue"
      )}
    >
      <span className="material-symbols-outlined">{icon}</span>
      <span className="text-xs font-medium mt-1">{label}</span>
    </NavLink>
  );
}

export function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="flex h-screen w-full overflow-hidden bg-stardust-white text-on-surface">
      {/* SideNavBar (Desktop) */}
      <nav className="h-full w-72 fixed left-0 top-0 hidden md:flex flex-col border-r border-surface-variant/30 bg-stardust-white/95 backdrop-blur-md shadow-[0_10px_30px_rgba(17,60,207,0.08)] z-40">
        <div className="flex flex-col h-full p-6 gap-2">
          <div className="flex flex-col items-center py-8 mb-4">
            <Link to="/">
              <div className="w-16 h-16 rounded-full bg-secondary-container flex items-center justify-center mb-4 shadow-md text-on-secondary-container mx-auto">
                <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1", fontSize: "32px" }}>family_restroom</span>
              </div>
            </Link>
            <h2 className="text-2xl font-extrabold text-mickey-red text-center">我們的魔法帳本</h2>
            <p className="text-sm font-bold text-castle-gray mt-2 text-center">今日結餘：$12,450</p>
          </div>
          
          <div className="flex-1 flex flex-col gap-2">
            <NavItem to="/" icon="dashboard" label="魔法儀表板" />
            <NavItem to="/reports" icon="auto_awesome" label="家計報告" />
            <NavItem to="/transactions" icon="list_alt" label="交易明細" />
            <NavItem to="/members" icon="family_restroom" label="家族成員" />
            {/* Keeping it simple for UI mapping */}
          </div>
          
          <div className="mt-auto pt-4 pb-4">
            <Link to="/quick-add" className="w-full bg-mickey-red text-on-primary py-4 rounded-full shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex items-center justify-center gap-2 relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]"></div>
              <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>add_circle</span>
              <span className="text-sm font-bold">魔法快速記帳</span>
            </Link>
          </div>
        </div>
      </nav>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-full md:ml-72 relative">
        {/* TopAppBar */}
        <header className="sticky top-0 z-30 bg-stardust-white/80 backdrop-blur-md shadow-[0_10px_30px_rgba(17,60,207,0.08)]">
          <div className="flex justify-between items-center w-full px-5 md:px-10 py-4 max-w-6xl mx-auto">
            <div className="flex items-center gap-4">
              <Link to="/">
                <h1 className="text-2xl font-extrabold text-mickey-red italic tracking-tight hidden md:block">Magic Ledger</h1>
                <h1 className="text-2xl font-extrabold text-mickey-red italic tracking-tight md:hidden">Magic Ledger</h1>
              </Link>
            </div>
            <div className="flex items-center gap-2">
              <button className="text-castle-gray hover:text-mickey-red transition-colors p-2 hover:bg-surface-container-high/50 rounded-full">
                <span className="material-symbols-outlined">notifications</span>
              </button>
              <button className="text-castle-gray hover:text-mickey-red transition-colors p-2 hover:bg-surface-container-high/50 rounded-full">
                <span className="material-symbols-outlined">family_history</span>
              </button>
              <div className="w-10 h-10 rounded-full bg-surface-variant overflow-hidden border-2 border-transparent hover:border-mickey-red transition-colors ml-2 shadow-sm cursor-pointer">
                <div className="w-full h-full bg-secondary text-primary-fixed flex items-center justify-center font-bold">
                  D
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Main Canvas Scrollable Area */}
        <main className="flex-1 overflow-y-auto pb-32 md:pb-8 pt-6 px-5 md:px-10 bg-stardust-white relative z-10">
          <div className="max-w-6xl mx-auto flex flex-col items-center">
            {children}
          </div>
        </main>
      </div>

      {/* BottomNavBar (Mobile Only) */}
      <nav className="fixed bottom-0 left-0 w-full z-50 flex justify-around items-end px-4 pb-4 pt-2 shadow-[0_-10px_30px_rgba(17,60,207,0.1)] bg-stardust-white/95 backdrop-blur-lg md:hidden rounded-t-[32px]">
        <MobileNavItem to="/" icon="home" label="首頁" />
        <MobileNavItem to="/transactions" icon="list_alt" label="明細" />
        {/* FAB Quick Add */}
        <NavLink 
          to="/quick-add"
          className={({ isActive }) => clsx(
            "flex flex-col items-center justify-center bg-mickey-red text-on-primary rounded-full w-12 h-12 shadow-lg transform ring-4 ring-stardust-white scale-90 transition-transform duration-150 relative",
            isActive ? "-translate-y-6" : "-translate-y-4"
          )}
        >
          <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>add</span>
        </NavLink>
        <MobileNavItem to="/reports" icon="analytics" label="報表" />
        <MobileNavItem to="/members" icon="group" label="家族" />
      </nav>
    </div>
  );
}
