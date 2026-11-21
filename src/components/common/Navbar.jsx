import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { getSupabaseConfig } from '../../services/supabaseClient';
import { ThemeSelector } from './ThemeSelector';
import {
  Building2,
  Database,
  Calendar,
  LogOut,
  User,
  Shield,
  Briefcase,
  Key,
  Menu,
  X,
  ChevronDown,
  Sparkles,
  ArrowRight,
} from 'lucide-react';

export const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const {
    currentUser,
    logout,
    setSupabaseModalOpen,
    setMyBookingsModalOpen,
    bookings,
  } = useApp();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [loginMenuOpen, setLoginMenuOpen] = useState(false);
  const loginDropdownRef = useRef(null);
  const userDropdownRef = useRef(null);
  const config = getSupabaseConfig();

  // Close dropdowns on outside click
  useEffect(() => {
    const handleOutside = (e) => {
      if (loginDropdownRef.current && !loginDropdownRef.current.contains(e.target)) {
        setLoginMenuOpen(false);
      }
      if (userDropdownRef.current && !userDropdownRef.current.contains(e.target)) {
        setUserDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, []);

  const pendingBookingsCount = bookings.filter((b) => b.status === 'Pending').length;

  const navLinks = [
    { to: '/', label: 'Home' },
    { to: '/properties', label: 'Properties' },
    { to: '/owners', label: 'Owners' },
    { to: '/agents', label: 'Agents' },
    { to: '/customers', label: 'Customers' },
    {
      to: '/bookings',
      label: 'Bookings',
      badge: currentUser?.role === 'admin' && pendingBookingsCount > 0 ? pendingBookingsCount : null,
    },
  ];

  const getDashboardPath = () => {
    if (!currentUser) return '/buyer/login';
    if (currentUser.role === 'admin') return '/admin';
    if (currentUser.role === 'owner') return '/owner/dashboard';
    return '/buyer/dashboard';
  };

  const getDashboardLabel = () => {
    if (!currentUser) return 'Sign In';
    if (currentUser.role === 'admin') return 'Admin Dashboard';
    if (currentUser.role === 'owner') return 'Agent Workspace';
    return 'Client Lounge';
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-11 h-11 rounded-xl bg-slate-900 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-md group-hover:scale-105 transition-transform">
              <Building2 className="w-6 h-6 text-amber-400" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xl font-extrabold tracking-tight text-slate-900">LUXE</span>
                <span className="text-xl font-light tracking-widest text-amber-600">ESTATE</span>
              </div>
              <p className="text-[10px] uppercase tracking-widest text-slate-400 font-semibold -mt-1">
                Real Estate System
              </p>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => {
              const isActive =
                link.to === '/'
                  ? location.pathname === '/'
                  : location.pathname.startsWith(link.to);

              return (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`relative px-3.5 py-2 text-sm font-medium rounded-lg transition-all ${
                    isActive
                      ? 'text-slate-900 bg-slate-100 font-bold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <span className="flex items-center gap-1.5">
                    {link.label}
                    {link.badge && (
                      <span className="inline-flex items-center justify-center px-1.5 py-0.5 text-[10px] font-bold text-white bg-amber-600 rounded-full">
                        {link.badge}
                      </span>
                    )}
                  </span>
                </Link>
              );
            })}

            {/* Role Dashboard Quick Link (if logged in) */}
            {currentUser && (
              <Link
                to={getDashboardPath()}
                className="ml-2 px-3.5 py-2 text-xs font-bold rounded-lg bg-slate-900 text-amber-400 hover:text-amber-300 shadow-xs flex items-center gap-1.5"
              >
                {currentUser.role === 'admin' && <Shield className="w-3.5 h-3.5 text-amber-400" />}
                {currentUser.role === 'owner' && <Briefcase className="w-3.5 h-3.5 text-emerald-400" />}
                {currentUser.role === 'customer' && <Key className="w-3.5 h-3.5 text-amber-400" />}
                <span>{getDashboardLabel()}</span>
              </Link>
            )}
          </nav>

          {/* Right Action Icons & Auth Options */}
          <div className="hidden md:flex items-center gap-3">
            {/* Color Palette Switcher */}
            <ThemeSelector />

            {/* Supabase status badge */}
            <button
              onClick={() => setSupabaseModalOpen(true)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium border border-slate-200 hover:border-amber-400 bg-slate-50 hover:bg-amber-50/50 text-slate-700 transition-all cursor-pointer"
              title="Click to manage Database & Supabase connection"
            >
              <div
                className={`w-2 h-2 rounded-full ${
                  config.isConfigured ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'
                }`}
              />
              <span className="font-mono text-[11px]">
                {config.isConfigured ? 'Supabase Live' : 'Local DB'}
              </span>
              <Database className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {/* Bookings / Client Tours Shortcut */}
            <button
              onClick={() => {
                if (currentUser?.role === 'customer') {
                  navigate('/buyer/dashboard');
                } else {
                  setMyBookingsModalOpen(true);
                }
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-700 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
              title="View my tour bookings"
            >
              <Calendar className="w-4 h-4 text-amber-600" />
              <span>Bookings</span>
            </button>

            {/* If Authenticated: User Profile Menu */}
            {currentUser ? (
              <div className="relative" ref={userDropdownRef}>
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-full border border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50 transition-all cursor-pointer"
                >
                  <img
                    src={currentUser.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=300&q=80'}
                    alt={currentUser.name}
                    className="w-7 h-7 rounded-full object-cover border border-amber-400/50"
                  />
                  <div className="text-left text-xs">
                    <p className="font-semibold text-slate-900 leading-tight">
                      {currentUser.name.split(' ')[0]}
                    </p>
                    <span className="text-[10px] uppercase font-bold text-amber-600 tracking-wider">
                      {currentUser.role}
                    </span>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </button>

                {/* Dropdown Menu */}
                {userDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 z-50 animate-in fade-in slide-in-from-top-2">
                    <div className="px-4 py-2 border-b border-slate-100">
                      <p className="text-xs font-bold text-slate-900">{currentUser.name}</p>
                      <p className="text-[11px] text-slate-500 truncate">{currentUser.email}</p>
                      <span className="inline-block mt-1 text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                        {currentUser.role.toUpperCase()} ACCOUNT
                      </span>
                    </div>

                    <Link
                      to={getDashboardPath()}
                      onClick={() => setUserDropdownOpen(false)}
                      className="w-full text-left px-4 py-2.5 text-xs font-bold text-slate-900 hover:bg-slate-50 flex items-center justify-between"
                    >
                      <span className="flex items-center gap-2">
                        <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                        {getDashboardLabel()}
                      </span>
                      <ArrowRight className="w-3 h-3 text-slate-400" />
                    </Link>

                    {/* Switch Portals Shortcut */}
                    <div className="px-4 py-2 border-t border-slate-100 bg-slate-50/50">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                        Login Portals
                      </span>
                      <div className="space-y-1 text-xs">
                        <Link
                          to="/admin/login"
                          onClick={() => setUserDropdownOpen(false)}
                          className="block text-slate-600 hover:text-amber-600 font-medium"
                        >
                          Ã¢â‚¬Â¢ Admin Login (/admin/login)
                        </Link>
                        <Link
                          to="/owner/login"
                          onClick={() => setUserDropdownOpen(false)}
                          className="block text-slate-600 hover:text-amber-600 font-medium"
                        >
                          Ã¢â‚¬Â¢ Owner Login (/owner/login)
                        </Link>
                        <Link
                          to="/buyer/login"
                          onClick={() => setUserDropdownOpen(false)}
                          className="block text-slate-600 hover:text-amber-600 font-medium"
                        >
                          Ã¢â‚¬Â¢ Buyer Login (/buyer/login)
                        </Link>
                      </div>
                    </div>

                    <div className="pt-1 border-t border-slate-100">
                      <button
                        onClick={() => {
                          setUserDropdownOpen(false);
                          logout();
                        }}
                        className="w-full text-left px-4 py-2 text-xs text-rose-600 hover:bg-rose-50 flex items-center gap-2 cursor-pointer font-semibold"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              /* If Not Authenticated: Portals Login Dropdown */
              <div className="relative" ref={loginDropdownRef}>
                <button
                  type="button"
                  onClick={() => setLoginMenuOpen(!loginMenuOpen)}
                  className="px-4 py-2 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-xl transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
                >
                  <span>Sign In</span>
                  <ChevronDown className="w-3.5 h-3.5 text-amber-400" />
                </button>

                {loginMenuOpen && (
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-2xl border border-slate-100 py-2.5 z-50 animate-in fade-in slide-in-from-top-2">
                    <div className="px-4 py-1.5 border-b border-slate-100">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        Select Login Portal
                      </span>
                    </div>

                    <Link
                      to="/admin/login"
                      onClick={() => setLoginMenuOpen(false)}
                      className="p-3 hover:bg-slate-50 flex items-start gap-3 transition-colors group"
                    >
                      <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-700 flex items-center justify-center shrink-0 group-hover:bg-slate-900 group-hover:text-amber-400 transition-colors">
                        <Shield className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-900 group-hover:text-amber-700">
                          Admin Login
                        </p>
                        <p className="text-[10px] text-slate-400">/admin/login</p>
                      </div>
                    </Link>

                    <Link
                      to="/owner/login"
                      onClick={() => setLoginMenuOpen(false)}
                      className="p-3 hover:bg-slate-50 flex items-start gap-3 transition-colors group"
                    >
                      <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-700 flex items-center justify-center shrink-0 group-hover:bg-slate-900 group-hover:text-emerald-400 transition-colors">
                        <Briefcase className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-900 group-hover:text-emerald-700">
                          Owner Login
                        </p>
                        <p className="text-[10px] text-slate-400">/owner/login</p>
                      </div>
                    </Link>

                    <Link
                      to="/buyer/login"
                      onClick={() => setLoginMenuOpen(false)}
                      className="p-3 hover:bg-slate-50 flex items-start gap-3 transition-colors group"
                    >
                      <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-700 flex items-center justify-center shrink-0 group-hover:bg-slate-900 group-hover:text-amber-400 transition-colors">
                        <Key className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-900 group-hover:text-amber-700">
                          Buyer Login
                        </p>
                        <p className="text-[10px] text-slate-400">/buyer/login</p>
                      </div>
                    </Link>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-6 space-y-2">
          <div className="py-2 border-b border-slate-100 flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Color Scheme</span>
            <ThemeSelector />
          </div>

          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2.5 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-100"
            >
              {link.label}
            </Link>
          ))}

          {currentUser ? (
            <div className="pt-3 border-t border-slate-100 space-y-2">
              <Link
                to={getDashboardPath()}
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center block py-2.5 bg-slate-900 text-amber-400 rounded-xl text-xs font-bold"
              >
                Go to {getDashboardLabel()}
              </Link>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  logout();
                }}
                className="w-full py-2.5 text-xs font-bold text-rose-600 bg-rose-50 rounded-xl"
              >
                Sign Out
              </button>
            </div>
          ) : (
            <div className="pt-3 border-t border-slate-100 space-y-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                Portals Login
              </span>
              <Link
                to="/admin/login"
                onClick={() => setMobileMenuOpen(false)}
                className="block py-2 px-3 bg-slate-50 rounded-xl text-xs font-bold text-slate-900 hover:bg-slate-100"
              >
                Ã°Å¸â€ºÂ¡Ã¯Â¸Â Admin Login (/admin/login)
              </Link>
              <Link
                to="/owner/login"
                onClick={() => setMobileMenuOpen(false)}
                className="block py-2 px-3 bg-slate-50 rounded-xl text-xs font-bold text-slate-900 hover:bg-slate-100"
              >
                Ã°Å¸â€™Â¼ Owner Login (/owner/login)
              </Link>
              <Link
                to="/buyer/login"
                onClick={() => setMobileMenuOpen(false)}
                className="block py-2 px-3 bg-slate-50 rounded-xl text-xs font-bold text-slate-900 hover:bg-slate-100"
              >
                Ã°Å¸â€â€˜ Buyer Login (/buyer/login)
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
};
