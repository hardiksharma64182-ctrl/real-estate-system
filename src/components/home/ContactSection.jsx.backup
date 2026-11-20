import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Mail, Phone, MapPin, Send, MessageSquare, Clock, Building } from 'lucide-react';

export const ContactSection = () => {
  const { addToast } = useApp();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    interest: 'General Inquiry',
    message: '',
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) {
      addToast({
        type: 'error',
        title: 'Missing Details',
        message: 'Please fill in your name, email, and message.',
      });
      return;
    }

    addToast({
      type: 'success',
      title: 'Inquiry Dispatched',
      message: `Thank you ${formData.name}. Our luxury concierge will respond within 2 hours.`,
    });

    setFormData({
      name: '',
      email: '',
      phone: '',
      interest: 'General Inquiry',
      message: '',
    });
  };

  return (
    <section className="py-24 bg-slate-950 text-white relative overflow-hidden" id="contact">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
          {/* Left Column: Contact Information */}
          <div className="space-y-8">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-amber-400 block mb-2">
                Private Advisory
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white leading-tight">
                Connect with Our <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-200 to-amber-400">
                  Real Estate Concierge.
                </span>
              </h2>
              <p className="mt-4 text-sm text-slate-300 leading-relaxed">
                Whether you are seeking a private off-market acquisition, looking to list an architectural estate, or require institutional property management, our senior advisory team is at your service.
              </p>
            </div>

            <div className="space-y-6 pt-4">
              <div className="flex items-start gap-4 p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
                <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
                  <MapPin className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">Global Headquarters</h4>
                  <p className="text-xs text-slate-400 mt-1">
                    9405 Wilshire Blvd, Suite 800, Beverly Hills, CA 90212
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
                <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
                  <Phone className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">Direct Advisory Line</h4>
                  <p className="text-xs text-slate-400 mt-1">+1 (800) 555-LUXE / +1 (310) 555-0142</p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
                <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
                  <Mail className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">VIP Inquiries</h4>
                  <p className="text-xs text-slate-400 mt-1">concierge@luxeestate.com</p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
                <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
                  <Clock className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">Concierge Hours</h4>
                  <p className="text-xs text-slate-400 mt-1">24 Hours / 7 Days a Week for Verified Clients</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Contact Inquiry Form */}
          <div className="bg-slate-900/90 rounded-3xl p-8 sm:p-10 border border-slate-800 shadow-2xl relative">
            <h3 className="text-xl font-bold text-white mb-2">Request a Confidential Briefing</h3>
            <p className="text-xs text-slate-400 mb-6">
              Complete the form below and an assigned broker will prepare private dossier details for your review.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                  Full Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Jonathan Reed"
                  className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 transition-colors"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="name@domain.com"
                    className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 transition-colors"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+1 (555) 000-0000"
                    className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                  Inquiry Topic
                </label>
                <select
                  value={formData.interest}
                  onChange={(e) => setFormData({ ...formData, interest: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:border-amber-400 transition-colors cursor-pointer"
                >
                  <option value="General Inquiry">General Property Inquiry</option>
                  <option value="Buy Waterfront Villa">Purchasing a Waterfront Villa</option>
                  <option value="Buy Skyline Penthouse">Purchasing a Skyline Penthouse</option>
                  <option value="Commercial Acquisition">Commercial & Office Campus</option>
                  <option value="List My Property">Listing an Owner Estate</option>
                  <option value="Agent Representation">Request Dedicated Broker</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                  Your Requirements & Message *
                </label>
                <textarea
                  rows={4}
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder="Detail preferred location, specifications, timing, and any specific questions..."
                  className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 transition-colors resize-none"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full py-3.5 px-6 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer mt-2"
              >
                <Send className="w-4 h-4" />
                <span>Submit Confidential Request</span>
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
};
