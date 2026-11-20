import React from 'react';
import { useApp } from '../../context/AppContext';
import { formatDate, formatCurrency } from '../../utils/formatters';
import { StatusBadge } from '../common/Badge';
import {
  X,
  Calendar,
  Clock,
  MapPin,
  Building,
  User,
  Phone,
  Mail,
  Shield,
  ArrowRight,
} from 'lucide-react';

export const MyBookingsModal = () => {
  const {
    myBookingsModalOpen,
    setMyBookingsModalOpen,
    bookings,
    properties,
    agents,
    currentUser,
    setSelectedProperty,
    setActiveTab,
  } = useApp();

  if (!myBookingsModalOpen) return null;

  // Filter user bookings or show recent if demo
  const userEmail = currentUser?.email?.toLowerCase();
  const userBookings = bookings.filter((b) => {
    if (!userEmail) return true;
    if (currentUser?.role === 'admin') return true;
    return b.customer_email?.toLowerCase() === userEmail;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden">
        {/* Header */}
        <div className="bg-slate-900 text-white p-6 sm:p-7 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold tracking-tight">Scheduled Property Tours</h2>
              <p className="text-xs text-slate-300">
                {currentUser?.role === 'admin'
                  ? 'All platform client bookings (Admin View)'
                  : `Tours requested by ${currentUser?.name || 'Customer'}`}
              </p>
            </div>
          </div>
          <button
            onClick={() => setMyBookingsModalOpen(false)}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 max-h-[65vh] overflow-y-auto space-y-4">
          {userBookings.length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h3 className="text-base font-bold text-slate-900">No scheduled visits yet</h3>
              <p className="text-xs text-slate-500 max-w-xs mx-auto mt-1">
                Browse our luxury properties catalog and click "Book Tour" on any listing to schedule a private walkthrough.
              </p>
              <button
                onClick={() => {
                  setMyBookingsModalOpen(false);
                  setActiveTab('properties');
                }}
                className="mt-4 px-4 py-2 bg-slate-900 text-amber-400 rounded-xl text-xs font-bold cursor-pointer"
              >
                Explore Properties
              </button>
            </div>
          ) : (
            userBookings.map((b) => {
              const prop = properties.find((p) => p.id === b.property_id);
              const assignedAgent = agents.find((a) => a.id === b.agent_id);

              return (
                <div
                  key={b.id}
                  className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 hover:border-slate-300 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="flex items-start gap-3.5 min-w-0">
                    {prop ? (
                      <img
                        src={prop.image}
                        alt={prop.name}
                        className="w-16 h-16 rounded-xl object-cover shrink-0 border border-slate-200 cursor-pointer"
                        onClick={() => {
                          setMyBookingsModalOpen(false);
                          setSelectedProperty(prop);
                        }}
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-xl bg-slate-200 flex items-center justify-center shrink-0">
                        <Building className="w-6 h-6 text-slate-400" />
                      </div>
                    )}

                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <h4
                          onClick={() => {
                            if (prop) {
                              setMyBookingsModalOpen(false);
                              setSelectedProperty(prop);
                            }
                          }}
                          className="text-sm font-bold text-slate-900 hover:text-amber-700 cursor-pointer truncate"
                        >
                          {prop ? prop.name : `Property ID: ${b.property_id}`}
                        </h4>
                      </div>

                      <p className="text-xs text-slate-500 mt-1 flex items-center gap-2">
                        <span className="flex items-center gap-1 font-semibold text-slate-700">
                          <Calendar className="w-3.5 h-3.5 text-amber-600" />
                          {formatDate(b.visit_date)}
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1 text-slate-600">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          {b.time_slot || b.visit_time}
                        </span>
                      </p>

                      {assignedAgent && (
                        <p className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
                          <Shield className="w-3 h-3 text-emerald-600" />
                          Broker: <span className="font-semibold text-slate-800">{assignedAgent.name}</span> ({assignedAgent.phone})
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex sm:flex-col items-center sm:items-end justify-between gap-2 shrink-0 border-t sm:border-t-0 pt-3 sm:pt-0">
                    <StatusBadge status={b.status} />
                    <span className="text-[11px] text-slate-400 font-mono">
                      Ref: {b.id.toUpperCase()}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-100 border-t border-slate-200 text-center">
          <p className="text-xs text-slate-500">
            For modifications or cancellations, contact our concierge line at +1 (800) 555-LUXE
          </p>
        </div>
      </div>
    </div>
  );
};
