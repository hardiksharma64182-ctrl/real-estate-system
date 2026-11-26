import React, { useMemo, useState } from 'react';
import { useApp } from '../../context/AppContext';
import { getSupabaseClient } from '../../services/supabaseClient';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { StatusBadge, TypeBadge } from '../common/Badge';
import {
  Home,
  Plus,
  Pencil,
  Trash2,
  CalendarDays,
  User,
  LogOut,
  CheckCircle,
  XCircle,
  Clock,
  Save,
  X,
  MapPin,
  BedDouble,
  Bath,
  Ruler,
  Image as ImageIcon,
  Building2,
  TrendingUp,
  Search,
  DollarSign,
  Phone,
  Mail,
} from 'lucide-react';

const initialForm = {
  name: '',
  location: '',
  address: '',
  type: 'Apartment',
  price: '',
  availability: 'Available',
  bedrooms: 0,
  bathrooms: 1,
  area_sqft: '',
  image: '',
  description: '',
};

const PROPERTY_TYPES = ['Apartment', 'House', 'Villa', 'Commercial'];
const AVAILABILITY_OPTIONS = ['Available', 'Under Offer', 'Sold', 'Rented'];

export const OwnerDashboard = () => {
  const {
    currentUser,
    logout,
    properties = [],
    bookings = [],
    addProperty,
    updateProperty,
    deleteProperty,
    updateBookingStatus,
    setCurrentUser,
    addToast,
  } = useApp();

  const [activeTab, setActiveTab] = useState('properties');
  const [propertySearch, setPropertySearch] = useState('');
  const [availabilityFilter, setAvailabilityFilter] = useState('All');
  const [bookingFilter, setBookingFilter] = useState('All');

  // Full Add / Edit modal state
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(initialForm);
  const [saving, setSaving] = useState(false);

  // Inline Quick Price & Availability editor state
  const [quickEditId, setQuickEditId] = useState(null);
  const [quickPrice, setQuickPrice] = useState('');
  const [quickAvailability, setQuickAvailability] = useState('Available');
  const [quickSaving, setQuickSaving] = useState(false);

  // Profile state
  const [profileSaving, setProfileSaving] = useState(false);
  const [profile, setProfile] = useState({
    name: currentUser?.name || '',
    phone: currentUser?.phone || '',
    address: currentUser?.address || '',
  });

  const ownerId = currentUser?.owner_id;

  // Strict owner isolation: only properties belonging to this owner
  const myProperties = useMemo(
    () => properties.filter((p) => String(p.owner_id) === String(ownerId)),
    [properties, ownerId]
  );

  const filteredProperties = useMemo(() => {
    const q = propertySearch.trim().toLowerCase();
    return myProperties.filter((p) => {
      const propName = (p.name || p.title || '').toLowerCase();
      const propLoc = (p.location || '').toLowerCase();
      const matchesSearch = !q || propName.includes(q) || propLoc.includes(q);
      const matchesStatus =
        availabilityFilter === 'All' || p.availability === availabilityFilter;
      return matchesSearch && matchesStatus;
    });
  }, [myProperties, propertySearch, availabilityFilter]);

  const propertyIds = useMemo(
    () => new Set(myProperties.map((p) => String(p.id))),
    [myProperties]
  );

  // Strict owner isolation: only bookings for this owner's properties
  const myBookings = useMemo(
    () => bookings.filter((b) => propertyIds.has(String(b.property_id))),
    [bookings, propertyIds]
  );

  const filteredBookings = useMemo(() => {
    if (bookingFilter === 'All') return myBookings;
    return myBookings.filter((b) => b.status === bookingFilter);
  }, [myBookings, bookingFilter]);

  const portfolioValue = useMemo(
    () => myProperties.reduce((sum, p) => sum + (Number(p.price) || 0), 0),
    [myProperties]
  );

  const availableCount = useMemo(
    () => myProperties.filter((p) => p.availability === 'Available').length,
    [myProperties]
  );

  const pendingBookingsCount = useMemo(
    () => myBookings.filter((b) => b.status === 'Pending').length,
    [myBookings]
  );

  const updateForm = (field, value) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const openAddForm = () => {
    setEditingId(null);
    setForm(initialForm);
    setShowForm(true);
  };

  const openEditForm = (property) => {
    if (String(property.owner_id) !== String(ownerId)) return;
    setEditingId(property.id);
    setForm({
      name: property.name || property.title || '',
      location: property.location || '',
      address: property.address || '',
      type: property.type || property.property_type || 'Apartment',
      price: property.price ?? '',
      availability: property.availability || 'Available',
      bedrooms: property.bedrooms ?? 0,
      bathrooms: property.bathrooms ?? 1,
      area_sqft: property.area_sqft ?? '',
      image: property.image || property.image_url || '',
      description: property.description || '',
    });
    setShowForm(true);
  };

  const handlePropertySave = async (event) => {
    event.preventDefault();

    if (!form.name.trim() || !form.location.trim() || !form.address.trim() || !form.price) {
      addToast({
        type: 'error',
        title: 'Missing Fields',
        message: 'Please fill in Property Name, City, Full Address, and Price.',
      });
      return;
    }

    setSaving(true);

    const payload = {
      name: form.name.trim(),
      location: form.location.trim(),
      address: form.address.trim(),
      type: form.type,
      price: Number(form.price),
      availability: form.availability,
      bedrooms: Number(form.bedrooms || 0),
      bathrooms: Number(form.bathrooms || 1),
      area_sqft: Number(form.area_sqft || 1000),
      image:
        form.image.trim() ||
        'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80',
      description: form.description.trim(),
      amenities: [],
      featured: false,
    };

    try {
      if (editingId) {
        await updateProperty(editingId, payload);
      } else {
        await addProperty({
          ...payload,
          owner_id: ownerId,
          agent_id: null,
        });
      }
      setShowForm(false);
      setForm(initialForm);
      setEditingId(null);
    } catch (error) {
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  const startQuickEdit = (property) => {
    if (String(property.owner_id) !== String(ownerId)) return;
    setQuickEditId(property.id);
    setQuickPrice(String(property.price ?? ''));
    setQuickAvailability(property.availability || 'Available');
  };

  const saveQuickEdit = async (property) => {
    if (String(property.owner_id) !== String(ownerId)) return;
    if (!quickPrice || Number(quickPrice) <= 0) {
      addToast({
        type: 'error',
        title: 'Invalid Price',
        message: 'Please enter a valid property price.',
      });
      return;
    }
    setQuickSaving(true);
    try {
      await updateProperty(property.id, {
        price: Number(quickPrice),
        availability: quickAvailability,
      });
      setQuickEditId(null);
    } catch (error) {
      console.error(error);
    } finally {
      setQuickSaving(false);
    }
  };

  const handleDelete = async (property) => {
    if (String(property.owner_id) !== String(ownerId)) return;
    const propTitle = property.name || property.title || 'this property';
    if (!window.confirm(`Delete "${propTitle}"? This action cannot be undone.`)) return;
    try {
      await deleteProperty(property.id);
    } catch (error) {
      console.error(error);
    }
  };

  const handleBookingStatus = async (id, status) => {
    try {
      await updateBookingStatus(id, status, null);
    } catch (error) {
      console.error(error);
    }
  };

  const handleProfileSave = async (event) => {
    event.preventDefault();
    setProfileSaving(true);

    try {
      const supabase = getSupabaseClient();
      const { error } = await supabase
        .from('profiles')
        .update({
          name: profile.name.trim(),
          phone: profile.phone.trim(),
          address: profile.address.trim(),
        })
        .eq('id', currentUser.id);

      if (error) throw error;

      setCurrentUser({
        ...currentUser,
        name: profile.name.trim(),
        phone: profile.phone.trim(),
        address: profile.address.trim(),
      });
      addToast({
        type: 'success',
        title: 'Profile Updated',
        message: 'Your owner profile details have been saved.',
      });
    } catch (error) {
      console.error(error);
      addToast({
        type: 'error',
        title: 'Update Failed',
        message: error.message || 'Could not update profile.',
      });
    } finally {
      setProfileSaving(false);
    }
  };

  if (!ownerId) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-6">
        <div className="max-w-md text-center bg-slate-900 border border-slate-700 rounded-3xl p-8 shadow-2xl">
          <Building2 size={44} className="mx-auto mb-4 text-amber-400" />
          <h1 className="text-2xl font-bold mb-3">Owner Account Not Linked</h1>
          <p className="text-slate-400 text-sm mb-6 leading-relaxed">
            Your account does not have an assigned Owner ID yet. Please ask the administrator to link your profile in Users & Settings.
          </p>
          <button
            onClick={logout}
            className="px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm cursor-pointer"
          >
            Sign Out
          </button>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'properties', label: `My Properties (${myProperties.length})`, icon: Home },
    { id: 'bookings', label: `Booking Requests (${myBookings.length})`, icon: CalendarDays },
    { id: 'profile', label: 'My Profile', icon: User },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Owner Console Header */}
      <header className="border-b border-slate-800 bg-slate-900/95 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-5 py-5 flex flex-col sm:flex-row justify-between sm:items-center gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <p className="text-emerald-400 text-[11px] font-bold uppercase tracking-widest">
                LUXE ESTATE • Owner Console
              </p>
              <h1 className="text-2xl font-extrabold mt-0.5">Property Owner Workspace</h1>
              <p className="text-xs text-slate-400 mt-0.5">
                Signed in as <span className="text-white font-semibold">{currentUser?.name || 'Owner'}</span> ({currentUser?.email})
              </p>
            </div>
          </div>

          <button
            onClick={logout}
            className="self-start sm:self-auto flex items-center gap-2 px-4 py-2.5 rounded-xl border border-rose-500/30 bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 text-xs font-bold cursor-pointer transition-colors"
          >
            <LogOut size={16} /> Sign Out
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-5 py-8">
        {/* Owner KPI Strip */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center mb-3">
              <Home size={18} />
            </div>
            <p className="text-slate-400 text-xs uppercase font-bold tracking-wider">My Properties</p>
            <p className="text-3xl font-black mt-1">{myProperties.length}</p>
            <p className="text-xs text-emerald-400 mt-1">{availableCount} Currently Available</p>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
            <div className="w-9 h-9 rounded-xl bg-amber-500/15 text-amber-400 flex items-center justify-center mb-3">
              <TrendingUp size={18} />
            </div>
            <p className="text-slate-400 text-xs uppercase font-bold tracking-wider">My Portfolio Value</p>
            <p className="text-2xl font-black text-amber-400 mt-1">{formatCurrency(portfolioValue)}</p>
            <p className="text-xs text-slate-400 mt-1">Combined listed valuation</p>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
            <div className="w-9 h-9 rounded-xl bg-sky-500/15 text-sky-400 flex items-center justify-center mb-3">
              <CalendarDays size={18} />
            </div>
            <p className="text-slate-400 text-xs uppercase font-bold tracking-wider">Total Tour Requests</p>
            <p className="text-3xl font-black mt-1">{myBookings.length}</p>
            <p className="text-xs text-slate-400 mt-1">Across your listings</p>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
            <div className="w-9 h-9 rounded-xl bg-amber-500/15 text-amber-400 flex items-center justify-center mb-3">
              <Clock size={18} />
            </div>
            <p className="text-slate-400 text-xs uppercase font-bold tracking-wider">Pending Approvals</p>
            <p className="text-3xl font-black mt-1">{pendingBookingsCount}</p>
            <p className="text-xs text-amber-400 mt-1">Awaiting your response</p>
          </div>
        </div>

        {/* Owner Navigation Tabs */}
        <nav className="flex flex-wrap gap-2 mb-7">
          {tabs.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-bold transition-all cursor-pointer ${
                activeTab === id
                  ? 'bg-emerald-500 text-slate-950 shadow-lg'
                  : 'bg-slate-900 text-slate-300 border border-slate-800 hover:border-slate-700'
              }`}
            >
              <Icon size={17} /> {label}
            </button>
          ))}
        </nav>

        {/* TAB 1: MY PROPERTIES */}
        {activeTab === 'properties' && (
          <section>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
              <div className="flex flex-col sm:flex-row gap-3 flex-1">
                <div className="relative flex-1 max-w-sm">
                  <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    value={propertySearch}
                    onChange={(e) => setPropertySearch(e.target.value)}
                    placeholder="Search your properties..."
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-400"
                  />
                </div>
                <select
                  value={availabilityFilter}
                  onChange={(e) => setAvailabilityFilter(e.target.value)}
                  className="px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-sm text-white focus:outline-none focus:border-emerald-400"
                >
                  <option value="All">All Statuses</option>
                  {AVAILABILITY_OPTIONS.map((st) => (
                    <option key={st} value={st}>
                      {st}
                    </option>
                  ))}
                </select>
              </div>

              <button
                onClick={openAddForm}
                className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm cursor-pointer transition-colors"
              >
                <Plus size={18} /> Add Property
              </button>
            </div>

            {filteredProperties.length === 0 ? (
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center">
                <Home size={40} className="mx-auto text-slate-500 mb-3" />
                <h3 className="text-lg font-bold">No properties found</h3>
                <p className="text-slate-400 text-sm mt-1">
                  {myProperties.length === 0
                    ? 'Add your first property listing to start receiving buyer tour requests.'
                    : 'Try adjusting your search or status filter.'}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                {filteredProperties.map((property) => {
                  const title = property.name || property.title;
                  const imgSrc = property.image || property.image_url;
                  const propType = property.type || property.property_type;
                  const isQuickEditing = quickEditId === property.id;

                  return (
                    <article
                      key={property.id}
                      className="overflow-hidden rounded-2xl bg-slate-900 border border-slate-800 flex flex-col justify-between"
                    >
                      <div>
                        <div className="relative h-48 bg-slate-800">
                          {imgSrc ? (
                            <img
                              src={imgSrc}
                              alt={title}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="h-full flex items-center justify-center">
                              <ImageIcon size={40} className="text-slate-500" />
                            </div>
                          )}
                          <div className="absolute top-3 left-3">
                            <TypeBadge type={propType} className="bg-white/95" />
                          </div>
                          <div className="absolute top-3 right-3">
                            <StatusBadge status={property.availability || 'Available'} />
                          </div>
                        </div>

                        <div className="p-5">
                          <h3 className="font-bold text-lg text-white">{title}</h3>
                          <p className="text-slate-400 text-xs mt-1.5 flex items-center gap-1.5">
                            <MapPin size={14} className="text-emerald-400 shrink-0" /> {property.location}
                          </p>
                          <p className="text-amber-400 font-black text-2xl mt-3">
                            {formatCurrency(property.price)}
                          </p>

                          <div className="flex flex-wrap gap-4 text-xs text-slate-400 mt-4 pt-3 border-t border-slate-800">
                            <span className="flex items-center gap-1">
                              <BedDouble size={14} /> {property.bedrooms || 0} Beds
                            </span>
                            <span className="flex items-center gap-1">
                              <Bath size={14} /> {property.bathrooms || 0} Baths
                            </span>
                            <span className="flex items-center gap-1">
                              <Ruler size={14} /> {property.area_sqft || 0} sq.ft.
                            </span>
                          </div>

                          {/* Inline Quick Price & Availability Update */}
                          {isQuickEditing && (
                            <div className="mt-4 p-3.5 rounded-xl bg-slate-950 border border-emerald-500/30 space-y-3">
                              <p className="text-[11px] uppercase font-bold tracking-wider text-emerald-400">
                                Quick Price & Availability Update
                              </p>
                              <div className="grid grid-cols-2 gap-2">
                                <input
                                  type="number"
                                  min="1"
                                  value={quickPrice}
                                  onChange={(e) => setQuickPrice(e.target.value)}
                                  className="px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white"
                                  placeholder="Price"
                                />
                                <select
                                  value={quickAvailability}
                                  onChange={(e) => setQuickAvailability(e.target.value)}
                                  className="px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white"
                                >
                                  {AVAILABILITY_OPTIONS.map((st) => (
                                    <option key={st} value={st}>
                                      {st}
                                    </option>
                                  ))}
                                </select>
                              </div>
                              <div className="flex gap-2">
                                <button
                                  type="button"
                                  disabled={quickSaving}
                                  onClick={() => saveQuickEdit(property)}
                                  className="flex-1 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold cursor-pointer"
                                >
                                  {quickSaving ? 'Saving...' : 'Save'}
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setQuickEditId(null)}
                                  className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 text-xs cursor-pointer"
                                >
                                  Cancel
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="px-5 pb-5 flex flex-wrap gap-2">
                        <button
                          onClick={() => startQuickEdit(property)}
                          className="flex items-center justify-center gap-1.5 rounded-xl px-3 py-2 bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 text-xs font-semibold cursor-pointer"
                        >
                          <DollarSign size={14} /> Price / Status
                        </button>
                        <button
                          onClick={() => openEditForm(property)}
                          className="flex-1 flex justify-center items-center gap-1.5 rounded-xl py-2 bg-slate-800 hover:bg-slate-700 text-xs font-semibold cursor-pointer"
                        >
                          <Pencil size={14} /> Edit
                        </button>
                        <button
                          onClick={() => handleDelete(property)}
                          className="flex justify-center items-center gap-1.5 rounded-xl px-3 py-2 bg-red-950/60 hover:bg-red-900/70 text-red-300 text-xs font-semibold cursor-pointer"
                        >
                          <Trash2 size={14} /> Delete
                        </button>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </section>
        )}

        {/* TAB 2: BOOKING REQUESTS */}
        {activeTab === 'bookings' && (
          <section>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <h2 className="text-xl font-bold">Booking Requests for My Properties</h2>
              <div className="flex flex-wrap gap-2">
                {['All', 'Pending', 'Approved', 'Completed', 'Rejected'].map((st) => (
                  <button
                    key={st}
                    onClick={() => setBookingFilter(st)}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold cursor-pointer transition-all ${
                      bookingFilter === st
                        ? 'bg-amber-500 text-slate-950'
                        : 'bg-slate-900 text-slate-300 border border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>

            {filteredBookings.length === 0 ? (
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center">
                <CalendarDays size={40} className="mx-auto text-slate-500 mb-3" />
                <h3 className="font-bold text-lg">No booking requests</h3>
                <p className="text-slate-400 text-sm mt-1">
                  Tour requests submitted by buyers for your properties will appear here.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredBookings.map((booking) => {
                  const property = myProperties.find(
                    (p) => String(p.id) === String(booking.property_id)
                  );
                  return (
                    <article
                      key={booking.id}
                      className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-5"
                    >
                      <div className="space-y-2">
                        <div className="flex flex-wrap items-center gap-2.5">
                          <h3 className="font-bold text-base text-white">
                            {property?.name || property?.title || `Property #${booking.property_id}`}
                          </h3>
                          <StatusBadge status={booking.status} />
                        </div>

                        <div className="flex flex-wrap items-center gap-4 text-xs text-slate-300">
                          <span className="flex items-center gap-1.5 font-semibold">
                            <User size={14} className="text-amber-400" />
                            {booking.customer_name || 'Buyer'}
                          </span>
                          {booking.customer_email && (
                            <span className="flex items-center gap-1.5 text-slate-400">
                              <Mail size={14} /> {booking.customer_email}
                            </span>
                          )}
                          {booking.customer_phone && (
                            <span className="flex items-center gap-1.5 text-slate-400">
                              <Phone size={14} /> {booking.customer_phone}
                            </span>
                          )}
                        </div>

                        <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400">
                          <span className="flex items-center gap-1.5 text-emerald-400 font-semibold">
                            <CalendarDays size={14} /> {formatDate(booking.visit_date)}
                          </span>
                          <span className="flex items-center gap-1.5">
                            <Clock size={14} /> {booking.time_slot || booking.visit_time || 'Afternoon'}
                          </span>
                        </div>

                        {(booking.notes || booking.message) && (
                          <p className="text-slate-300 text-xs bg-slate-950/80 border border-slate-800 rounded-xl p-3 mt-2">
                            {booking.notes || booking.message}
                          </p>
                        )}
                      </div>

                      <div className="flex flex-wrap gap-2 shrink-0">
                        {booking.status === 'Pending' && (
                          <>
                            <button
                              onClick={() => handleBookingStatus(booking.id, 'Approved')}
                              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold cursor-pointer"
                            >
                              <CheckCircle size={15} /> Approve
                            </button>
                            <button
                              onClick={() => handleBookingStatus(booking.id, 'Rejected')}
                              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-red-950/80 hover:bg-red-900 text-red-200 border border-red-500/30 text-xs font-bold cursor-pointer"
                            >
                              <XCircle size={15} /> Reject
                            </button>
                          </>
                        )}
                        {booking.status === 'Approved' && (
                          <button
                            onClick={() => handleBookingStatus(booking.id, 'Completed')}
                            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold cursor-pointer"
                          >
                            <CheckCircle size={15} className="text-emerald-400" /> Mark Completed
                          </button>
                        )}
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </section>
        )}

        {/* TAB 3: MY PROFILE */}
        {activeTab === 'profile' && (
          <section className="max-w-2xl">
            <h2 className="text-xl font-bold mb-5">My Owner Profile</h2>
            <form
              onSubmit={handleProfileSave}
              className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-5"
            >
              <div>
                <span className="text-xs uppercase font-bold tracking-wider text-slate-400">
                  Registered Email (Read Only)
                </span>
                <input
                  type="email"
                  value={currentUser?.email || ''}
                  disabled
                  className="w-full mt-2 rounded-xl bg-slate-950 border border-slate-800 p-3 text-slate-400 text-sm font-mono"
                />
              </div>

              {[
                ['name', 'Full Name'],
                ['phone', 'Phone Number'],
                ['address', 'Office / Residential Address'],
              ].map(([field, label]) => (
                <label key={field} className="block">
                  <span className="text-xs uppercase font-bold tracking-wider text-slate-300">
                    {label}
                  </span>
                  <input
                    value={profile[field]}
                    onChange={(e) => setProfile({ ...profile, [field]: e.target.value })}
                    className="w-full mt-2 rounded-xl bg-slate-800 border border-slate-700 p-3 text-white text-sm focus:outline-none focus:border-emerald-400"
                    required={field === 'name'}
                  />
                </label>
              ))}

              <button
                type="submit"
                disabled={profileSaving}
                className="flex items-center gap-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm px-6 py-3 cursor-pointer"
              >
                <Save size={17} /> {profileSaving ? 'Saving...' : 'Save Profile'}
              </button>
            </form>
          </section>
        )}
      </main>

      {/* Add / Edit Property Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <form
            onSubmit={handlePropertySave}
            className="w-full max-w-3xl my-8 rounded-3xl bg-slate-900 border border-slate-700 p-6 sm:p-8 shadow-2xl"
          >
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold text-white">
                  {editingId ? 'Edit Property Listing' : 'Add New Property'}
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  This listing is linked directly to your Owner account.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="p-2 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-white cursor-pointer"
              >
                <X />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                ['name', 'Property Name *', 'text'],
                ['location', 'City / Location *', 'text'],
                ['address', 'Full Street Address *', 'text'],
                ['price', 'Price (USD) *', 'number'],
                ['bedrooms', 'Bedrooms', 'number'],
                ['bathrooms', 'Bathrooms', 'number'],
                ['area_sqft', 'Area (sq.ft.)', 'number'],
                ['image', 'Cover Image URL', 'url'],
              ].map(([field, label, type]) => (
                <label key={field} className="block">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
                    {label}
                  </span>
                  <input
                    type={type}
                    min={type === 'number' ? '0' : undefined}
                    step={field === 'bathrooms' ? '0.5' : undefined}
                    value={form[field]}
                    onChange={(e) => updateForm(field, e.target.value)}
                    required={['name', 'location', 'address', 'price'].includes(field)}
                    className="w-full mt-1.5 rounded-xl bg-slate-800 border border-slate-700 p-3 text-sm text-white focus:outline-none focus:border-emerald-400"
                  />
                </label>
              ))}

              <label className="block">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
                  Property Type
                </span>
                <select
                  value={form.type}
                  onChange={(e) => updateForm('type', e.target.value)}
                  className="w-full mt-1.5 rounded-xl bg-slate-800 border border-slate-700 p-3 text-sm text-white focus:outline-none focus:border-emerald-400"
                >
                  {PROPERTY_TYPES.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
                  Availability
                </span>
                <select
                  value={form.availability}
                  onChange={(e) => updateForm('availability', e.target.value)}
                  className="w-full mt-1.5 rounded-xl bg-slate-800 border border-slate-700 p-3 text-sm text-white focus:outline-none focus:border-emerald-400"
                >
                  {AVAILABILITY_OPTIONS.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block md:col-span-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
                  Description
                </span>
                <textarea
                  value={form.description}
                  onChange={(e) => updateForm('description', e.target.value)}
                  rows={3}
                  className="w-full mt-1.5 rounded-xl bg-slate-800 border border-slate-700 p-3 text-sm text-white focus:outline-none focus:border-emerald-400"
                />
              </label>
            </div>

            <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-5 py-2.5 rounded-xl border border-slate-700 text-sm font-semibold hover:bg-slate-800 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm cursor-pointer"
              >
                {saving ? 'Saving...' : editingId ? 'Update Property' : 'Publish Property'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
