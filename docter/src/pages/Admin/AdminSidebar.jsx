import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  UserRound, 
  Stethoscope, 
  CalendarCheck, 
  FileClock, 
  Settings, 
  LogOut, 
  ChevronRight,
  Menu,
  X,
  Activity
} from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

const AdminSidebar = ({ children }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  const menuItems = [
    { name: 'Dashboard', icon: <LayoutDashboard size={20} />, path: '/admin/dashboard' },
    { name: 'Doctor Management', icon: <Stethoscope size={20} />, path: '/admin/doctors' },
    { name: 'Patient List', icon: <UserRound size={20} />, path: '/admin/patients' },
    { name: 'All Appointments', icon: <CalendarCheck size={20} />, path: '/admin/appointments' },
    { name: 'Medical Logs', icon: <FileClock size={20} />, path: '/admin/logs' },
    {name:"Notifications", icon: <Activity size={20} />, path: '/admin/notifications'},
    { name: 'System Settings', icon: <Settings size={20} />, path: '/admin/settings' },
  ];

  return (
    <div className="flex h-screen bg-[#0f172a] text-slate-300">
      {/* --- SIDEBAR FOR DESKTOP --- */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-72 bg-[#1e293b] border-r border-slate-800 transition-transform duration-300 lg:translate-x-0 lg:static lg:inset-0 ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        
        {/* Logo Section */}
        <div className="p-8 flex items-center gap-3">
          <div className="bg-teal-500 p-2 rounded-xl">
            <Activity className="text-[#0f172a]" size={24} />
          </div>
          <h1 className="text-xl font-black text-white tracking-tight">HEALTH<span className="text-teal-400">HUB</span></h1>
        </div>

        {/* Navigation Links */}
        <nav className="mt-4 px-4 space-y-2">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.name}
                to={item.path}
                className={`flex items-center justify-between px-4 py-4 rounded-2xl transition-all duration-200 group ${
                  isActive 
                    ? 'bg-teal-500 text-[#0f172a] font-bold shadow-lg shadow-teal-500/20' 
                    : 'hover:bg-slate-800 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-4">
                  {item.icon}
                  <span className="text-sm">{item.name}</span>
                </div>
                {isActive && <ChevronRight size={16} />}
              </Link>
            );
          })}
        </nav>

        {/* Admin Profile Footer */}
        <div className="absolute bottom-0 w-full p-6 border-t border-slate-800 bg-[#1e293b]">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center font-bold text-teal-400 border border-slate-600">
              AD
            </div>
            <div>
              <p className="text-sm font-bold text-white leading-tight">Super Admin</p>
              <p className="text-[10px] text-slate-500">admin@healthhub.com</p>
            </div>
          </div>
          <button className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white transition-all text-xs font-bold">
            <LogOut size={14} /> LOGOUT
          </button>
        </div>
      </aside>

      {/* --- MAIN CONTENT AREA --- */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header (Mobile View-ku) */}
        <header className="lg:hidden flex items-center justify-between p-4 bg-[#1e293b] border-b border-slate-800">
          <h1 className="font-black text-white">HEALTHHUB</h1>
          <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2 text-slate-400">
            {isMobileMenuOpen ? <X /> : <Menu />}
          </button>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-y-auto p-6 lg:p-10 custom-scrollbar">
          {children}
        </div>
      </main>

      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden" 
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
    </div>
  );
};

export default AdminSidebar;