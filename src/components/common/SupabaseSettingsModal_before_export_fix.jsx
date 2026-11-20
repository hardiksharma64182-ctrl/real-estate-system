import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { getSupabaseConfig } from '../../services/supabaseClient';
import { Database, ShieldCheck, RefreshCw, Download, Check, Copy, ExternalLink, X, Key, Globe } from 'lucide-react';

export const SupabaseSettingsModal = () => {
  const { supabaseModalOpen, setSupabaseModalOpen, addToast, refreshData } = useApp();
  const config = getSupabaseConfig();

  const [url, setUrl] = useState(localStorage.getItem('custom_supabase_url') || '');
  const [anonKey, setAnonKey] = useState(localStorage.getItem('custom_supabase_anon_key') || '');
  const [copied, setCopied] = useState(false);

  if (!supabaseModalOpen) return null;

  const handleSave = () => {
    if (url && anonKey) {
      localStorage.setItem('custom_supabase_url', url.trim());
      localStorage.setItem('custom_supabase_anon_key', anonKey.trim());
      addToast({
        type: 'success',
        title: 'Supabase Configured',
        message: 'Credentials saved. Syncing with live database...',
      });
    } else {
      localStorage.removeItem('custom_supabase_url');
      localStorage.removeItem('custom_supabase_anon_key');
      addToast({
        type: 'info',
        title: 'Reset to Local Mode',
        message: 'Using persistent browser storage with luxury sample data.',
      });
    }
    refreshData();
    setSupabaseModalOpen(false);
  };

  const handleExportData = () => {
    const backup = {
      properties: JSON.parse(localStorage.getItem('lux_properties') || '[]'),
      owners: JSON.parse(localStorage.getItem('lux_owners') || '[]'),
      agents: JSON.parse(localStorage.getItem('lux_agents') || '[]'),
      customers: JSON.parse(localStorage.getItem('lux_customers') || '[]'),
      bookings: JSON.parse(localStorage.getItem('lux_bookings') || '[]'),
      timestamp: new Date().toISOString(),
    };

    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
    const blobUrl = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = blobUrl;
    a.download = `luxeestate-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(blobUrl);

    addToast({
      type: 'success',
      title: 'Database Exported',
      message: 'Backup JSON downloaded successfully.',
    });
  };

  const sqlSample = `-- Tables created:
-- 1. properties (id, name, location, price, type, bedrooms, bathrooms, area_sqft, availability, owner_id, agent_id, image, description)
-- 2. owners (id, name, email, phone, address, notes)
-- 3. agents (id, name, email, phone, photo, experience, specialty, rating, deals_closed)
-- 4. customers (id, name, email, phone, address, interested_property_id, registration_date)
-- 5. bookings (id, property_id, customer_name, customer_email, customer_phone, visit_date, visit_time, status, agent_id)
-- 6. storage.buckets ('property-images')`;

  const copySqlSummary = () => {
    navigator.clipboard.writeText(sqlSample);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden transform transition-all p-6 sm:p-8">
        <button
          onClick={() => setSupabaseModalOpen(false)}
          className="absolute top-5 right-5 p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-amber-50 border border-amber-200/50 flex items-center justify-center text-amber-600">
            <Database className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900">Database & Cloud Settings</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Supabase integration & real-time persistence engine
            </p>
          </div>
        </div>

        {/* Current Status Banner */}
        <div className="mt-6 p-4 rounded-xl border bg-slate-50 border-slate-200/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-3 h-3 rounded-full ${config.isConfigured ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Active Storage</p>
              <p className="text-sm font-bold text-slate-900">
                {config.isConfigured ? 'Supabase Cloud Connected' : 'Local Persistent Storage (Mock Active)'}
              </p>
            </div>
          </div>
          <span className="text-xs px-2.5 py-1 rounded-full font-medium bg-white border border-slate-200 text-slate-700">
            {config.isConfigured ? 'Live Mode' : 'Local Fallback'}
          </span>
        </div>

        {/* Credentials Form */}
        <div className="mt-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase text-slate-700 tracking-wider mb-1.5 flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-slate-500" />
              Supabase Project URL
            </label>
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://xyzcompany.supabase.co"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 transition-all font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase text-slate-700 tracking-wider mb-1.5 flex items-center gap-1.5">
              <Key className="w-3.5 h-3.5 text-slate-500" />
              Supabase Anon / Public Key
            </label>
            <input
              type="password"
              value={anonKey}
              onChange={(e) => setAnonKey(e.target.value)}
              placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6..."
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 transition-all font-mono"
            />
            <p className="text-xs text-slate-400 mt-1.5">
              Tip: You can also define <code className="bg-slate-100 px-1 py-0.5 rounded text-slate-700">VITE_SUPABASE_URL</code> in your <code className="bg-slate-100 px-1 py-0.5 rounded text-slate-700">.env</code> file.
            </p>
          </div>
        </div>

        {/* Database Quick Actions */}
        <div className="mt-6 border-t border-slate-100 pt-5">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-3">
            Database Tools & Utilities
          </p>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={handleExportData}
              className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-slate-500" />
              Export Backup JSON
            </button>
          </div>
        </div>

        {/* Schema File Reference */}
        <div className="mt-4 p-3 bg-slate-50 rounded-xl border border-slate-200/60 flex items-center justify-between text-xs">
          <span className="text-slate-600 font-mono">supabase-schema.sql included</span>
          <button
            onClick={copySqlSummary}
            className="flex items-center gap-1 text-amber-700 hover:text-amber-800 font-medium cursor-pointer"
          >
            {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? 'Copied' : 'Copy Table List'}
          </button>
        </div>

        {/* Footer Buttons */}
        <div className="mt-6 flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
          <button
            type="button"
            onClick={() => setSupabaseModalOpen(false)}
            className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-5 py-2 text-sm font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-xl transition-colors shadow-sm cursor-pointer"
          >
            Save & Connect
          </button>
        </div>
      </div>
    </div>
  );
};

