import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Search, MapPin, Home, DollarSign, ArrowRight, ShieldCheck, Star, Users, Building } from 'lucide-react';

export const HeroSection = () => {
  const { setActiveTab, setSearchFilters, properties, agents, owners, customers } = useApp();

  const [location, setLocation] = useState('');
  const [propertyType, setPropertyType] = useState('');
  const [budget, setBudget] = useState('');

  const locations = [...new Set(
    properties.map((property) => property.location).filter(Boolean)
  )].sort();

  const handleSearch = (e) => {
    e.preventDefault();
    setSearchFilters({
      location,
      type: propertyType,
      budget,
      keyword: '',
    });
    setActiveTab('properties');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="relative bg-slate-950 text-white overflow-hidden">
      {/* Background Hero Image with Elegant Overlay */}
      <div className="absolute inset-0 z-0">
        <img
          src="https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=2000&q=80"
          alt="Luxury Architecture"
          className="w-full h-full object-cover object-center opacity-25 scale-105 transition-transform duration-1000 ease-out"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/80 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950/95 via-slate-950/60 to-transparent" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-28 lg:pt-28 lg:pb-36">
        <div className="max-w-3xl">
          {/* Trust Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-semibold mb-6 backdrop-blur-md animate-in fade-in slide-in-from-bottom-2">
            <ShieldCheck className="w-4 h-4 text-amber-400" />
            <span>Premier Real Estate Management Platform</span>
          </div>

          {/* Main Headline */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-tight">
            Find Your Perfect Property, <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-400 to-amber-500">
              Your Future Starts Here.
            </span>
          </h1>

          <p className="mt-6 text-base sm:text-lg text-slate-300 leading-relaxed max-w-2xl">
            Explore curated waterfront villas, panoramic penthouses, and premier commercial hubs.
            Connect directly with verified owners, licensed top-tier agents, and manage visits effortlessly.
          </p>
        </div>

        {/* Interactive Property Search Bar Card */}
        <div className="mt-10 max-w-5xl bg-white/95 backdrop-blur-md rounded-3xl p-4 sm:p-6 shadow-2xl border border-white/20 text-slate-900">
          <form onSubmit={handleSearch}>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
              {/* Location Filter */}
              <div className="p-2 sm:p-3 rounded-2xl hover:bg-slate-50 transition-colors">
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-amber-600" />
                  Location
                </label>
                <select
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full bg-transparent text-sm font-semibold text-slate-900 focus:outline-none cursor-pointer"
                >
                  <option value="">All Locations</option>
                  {locations.map((item) => (
                    <option key={item} value={item}>{item}</option>
                  ))}
                </select>
              </div>

              {/* Property Type Filter */}
              <div className="p-2 sm:p-3 rounded-2xl hover:bg-slate-50 transition-colors border-t md:border-t-0 md:border-l border-slate-200">
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1 flex items-center gap-1.5">
                  <Home className="w-3.5 h-3.5 text-amber-600" />
                  Property Type
                </label>
                <select
                  value={propertyType}
                  onChange={(e) => setPropertyType(e.target.value)}
                  className="w-full bg-transparent text-sm font-semibold text-slate-900 focus:outline-none cursor-pointer"
                >
                  <option value="">All Categories</option>
                  <option value="Villa">Luxury Villa</option>
                  <option value="Apartment">Skyline Apartment / Penthouse</option>
                  <option value="House">Modern House</option>
                  <option value="Commercial">Commercial & Corporate Hub</option>
                </select>
              </div>

              {/* Budget Range Filter */}
              <div className="p-2 sm:p-3 rounded-2xl hover:bg-slate-50 transition-colors border-t md:border-t-0 md:border-l border-slate-200">
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1 flex items-center gap-1.5">
                  <DollarSign className="w-3.5 h-3.5 text-amber-600" />
                  Budget Range
                </label>
                <select
                  value={budget}
                  onChange={(e) => setBudget(e.target.value)}
                  className="w-full bg-transparent text-sm font-semibold text-slate-900 focus:outline-none cursor-pointer"
                >
                  <option value="">Any Budget</option>
                  <option value="under2m">Under $2,000,000</option>
                  <option value="2m-4m">$2,000,000 - $4,000,000</option>
                  <option value="4m-8m">$4,000,000 - $8,000,000</option>
                  <option value="over8m">$8,000,000+</option>
                </select>
              </div>

              {/* Search Submit Button */}
              <div className="pt-2 md:pt-0">
                <button
                  type="submit"
                  className="w-full h-14 bg-slate-950 hover:bg-slate-900 text-amber-400 font-bold text-sm rounded-2xl transition-all shadow-lg flex items-center justify-center gap-2 group cursor-pointer border border-amber-500/30 hover:border-amber-400"
                >
                  <Search className="w-4 h-4 text-amber-400 group-hover:scale-110 transition-transform" />
                  <span>Find Properties</span>
                  <ArrowRight className="w-4 h-4 text-amber-400 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>
          </form>
        </div>

        {/* Live Database Statistics */}
        <div className="mt-14 grid grid-cols-2 sm:grid-cols-4 gap-6 pt-8 border-t border-slate-800/80">
          <div>
            <div className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">{properties.length}</div>
            <div className="text-xs uppercase tracking-wider text-slate-400 mt-1">Properties</div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-extrabold text-amber-400 tracking-tight">{owners.length}</div>
            <div className="text-xs uppercase tracking-wider text-slate-400 mt-1">Registered Owners</div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">{agents.length}</div>
            <div className="text-xs uppercase tracking-wider text-slate-400 mt-1">Registered Agents</div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-extrabold text-amber-400 tracking-tight">{customers.length}</div>
            <div className="text-xs uppercase tracking-wider text-slate-400 mt-1">Registered Customers</div>
          </div>
        </div>
      </div>
    </div>
  );
};

