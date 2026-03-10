import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Ticket, 
  BookOpen, 
  Terminal, 
  FileText, 
  Settings, 
  LogOut, 
  User,
  Menu,
  X,
  ChevronRight
} from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function Layout({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const navItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard, roles: ['customer', 'engineer', 'admin'] },
    { name: 'My Tickets', path: '/tickets', icon: Ticket, roles: ['customer'] },
    { name: 'All Tickets', path: '/tickets', icon: Ticket, roles: ['engineer', 'admin'] },
    { name: 'Knowledge Base', path: '/kb', icon: BookOpen, roles: ['customer', 'engineer', 'admin'] },
    { name: 'API Debugger', path: '/debug', icon: Terminal, roles: ['engineer', 'admin'] },
    { name: 'Log Analyzer', path: '/logs', icon: FileText, roles: ['engineer', 'admin'] },
    { name: 'Admin Panel', path: '/admin', icon: Settings, roles: ['admin'] },
  ];

  const filteredNavItems = navItems.filter(item => item.roles.includes(user.role));

  return (
    <div className="flex h-screen bg-[#F5F5F0] text-[#141414] font-sans">
      {/* Sidebar */}
      <aside className={cn(
        "bg-[#141414] text-white transition-all duration-300 flex flex-col border-r border-white/10",
        isSidebarOpen ? "w-64" : "w-20"
      )}>
        <div className="p-6 flex items-center justify-between">
          {isSidebarOpen && <span className="text-xl font-bold tracking-tighter italic serif">SupportDesk</span>}
          <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-1 hover:bg-white/10 rounded">
            {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        <nav className="flex-1 px-4 space-y-2 mt-4">
          {filteredNavItems.map((item) => (
            <Link
              key={item.name}
              to={item.path}
              className={cn(
                "flex items-center p-3 rounded-lg transition-colors group",
                location.pathname === item.path ? "bg-white text-[#141414]" : "hover:bg-white/5 text-white/60 hover:text-white"
              )}
            >
              <item.icon size={20} className={cn("min-w-[20px]", location.pathname === item.path ? "text-[#141414]" : "text-white/40 group-hover:text-white")} />
              {isSidebarOpen && <span className="ml-3 font-medium text-sm">{item.name}</span>}
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-white/10">
          <div className={cn("flex items-center p-3 rounded-lg bg-white/5 mb-4", !isSidebarOpen && "justify-center")}>
            <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center text-white font-bold text-xs">
              {user.name?.[0]}
            </div>
            {isSidebarOpen && (
              <div className="ml-3 overflow-hidden">
                <p className="text-sm font-medium truncate">{user.name}</p>
                <p className="text-xs text-white/40 truncate capitalize">{user.role}</p>
              </div>
            )}
          </div>
          <button 
            onClick={handleLogout}
            className={cn(
              "flex items-center w-full p-3 rounded-lg hover:bg-red-500/10 text-red-400 transition-colors",
              !isSidebarOpen && "justify-center"
            )}
          >
            <LogOut size={20} />
            {isSidebarOpen && <span className="ml-3 font-medium text-sm">Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <header className="h-16 border-b border-[#141414]/10 bg-white flex items-center justify-between px-8 sticky top-0 z-10">
          <div className="flex items-center space-x-2 text-sm text-[#141414]/40">
            <span>SupportDesk</span>
            <ChevronRight size={14} />
            <span className="text-[#141414] font-medium capitalize">{location.pathname.split('/')[1] || 'Dashboard'}</span>
          </div>
          <div className="flex items-center space-x-4">
            <div className="h-8 w-px bg-[#141414]/10 mx-2" />
            <span className="text-xs font-mono opacity-50 uppercase tracking-widest">System Status: Optimal</span>
          </div>
        </header>

        <div className="p-8 max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
