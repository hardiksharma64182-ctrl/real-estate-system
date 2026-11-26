import React, { useState, useEffect, useCallback } from 'react';
import { useApp } from '../../context/AppContext';
import { getSupabaseClient } from '../../services/supabaseClient';
import { dataService } from '../../services/dataService';
import { AdminSidebar } from './AdminSidebar';
import { PropertiesPage } from '../properties/PropertiesPage';
import { OwnersPage } from '../owners/OwnersPage';
import { AgentsPage } from '../agents/AgentsPage';
import { CustomersPage } from '../customers/CustomersPage';
import { BookingsPage } from '../bookings/BookingsPage';
import { StatusBadge, TypeBadge } from '../common/Badge';
import { THEMES } from '../common/ThemeSelector';
import { formatCurrency, formatDate } from '../../utils/formatters';
import {
  Building,
  Users,
  Shield,
  UserCheck,
  Calendar,
  CheckCircle,
  Clock,
  TrendingUp,
  ExternalLink,
  Plus,
  RefreshCw,
  Database,
  BarChart3,
  PieChart,
  CreditCard,
  Download,
  Search,
  Palette,
  Check,
  AlertTriangle,
  DollarSign,
  Settings,
} from 'lucide-react';

export const AdminDashboard = () => {
  const {
    adminSection,
    setAdminSection,
    properties,
    owners,
    agents,
    customers,
    bookings,
    updateBookingStatus,
    setSelectedProperty,
    refreshData,
    setSupabaseModalOpen,
    currentTheme,
    changeTheme,
    addToast,
  } = useApp();

  // Payments & Reports state
  const [payments, setPayments] = useState([]);
  const [paymentsLoading, setPaymentsLoading] = useState(false);
  const [paymentSearch, setPaymentSearch] = useState('');
  const [paymentStatusFilter, setPaymentStatusFilter] = useState('All');

  // Users & Settings state
  const [profiles, setProfiles] = useState([]);
  const [profilesLoading, setProfilesLoading] = useState(false);
  const [userSearch, setUserSearch] = useState('');

  const loadPayments = useCallback(async () => {
    const supabase = getSupabaseClient();
    if (!supabase) return;
    setPaymentsLoading(true);
    try {
      const { data, error } = await supabase
        .from('payments')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      setPayments(data || []);
    } catch (err) {
      console.warn('Could not load payments:', err.message);
    } finally {
      setPaymentsLoading(false);
    }
  }, []);

  const loadProfiles = useCallback(async () => {
    const supabase = getSupabaseClient();
    if (!supabase) return;
    setProfilesLoading(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      setProfiles(data || []);
    } catch (err) {
      console.warn('Could not load profiles:', err.message);
    } finally {
      setProfilesLoading(false);
    }
  }, []);

  useEffect(() => {
    if (adminSection === 'payments') loadPayments();
    if (adminSection === 'settings') loadProfiles();
  }, [adminSection, loadPayments, loadProfiles]);

  const handleLinkOwnerProfile = async (profileId, ownerId) => {
    const supabase = getSupabaseClient();
    if (!supabase) return;
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ owner_id: ownerId || null })
        .eq('id', profileId);
      if (error) throw error;
      setProfiles((prev) =>
        prev.map((p) => (p.id === profileId ? { ...p, owner_id: ownerId || null } : p))
      );
      addToast({
        type: 'success',
        title: 'Owner Link Updated',
        message: ownerId ? 'Profile linked to owner record.' : 'Owner link removed from profile.',
      });
    } catch (err) {
      addToast({
        type: 'error',
        title: 'Update Failed',
        message: err.message || 'Could not update profile owner link.',
      });
    }
  };

  const exportCsvReport = (filename, headers, rows) => {
    const csv = [
      headers.join(','),
      ...rows.map((r) =>
        r.map((val) => `"${String(val ?? '').replace(/"/g, '""')}"`).join(',')
      ),
    ].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // If sub-page selected in sidebar, render that view
  if (adminSection === 'properties') {
    return (
      <div className="flex flex-col lg:flex-row min-h-screen">
        <AdminSidebar activeSection={adminSection} onSelectSection={setAdminSection} />
        <div className="flex-1 overflow-x-hidden">
          <PropertiesPage />
        </div>
      </div>
    );
  }

  if (adminSection === 'owners') {
    return (
      <div className="flex flex-col lg:flex-row min-h-screen">
        <AdminSidebar activeSection={adminSection} onSelectSection={setAdminSection} />
        <div className="flex-1 overflow-x-hidden">
          <OwnersPage />
        </div>
      </div>
    );
  }

  if (adminSection === 'agents') {
    return (
      <div className="flex flex-col lg:flex-row min-h-screen">
        <AdminSidebar activeSection={adminSection} onSelectSection={setAdminSection} />
        <div className="flex-1 overflow-x-hidden">
          <AgentsPage />
        </div>
      </div>
    );
  }

  if (adminSection === 'customers') {
    return (
      <div className="flex flex-col lg:flex-row min-h-screen">
        <AdminSidebar activeSection={adminSection} onSelectSection={setAdminSection} />
        <div className="flex-1 overflow-x-hidden">
          <CustomersPage />
        </div>
      </div>
    );
  }

  if (adminSection === 'bookings') {
    return (
      <div className="flex flex-col lg:flex-row min-h-screen">
        <AdminSidebar activeSection={adminSection} onSelectSection={setAdminSection} />
        <div className="flex-1 overflow-x-hidden">
          <BookingsPage />
        </div>
      </div>
    );
  }

  // ===================== PAYMENTS & REPORTS =====================
  if (adminSection === 'payments') {
    const verifiedPayments = payments.filter((p) => p.status === 'Completed' && !p.is_demo);
    const demoPayments = payments.filter((p) => p.is_demo || p.status === 'Demo_Completed');
    const pendingOrFailed = payments.filter((p) => p.status === 'Pending' || p.status === 'Failed');

    const verifiedRevenue = verifiedPayments.reduce((sum, p) => sum + (Number(p.amount) || 0), 0);
    const demoVolume = demoPayments.reduce((sum, p) => sum + (Number(p.amount) || 0), 0);

    const filteredPayments = payments.filter((p) => {
      const matchesStatus = paymentStatusFilter === 'All' || p.status === paymentStatusFilter;
      const q = paymentSearch.trim().toLowerCase();
      const matchesSearch =
        !q ||
        p.customer_name?.toLowerCase().includes(q) ||
        p.customer_email?.toLowerCase().includes(q) ||
        p.property_name?.toLowerCase().includes(q) ||
        p.transaction_id?.toLowerCase().includes(q);
      return matchesStatus && matchesSearch;
    });

    const handleExportPayments = () => {
      exportCsvReport(
        `luxe-estate-payments-${new Date().toISOString().slice(0, 10)}.csv`,
        ['Transaction ID', 'Property', 'Customer', 'Email', 'Amount', 'Method', 'Status', 'Is Demo', 'Date'],
        filteredPayments.map((p) => [
          p.transaction_id || p.id,
          p.property_name || p.property_id || '-',
          p.customer_name,
          p.customer_email,
          p.amount,
          p.payment_method,
          p.status,
          p.is_demo ? 'Yes' : 'No',
          p.created_at,
        ])
      );
      addToast({ type: 'success', title: 'Report Exported', message: 'Payments CSV downloaded.' });
    };

    const handleExportPortfolio = () => {
      exportCsvReport(
        `luxe-estate-portfolio-${new Date().toISOString().slice(0, 10)}.csv`,
        ['ID', 'Name', 'Type', 'Location', 'Price', 'Availability', 'Bedrooms', 'Bathrooms', 'Area SqFt'],
        properties.map((p) => [
          p.id,
          p.name,
          p.type,
          p.location,
          p.price,
          p.availability,
          p.bedrooms,
          p.bathrooms,
          p.area_sqft,
        ])
      );
      addToast({ type: 'success', title: 'Report Exported', message: 'Portfolio CSV downloaded.' });
    };

    return (
      <div className="flex flex-col lg:flex-row min-h-screen bg-slate-50">
        <AdminSidebar activeSection={adminSection} onSelectSection={setAdminSection} />
        <div className="flex-1 p-6 sm:p-10 max-w-7xl mx-auto w-full space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
            <div>
              <span className="text-xs uppercase font-bold tracking-widest text-amber-600">
                Financial Ledger & Reports
              </span>
              <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
                Payments & Revenue Reports
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                Audit verified production transactions separately from demo records and export executive reports.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2.5">
              <button
                onClick={loadPayments}
                className="p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 cursor-pointer"
                title="Refresh payments"
              >
                <RefreshCw className={`w-4 h-4 ${paymentsLoading ? 'animate-spin' : ''}`} />
              </button>
              <button
                onClick={handleExportPortfolio}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-800 text-xs font-bold cursor-pointer"
              >
                <Download className="w-4 h-4 text-amber-600" />
                <span>Export Portfolio CSV</span>
              </button>
              <button
                onClick={handleExportPayments}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold cursor-pointer"
              >
                <Download className="w-4 h-4 text-amber-400" />
                <span>Export Payments CSV</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 rounded-3xl bg-slate-900 text-white border border-slate-800 shadow-md">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mb-3">
                <DollarSign className="w-5 h-5" />
              </div>
              <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">
                Verified Revenue
              </span>
              <div className="text-2xl font-black text-emerald-400 mt-1">
                {formatCurrency(verifiedRevenue)}
              </div>
              <span className="text-[11px] text-slate-400 mt-0.5 block">
                {verifiedPayments.length} verified transactions
              </span>
            </div>

            <div className="p-5 rounded-3xl bg-white border border-slate-200/80 shadow-xs">
              <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center mb-3">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">
                Demo / Test Volume
              </span>
              <div className="text-2xl font-black text-slate-900 mt-1">
                {formatCurrency(demoVolume)}
              </div>
              <span className="text-[11px] text-amber-700 font-semibold mt-0.5 block">
                {demoPayments.length} non-production records
              </span>
            </div>

            <div className="p-5 rounded-3xl bg-white border border-slate-200/80 shadow-xs">
              <div className="w-9 h-9 rounded-xl bg-rose-500/10 text-rose-600 flex items-center justify-center mb-3">
                <Clock className="w-5 h-5" />
              </div>
              <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">
                Pending / Failed
              </span>
              <div className="text-2xl font-black text-slate-900 mt-1">{pendingOrFailed.length}</div>
              <span className="text-[11px] text-slate-500 mt-0.5 block">Requires review</span>
            </div>

            <div className="p-5 rounded-3xl bg-white border border-slate-200/80 shadow-xs">
              <div className="w-9 h-9 rounded-xl bg-blue-500/10 text-blue-600 flex items-center justify-center mb-3">
                <CreditCard className="w-5 h-5" />
              </div>
              <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">
                Total Records
              </span>
              <div className="text-2xl font-black text-slate-900 mt-1">{payments.length}</div>
              <span className="text-[11px] text-slate-500 mt-0.5 block">All ledger entries</span>
            </div>
          </div>

          <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="relative flex-1 max-w-md">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  value={paymentSearch}
                  onChange={(e) => setPaymentSearch(e.target.value)}
                  placeholder="Search by client, property, or transaction ID..."
                  className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                />
              </div>
              <div className="flex flex-wrap gap-1.5">
                {['All', 'Completed', 'Demo_Completed', 'Pending', 'Failed', 'Refunded'].map((st) => (
                  <button
                    key={st}
                    onClick={() => setPaymentStatusFilter(st)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold cursor-pointer transition-all ${
                      paymentStatusFilter === st
                        ? 'bg-slate-900 text-amber-400'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {st.replace('_', ' ')}
                  </button>
                ))}
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] font-bold border-b border-slate-200">
                  <tr>
                    <th className="px-4 py-3">Transaction</th>
                    <th className="px-4 py-3">Property</th>
                    <th className="px-4 py-3">Client</th>
                    <th className="px-4 py-3">Amount</th>
                    <th className="px-4 py-3">Environment</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredPayments.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-4 py-10 text-center text-slate-500">
                        <CreditCard className="w-9 h-9 text-slate-300 mx-auto mb-2" />
                        <p className="font-bold text-slate-700">No payment records found</p>
                        <p className="text-[11px] mt-1">
                          Verified and demo transactions will appear here once recorded.
                        </p>
                      </td>
                    </tr>
                  ) : (
                    filteredPayments.map((p) => (
                      <tr key={p.id} className="hover:bg-slate-50/80">
                        <td className="px-4 py-3.5 font-mono font-semibold text-slate-800">
                          {p.transaction_id || p.id}
                          <div className="text-[10px] font-sans text-slate-400">{p.payment_method}</div>
                        </td>
                        <td className="px-4 py-3.5 font-semibold text-slate-900">
                          {p.property_name || p.property_id || 'General'}
                        </td>
                        <td className="px-4 py-3.5 text-slate-700">
                          <div className="font-semibold">{p.customer_name}</div>
                          <div className="text-[11px] text-slate-400">{p.customer_email}</div>
                        </td>
                        <td className="px-4 py-3.5 font-extrabold text-slate-900">
                          {formatCurrency(p.amount)}
                        </td>
                        <td className="px-4 py-3.5">
                          {p.is_demo || p.status === 'Demo_Completed' ? (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                              Demo
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                              Production
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3.5">
                          <StatusBadge status={p.status === 'Demo_Completed' ? 'Pending' : p.status} />
                        </td>
                        <td className="px-4 py-3.5 text-slate-500 whitespace-nowrap">
                          {formatDate(p.created_at)}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ===================== USERS & WEBSITE SETTINGS =====================
  if (adminSection === 'settings') {
    const dbStatus = dataService.getDbStatus();
    const filteredProfiles = profiles.filter((p) => {
      const q = userSearch.trim().toLowerCase();
      return (
        !q ||
        p.name?.toLowerCase().includes(q) ||
        p.email?.toLowerCase().includes(q) ||
        p.role?.toLowerCase().includes(q)
      );
    });

    return (
      <div className="flex flex-col lg:flex-row min-h-screen bg-slate-50">
        <AdminSidebar activeSection={adminSection} onSelectSection={setAdminSection} />
        <div className="flex-1 p-6 sm:p-10 max-w-7xl mx-auto w-full space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
            <div>
              <span className="text-xs uppercase font-bold tracking-widest text-amber-600">
                System Administration
              </span>
              <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
                Users & Website Settings
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                Manage user owner-links, customize website appearance, and inspect cloud database connectivity.
              </p>
            </div>
            <button
              onClick={loadProfiles}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold cursor-pointer"
            >
              <RefreshCw className={`w-4 h-4 ${profilesLoading ? 'animate-spin' : ''}`} />
              <span>Sync Users</span>
            </button>
          </div>

          {/* Website Appearance & Database Settings */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs">
              <div className="flex items-center gap-2 text-xs uppercase font-bold tracking-wider text-amber-600 mb-1">
                <Palette className="w-4 h-4" />
                <span>Website Theme & Branding</span>
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-4">Active Color Palette</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {THEMES.map((t) => {
                  const isCurrent = t.id === currentTheme;
                  return (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => {
                        changeTheme(t.id);
                        addToast({
                          type: 'success',
                          title: 'Theme Updated',
                          message: `Website palette set to ${t.name}.`,
                        });
                      }}
                      className={`p-3.5 rounded-2xl border text-left transition-all flex items-center justify-between cursor-pointer ${
                        isCurrent
                          ? 'border-amber-500 bg-amber-50/40 shadow-xs'
                          : 'border-slate-200 hover:border-slate-300 bg-white'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex items-center -space-x-1.5">
                          <span
                            className="w-5 h-5 rounded-full border-2 border-white shadow-xs"
                            style={{ backgroundColor: t.primaryColor }}
                          />
                          <span
                            className="w-5 h-5 rounded-full border-2 border-white shadow-xs"
                            style={{ backgroundColor: t.accentColor }}
                          />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-slate-900">{t.name}</p>
                          <p className="text-[10px] text-slate-500">{t.subtitle}</p>
                        </div>
                      </div>
                      {isCurrent && (
                        <span className="w-5 h-5 rounded-full bg-slate-900 text-amber-400 flex items-center justify-center">
                          <Check className="w-3 h-3" />
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="p-6 rounded-3xl bg-slate-900 text-white border border-slate-800 shadow-md flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 text-xs uppercase font-bold tracking-wider text-amber-400 mb-2">
                  <Database className="w-4 h-4" />
                  <span>Cloud Engine</span>
                </div>
                <h3 className="text-lg font-bold">Supabase Connection</h3>
                <p className="text-xs text-slate-400 mt-1">
                  Status:{' '}
                  <span className={dbStatus.connected ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
                    {dbStatus.connected ? 'Connected' : 'Not Configured'}
                  </span>
                </p>
                <p className="text-[11px] font-mono text-slate-400 mt-2 break-all bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                  {dbStatus.url}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSupabaseModalOpen(true)}
                className="mt-5 w-full py-2.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs cursor-pointer flex items-center justify-center gap-2"
              >
                <Settings className="w-4 h-4" />
                <span>Configure Database Keys</span>
              </button>
            </div>
          </div>

          {/* Registered Profiles & Owner Linking */}
          <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Registered Platform Users</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  View authenticated user roles and link property owners to their owner profile.
                </p>
              </div>
              <div className="relative w-full sm:w-72">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-2.5" />
                <input
                  type="text"
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  placeholder="Filter users by name, email, role..."
                  className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] font-bold border-b border-slate-200">
                  <tr>
                    <th className="px-4 py-3">User</th>
                    <th className="px-4 py-3">Email</th>
                    <th className="px-4 py-3">DB Role</th>
                    <th className="px-4 py-3">Linked Owner Account</th>
                    <th className="px-4 py-3">Joined</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredProfiles.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-4 py-10 text-center text-slate-500">
                        No user profiles found.
                      </td>
                    </tr>
                  ) : (
                    filteredProfiles.map((u) => (
                      <tr key={u.id} className="hover:bg-slate-50/80">
                        <td className="px-4 py-3.5 font-bold text-slate-900">{u.name}</td>
                        <td className="px-4 py-3.5 font-mono text-slate-600">{u.email}</td>
                        <td className="px-4 py-3.5">
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                              u.role === 'admin'
                                ? 'bg-amber-100 text-amber-800'
                                : u.role === 'agent'
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-emerald-100 text-emerald-800'
                            }`}
                          >
                            {u.role}
                          </span>
                        </td>
                        <td className="px-4 py-3.5">
                          {u.role === 'admin' ? (
                            <span className="text-[11px] text-slate-400">Administrator</span>
                          ) : (
                            <select
                              value={u.owner_id || ''}
                              onChange={(e) => handleLinkOwnerProfile(u.id, e.target.value)}
                              className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-xs text-slate-700"
                            >
                              <option value="">Not an Owner (Buyer)</option>
                              {owners.map((o) => (
                                <option key={o.id} value={o.id}>
                                  {o.name} ({o.id})
                                </option>
                              ))}
                            </select>
                          )}
                        </td>
                        <td className="px-4 py-3.5 text-slate-500 whitespace-nowrap">
                          {formatDate(u.created_at)}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ===================== OVERVIEW DASHBOARD =====================
  const totalProperties = properties.length;
  const availableProperties = properties.filter((p) => p.availability === 'Available').length;
  const totalOwners = owners.length;
  const totalAgents = agents.length;
  const totalCustomers = customers.length;
  const totalBookings = bookings.length;
  const pendingBookings = bookings.filter((b) => b.status === 'Pending').length;
  const approvedBookings = bookings.filter((b) => b.status === 'Approved').length;
  const completedBookings = bookings.filter((b) => b.status === 'Completed').length;
  const rejectedBookings = bookings.filter((b) => b.status === 'Rejected').length;

  const totalPortfolioValue = properties.reduce((sum, p) => sum + (Number(p.price) || 0), 0);

  // Property distribution by type
  const typeCounts = {
    Villa: properties.filter((p) => p.type === 'Villa').length,
    Apartment: properties.filter((p) => p.type === 'Apartment').length,
    House: properties.filter((p) => p.type === 'House').length,
    Commercial: properties.filter((p) => p.type === 'Commercial').length,
  };

  // Recent Bookings (top 4)
  const recentBookings = [...bookings].slice(0, 4);

  // Recent Listings (top 4)
  const recentListings = [...properties].slice(0, 4);

  // Monthly statistics data for interactive chart
  const monthlyStats = Array.from({ length: 6 }, (_, index) => {
    const date = new Date();
    date.setDate(1);
    date.setMonth(date.getMonth() - (5 - index));

    const year = date.getFullYear();
    const monthIndex = date.getMonth();

    const tours = bookings.filter((booking) => {
      if (!booking.visit_date) return false;

      const [visitYear, visitMonth] = booking.visit_date
        .split('-')
        .map(Number);

      return visitYear === year && visitMonth - 1 === monthIndex;
    }).length;

    return {
      month: date.toLocaleString('en-IN', { month: 'short' }),
      tours,
    };
  });

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-slate-50">
      {/* Admin Sidebar */}
      <AdminSidebar activeSection={adminSection} onSelectSection={setAdminSection} />

      {/* Main Content Area */}
      <div className="flex-1 p-6 sm:p-10 max-w-7xl mx-auto w-full space-y-8">
        {/* Top Control Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs uppercase font-bold tracking-widest text-amber-600">
                Executive Portal
              </span>
            </div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              Admin Analytics & Operations
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Real-time synchronization across real estate portfolio, bookings, and agents.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={refreshData}
              className="p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 transition-colors cursor-pointer"
              title="Refresh database"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            <button
              onClick={() => setAdminSection('properties')}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-sm transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4 text-amber-400" />
              <span>Add Property</span>
            </button>
          </div>
        </div>

        {/* KPI Stat Cards (6 Key Metrics Required) */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {/* 1. Total Properties */}
          <div
            onClick={() => setAdminSection('properties')}
            className="p-5 rounded-3xl bg-white border border-slate-200/80 shadow-xs hover:shadow-md transition-all cursor-pointer group"
          >
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <Building className="w-5 h-5" />
            </div>
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">
              Total Properties
            </span>
            <div className="text-2xl font-black text-slate-900 mt-1">{totalProperties}</div>
            <span className="text-[11px] text-amber-700 font-semibold mt-0.5 block">
              {availableProperties} Available
            </span>
          </div>

          {/* 2. Total Owners */}
          <div
            onClick={() => setAdminSection('owners')}
            className="p-5 rounded-3xl bg-white border border-slate-200/80 shadow-xs hover:shadow-md transition-all cursor-pointer group"
          >
            <div className="w-9 h-9 rounded-xl bg-blue-500/10 text-blue-600 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <Users className="w-5 h-5" />
            </div>
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">
              Total Owners
            </span>
            <div className="text-2xl font-black text-slate-900 mt-1">{totalOwners}</div>
            <span className="text-[11px] text-slate-500 mt-0.5 block">Registered Owners</span>
          </div>

          {/* 4. Total Customers */}
          <div
            onClick={() => setAdminSection('customers')}
            className="p-5 rounded-3xl bg-white border border-slate-200/80 shadow-xs hover:shadow-md transition-all cursor-pointer group"
          >
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <UserCheck className="w-5 h-5" />
            </div>
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">
              Total Customers
            </span>
            <div className="text-2xl font-black text-slate-900 mt-1">{totalCustomers}</div>
            <span className="text-[11px] text-emerald-700 font-semibold mt-0.5 block">Registered Customers</span>
          </div>

          {/* 5. Total Bookings */}
          <div
            onClick={() => setAdminSection('bookings')}
            className="p-5 rounded-3xl bg-white border border-slate-200/80 shadow-xs hover:shadow-md transition-all cursor-pointer group"
          >
            <div className="w-9 h-9 rounded-xl bg-rose-500/10 text-rose-600 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <Calendar className="w-5 h-5" />
            </div>
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">
              Total Bookings
            </span>
            <div className="text-2xl font-black text-slate-900 mt-1">{totalBookings}</div>
            <span className="text-[11px] text-amber-700 font-semibold mt-0.5 block">
              {pendingBookings} Pending
            </span>
          </div>

          {/* 6. Portfolio Asset Value */}
          <div className="p-5 rounded-3xl bg-slate-900 text-white border border-slate-800 shadow-md">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center mb-3">
              <TrendingUp className="w-5 h-5" />
            </div>
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">
              Portfolio Value
            </span>
            <div className="text-xl font-black text-amber-400 mt-1">
              {formatCurrency(totalPortfolioValue)}
            </div>
            <span className="text-[11px] text-slate-400 mt-0.5 block">Managed Assets</span>
          </div>
        </div>

        {/* Charts Section: Booking Statistics & Property Breakdown */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Chart 1: Monthly Tour Bookings Trend (SVG Visual Chart) */}
          <div className="lg:col-span-2 p-6 sm:p-7 rounded-3xl bg-white border border-slate-200/80 shadow-xs">
            <div className="flex items-center justify-between mb-6">
              <div>
                <span className="text-xs uppercase font-bold tracking-wider text-amber-600 flex items-center gap-1.5">
                  <BarChart3 className="w-4 h-4" />
                  Performance Metrics
                </span>
                <h3 className="text-lg font-bold text-slate-900 mt-0.5">
                  Monthly Booking Tour Trends
                </h3>
              </div>
              <div className="flex items-center gap-4 text-xs font-semibold">
                <span className="flex items-center gap-1.5 text-slate-700">
                  <span className="w-3 h-3 rounded-md bg-slate-900" />
                  Scheduled Tours
                </span>

              </div>
            </div>

            {/* Rendered SVG Chart */}
            <div className="h-64 flex items-end justify-between gap-4 pt-4 px-2 border-b border-slate-100">
              {monthlyStats.map((item, index) => {
                const maxVal = 50;
                const barHeight = Math.min(100, (item.tours / maxVal) * 100);


                return (
                  <div key={item.month} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
                    <div className="relative w-full flex items-end justify-center gap-1.5 h-full">
                      {/* Tours Bar */}
                      <div
                        style={{ height: `${barHeight}%` }}
                        className="w-full max-w-[28px] rounded-t-lg bg-slate-900 group-hover:bg-amber-600 transition-all duration-300 relative"
                      >
                        <span className="opacity-0 group-hover:opacity-100 absolute -top-7 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[10px] font-bold py-0.5 px-1.5 rounded pointer-events-none transition-opacity">
                          {item.tours}
                        </span>
                      </div>


                    </div>
                    <span className="text-xs font-bold text-slate-600 mt-2">{item.month}</span>
                  </div>
                );
              })}
            </div>

            <div className="mt-4 flex items-center justify-between text-xs text-slate-500">
              <span>Showing last 6 months activity</span>
              <span>Based on actual scheduled bookings</span>
            </div>
          </div>

          {/* Chart 2: Status Breakdown & Property Type Donut */}
          <div className="p-6 sm:p-7 rounded-3xl bg-white border border-slate-200/80 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-1.5 text-xs uppercase font-bold tracking-wider text-amber-600 mb-1">
                <PieChart className="w-4 h-4" />
                <span>Asset Composition</span>
              </div>
              <h3 className="text-lg font-bold text-slate-900">Property Categories</h3>

              {/* Category Breakdown Progress Bars */}
              <div className="mt-6 space-y-4">
                {Object.entries(typeCounts).map(([catName, count]) => {
                  const percentage = totalProperties > 0 ? Math.round((count / totalProperties) * 100) : 0;
                  return (
                    <div key={catName}>
                      <div className="flex items-center justify-between text-xs font-semibold mb-1">
                        <span className="text-slate-700">{catName}</span>
                        <span className="text-slate-500">
                          {count} ({percentage}%)
                        </span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                        <div
                          style={{ width: `${percentage}%` }}
                          className={`h-full rounded-full ${
                            catName === 'Villa'
                              ? 'bg-purple-600'
                              : catName === 'Apartment'
                              ? 'bg-sky-500'
                              : catName === 'House'
                              ? 'bg-amber-500'
                              : 'bg-emerald-600'
                          }`}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Booking Status Mini Badges */}
            <div className="mt-8 pt-5 border-t border-slate-100">
              <span className="text-[10px] uppercase font-bold text-slate-400 block mb-2">
                Booking Queue Status
              </span>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200/60">
                  <span className="text-[10px] text-amber-700 uppercase font-bold block">Pending</span>
                  <span className="text-base font-extrabold text-amber-900">{pendingBookings}</span>
                </div>
                <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200/60">
                  <span className="text-[10px] text-emerald-700 uppercase font-bold block">Approved</span>
                  <span className="text-base font-extrabold text-emerald-900">{approvedBookings}</span>
                </div>
                <div className="p-2.5 rounded-xl bg-blue-50 border border-blue-200/60">
                  <span className="text-[10px] text-blue-700 uppercase font-bold block">Completed</span>
                  <span className="text-base font-extrabold text-blue-900">{completedBookings}</span>
                </div>
                <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200/60">
                  <span className="text-[10px] text-rose-700 uppercase font-bold block">Rejected</span>
                  <span className="text-base font-extrabold text-rose-900">{rejectedBookings}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Section: Recent Booking Requests Table (Required) */}
        <div className="p-6 sm:p-7 rounded-3xl bg-white border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-lg font-bold text-slate-900">Recent Booking Requests</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Manage upcoming customer walkthrough requests and approve or reject with one click.
              </p>
            </div>
            <button
              onClick={() => setAdminSection('bookings')}
              className="text-xs font-bold text-amber-700 hover:text-amber-800 flex items-center gap-1 cursor-pointer"
            >
              <span>View All Bookings ({bookings.length})</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] font-bold border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3">Property</th>
                  <th className="px-4 py-3">Client</th>
                  <th className="px-4 py-3">Date & Slot</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Instant Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recentBookings.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-10 text-center">
                      <Calendar className="w-9 h-9 text-slate-400 mx-auto mb-3" />
                      <p className="text-sm font-bold text-slate-700">No Bookings Available Yet</p>
                      <p className="text-xs text-slate-500 mt-1">
                        Customer bookings will appear here once received.
                      </p>
                    </td>
                  </tr>
                ) : recentBookings.map((b) => {
                  const prop = properties.find((p) => p.id === b.property_id);
                  return (
                    <tr key={b.id} className="hover:bg-slate-50/80">
                      <td className="px-4 py-3.5 font-bold text-slate-900 max-w-xs truncate">
                        {prop ? prop.name : `Property #${b.property_id}`}
                      </td>
                      <td className="px-4 py-3.5 text-slate-700">
                        <div className="font-semibold">{b.customer_name}</div>
                        <div className="text-[11px] text-slate-400">{b.customer_email}</div>
                      </td>
                      <td className="px-4 py-3.5 text-slate-600 whitespace-nowrap">
                        <div className="font-semibold">{formatDate(b.visit_date)}</div>
                        <div className="text-[11px] text-slate-400">{b.time_slot || b.visit_time}</div>
                      </td>
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <StatusBadge status={b.status} />
                      </td>
                      <td className="px-4 py-3.5 text-right whitespace-nowrap">
                        {b.status === 'Pending' ? (
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => updateBookingStatus(b.id, 'Approved', b.agent_id)}
                              className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] cursor-pointer"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => updateBookingStatus(b.id, 'Rejected', b.agent_id)}
                              className="px-2.5 py-1 rounded-lg bg-rose-100 hover:bg-rose-200 text-rose-700 font-bold text-[11px] cursor-pointer"
                            >
                              Reject
                            </button>
                          </div>
                        ) : (
                          <span className="text-[11px] text-slate-400 font-mono">
                            Ref: {b.id.toUpperCase()}
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Section: Recent Property Listings (Required) */}
        <div className="p-6 sm:p-7 rounded-3xl bg-white border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-lg font-bold text-slate-900">Recent Property Listings</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Newest residential and commercial additions to the active database.
              </p>
            </div>
            <button
              onClick={() => setAdminSection('properties')}
              className="text-xs font-bold text-amber-700 hover:text-amber-800 flex items-center gap-1 cursor-pointer"
            >
              <span>Manage All Properties</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {recentListings.length === 0 ? (
              <div className="col-span-full py-10 text-center rounded-2xl border border-dashed border-slate-300 bg-slate-50">
                <Building className="w-10 h-10 text-slate-400 mx-auto mb-3" />
                <h4 className="text-sm font-bold text-slate-700">No Properties Available</h4>
                <p className="text-xs text-slate-500 mt-1">
                  Property listings will appear here once added to the database.
                </p>
              </div>
            ) : recentListings.map((prop) => (
              <div
                key={prop.id}
                onClick={() => setSelectedProperty(prop)}
                className="group p-3 rounded-2xl border border-slate-200/80 hover:border-amber-400/80 bg-slate-50/50 hover:bg-white transition-all cursor-pointer shadow-xs"
              >
                <div className="aspect-[16/10] rounded-xl overflow-hidden mb-3 relative">
                  {prop.image ? (
                    <img
                      src={prop.image}
                      alt={prop.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-slate-100 text-slate-400">
                      <Building className="w-10 h-10" />
                    </div>
                  )}
                  <div className="absolute top-2 left-2">
                    <TypeBadge type={prop.type} className="bg-white/95 text-[10px]" />
                  </div>
                </div>
                <h4 className="text-xs font-bold text-slate-900 group-hover:text-amber-700 truncate">
                  {prop.name}
                </h4>
                <p className="text-[11px] text-slate-500 truncate mt-0.5">{prop.location}</p>
                <div className="mt-2 pt-2 border-t border-slate-200/60 flex items-center justify-between">
                  <span className="text-xs font-extrabold text-slate-900">
                    {formatCurrency(prop.price)}
                  </span>
                  <StatusBadge status={prop.availability} className="text-[10px] px-1.5 py-0.2" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};





