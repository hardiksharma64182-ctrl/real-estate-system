import React from 'react';
import { Navigate, useLocation, Link } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { ShieldAlert, LogOut, Lock, Home, Loader2 } from 'lucide-react';

export const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const location = useLocation();
  const { currentUser, isAuthLoading, logout } = useApp();

  // 0. Session is still being verified against Supabase — show a minimal loader.
  //    This prevents a premature redirect to /login while refreshSessionFromSupabase()
  //    is in-flight right after the page loads.
  if (isAuthLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4 text-slate-400">
          <Loader2 className="w-8 h-8 text-amber-400 animate-spin" />
          <span className="text-xs uppercase tracking-widest font-semibold">
            Verifying Session…
          </span>
        </div>
      </div>
    );
  }

  // 1. Not authenticated at all
  if (!currentUser) {
    let redirectPath = '/customer/login';
    let message = 'Please sign in to access this page.';

    if (allowedRoles.includes('admin')) {
      redirectPath = '/admin/login';
      message = 'Administrator authentication required to access this console.';
    } else if (allowedRoles.includes('agent')) {
      redirectPath = '/agent/login';
      message = 'Licensed Broker authentication required to access this workspace.';
    }

    return (
      <Navigate
        to={redirectPath}
        state={{ from: location.pathname, message }}
        replace
      />
    );
  }

  // 2. Authenticated, but role not allowed
  if (allowedRoles.length > 0 && !allowedRoles.includes(currentUser.role)) {
    const roleCapitalized = currentUser.role.charAt(0).toUpperCase() + currentUser.role.slice(1);
    let myDashboardPath = '/';
    if (currentUser.role === 'admin') myDashboardPath = '/admin';
    else if (currentUser.role === 'agent') myDashboardPath = '/agent/dashboard';
    else if (currentUser.role === 'customer') myDashboardPath = '/customer/dashboard';

    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-radial from-amber-500/5 via-slate-950/80 to-slate-950 pointer-events-none" />

        <div className="relative max-w-lg w-full bg-slate-900 border border-slate-800 rounded-3xl p-8 sm:p-10 shadow-2xl text-center">
          <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400 mx-auto mb-6 shadow-lg">
            <ShieldAlert className="w-8 h-8 text-rose-400" />
          </div>

          <span className="text-xs font-bold uppercase tracking-widest text-rose-400 block mb-2 font-mono">
            Security 403 • Unauthorized Access
          </span>

          <h2 className="text-2xl font-black text-white tracking-tight">
            Permission Restricted
          </h2>

          <p className="mt-3 text-sm text-slate-300 leading-relaxed">
            You are authenticated as <strong className="text-amber-400">{currentUser.name}</strong> ({roleCapitalized} Account).
            Your security role does not have authorization to view this private workspace.
          </p>

          <div className="mt-8 pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              to={myDashboardPath}
              className="w-full sm:w-auto px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
            >
              <Home className="w-3.5 h-3.5" />
              <span>Go to My {roleCapitalized} Dashboard</span>
            </Link>

            <button
              onClick={logout}
              className="w-full sm:w-auto px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-rose-300 hover:text-white font-semibold text-xs rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Log Out & Switch User</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 3. Authorized
  return children;
};
