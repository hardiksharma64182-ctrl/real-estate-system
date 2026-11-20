import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { StatusBadge } from '../common/Badge';
import { ConfirmModal } from '../common/ConfirmModal';
import { formatDate, formatCurrency } from '../../utils/formatters';
import {
  Calendar,
  Clock,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  Clock3,
  UserCheck,
  Shield,
  Trash2,
  Phone,
  Mail,
  Building,
  User,
  ExternalLink,
} from 'lucide-react';

export const BookingsPage = () => {
  const {
    bookings,
    properties,
    agents,
    updateBookingStatus,
    deleteBooking,
    setSelectedProperty,
  } = useApp();

  const [statusFilter, setStatusFilter] = useState('All'); // 'All', 'Pending', 'Approved', 'Rejected', 'Completed'
  const [searchTerm, setSearchTerm] = useState('');
  const [bookingToDelete, setBookingToDelete] = useState(null);

  const statuses = ['All', 'Pending', 'Approved', 'Completed', 'Rejected'];

  const filteredBookings = useMemo(() => {
    return bookings.filter((b) => {
      // Status filter
      if (statusFilter !== 'All' && b.status.toLowerCase() !== statusFilter.toLowerCase()) {
        return false;
      }

      // Search filter
      if (searchTerm) {
        const term = searchTerm.toLowerCase();
        const prop = properties.find((p) => p.id === b.property_id);
        const matchCust = b.customer_name?.toLowerCase().includes(term);
        const matchEmail = b.customer_email?.toLowerCase().includes(term);
        const matchProp = prop?.name?.toLowerCase().includes(term);
        const matchId = b.id?.toLowerCase().includes(term);
        if (!matchCust && !matchEmail && !matchProp && !matchId) return false;
      }

      return true;
    });
  }, [bookings, statusFilter, searchTerm, properties]);

  const handleDeleteConfirm = async () => {
    if (bookingToDelete) {
      await deleteBooking(bookingToDelete.id);
      setBookingToDelete(null);
    }
  };

  const handleAgentChange = async (bookingId, agentId) => {
    const booking = bookings.find((b) => b.id === bookingId);
    if (booking) {
      await updateBookingStatus(bookingId, booking.status, agentId);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-10 sm:py-14">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-8 border-b border-slate-200">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs uppercase font-bold tracking-widest text-amber-600">
                Tour Operations & Concierge
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Booking Management
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Manage client property walkthrough requests, approve schedules, and assign dedicated brokers.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-amber-500/10 text-amber-700 border border-amber-500/30">
              {bookings.filter((b) => b.status === 'Pending').length} Pending Requests
            </span>
          </div>
        </div>

        {/* Filter Tabs & Search */}
        <div className="mt-8 bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            {/* Status tabs */}
            <div className="flex flex-wrap gap-1.5 p-1 bg-slate-100 rounded-2xl w-full md:w-auto">
              {statuses.map((st) => {
                const count =
                  st === 'All'
                    ? bookings.length
                    : bookings.filter((b) => b.status.toLowerCase() === st.toLowerCase()).length;

                return (
                  <button
                    key={st}
                    onClick={() => setStatusFilter(st)}
                    className={`px-3.5 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
                      statusFilter === st
                        ? 'bg-white text-slate-900 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <span>{st}</span>
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                        statusFilter === st ? 'bg-slate-900 text-white' : 'bg-slate-200 text-slate-700'
                      }`}
                    >
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Search */}
            <div className="relative w-full md:w-72">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search booking or client..."
                className="w-full pl-9 pr-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-amber-500/20"
              />
            </div>
          </div>
        </div>

        {/* Bookings List / Table */}
        <div className="mt-8 space-y-4">
          {filteredBookings.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-3xl border border-slate-200 p-8">
              <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h3 className="text-lg font-bold text-slate-900">No bookings match this filter</h3>
              <p className="text-xs text-slate-500 mt-1">
                Select another status filter tab or clear your search term.
              </p>
            </div>
          ) : (
            filteredBookings.map((b) => {
              const prop = properties.find((p) => p.id === b.property_id);
              const assignedAgent = agents.find((a) => a.id === b.agent_id);

              return (
                <div
                  key={b.id}
                  className="bg-white rounded-3xl border border-slate-200/80 shadow-xs hover:shadow-md transition-all p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-6"
                >
                  {/* Left Column: Property & Client Info */}
                  <div className="flex flex-col sm:flex-row items-start gap-4 min-w-0 flex-1">
                    {/* Property Thumbnail */}
                    {prop ? (
                      <div
                        onClick={() => setSelectedProperty(prop)}
                        className="relative w-full sm:w-36 h-24 rounded-2xl overflow-hidden shrink-0 border border-slate-200 cursor-pointer group"
                      >
                        <img
                          src={prop.image}
                          alt={prop.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        />
                        <div className="absolute inset-0 bg-slate-950/20 group-hover:bg-transparent transition-colors" />
                        <span className="absolute bottom-1.5 left-1.5 text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-950/80 text-white">
                          {formatCurrency(prop.price)}
                        </span>
                      </div>
                    ) : (
                      <div className="w-full sm:w-36 h-24 rounded-2xl bg-slate-100 flex items-center justify-center shrink-0">
                        <Building className="w-6 h-6 text-slate-400" />
                      </div>
                    )}

                    {/* Booking Details */}
                    <div className="min-w-0 space-y-1.5">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-xs font-mono font-bold text-slate-400">
                          ID: {b.id.toUpperCase()}
                        </span>
                        <StatusBadge status={b.status} />
                      </div>

                      <h3
                        onClick={() => prop && setSelectedProperty(prop)}
                        className="text-base font-bold text-slate-900 hover:text-amber-700 cursor-pointer line-clamp-1"
                      >
                        {prop ? prop.name : `Property ID: ${b.property_id}`}
                      </h3>

                      <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600">
                        <span className="flex items-center gap-1 font-semibold text-slate-800">
                          <Calendar className="w-3.5 h-3.5 text-amber-600" />
                          {formatDate(b.visit_date)}
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          {b.time_slot || b.visit_time}
                        </span>
                      </div>

                      {/* Client Details */}
                      <div className="flex flex-wrap items-center gap-3 pt-1 text-xs text-slate-500">
                        <span className="font-semibold text-slate-900 flex items-center gap-1">
                          <User className="w-3.5 h-3.5 text-slate-400" />
                          {b.customer_name}
                        </span>
                        <span className="flex items-center gap-1">
                          <Mail className="w-3 h-3 text-slate-400" />
                          <a href={`mailto:${b.customer_email}`} className="hover:text-amber-600">
                            {b.customer_email}
                          </a>
                        </span>
                        {b.customer_phone && (
                          <span className="flex items-center gap-1">
                            <Phone className="w-3 h-3 text-slate-400" />
                            <a href={`tel:${b.customer_phone}`} className="hover:text-amber-600">
                              {b.customer_phone}
                            </a>
                          </span>
                        )}
                      </div>

                      {b.notes && (
                        <p className="text-xs text-slate-500 italic mt-1">
                          Request Note: "{b.notes}"
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Right Column: Agent Assignment & Status Controls */}
                  <div className="flex flex-col sm:flex-row lg:flex-col items-start lg:items-end justify-between gap-3 border-t lg:border-t-0 pt-4 lg:pt-0 shrink-0">
                    {/* Assign Agent Select */}
                    <div className="w-full sm:w-auto">
                      <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1 flex items-center gap-1">
                        <Shield className="w-3 h-3 text-amber-600" />
                        Assigned Broker
                      </label>
                      <select
                        value={b.agent_id || ''}
                        onChange={(e) => handleAgentChange(b.id, e.target.value)}
                        className="w-full sm:w-56 px-3 py-1.5 text-xs font-semibold rounded-xl bg-slate-50 border border-slate-200 text-slate-700 focus:outline-none focus:ring-2 focus:ring-amber-500/20 bg-white"
                      >
                        <option value="">Unassigned Broker</option>
                        {agents.map((ag) => (
                          <option key={ag.id} value={ag.id}>
                            {ag.name} ({ag.experience})
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Fast Status Action Buttons */}
                    <div className="flex flex-wrap items-center gap-1.5 w-full sm:w-auto justify-end">
                      {b.status === 'Pending' && (
                        <>
                          <button
                            type="button"
                            onClick={() => updateBookingStatus(b.id, 'Approved', b.agent_id)}
                            className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors flex items-center gap-1 cursor-pointer shadow-xs"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Approve</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => updateBookingStatus(b.id, 'Rejected', b.agent_id)}
                            className="px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold transition-colors flex items-center gap-1 cursor-pointer"
                          >
                            <XCircle className="w-3.5 h-3.5" />
                            <span>Reject</span>
                          </button>
                        </>
                      )}

                      {b.status === 'Approved' && (
                        <button
                          type="button"
                          onClick={() => updateBookingStatus(b.id, 'Completed', b.agent_id)}
                          className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-colors flex items-center gap-1 cursor-pointer shadow-xs"
                        >
                          <UserCheck className="w-3.5 h-3.5" />
                          <span>Mark Completed</span>
                        </button>
                      )}

                      {/* Dropdown status update for arbitrary change */}
                      <select
                        value={b.status}
                        onChange={(e) => updateBookingStatus(b.id, e.target.value, b.agent_id)}
                        className="px-2.5 py-1.5 rounded-xl border border-slate-200 text-xs font-medium bg-slate-50 text-slate-700 focus:outline-none cursor-pointer"
                      >
                        <option value="Pending">Pending</option>
                        <option value="Approved">Approved</option>
                        <option value="Completed">Completed</option>
                        <option value="Rejected">Rejected</option>
                      </select>

                      <button
                        type="button"
                        onClick={() => setBookingToDelete(b)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                        title="Delete Booking Record"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Delete Confirmation */}
      <ConfirmModal
        isOpen={Boolean(bookingToDelete)}
        title="Cancel & Delete Booking"
        message={`Are you sure you want to remove the booking record for "${bookingToDelete?.customer_name}"?`}
        confirmText="Yes, Delete Booking"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setBookingToDelete(null)}
      />
    </div>
  );
};
