import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { AdminSidebar } from './AdminSidebar';
import { PropertiesPage } from '../properties/PropertiesPage';
import { OwnersPage } from '../owners/OwnersPage';
import { AgentsPage } from '../agents/AgentsPage';
import { CustomersPage } from '../customers/CustomersPage';
import { BookingsPage } from '../bookings/BookingsPage';
import { StatusBadge, TypeBadge } from '../common/Badge';
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
  ArrowUpRight,
  ExternalLink,
  Plus,
  RefreshCw,
  Database,
  BarChart3,
  PieChart,
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
    setActiveTab,
    refreshData,
    setSupabaseModalOpen,
  } = useApp();

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





