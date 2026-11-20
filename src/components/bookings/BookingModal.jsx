import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { formatCurrency } from '../../utils/formatters';
import { X, Calendar, Clock, User, Mail, Phone, MapPin, Building, Sparkles } from 'lucide-react';

export const BookingModal = () => {
  const {
    bookingProperty,
    setBookingProperty,
    properties,
    currentUser,
    addBooking,
    addToast,
  } = useApp();

  const [selectedPropId, setSelectedPropId] = useState('');
  const [visitDate, setVisitDate] = useState('');
  const [timeSlot, setTimeSlot] = useState('Afternoon (2:00 PM)');
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');

  // Set minimum date to tomorrow
  const minDate = new Date(Date.now() + 86400000).toISOString().split('T')[0];

  useEffect(() => {
    if (bookingProperty) {
      setSelectedPropId(bookingProperty.id);
    } else if (properties.length > 0) {
      setSelectedPropId(properties[0].id);
    }

    if (currentUser) {
      setCustomerName(currentUser.name || '');
      setCustomerEmail(currentUser.email || '');
    }

    // Default visit date to 3 days ahead
    const defaultDate = new Date(Date.now() + 3 * 86400000).toISOString().split('T')[0];
    setVisitDate(defaultDate);
  }, [bookingProperty, properties, currentUser]);

  if (!bookingProperty) return null;

  const currentProperty = properties.find((p) => p.id === selectedPropId) || bookingProperty;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!currentProperty) {
      setError('Please select a property to visit.');
      return;
    }
    if (!visitDate) {
      setError('Please select a preferred visit date.');
      return;
    }
    if (!customerName || !customerEmail || !customerPhone) {
      setError('Please provide your name, email, and contact number.');
      return;
    }

    try {
      await addBooking({
        property_id: currentProperty.id,
        customer_name: customerName,
        customer_email: customerEmail,
        customer_phone: customerPhone,
        visit_date: visitDate,
        time_slot: timeSlot,
        agent_id: currentProperty.agent_id || null,
        status: 'Pending',
        notes: notes || 'Private walkthrough request',
      });

      setBookingProperty(null);
    } catch (err) {
      setError('Could not submit booking request.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl my-8 bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden">
        {/* Header */}
        <div className="bg-slate-900 text-white p-6 sm:p-7 relative overflow-hidden">
          <div className="absolute -top-12 -right-12 w-32 h-32 rounded-full bg-amber-500/20 blur-2xl pointer-events-none" />
          <button
            onClick={() => setBookingProperty(null)}
            className="absolute top-5 right-5 p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-xs uppercase tracking-widest text-amber-400 font-bold flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              Private Showing Request
            </span>
          </div>
          <h2 className="text-2xl font-bold tracking-tight">Schedule Property Tour</h2>
          <p className="text-xs text-slate-300 mt-1">
            Experience the craftsmanship and views firsthand with a licensed advisor.
          </p>
        </div>

        {/* Selected Property Preview */}
        {currentProperty && (
          <div className="p-4 bg-slate-50 border-b border-slate-200/80 flex items-center gap-3.5">
            <img
              src={currentProperty.image}
              alt={currentProperty.name}
              className="w-16 h-14 rounded-xl object-cover shrink-0 border border-slate-200"
            />
            <div className="min-w-0 flex-1">
              <h4 className="text-sm font-bold text-slate-900 truncate">
                {currentProperty.name}
              </h4>
              <p className="text-xs text-slate-500 truncate flex items-center gap-1 mt-0.5">
                <MapPin className="w-3 h-3 text-amber-600 shrink-0" />
                {currentProperty.location}
              </p>
            </div>
            <div className="text-right shrink-0">
              <span className="text-sm font-extrabold text-amber-700 block">
                {formatCurrency(currentProperty.price)}
              </span>
              <span className="text-[10px] text-slate-400 uppercase font-semibold">
                {currentProperty.type}
              </span>
            </div>
          </div>
        )}

        {/* Booking Form */}
        <form onSubmit={handleSubmit} className="p-6 sm:p-7 space-y-4 max-h-[65vh] overflow-y-auto">
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">
              {error}
            </div>
          )}

          {/* Date & Time Slot */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-amber-600" />
                Preferred Visit Date *
              </label>
              <input
                type="date"
                min={minDate}
                value={visitDate}
                onChange={(e) => setVisitDate(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 cursor-pointer"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-amber-600" />
                Preferred Time Slot *
              </label>
              <select
                value={timeSlot}
                onChange={(e) => setTimeSlot(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 bg-white cursor-pointer font-medium"
              >
                <option value="Morning (10:00 AM)">Morning (10:00 AM)</option>
                <option value="Morning (11:30 AM)">Morning (11:30 AM)</option>
                <option value="Afternoon (2:00 PM)">Afternoon (2:00 PM)</option>
                <option value="Afternoon (4:00 PM)">Afternoon (4:00 PM)</option>
                <option value="Sunset Hour (6:00 PM)">Sunset Golden Hour (6:00 PM)</option>
              </select>
            </div>
          </div>

          {/* Contact Details */}
          <div className="border-t border-slate-100 pt-4 space-y-3.5">
            <span className="text-xs uppercase font-bold text-slate-400 block tracking-wider">
              Client Contact Information
            </span>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name *</label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="e.g. Jonathan Reed"
                  className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address *</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="email"
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    placeholder="j.reed@techcapital.io"
                    className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Phone Number *</label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="tel"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    placeholder="+1 (555) 000-0000"
                    className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                    required
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Special Requests / Tour Notes
              </label>
              <textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Include details such as private parking needs, yacht dock access, or architect walkthrough..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 resize-none"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => setBookingProperty(null)}
              className="px-4 py-2 text-sm font-semibold text-slate-600 hover:text-slate-900 rounded-xl transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 text-sm font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-xl shadow-md transition-all cursor-pointer flex items-center gap-2"
            >
              <Calendar className="w-4 h-4 text-amber-400" />
              <span>Confirm Tour Request</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
