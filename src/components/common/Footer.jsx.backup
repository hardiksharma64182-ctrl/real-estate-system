import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Building2, Mail, Phone, MapPin, Send, ArrowUp, ShieldCheck, Award } from 'lucide-react';

export const Footer = () => {
  const { setActiveTab, addToast } = useApp();
  const [email, setEmail] = useState('');

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (email) {
      addToast({
        type: 'success',
        title: 'Subscribed to LuxeBrief',
        message: 'You will receive our weekly curated luxury property releases.',
      });
      setEmail('');
    }
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-slate-950 text-slate-300 border-t border-slate-800">
      {/* Top Banner / Callout */}
      <div className="border-b border-slate-900 bg-slate-900/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                <Award className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Excellence in Global Real Estate</h3>
                <p className="text-sm text-slate-400">Over $1.2B in verified residential and commercial assets managed.</p>
              </div>
            </div>

            {/* Newsletter form */}
            <form onSubmit={handleSubscribe} className="flex w-full md:w-auto max-w-md gap-2">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email for private listings..."
                className="px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 transition-colors w-full sm:w-72"
                required
              />
              <button
                type="submit"
                className="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold text-sm rounded-xl transition-all flex items-center gap-1.5 shrink-0 cursor-pointer shadow-sm"
              >
                <span>Subscribe</span>
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          {/* Brand Info */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-1">
                  <span className="text-xl font-black tracking-tight text-white">LUXE</span>
                  <span className="text-xl font-light tracking-widest text-amber-500">ESTATE</span>
                </div>
                <p className="text-[10px] uppercase tracking-widest text-slate-500 font-semibold">
                  Property Management System
                </p>
              </div>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed max-w-sm">
              Connecting discerning clients, verified property owners, and seasoned real estate agents across the globe with full lifecycle property management and transparent scheduling.
            </p>
            <div className="flex items-center gap-3 pt-2 text-xs text-slate-400">
              <span className="flex items-center gap-1 text-emerald-400">
                <ShieldCheck className="w-4 h-4" /> Fully Verified Listings
              </span>
              <span>•</span>
              <span>24/7 VIP Concierge</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-4">Platform</h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <button
                  onClick={() => { setActiveTab('home'); scrollToTop(); }}
                  className="text-slate-400 hover:text-amber-400 transition-colors cursor-pointer"
                >
                  Home Landing
                </button>
              </li>
              <li>
                <button
                  onClick={() => { setActiveTab('properties'); scrollToTop(); }}
                  className="text-slate-400 hover:text-amber-400 transition-colors cursor-pointer"
                >
                  Property Directory
                </button>
              </li>
              <li>
                <button
                  onClick={() => { setActiveTab('owners'); scrollToTop(); }}
                  className="text-slate-400 hover:text-amber-400 transition-colors cursor-pointer"
                >
                  Property Owners
                </button>
              </li>
              <li>
                <button
                  onClick={() => { setActiveTab('agents'); scrollToTop(); }}
                  className="text-slate-400 hover:text-amber-400 transition-colors cursor-pointer"
                >
                  Verified Agents
                </button>
              </li>
              <li>
                <button
                  onClick={() => { setActiveTab('admin'); scrollToTop(); }}
                  className="text-slate-400 hover:text-amber-400 transition-colors cursor-pointer"
                >
                  Admin Dashboard
                </button>
              </li>
            </ul>
          </div>

          {/* Property Types */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-4">Portfolio</h4>
            <ul className="space-y-2.5 text-sm text-slate-400">
              <li className="hover:text-amber-400 cursor-pointer" onClick={() => { setActiveTab('properties'); scrollToTop(); }}>
                Waterfront Villas
              </li>
              <li className="hover:text-amber-400 cursor-pointer" onClick={() => { setActiveTab('properties'); scrollToTop(); }}>
                Skyline Penthouses
              </li>
              <li className="hover:text-amber-400 cursor-pointer" onClick={() => { setActiveTab('properties'); scrollToTop(); }}>
                Architectural Modern Homes
              </li>
              <li className="hover:text-amber-400 cursor-pointer" onClick={() => { setActiveTab('properties'); scrollToTop(); }}>
                Grade-A Commercial Hubs
              </li>
              <li className="hover:text-amber-400 cursor-pointer" onClick={() => { setActiveTab('properties'); scrollToTop(); }}>
                Exclusive Gated Communities
              </li>
            </ul>
          </div>

          {/* Contact Details */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-4">Headquarters</h4>
            <div className="space-y-3 text-sm text-slate-400">
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                <span>9405 Wilshire Blvd, Suite 800, Beverly Hills, CA 90212</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-amber-500 shrink-0" />
                <span>+1 (800) 555-LUXE</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-amber-500 shrink-0" />
                <span>concierge@luxeestate.com</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 pt-8 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} LuxeEstate Management System. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <span>Supabase Cloud Integration</span>
            <span>•</span>
            <span>REST & Real-time Architecture</span>
            <button
              onClick={scrollToTop}
              className="p-2 rounded-lg bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              title="Back to top"
            >
              <ArrowUp className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};
