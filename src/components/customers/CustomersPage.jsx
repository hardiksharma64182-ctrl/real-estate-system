import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { CustomerFormModal } from './CustomerFormModal';
import { ConfirmModal } from '../common/ConfirmModal';
import { StatusBadge } from '../common/Badge';
import { formatDate, formatCurrency } from '../../utils/formatters';
import {
  Users,
  Search,
  Plus,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Building,
  Edit2,
  Trash2,
  Clock,
  History,
  ExternalLink,
} from 'lucide-react';

export const CustomersPage = () => {
  const { customers, properties, bookings, deleteCustomer, setSelectedProperty } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [customerToEdit, setCustomerToEdit] = useState(null);
  const [customerToDelete, setCustomerToDelete] = useState(null);

  const filteredCustomers = useMemo(() => {
    return customers.filter((cust) => {
      if (!searchTerm) return true;
      const term = searchTerm.toLowerCase();
      return (
        cust.name?.toLowerCase().includes(term) ||
        cust.email?.toLowerCase().includes(term) ||
        cust.phone?.toLowerCase().includes(term) ||
        cust.address?.toLowerCase().includes(term)
      );
    });
  }, [customers, searchTerm]);

  // Map customer booking history
  const getCustomerBookings = (custEmail) => {
    if (!custEmail) return [];
    return bookings.filter(
      (b) => b.customer_email?.toLowerCase() === custEmail.toLowerCase()
    );
  };

  const handleDeleteConfirm = async () => {
    if (customerToDelete) {
      await deleteCustomer(customerToDelete.id);
      setCustomerToDelete(null);
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
                Buyer Relationship Management
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Customers Management
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Track registered clients, interested assets, purchase budgets, and enquiry history.
            </p>
          </div>

          <button
            onClick={() => {
              setCustomerToEdit(null);
              setFormModalOpen(true);
            }}
            className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm shadow-md transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4 text-amber-400" />
            <span>Add New Customer</span>
          </button>
        </div>

        {/* Stats Row */}
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs">
            <span className="text-xs uppercase font-bold text-slate-400">Total Registered Clients</span>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-slate-900">{customers.length}</span>
              <span className="text-xs font-semibold text-emerald-600">Active Profiles</span>
            </div>
          </div>

          <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs">
            <span className="text-xs uppercase font-bold text-slate-400">Active Tour Requests</span>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-amber-600">
                {bookings.filter((b) => b.status === 'Pending' || b.status === 'Approved').length}
              </span>
              <span className="text-xs font-semibold text-slate-500">In Schedule</span>
            </div>
          </div>

          <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs">
            <span className="text-xs uppercase font-bold text-slate-400">Completed Tours</span>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-slate-900">
                {bookings.filter((b) => b.status === 'Completed').length}
              </span>
              <span className="text-xs font-semibold text-blue-600">Inspections</span>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="mt-8 bg-white rounded-3xl p-4 sm:p-5 border border-slate-200/80 shadow-xs">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search customers by name, email, phone, or location..."
              className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all"
            />
          </div>
        </div>

        {/* Customer Cards */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-8">
          {filteredCustomers.map((cust) => {
            const interestedProp = properties.find((p) => p.id === cust.interested_property_id);
            const customerHistory = getCustomerBookings(cust.email);

            return (
              <div
                key={cust.id}
                className="bg-white rounded-3xl border border-slate-200/80 shadow-xs hover:shadow-xl transition-all p-6 sm:p-8 flex flex-col justify-between"
              >
                <div>
                  {/* Top Bar */}
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3.5">
                      <div className="w-12 h-12 rounded-2xl bg-slate-900 text-amber-400 border border-amber-500/30 flex items-center justify-center font-bold text-lg">
                        {cust.name.charAt(0)}
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-slate-900">{cust.name}</h3>
                        <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
                          <span>Joined {formatDate(cust.registration_date)}</span>
                          {cust.budget_range && (
                            <>
                              <span>•</span>
                              <span className="text-amber-700 font-semibold">{cust.budget_range}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => {
                          setCustomerToEdit(cust);
                          setFormModalOpen(true);
                        }}
                        className="p-2 text-slate-500 hover:text-amber-600 hover:bg-amber-50 rounded-xl transition-colors cursor-pointer"
                        title="Edit Customer"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setCustomerToDelete(cust)}
                        className="p-2 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
                        title="Delete Customer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Contact Info */}
                  <div className="mt-5 space-y-2 text-xs text-slate-600 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                    <div className="flex items-center gap-2">
                      <Mail className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                      <a href={`mailto:${cust.email}`} className="hover:text-amber-600 font-medium truncate">
                        {cust.email}
                      </a>
                    </div>
                    {cust.phone && (
                      <div className="flex items-center gap-2">
                        <Phone className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                        <a href={`tel:${cust.phone}`} className="hover:text-amber-600 font-medium">
                          {cust.phone}
                        </a>
                      </div>
                    )}
                    {cust.address && (
                      <div className="flex items-start gap-2">
                        <MapPin className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                        <span className="truncate">{cust.address}</span>
                      </div>
                    )}
                  </div>

                  {/* Interested Property */}
                  {interestedProp && (
                    <div className="mt-4">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1.5">
                        Interested Property Target
                      </span>
                      <div
                        onClick={() => setSelectedProperty(interestedProp)}
                        className="flex items-center justify-between p-3 rounded-2xl bg-amber-50/50 border border-amber-200/50 hover:bg-amber-100/50 transition-colors cursor-pointer group"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <img
                            src={interestedProp.image}
                            alt={interestedProp.name}
                            className="w-10 h-10 rounded-xl object-cover shrink-0"
                          />
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-slate-900 group-hover:text-amber-800 truncate">
                              {interestedProp.name}
                            </p>
                            <p className="text-[11px] text-slate-500 truncate">
                              {interestedProp.location} • {formatCurrency(interestedProp.price)}
                            </p>
                          </div>
                        </div>
                        <ExternalLink className="w-4 h-4 text-slate-400 group-hover:text-amber-700 shrink-0 ml-2" />
                      </div>
                    </div>
                  )}

                  {cust.notes && (
                    <p className="mt-3 text-xs text-slate-500 italic">
                      Notes: {cust.notes}
                    </p>
                  )}
                </div>

                {/* Enquiry & Tour History */}
                <div className="mt-6 pt-5 border-t border-slate-100">
                  <div className="flex items-center justify-between text-xs mb-3">
                    <span className="font-bold text-slate-700 flex items-center gap-1.5">
                      <History className="w-3.5 h-3.5 text-amber-600" />
                      Tour Booking History ({customerHistory.length})
                    </span>
                  </div>

                  {customerHistory.length === 0 ? (
                    <p className="text-xs text-slate-400 italic">No tour requests logged yet.</p>
                  ) : (
                    <div className="space-y-2">
                      {customerHistory.map((b) => {
                        const prop = properties.find((p) => p.id === b.property_id);
                        return (
                          <div
                            key={b.id}
                            className="p-3 rounded-xl bg-slate-50 border border-slate-200/60 flex items-center justify-between text-xs gap-3"
                          >
                            <div className="min-w-0">
                              <p className="font-semibold text-slate-900 truncate">
                                {prop ? prop.name : `Property ID: ${b.property_id}`}
                              </p>
                              <p className="text-[11px] text-slate-500 flex items-center gap-1.5 mt-0.5">
                                <Clock className="w-3 h-3 text-slate-400" />
                                {formatDate(b.visit_date)} • {b.time_slot || b.visit_time}
                              </p>
                            </div>
                            <StatusBadge status={b.status} className="shrink-0" />
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Customer Form Modal */}
      <CustomerFormModal
        isOpen={formModalOpen}
        onClose={() => setFormModalOpen(false)}
        initialData={customerToEdit}
      />

      {/* Delete Confirmation */}
      <ConfirmModal
        isOpen={Boolean(customerToDelete)}
        title="Remove Customer Record"
        message={`Are you sure you want to remove client "${customerToDelete?.name}"?`}
        confirmText="Yes, Remove Customer"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setCustomerToDelete(null)}
      />
    </div>
  );
};
