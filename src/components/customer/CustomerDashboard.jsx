import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { authService } from '../../services/authService';
import { PropertyCard } from '../properties/PropertyCard';
import { PropertyDetailsModal } from '../properties/PropertyDetailsModal';
import { BookingModal } from '../bookings/BookingModal';
import { StatusBadge, TypeBadge } from '../common/Badge';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { Link } from 'react-router-dom';
import {
  User,
  Heart,
  Calendar,
  Clock,
  Phone,
  Mail,
  MapPin,
  Building,
  Shield,
  Star,
  LogOut,
  Home,
  CheckCircle2,
  Trash2,
  Edit2,
  DollarSign,
  Sparkles,
} from 'lucide-react';

export const CustomerDashboard = () => {
  const {
    currentUser,
    logout,
    properties,
    bookings,
    agents,
    deleteBooking,
    setSelectedProperty,
    setBookingProperty,
    addToast,
  } = useApp();

  const [activeTab, setActiveTab] = useState('bookings'); // 'bookings' | 'favorites' | 'profile'

  // Favourites state
  const [favoriteIds, setFavoriteIds] = useState(() => {
    return authService.getFavorites(currentUser?.id || 'guest');
  });

  // Client's personal profile state for editing
  const [profileData, setProfileData] = useState({
    name: currentUser?.name || '',
    phone: currentUser?.phone || '',
    address: currentUser?.address || '',
    budget_range: currentUser?.budget_range || '$2M - $5M',
  });

  const handleToggleFavorite = (propId) => {
    const updated = authService.toggleFavorite(currentUser?.id || 'guest', propId);
    setFavoriteIds(updated);
    addToast({
      type: 'info',
      title: 'Favourites Updated',
      message: updated.includes(propId) ? 'Property saved to your favourites.' : 'Property removed from favourites.',
    });
  };

  // Strictly filter: ONLY bookings submitted by this customer
  const myBookings = useMemo(() => {
    const userEmail = currentUser?.email?.toLowerCase();
    return bookings.filter((b) => b.customer_email?.toLowerCase() === userEmail);
  }, [bookings, currentUser]);

  // Strictly filter: ONLY favourite properties
  const myFavoriteProperties = useMemo(() => {
    return properties.filter((p) => favoriteIds.includes(p.id));
  }, [properties, favoriteIds]);

  const handleSaveProfile = (e) => {
    e.preventDefault();
    addToast({
      type: 'success',
      title: 'Preferences Saved',
      message: 'Your client contact and investment criteria have been updated.',
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8 sm:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Customer Sanctuary Top Bar */}
        <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 rounded-full bg-amber-500/10 blur-3xl pointer-events-none" />

          <div className="flex items-center gap-4 relative z-10">
            <div className="relative">
              <img
                src={currentUser?.avatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80'}
                alt={currentUser?.name}
                className="w-18 h-18 sm:w-20 sm:h-20 rounded-2xl object-cover border-2 border-amber-400/50 shadow-md"
              />
              <span className="absolute -bottom-1 -right-1 p-1 rounded-full bg-slate-950 text-amber-400 border border-amber-400/50">
                <Sparkles className="w-3.5 h-3.5" />
              </span>
            </div>

            <div>
              <span className="text-[10px] uppercase font-bold tracking-widest px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30">
                VIP Private Client
              </span>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
                {currentUser?.name}
              </h1>
              <p className="text-xs text-slate-300 mt-0.5 flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-amber-400" />
                <span>{currentUser?.email}</span>
                {currentUser?.phone && (
                  <>
                    <span>•</span>
                    <Phone className="w-3.5 h-3.5 text-amber-400" />
                    <span>{currentUser.phone}</span>
                  </>
                )}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 relative z-10 w-full md:w-auto justify-end">
            <Link
              to="/"
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl transition-all flex items-center gap-1.5"
            >
              <Home className="w-3.5 h-3.5" />
              <span>Public Showcase</span>
            </Link>

            <button
              onClick={logout}
              className="px-4 py-2 bg-rose-950/60 hover:bg-rose-900 border border-rose-500/30 text-rose-300 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="mt-8 border-b border-slate-200 flex flex-wrap gap-4 sm:gap-8">
          <button
            onClick={() => setActiveTab('bookings')}
            className={`pb-3 text-sm font-bold border-b-2 transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'bookings'
                ? 'border-amber-500 text-slate-900'
                : 'border-transparent text-slate-400 hover:text-slate-700'
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>My Scheduled Tours ({myBookings.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('favorites')}
            className={`pb-3 text-sm font-bold border-b-2 transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'favorites'
                ? 'border-amber-500 text-slate-900'
                : 'border-transparent text-slate-400 hover:text-slate-700'
            }`}
          >
            <Heart className="w-4 h-4 text-rose-500" />
            <span>Saved Favourites ({myFavoriteProperties.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('profile')}
            className={`pb-3 text-sm font-bold border-b-2 transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'profile'
                ? 'border-amber-500 text-slate-900'
                : 'border-transparent text-slate-400 hover:text-slate-700'
            }`}
          >
            <User className="w-4 h-4" />
            <span>Client Profile & Criteria</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="mt-6">
          {/* TAB 1: My Bookings */}
          {activeTab === 'bookings' && (
            <div className="space-y-4">
              {myBookings.length === 0 ? (
                <div className="bg-white rounded-3xl p-12 text-center border border-slate-200/80">
                  <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                  <h3 className="text-base font-bold text-slate-900">No scheduled visits yet</h3>
                  <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                    Browse our luxury portfolio and select "Book Tour" on any property to request a private walkthrough.
                  </p>
                  <Link
                    to="/"
                    className="mt-4 inline-flex items-center gap-2 px-5 py-2.5 bg-slate-900 text-amber-400 rounded-xl text-xs font-bold"
                  >
                    <span>Explore Available Estates</span>
                  </Link>
                </div>
              ) : (
                myBookings.map((b) => {
                  const prop = properties.find((p) => p.id === b.property_id);
                  const assignedAgent = agents.find((a) => a.id === b.agent_id);

                  return (
                    <div
                      key={b.id}
                      className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs hover:shadow-md transition-all flex flex-col lg:flex-row lg:items-center justify-between gap-6"
                    >
                      <div className="flex items-start gap-4 min-w-0">
                        {prop ? (
                          <img
                            src={prop.image}
                            alt={prop.name}
                            className="w-20 h-20 rounded-2xl object-cover shrink-0 border border-slate-200 cursor-pointer"
                            onClick={() => setSelectedProperty(prop)}
                          />
                        ) : (
                          <div className="w-20 h-20 rounded-2xl bg-slate-100 flex items-center justify-center shrink-0">
                            <Building className="w-6 h-6 text-slate-400" />
                          </div>
                        )}

                        <div className="space-y-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-mono font-bold text-slate-400">
                              BOOKING: {b.id.toUpperCase()}
                            </span>
                            <StatusBadge status={b.status} />
                          </div>

                          <h3
                            onClick={() => prop && setSelectedProperty(prop)}
                            className="text-base font-bold text-slate-900 hover:text-amber-700 cursor-pointer truncate"
                          >
                            {prop ? prop.name : `Property #${b.property_id}`}
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

                          {assignedAgent && (
                            <div className="pt-2 flex items-center gap-3 text-xs text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                              <img
                                src={assignedAgent.photo}
                                alt={assignedAgent.name}
                                className="w-7 h-7 rounded-full object-cover border border-amber-400/50"
                              />
                              <div>
                                <span className="font-bold text-slate-900">{assignedAgent.name}</span>
                                <span className="text-[11px] text-slate-500 block">
                                  Dedicated Advisor: {assignedAgent.phone}
                                </span>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 border-t lg:border-t-0 pt-4 lg:pt-0 shrink-0">
                        {b.status === 'Pending' && (
                          <button
                            onClick={() => deleteBooking(b.id)}
                            className="px-3.5 py-2 text-xs font-semibold text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-xl transition-all cursor-pointer"
                          >
                            Cancel Request
                          </button>
                        )}
                        {b.status === 'Approved' && (
                          <div className="text-right">
                            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-800 text-xs font-bold border border-emerald-200">
                              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                              Tour Confirmed
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}

          {/* TAB 2: Saved Favourites */}
          {activeTab === 'favorites' && (
            <div className="space-y-6">
              {myFavoriteProperties.length === 0 ? (
                <div className="bg-white rounded-3xl p-12 text-center border border-slate-200/80">
                  <Heart className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                  <h3 className="text-base font-bold text-slate-900">No favourites saved yet</h3>
                  <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                    Click the heart icon on any estate card to curate your private selection.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {myFavoriteProperties.map((prop) => (
                    <div
                      key={prop.id}
                      className="p-5 rounded-3xl bg-white border border-slate-200/80 shadow-xs flex flex-col justify-between"
                    >
                      <div>
                        <div className="relative aspect-[16/10] rounded-2xl overflow-hidden mb-3">
                          <img
                            src={prop.image}
                            alt={prop.name}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute top-2 left-2">
                            <TypeBadge type={prop.type} className="bg-white/95" />
                          </div>
                          <button
                            onClick={() => handleToggleFavorite(prop.id)}
                            className="absolute top-2 right-2 p-1.5 rounded-full bg-slate-950/70 text-rose-500 hover:scale-110 transition-transform cursor-pointer"
                            title="Remove from favourites"
                          >
                            <Heart className="w-4 h-4 fill-rose-500" />
                          </button>
                        </div>

                        <h4
                          onClick={() => setSelectedProperty(prop)}
                          className="text-sm font-bold text-slate-900 hover:text-amber-700 cursor-pointer line-clamp-1"
                        >
                          {prop.name}
                        </h4>
                        <p className="text-xs text-slate-500 mt-0.5">{prop.location}</p>

                        <div className="mt-2 text-base font-extrabold text-slate-900">
                          {formatCurrency(prop.price)}
                        </div>
                      </div>

                      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                        <button
                          type="button"
                          onClick={() => setSelectedProperty(prop)}
                          className="flex-1 py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold"
                        >
                          Details
                        </button>
                        <button
                          type="button"
                          onClick={() => setBookingProperty(prop)}
                          className="flex-1 py-2 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-amber-400 text-xs font-bold"
                        >
                          Book Tour
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: Client Profile & Investment Criteria */}
          {activeTab === 'profile' && (
            <div className="max-w-2xl bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs">
              <h3 className="text-lg font-bold text-slate-900 mb-1">
                Client Dossier & Contact Preferences
              </h3>
              <p className="text-xs text-slate-500 mb-6">
                Keep your confidential acquisition criteria updated for our senior brokerage team.
              </p>

              <form onSubmit={handleSaveProfile} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Client Legal Name
                  </label>
                  <input
                    type="text"
                    value={profileData.name}
                    onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Registered Email (Read Only)
                  </label>
                  <input
                    type="email"
                    value={currentUser?.email}
                    disabled
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm bg-slate-50 text-slate-500 font-mono"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                      Direct Phone
                    </label>
                    <input
                      type="tel"
                      value={profileData.phone}
                      onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                      Target Investment Budget
                    </label>
                    <select
                      value={profileData.budget_range}
                      onChange={(e) => setProfileData({ ...profileData, budget_range: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 bg-white"
                    >
                      <option value="$1M - $3M">$1M - $3,000,000</option>
                      <option value="$3M - $6M">$3M - $6,000,000</option>
                      <option value="$6M - $12M">$6M - $12,000,000</option>
                      <option value="$12M+">$12M+ Ultra Luxury</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Primary Residence / City
                  </label>
                  <input
                    type="text"
                    value={profileData.address}
                    onChange={(e) => setProfileData({ ...profileData, address: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                  />
                </div>

                <div className="pt-4 border-t border-slate-100 flex justify-end">
                  <button
                    type="submit"
                    className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-sm transition-all cursor-pointer"
                  >
                    Save Preferences
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>

      <PropertyDetailsModal />
      <BookingModal />
    </div>
  );
};
