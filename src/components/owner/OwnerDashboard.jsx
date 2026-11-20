import React, { useMemo, useState } from 'react';
import { useApp } from '../../context/AppContext';
import { getSupabaseClient } from '../../services/supabaseClient';
import {
  Home, Plus, Pencil, Trash2, CalendarDays, User,
  LogOut, CheckCircle, XCircle, Clock, Save, X,
  MapPin, BedDouble, Bath, Ruler, Image as ImageIcon,
  Building2
} from 'lucide-react';

const money = (value) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(Number(value || 0));

const initialForm = {
  title: '', location: '', address: '',
  property_type: 'Apartment', price: '',
  availability: 'Available', bedrooms: 0,
  bathrooms: 0, area_sqft: '', image_url: '',
  description: ''
};

export const OwnerDashboard = () => {
  const {
    currentUser, logout, properties = [], bookings = [],
    addProperty, updateProperty, deleteProperty,
    updateBookingStatus, setCurrentUser, showToast
  } = useApp();

  const [activeTab, setActiveTab] = useState('properties');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(initialForm);
  const [saving, setSaving] = useState(false);
  const [profileSaving, setProfileSaving] = useState(false);
  const [profile, setProfile] = useState({
    name: currentUser?.name || '',
    phone: currentUser?.phone || '',
    address: currentUser?.address || ''
  });

  const ownerId = currentUser?.owner_id;

  const myProperties = useMemo(
    () => properties.filter(p => String(p.owner_id) === String(ownerId)),
    [properties, ownerId]
  );

  const propertyIds = useMemo(
    () => new Set(myProperties.map(p => String(p.id))),
    [myProperties]
  );

  const myBookings = useMemo(
    () => bookings.filter(b => propertyIds.has(String(b.property_id))),
    [bookings, propertyIds]
  );

  const updateForm = (field, value) =>
    setForm(prev => ({ ...prev, [field]: value }));

  const openAddForm = () => {
    setEditingId(null);
    setForm(initialForm);
    setShowForm(true);
  };

  const openEditForm = property => {
    setEditingId(property.id);
    setForm({
      title: property.title || '',
      location: property.location || '',
      address: property.address || '',
      property_type: property.property_type || 'Apartment',
      price: property.price ?? '',
      availability: property.availability || 'Available',
      bedrooms: property.bedrooms ?? 0,
      bathrooms: property.bathrooms ?? 0,
      area_sqft: property.area_sqft ?? '',
      image_url: property.image_url || '',
      description: property.description || ''
    });
    setShowForm(true);
  };

  const handlePropertySave = async event => {
    event.preventDefault();

    if (!form.title.trim() || !form.location.trim() || !form.price) {
      showToast?.('Please fill in required fields.', 'error');
      return;
    }

    setSaving(true);

    const payload = {
      title: form.title.trim(),
      location: form.location.trim(),
      address: form.address.trim(),
      property_type: form.property_type,
      price: Number(form.price),
      availability: form.availability,
      bedrooms: Number(form.bedrooms || 0),
      bathrooms: Number(form.bathrooms || 0),
      area_sqft: Number(form.area_sqft || 0),
      image_url: form.image_url.trim(),
      description: form.description.trim(),
      amenities: [],
      featured: false
    };

    try {
      if (editingId) {
        await updateProperty(editingId, payload);
      } else {
        await addProperty({
          ...payload,
          owner_id: ownerId,
          agent_id: null
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

  const handleDelete = async property => {
    if (!window.confirm(`Delete "${property.title}"?`)) return;
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

  const handleProfileSave = async event => {
    event.preventDefault();
    setProfileSaving(true);

    try {
      const supabase = getSupabaseClient();
      const { error } = await supabase
        .from('profiles')
        .update({
          name: profile.name.trim(),
          phone: profile.phone.trim(),
          address: profile.address.trim()
        })
        .eq('id', currentUser.id);

      if (error) throw error;

      setCurrentUser({ ...currentUser, ...profile });
      showToast?.('Profile updated successfully.', 'success');
    } catch (error) {
      console.error(error);
      showToast?.(error.message || 'Profile update failed.', 'error');
    } finally {
      setProfileSaving(false);
    }
  };

  if (!ownerId) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-6">
        <div className="max-w-md text-center bg-slate-900 border border-slate-700 rounded-2xl p-8">
          <Building2 size={44} className="mx-auto mb-4 text-amber-400" />
          <h1 className="text-2xl font-bold mb-3">Owner Account Not Linked</h1>
          <p className="text-slate-400 mb-6">
            Contact the administrator to link your owner account.
          </p>
          <button onClick={logout} className="px-5 py-3 rounded-xl bg-amber-500 text-slate-950 font-semibold">
            Sign Out
          </button>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'properties', label: 'My Properties', icon: Home },
    { id: 'bookings', label: 'Booking Requests', icon: CalendarDays },
    { id: 'profile', label: 'My Profile', icon: User }
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <header className="border-b border-slate-800 bg-slate-900">
        <div className="max-w-7xl mx-auto px-5 py-5 flex justify-between items-center">
          <div>
            <p className="text-amber-400 text-sm font-semibold tracking-widest">LUXE ESTATE</p>
            <h1 className="text-2xl font-bold mt-1">Owner Dashboard</h1>
            <p className="text-sm text-slate-400 mt-1">
              Welcome, {currentUser?.name || 'Owner'}
            </p>
          </div>
          <button onClick={logout} className="flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-700">
            <LogOut size={17} /> Sign Out
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-5 py-8">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
            <Home className="text-amber-400 mb-3" />
            <p className="text-slate-400 text-sm">My Properties</p>
            <p className="text-3xl font-bold">{myProperties.length}</p>
          </div>
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
            <CalendarDays className="text-amber-400 mb-3" />
            <p className="text-slate-400 text-sm">Booking Requests</p>
            <p className="text-3xl font-bold">{myBookings.length}</p>
          </div>
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
            <Clock className="text-amber-400 mb-3" />
            <p className="text-slate-400 text-sm">Pending Requests</p>
            <p className="text-3xl font-bold">
              {myBookings.filter(b => b.status === 'Pending').length}
            </p>
          </div>
        </div>

        <nav className="flex flex-wrap gap-2 mb-7">
          {tabs.map(({ id, label, icon: Icon }) => (
            <button key={id} onClick={() => setActiveTab(id)}
              className={`flex items-center gap-2 px-5 py-3 rounded-xl font-medium ${
                activeTab === id
                  ? 'bg-amber-500 text-slate-950'
                  : 'bg-slate-900 text-slate-300 border border-slate-800'
              }`}>
              <Icon size={18} /> {label}
            </button>
          ))}
        </nav>

        {activeTab === 'properties' && (
          <section>
            <div className="flex justify-between items-center gap-3 mb-5">
              <h2 className="text-xl font-bold">My Properties</h2>
              <button onClick={openAddForm}
                className="flex items-center gap-2 px-4 py-3 rounded-xl bg-amber-500 text-slate-950 font-semibold">
                <Plus size={18} /> Add Property
              </button>
            </div>

            {myProperties.length === 0 ? (
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-10 text-center">
                <Home size={40} className="mx-auto text-slate-500 mb-3" />
                <h3 className="text-lg font-semibold">No properties yet</h3>
                <p className="text-slate-400 mt-2">Add your first property.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                {myProperties.map(property => (
                  <article key={property.id} className="overflow-hidden rounded-2xl bg-slate-900 border border-slate-800">
                    {property.image_url ? (
                      <img src={property.image_url} alt={property.title} className="w-full h-48 object-cover" />
                    ) : (
                      <div className="h-48 bg-slate-800 flex items-center justify-center">
                        <ImageIcon size={40} className="text-slate-500" />
                      </div>
                    )}
                    <div className="p-5">
                      <h3 className="font-bold text-lg">{property.title}</h3>
                      <p className="text-slate-400 text-sm mt-2 flex gap-1">
                        <MapPin size={15} /> {property.location}
                      </p>
                      <p className="text-amber-400 font-bold text-xl mt-4">{money(property.price)}</p>
                      <div className="flex flex-wrap gap-4 text-xs text-slate-400 mt-4">
                        <span className="flex gap-1"><BedDouble size={14} /> {property.bedrooms || 0} Beds</span>
                        <span className="flex gap-1"><Bath size={14} /> {property.bathrooms || 0} Baths</span>
                        <span className="flex gap-1"><Ruler size={14} /> {property.area_sqft || 0} sq.ft.</span>
                      </div>
                      <p className="text-xs text-amber-300 mt-3">{property.availability || 'Available'}</p>
                      <div className="flex gap-2 mt-5">
                        <button onClick={() => openEditForm(property)}
                          className="flex-1 flex justify-center items-center gap-2 rounded-lg py-2 bg-slate-800">
                          <Pencil size={15} /> Edit
                        </button>
                        <button onClick={() => handleDelete(property)}
                          className="flex-1 flex justify-center items-center gap-2 rounded-lg py-2 bg-red-950/50 text-red-300">
                          <Trash2 size={15} /> Delete
                        </button>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>
        )}

        {activeTab === 'bookings' && (
          <section>
            <h2 className="text-xl font-bold mb-5">Booking Requests</h2>
            {myBookings.length === 0 ? (
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-10 text-center">
                <CalendarDays size={40} className="mx-auto text-slate-500 mb-3" />
                <h3 className="font-semibold">No booking requests</h3>
              </div>
            ) : (
              <div className="space-y-4">
                {myBookings.map(booking => {
                  const property = myProperties.find(
                    p => String(p.id) === String(booking.property_id)
                  );
                  return (
                    <article key={booking.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
                      <h3 className="font-bold">{property?.title || 'Property booking'}</h3>
                      <p className="text-sm text-slate-400 mt-1">
                        {booking.customer_name || booking.name || 'Buyer'}
                      </p>
                      <p className="text-sm text-slate-400">
                        {booking.customer_email || booking.email || ''}
                      </p>
                      <p className="text-amber-300 text-sm mt-2">{booking.status}</p>
                      {booking.message && <p className="text-slate-300 text-sm mt-3">{booking.message}</p>}
                      <div className="flex flex-wrap gap-2 mt-5">
                        {booking.status === 'Pending' && (
                          <>
                            <button onClick={() => handleBookingStatus(booking.id, 'Approved')}
                              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-900/60 text-emerald-300">
                              <CheckCircle size={16} /> Approve
                            </button>
                            <button onClick={() => handleBookingStatus(booking.id, 'Rejected')}
                              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-950/60 text-red-300">
                              <XCircle size={16} /> Reject
                            </button>
                          </>
                        )}
                        {booking.status === 'Approved' && (
                          <button onClick={() => handleBookingStatus(booking.id, 'Completed')}
                            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-800">
                            <CheckCircle size={16} /> Mark Completed
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

        {activeTab === 'profile' && (
          <section className="max-w-2xl">
            <h2 className="text-xl font-bold mb-5">My Profile</h2>
            <form onSubmit={handleProfileSave} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-5">
              {[
                ['name', 'Full Name'],
                ['phone', 'Phone'],
                ['address', 'Address']
              ].map(([field, label]) => (
                <label key={field} className="block">
                  <span className="text-sm text-slate-300">{label}</span>
                  <input value={profile[field]}
                    onChange={e => setProfile({ ...profile, [field]: e.target.value })}
                    className="w-full mt-2 rounded-lg bg-slate-800 border border-slate-700 p-3 text-white" />
                </label>
              ))}
              <button type="submit" disabled={profileSaving}
                className="flex items-center gap-2 rounded-xl bg-amber-500 text-slate-950 font-semibold px-5 py-3">
                <Save size={17} /> {profileSaving ? 'Saving...' : 'Save Profile'}
              </button>
            </form>
          </section>
        )}
      </main>

      {showForm && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4 overflow-y-auto">
          <form onSubmit={handlePropertySave}
            className="w-full max-w-3xl my-8 rounded-2xl bg-slate-900 border border-slate-700 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold">{editingId ? 'Edit Property' : 'Add Property'}</h2>
              <button type="button" onClick={() => setShowForm(false)}><X /></button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                ['title', 'Property Title', 'text'],
                ['location', 'City / Location', 'text'],
                ['address', 'Full Address', 'text'],
                ['price', 'Price (INR)', 'number'],
                ['bedrooms', 'Bedrooms', 'number'],
                ['bathrooms', 'Bathrooms', 'number'],
                ['area_sqft', 'Area (sq.ft.)', 'number'],
                ['image_url', 'Image URL', 'url']
              ].map(([field, label, type]) => (
                <label key={field} className="block">
                  <span className="text-sm text-slate-300">{label}</span>
                  <input type={type} min={type === 'number' ? '0' : undefined}
                    value={form[field]} onChange={e => updateForm(field, e.target.value)}
                    required={['title', 'location', 'price'].includes(field)}
                    className="w-full mt-2 rounded-lg bg-slate-800 border border-slate-700 p-3 text-white" />
                </label>
              ))}

              <label className="block">
                <span className="text-sm text-slate-300">Property Type</span>
                <select value={form.property_type}
                  onChange={e => updateForm('property_type', e.target.value)}
                  className="w-full mt-2 rounded-lg bg-slate-800 border border-slate-700 p-3 text-white">
                  {['Apartment', 'House', 'Villa', 'Plot', 'Commercial'].map(type =>
                    <option key={type}>{type}</option>
                  )}
                </select>
              </label>

              <label className="block">
                <span className="text-sm text-slate-300">Availability</span>
                <select value={form.availability}
                  onChange={e => updateForm('availability', e.target.value)}
                  className="w-full mt-2 rounded-lg bg-slate-800 border border-slate-700 p-3 text-white">
                  {['Available', 'Sold', 'Rented', 'Unavailable'].map(status =>
                    <option key={status}>{status}</option>
                  )}
                </select>
              </label>

              <label className="block md:col-span-2">
                <span className="text-sm text-slate-300">Description</span>
                <textarea value={form.description}
                  onChange={e => updateForm('description', e.target.value)}
                  rows={4}
                  className="w-full mt-2 rounded-lg bg-slate-800 border border-slate-700 p-3 text-white" />
              </label>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button type="button" onClick={() => setShowForm(false)}
                className="px-5 py-3 rounded-xl border border-slate-700">Cancel</button>
              <button type="submit" disabled={saving}
                className="px-5 py-3 rounded-xl bg-amber-500 text-slate-950 font-semibold">
                {saving ? 'Saving...' : editingId ? 'Update Property' : 'Add Property'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
