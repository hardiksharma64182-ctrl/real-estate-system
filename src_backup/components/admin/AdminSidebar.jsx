import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  LayoutDashboard,
  Building,
  Users,
  Shield,
  UserCheck,
  Calendar,
  Database,
  Plus,
  Home,
  LogOut,
  Sparkles,
} from 'lucide-react';

export const AdminSidebar = ({ activeSection, onSelectSection }) => {
  const { currentUser, setAuthModalOpen, logout, setActiveTab, setSupabaseModalOpen, bookings } = useApp();

  const pendingCount = bookings.filter((b) => b.status === 'Pending').length;

  const menuItems = [
    { id: 'overview', label: 'Dashboard Overview', icon: LayoutDashboard },
    { id: 'properties', label: 'Properties Catalog', icon: Building },
    { id: 'owners', label: 'Owners Management', icon: Users },
    { id: 'agents', label: 'Agents & Brokers', icon: Shield },
    { id: 'customers', label: 'Customers & CRM', icon: UserCheck },
    { id: 'bookings', label: 'Tour Bookings', icon: Calendar, badge: pendingCount > 0 ? pendingCount : null },
  ];

  return (
    <aside className="w-full lg:w-64 bg-slate-900 text-white flex flex-col justify-between shrink-0 border-r border-slate-800">
      <div>
        {/* Top Branding in Sidebar */}
        <div className="p-6 border-b border-slate-800/80">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-1">
                <span className="text-base font-black tracking-tight text-white">LUXE</span>
                <span className="text-base font-light tracking-widest text-amber-500">ADMIN</span>
              </div>
              <p className="text-[10px] uppercase tracking-widest text-slate-400 font-semibold">
                Control Console
              </p>
            </div>
          </div>
        </div>

        {/* Current Admin User Badge */}
        {currentUser && (
          <div className="p-4 mx-4 my-4 rounded-2xl bg-slate-800/60 border border-slate-700/60 flex items-center gap-3">
            <img
              src={currentUser.avatar}
              alt={currentUser.name}
              className="w-10 h-10 rounded-xl object-cover border border-amber-500/40 shrink-0"
            />
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-white truncate">{currentUser.name}</p>
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 block">
                {currentUser.role}
              </span>
            </div>
          </div>
        )}

        {/* Navigation Items */}
        <div className="px-3 py-2 space-y-1">
          <p className="px-3 text-[10px] uppercase font-bold tracking-wider text-slate-400 mb-2">
            Main Management
          </p>
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeSection === item.id;

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onSelectSection(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  isActive
                    ? 'bg-amber-500 text-slate-950 font-bold shadow-sm'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-slate-950' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span
                    className={`text-[10px] font-bold px-1.5 py-0.2 rounded-full ${
                      isActive ? 'bg-slate-950 text-white' : 'bg-amber-500 text-slate-950'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Bottom Shortcuts */}
      <div className="p-4 border-t border-slate-800/80 space-y-2">
        <button
          type="button"
          onClick={() => setSupabaseModalOpen(true)}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
        >
          <Database className="w-4 h-4 text-amber-400" />
          <span>Database & Cloud Engine</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('home')}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
        >
          <Home className="w-4 h-4 text-slate-400" />
          <span>Exit to Public Website</span>
        </button>

        <button
          type="button"
          onClick={logout}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-rose-300 hover:text-white hover:bg-rose-950/60 transition-colors cursor-pointer"
        >
          <LogOut className="w-4 h-4 text-rose-400" />
          <span>Sign Out of Console</span>
        </button>
      </div>
    </aside>
  );
};
