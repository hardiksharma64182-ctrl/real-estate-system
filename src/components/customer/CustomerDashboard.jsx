import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { useApp } from '../../context/AppContext';
import { dataService } from '../../services/dataService';
import { getSupabaseClient } from '../../services/supabaseClient';
import { PropertyDetailsModal } from '../properties/PropertyDetailsModal';
import { BookingModal } from '../bookings/BookingModal';
import { StatusBadge, TypeBadge } from '../common/Badge';
import { formatCurrency, formatDate } from '../../utils/formatters';
import {
  User,
  Heart,
  Calendar,
  Clock,
  Phone,
  Mail,
  MapPin,
  Building,
  Building2,
  LogOut,
  CheckCircle2,
  Sparkles,
  Search,
  BedDouble,
  Bath,
  Ruler,
  Eye,
  CalendarPlus,
  Save,
  Loader2,
} from 'lucide-react';

export const CustomerDashboard = () => {
  const {
    currentUser,
    setCurrentUser,
    logout,
    properties = [],
    bookings = [],
    agents = [],
    deleteBooking,
    setSelectedProperty,
    setBookingProperty,
    addToast,
  } = useApp();

  const [activeTab, setActiveTab] = useState('browse'); // 'browse' | 'bookings' | 'favorites' | 'profile'

  // Browse & Search filters
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('All');
  const [budgetFilter, setBudgetFilter] = useState('All');
  const [bookingStatusFilter, setBookingStatusFilter] = useState('All');

  // Supabase-persisted Favourites state
  const [favoriteIds, setFavoriteIds] = useState([]);
  const [favoritesLoading, setFavoritesLoading] = useState(true);
  const [togglingFavId, setTogglingFavId] = useState(null);

  // Cancelling state
  const [cancellingId, setCancellingId] = useState(null);

  // Buyer profile state
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileData, setProfileData] = useState({
    name: currentUser?.name || '',
    phone: currentUser?.phone || '',
    address: currentUser?.address || '',
    budget_range: currentUser?.budget_range || '$1M - $3M',
  });

  useEffect(() => {
    setProfileData({
      name: currentUser?.name || '',
      phone: currentUser?.phone || '',
      address: currentUser?.address || '',
      budget_range: currentUser?.budget_range || '$1M - $3M',
    });
  }, [currentUser]);

  // Load buyer favourites from Supabase customer_favorites table
  const loadFavorites = useCallback(async () => {
    if (!currentUser?.id) {
      setFavoriteIds([]);
      setFavoritesLoading(false);
      return;
    }
    setFavoritesLoading(true);
    try {
      const ids = await dataService.getCustomerFavorites(currentUser);
      setFavoriteIds(ids);
    } catch (err) {
      console.warn('Could not load buyer favourites from Supabase:', err.message);
      setFavoriteIds([]);
    } finally {
      setFavoritesLoading(false);
    }
  }, [currentUser]);

  useEffect(() => {
    loadFavorites();
  }, [loadFavorites]);

  const handleToggleFavorite = async (propId) => {
    if (!currentUser?.id || togglingFavId === propId) return;
    const isFav = favoriteIds.includes(propId);
    setTogglingFavId(propId);
    try {
      const updated = await dataService.toggleCustomerFavorite(currentUser, propId, isFav);
      setFavoriteIds(updated);
      addToast({
        type: 'info',
        title: 'Favourites Updated',
        message: !isFav
          ? 'Property saved to your Supabase favourites.'
          : 'Property removed from your favourites.',
      });
    } catch (err) {
      addToast({
        type: 'error',
        title: 'Could Not Update Favourites',
        message: err.message || 'Please check your connection and try again.',
      });
    } finally {
      setTogglingFavId(null);
    }
  };

  // Available properties from Supabase
  const availableProperties = useMemo(() => {
    return properties.filter((p) => p.availability === 'Available');
  }, [properties]);

  const filteredBrowseProperties = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return availableProperties.filter((p) => {
      const name = (p.name || '').toLowerCase();
      const loc = (p.location || '').toLowerCase();
      const addr = (p.address || '').toLowerCase();
      const matchesSearch = !q || name.includes(q) || loc.includes(q) || addr.includes(q);
      const matchesType = typeFilter === 'All' || p.type === typeFilter;

      const price = Number(p.price) || 0;
      let matchesBudget = true;
      if (budgetFilter === 'under2m') matchesBudget = price < 2000000;
      else if (budgetFilter === '2m-5m') matchesBudget = price >= 2000000 && price <= 5000000;
      else if (budgetFilter === '5m-10m') matchesBudget = price > 5000000 && price <= 10000000;
      else if (budgetFilter === '10m+') matchesBudget = price > 10000000;

      return matchesSearch && matchesType && matchesBudget;
    });
  }, [availableProperties, searchQuery, typeFilter, budgetFilter]);

  // Strictly filter: ONLY bookings belonging to the logged-in buyer
  const myBookings = useMemo(() => {
    const userEmail = currentUser?.email?.toLowerCase();
    const userId = currentUser?.id;
    return bookings.filter(
      (b) =>
        (userId && b.user_id === userId) ||
        (userEmail && b.customer_email?.toLowerCase() === userEmail)
    );
  }, [bookings, currentUser]);

  const filteredMyBookings = useMemo(() => {
    if (bookingStatusFilter === 'All') return myBookings;
    return myBookings.filter((b) => b.status === bookingStatusFilter);
  }, [myBookings, bookingStatusFilter]);

  const confirmedVisitsCount = useMemo(
    () => myBookings.filter((b) => b.status === 'Approved').length,
    [myBookings]
  );

  // Strictly filter: ONLY favourite properties linked to the logged-in buyer
  const myFavoriteProperties = useMemo(() => {
    return properties.filter((p) => favoriteIds.includes(p.id));
  }, [properties, favoriteIds]);

  const handleCancelBooking = async (booking) => {
    // Only Pending bookings may be requested for cancellation under existing rules
    if (booking.status !== 'Pending') return;
    if (!window.confirm('Cancel this pending property visit request?')) return;

    setCancellingId(booking.id);
    try {
      await deleteBooking(booking.id);
    } catch (err) {
      addToast({
        type: 'warning',
        title: 'Cancellation Restricted',
        message:
          err?.message ||
          'Current booking security rules only allow an administrator to remove submitted bookings.',
      });
    } finally {
      setCancellingId(null);
    }
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    if (!currentUser?.id) return;
    setProfileSaving(true);

    const cleanProfile = {
      name: profileData.name.trim(),
      phone: profileData.phone.trim(),
      address: profileData.address.trim(),
      budget_range: profileData.budget_range,
    };

    try {
      const supabase = getSupabaseClient();
      if (!supabase) {
        throw new Error('Supabase is not configured.');
      }

      const { error: profileErr } = await supabase
        .from('profiles')
        .update(cleanProfile)
        .eq('id', currentUser.id);

      if (profileErr) throw profileErr;

      // Also sync the buyer's own customers record if it exists (allowed by RLS)
      await supabase
        .from('customers')
        .update({
          name: cleanProfile.name,
          phone: cleanProfile.phone || 'Not provided',
          address: cleanProfile.address,
          budget_range: cleanProfile.budget_range,
        })
        .eq('user_id', currentUser.id);

      setCurrentUser({
        ...currentUser,
        ...cleanProfile,
      });

      addToast({
        type: 'success',
        title: 'Profile Saved',
        message: 'Your buyer profile has been updated in Supabase.',
      });
    } catch (err) {
      addToast({
        type: 'error',
        title: 'Update Failed',
        message: err.message || 'Could not save your profile changes.',
      });
    } finally {
      setProfileSaving(false);
    }
  };

  const tabs = [
    { id: 'browse', label: `Browse Properties (${availableProperties.length})`, icon: Search },
    { id: 'bookings', label: `My Bookings (${myBookings.length})`, icon: Calendar },
    { id: 'favorites', label: `Saved Favourites (${myFavoriteProperties.length})`, icon: Heart },
    { id: 'profile', label: 'My Profile', icon: User },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Dark Slate, Emerald & Gold Buyer Header (No Public Showcase button) */}
      <header className="border-b border-slate-800 bg-slate-900/95 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="relative shrink-0">
              <img
                src={
                  currentUser?.avatar ||
                  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80'
                }
                alt={currentUser?.name || 'Buyer'}
                className="w-14 h-14 rounded-2xl object-cover border-2 border-amber-400/50 shadow-lg"
              />
              <span className="absolute -bottom-1 -right-1 p-1 rounded-full bg-slate-950 text-emerald-400 border border-emerald-500/40">
                <Sparkles className="w-3 h-3" />
              </span>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4 text-amber-400" />
                <span className="text-[11px] uppercase font-bold tracking-widest text-emerald-400">
                  LUXE ESTATE • Buyer Sanctuary
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-extrabold text-white mt-0.5">
                Welcome, {currentUser?.name || 'Buyer'}
              </h1>
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-400 mt-0.5">
                <span className="flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-amber-400" />
                  {currentUser?.email}
                </span>
                {currentUser?.phone && (
                  <span className="flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-emerald-400" />
                    {currentUser.phone}
                  </span>
                )}
              </div>
            </div>
          </div>

          <button
            onClick={logout}
            className="self-start sm:self-auto px-4 py-2.5 bg-rose-950/50 hover:bg-rose-900/70 border border-rose-500/30 text-rose-300 text-xs font-bold rounded-xl transition-all flex items-center gap-2 cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* 1. Dashboard Summary Cards (Real Supabase Data) */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <button
            type="button"
            onClick={() => setActiveTab('browse')}
            className="text-left p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-emerald-500/40 transition-all cursor-pointer"
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center mb-3">
              <Building className="w-5 h-5" />
            </div>
            <span className="text-[11px] uppercase font-bold tracking-wider text-slate-400 block">
              Available Properties
            </span>
            <div className="text-3xl font-black text-white mt-1">
              {availableProperties.length}
            </div>
            <span className="text-xs text-emerald-400 mt-1 block">Ready for private viewing</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('bookings')}
            className="text-left p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-amber-500/40 transition-all cursor-pointer"
          >
            <div className="w-10 h-10 rounded-xl bg-amber-500/15 text-amber-400 flex items-center justify-center mb-3">
              <Calendar className="w-5 h-5" />
            </div>
            <span className="text-[11px] uppercase font-bold tracking-wider text-slate-400 block">
              My Bookings
            </span>
            <div className="text-3xl font-black text-white mt-1">{myBookings.length}</div>
            <span className="text-xs text-slate-400 mt-1 block">Your tour requests</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('bookings')}
            className="text-left p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-emerald-500/40 transition-all cursor-pointer"
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center mb-3">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <span className="text-[11px] uppercase font-bold tracking-wider text-slate-400 block">
              Confirmed Visits
            </span>
            <div className="text-3xl font-black text-amber-400 mt-1">{confirmedVisitsCount}</div>
            <span className="text-xs text-emerald-400 mt-1 block">Approved appointments</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('favorites')}
            className="text-left p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-rose-500/40 transition-all cursor-pointer"
          >
            <div className="w-10 h-10 rounded-xl bg-rose-500/15 text-rose-400 flex items-center justify-center mb-3">
              <Heart className="w-5 h-5" />
            </div>
            <span className="text-[11px] uppercase font-bold tracking-wider text-slate-400 block">
              Saved Favourites
            </span>
            <div className="text-3xl font-black text-white mt-1">
              {favoritesLoading ? '...' : myFavoriteProperties.length}
            </div>
            <span className="text-xs text-slate-400 mt-1 block">Synced to your account</span>
          </button>
        </section>

        {/* Navigation Tabs */}
        <nav className="flex flex-wrap gap-2 border-b border-slate-800 pb-4">
          {tabs.map(({ id, label, icon: Icon }) => {
            const isActive = activeTab === id;
            return (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={`flex items-center gap-2 px-4 sm:px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                  isActive
                    ? 'bg-emerald-500 text-slate-950 shadow-lg'
                    : 'bg-slate-900 text-slate-300 border border-slate-800 hover:border-slate-700 hover:text-white'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{label}</span>
              </button>
            );
          })}
        </nav>

        {/* 2. TAB 1: Browse Properties */}
        {activeTab === 'browse' && (
          <section className="space-y-6">
            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col md:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by property name or location..."
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-400"
                />
              </div>

              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:border-emerald-400"
              >
                <option value="All">All Property Types</option>
                <option value="Villa">Villa</option>
                <option value="Apartment">Apartment</option>
                <option value="House">House</option>
                <option value="Commercial">Commercial</option>
              </select>

              <select
                value={budgetFilter}
                onChange={(e) => setBudgetFilter(e.target.value)}
                className="px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:border-emerald-400"
              >
                <option value="All">Any Price Range</option>
                <option value="under2m">Under $2M</option>
                <option value="2m-5m">$2M - $5M</option>
                <option value="5m-10m">$5M - $10M</option>
                <option value="10m+">$10M+</option>
              </select>
            </div>

            {filteredBrowseProperties.length === 0 ? (
              <div className="bg-slate-900 rounded-3xl p-12 text-center border border-slate-800">
                <Building className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                <h3 className="text-base font-bold text-white">No available properties found</h3>
                <p className="text-xs text-slate-400 mt-1">
                  Try adjusting your search keywords, property type, or price range.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredBrowseProperties.map((prop) => {
                  const isFav = favoriteIds.includes(prop.id);
                  const isToggling = togglingFavId === prop.id;
                  return (
                    <article
                      key={prop.id}
                      className="rounded-2xl bg-slate-900 border border-slate-800 hover:border-amber-500/40 transition-all overflow-hidden flex flex-col justify-between"
                    >
                      <div>
                        <div className="relative aspect-[16/10] bg-slate-800">
                          <img
                            src={prop.image}
                            alt={prop.name}
                            className="w-full h-full object-cover cursor-pointer"
                            onClick={() => setSelectedProperty(prop)}
                          />
                          <div className="absolute top-3 left-3 flex items-center gap-1.5">
                            <TypeBadge type={prop.type} className="bg-white/95" />
                            <StatusBadge status={prop.availability} />
                          </div>
                          <button
                            type="button"
                            disabled={isToggling}
                            onClick={() => handleToggleFavorite(prop.id)}
                            className="absolute top-3 right-3 p-2 rounded-full bg-slate-950/75 text-white hover:scale-110 transition-transform cursor-pointer disabled:opacity-50"
                            title={isFav ? 'Remove from favourites' : 'Save to favourites'}
                          >
                            {isToggling ? (
                              <Loader2 className="w-4 h-4 animate-spin text-amber-400" />
                            ) : (
                              <Heart
                                className={`w-4 h-4 ${
                                  isFav ? 'fill-rose-500 text-rose-500' : 'text-white'
                                }`}
                              />
                            )}
                          </button>
                        </div>

                        <div className="p-5">
                          <h3
                            onClick={() => setSelectedProperty(prop)}
                            className="text-lg font-bold text-white hover:text-amber-400 cursor-pointer line-clamp-1"
                          >
                            {prop.name}
                          </h3>
                          <p className="text-xs text-slate-400 mt-1 flex items-center gap-1.5">
                            <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                            <span>{prop.location}</span>
                          </p>
                          <div className="mt-3 text-2xl font-black text-amber-400">
                            {formatCurrency(prop.price)}
                          </div>
                          {prop.description && (
                            <p className="text-xs text-slate-400 mt-2 line-clamp-2">
                              {prop.description}
                            </p>
                          )}
                          <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 mt-4 pt-3 border-t border-slate-800">
                            <span className="flex items-center gap-1">
                              <BedDouble className="w-3.5 h-3.5 text-emerald-400" />
                              {prop.bedrooms || 0} Beds
                            </span>
                            <span className="flex items-center gap-1">
                              <Bath className="w-3.5 h-3.5 text-emerald-400" />
                              {prop.bathrooms || 0} Baths
                            </span>
                            <span className="flex items-center gap-1">
                              <Ruler className="w-3.5 h-3.5 text-emerald-400" />
                              {prop.area_sqft || 0} sq.ft.
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="px-5 pb-5 flex items-center gap-2.5">
                        <button
                          type="button"
                          onClick={() => setSelectedProperty(prop)}
                          className="flex-1 py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Details</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setBookingProperty(prop)}
                          className="flex-1 py-2.5 px-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          <CalendarPlus className="w-3.5 h-3.5" />
                          <span>Book Visit</span>
                        </button>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </section>
        )}

        {/* 3. TAB 2: My Bookings */}
        {activeTab === 'bookings' && (
          <section className="space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-xl font-bold text-white">My Property Visit Bookings</h2>
              <div className="flex flex-wrap gap-2">
                {['All', 'Pending', 'Approved', 'Rejected', 'Cancelled'].map((st) => (
                  <button
                    key={st}
                    onClick={() => setBookingStatusFilter(st)}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold cursor-pointer transition-all ${
                      bookingStatusFilter === st
                        ? 'bg-amber-500 text-slate-950'
                        : 'bg-slate-900 border border-slate-800 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>

            {filteredMyBookings.length === 0 ? (
              <div className="bg-slate-900 rounded-3xl p-12 text-center border border-slate-800">
                <Calendar className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                <h3 className="text-base font-bold text-white">No bookings found</h3>
                <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                  Browse available properties and click "Book Visit" to schedule a private viewing.
                </p>
                <button
                  type="button"
                  onClick={() => setActiveTab('browse')}
                  className="mt-4 inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-xl text-xs font-bold cursor-pointer"
                >
                  <span>Browse Available Properties</span>
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredMyBookings.map((b) => {
                  const prop = properties.find((p) => p.id === b.property_id);
                  const assignedAgent = agents.find((a) => a.id === b.agent_id);

                  return (
                    <article
                      key={b.id}
                      className="p-5 sm:p-6 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col lg:flex-row lg:items-center justify-between gap-5"
                    >
                      <div className="flex items-start gap-4 min-w-0">
                        {prop?.image ? (
                          <img
                            src={prop.image}
                            alt={prop.name}
                            className="w-20 h-20 rounded-2xl object-cover shrink-0 border border-slate-700 cursor-pointer"
                            onClick={() => setSelectedProperty(prop)}
                          />
                        ) : (
                          <div className="w-20 h-20 rounded-2xl bg-slate-800 flex items-center justify-center shrink-0">
                            <Building className="w-6 h-6 text-slate-500" />
                          </div>
                        )}

                        <div className="space-y-1.5 min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-[11px] font-mono font-bold text-slate-400">
                              REF: {String(b.id).toUpperCase()}
                            </span>
                            <StatusBadge status={b.status} />
                          </div>

                          <h3
                            onClick={() => prop && setSelectedProperty(prop)}
                            className="text-base font-bold text-white hover:text-amber-400 cursor-pointer truncate"
                          >
                            {prop ? prop.name : `Property #${b.property_id}`}
                          </h3>

                          {prop?.location && (
                            <p className="text-xs text-slate-400 flex items-center gap-1">
                              <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                              {prop.location}
                            </p>
                          )}

                          <div className="flex flex-wrap items-center gap-3 text-xs text-slate-300 pt-1">
                            <span className="flex items-center gap-1.5 font-semibold text-emerald-400">
                              <Calendar className="w-3.5 h-3.5" />
                              {formatDate(b.visit_date)}
                            </span>
                            <span className="text-slate-600">•</span>
                            <span className="flex items-center gap-1.5">
                              <Clock className="w-3.5 h-3.5 text-amber-400" />
                              {b.time_slot || b.visit_time}
                            </span>
                          </div>

                          {b.notes && (
                            <p className="text-xs text-slate-300 bg-slate-950 border border-slate-800 rounded-xl p-2.5 mt-2">
                              {b.notes}
                            </p>
                          )}

                          {assignedAgent && (
                            <div className="pt-2 flex items-center gap-2.5 text-xs text-slate-300">
                              <img
                                src={assignedAgent.photo}
                                alt={assignedAgent.name}
                                className="w-6 h-6 rounded-full object-cover border border-amber-400/50"
                              />
                              <span>
                                Advisor: <strong className="text-white">{assignedAgent.name}</strong>
                              </span>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-2.5 border-t lg:border-t-0 border-slate-800 pt-4 lg:pt-0 shrink-0">
                        {prop && (
                          <button
                            type="button"
                            onClick={() => setSelectedProperty(prop)}
                            className="px-3.5 py-2 text-xs font-bold text-slate-200 bg-slate-800 hover:bg-slate-700 rounded-xl cursor-pointer"
                          >
                            View Property
                          </button>
                        )}
                        {b.status === 'Pending' && (
                          <button
                            type="button"
                            disabled={cancellingId === b.id}
                            onClick={() => handleCancelBooking(b)}
                            className="px-3.5 py-2 text-xs font-bold text-rose-300 bg-rose-950/60 hover:bg-rose-900 border border-rose-500/30 rounded-xl transition-all cursor-pointer disabled:opacity-50"
                          >
                            {cancellingId === b.id ? 'Cancelling...' : 'Cancel Booking'}
                          </button>
                        )}
                        {b.status === 'Approved' && (
                          <span className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-500/15 text-emerald-300 text-xs font-bold border border-emerald-500/30">
                            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                            Visit Confirmed
                          </span>
                        )}
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </section>
        )}

        {/* 4. TAB 3: Saved Favourites */}
        {activeTab === 'favorites' && (
          <section className="space-y-6">
            {favoritesLoading ? (
              <div className="bg-slate-900 rounded-3xl p-12 text-center border border-slate-800">
                <Loader2 className="w-8 h-8 text-amber-400 animate-spin mx-auto mb-3" />
                <p className="text-xs text-slate-400">Loading your saved favourites from Supabase...</p>
              </div>
            ) : myFavoriteProperties.length === 0 ? (
              <div className="bg-slate-900 rounded-3xl p-12 text-center border border-slate-800">
                <Heart className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                <h3 className="text-base font-bold text-white">No saved favourites yet</h3>
                <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                  Tap the heart icon on any property while browsing to save it to your Supabase account.
                </p>
                <button
                  type="button"
                  onClick={() => setActiveTab('browse')}
                  className="mt-4 inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-xl text-xs font-bold cursor-pointer"
                >
                  <span>Browse Properties</span>
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {myFavoriteProperties.map((prop) => {
                  const isToggling = togglingFavId === prop.id;
                  return (
                    <article
                      key={prop.id}
                      className="rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden flex flex-col justify-between"
                    >
                      <div>
                        <div className="relative aspect-[16/10] bg-slate-800">
                          <img
                            src={prop.image}
                            alt={prop.name}
                            className="w-full h-full object-cover cursor-pointer"
                            onClick={() => setSelectedProperty(prop)}
                          />
                          <div className="absolute top-3 left-3 flex items-center gap-1.5">
                            <TypeBadge type={prop.type} className="bg-white/95" />
                            <StatusBadge status={prop.availability} />
                          </div>
                          <button
                            type="button"
                            disabled={isToggling}
                            onClick={() => handleToggleFavorite(prop.id)}
                            className="absolute top-3 right-3 p-2 rounded-full bg-slate-950/75 text-rose-500 hover:scale-110 transition-transform cursor-pointer disabled:opacity-50"
                            title="Remove from favourites"
                          >
                            {isToggling ? (
                              <Loader2 className="w-4 h-4 animate-spin text-amber-400" />
                            ) : (
                              <Heart className="w-4 h-4 fill-rose-500" />
                            )}
                          </button>
                        </div>

                        <div className="p-5">
                          <h4
                            onClick={() => setSelectedProperty(prop)}
                            className="text-base font-bold text-white hover:text-amber-400 cursor-pointer line-clamp-1"
                          >
                            {prop.name}
                          </h4>
                          <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                            {prop.location}
                          </p>
                          <div className="mt-3 text-xl font-black text-amber-400">
                            {formatCurrency(prop.price)}
                          </div>
                        </div>
                      </div>

                      <div className="px-5 pb-5 flex items-center gap-2.5">
                        <button
                          type="button"
                          onClick={() => setSelectedProperty(prop)}
                          className="flex-1 py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold cursor-pointer"
                        >
                          Details
                        </button>
                        <button
                          type="button"
                          onClick={() => setBookingProperty(prop)}
                          className="flex-1 py-2.5 px-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold cursor-pointer"
                        >
                          Book Visit
                        </button>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </section>
        )}

        {/* 5. TAB 4: My Profile */}
        {activeTab === 'profile' && (
          <section className="max-w-2xl bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-800">
            <h2 className="text-lg font-bold text-white mb-1">
              Buyer Profile & Investment Preferences
            </h2>
            <p className="text-xs text-slate-400 mb-6">
              Updates are saved directly to your authenticated Supabase profile.
            </p>

            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                  Full Name
                </label>
                <input
                  type="text"
                  value={profileData.name}
                  onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:border-emerald-400"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                  Registered Email (Read Only)
                </label>
                <input
                  type="email"
                  value={currentUser?.email || ''}
                  disabled
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-800 text-sm bg-slate-950/60 text-slate-500 font-mono"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                    Direct Phone
                  </label>
                  <input
                    type="tel"
                    value={profileData.phone}
                    onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:border-emerald-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                    Target Investment Budget
                  </label>
                  <select
                    value={profileData.budget_range}
                    onChange={(e) =>
                      setProfileData({ ...profileData, budget_range: e.target.value })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:border-emerald-400"
                  >
                    <option value="$1M - $3M">$1M - $3,000,000</option>
                    <option value="$3M - $6M">$3M - $6,000,000</option>
                    <option value="$6M - $12M">$6M - $12,000,000</option>
                    <option value="$12M+">$12M+ Ultra Luxury</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                  Primary Residence / City
                </label>
                <input
                  type="text"
                  value={profileData.address}
                  onChange={(e) => setProfileData({ ...profileData, address: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:border-emerald-400"
                />
              </div>

              <div className="pt-4 border-t border-slate-800 flex justify-end">
                <button
                  type="submit"
                  disabled={profileSaving}
                  className="inline-flex items-center gap-2 px-6 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl shadow-sm transition-all cursor-pointer disabled:opacity-60"
                >
                  <Save className="w-4 h-4" />
                  <span>{profileSaving ? 'Saving...' : 'Save Profile'}</span>
                </button>
              </div>
            </form>
          </section>
        )}
      </main>

      <PropertyDetailsModal />
      <BookingModal />
    </div>
  );
};
