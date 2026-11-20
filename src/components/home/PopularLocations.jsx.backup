import React from 'react';
import { useApp } from '../../context/AppContext';
import { MapPin, ArrowRight } from 'lucide-react';

const LOCATIONS = [
  {
    name: 'Miami Beach',
    state: 'Florida',
    image: 'https://images.unsplash.com/photo-1506953823976-52e1fdc0149a?auto=format&fit=crop&w=800&q=80',
    propertiesCount: '18 Available',
    avgPrice: '$4.8M',
    tag: 'Waterfront & Island',
  },
  {
    name: 'Manhattan',
    state: 'New York',
    image: 'https://images.unsplash.com/photo-1538688525198-9b88f6f53126?auto=format&fit=crop&w=800&q=80',
    propertiesCount: '24 Available',
    avgPrice: '$3.5M',
    tag: 'Skyline Penthouses',
  },
  {
    name: 'Beverly Hills',
    state: 'California',
    image: 'https://images.unsplash.com/photo-1580655653885-65763b2597d0?auto=format&fit=crop&w=800&q=80',
    propertiesCount: '15 Available',
    avgPrice: '$7.2M',
    tag: 'Exclusive Estates',
  },
  {
    name: 'Austin',
    state: 'Texas',
    image: 'https://images.unsplash.com/photo-1531218150217-54595bc2b934?auto=format&fit=crop&w=800&q=80',
    propertiesCount: '12 Available',
    avgPrice: '$2.1M',
    tag: 'Tech Innovation Hub',
  },
  {
    name: 'Chicago',
    state: 'Illinois',
    image: 'https://images.unsplash.com/photo-1477959858617-67f30bc75b82?auto=format&fit=crop&w=800&q=80',
    propertiesCount: '9 Available',
    avgPrice: '$5.4M',
    tag: 'Commercial Landmark',
  },
  {
    name: 'Scottsdale',
    state: 'Arizona',
    image: 'https://images.unsplash.com/photo-1517400508447-f8dd518b86db?auto=format&fit=crop&w=800&q=80',
    propertiesCount: '14 Available',
    avgPrice: '$3.8M',
    tag: 'Desert Oasis',
  },
];

export const PopularLocations = () => {
  const { setActiveTab, setSearchFilters } = useApp();

  const handleSelectLocation = (locName) => {
    setSearchFilters((prev) => ({
      ...prev,
      location: locName,
    }));
    setActiveTab('properties');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-amber-600 block mb-2">
              Prime Destinations
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Popular Locations
            </h2>
            <p className="mt-2 text-sm text-slate-600 max-w-xl">
              Discover prime residential enclaves and commercial corridors with high capital appreciation and unrivaled lifestyle offerings.
            </p>
          </div>

          <button
            onClick={() => {
              setActiveTab('properties');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="inline-flex items-center gap-1.5 text-sm font-bold text-slate-900 hover:text-amber-600 transition-colors cursor-pointer group"
          >
            <span>View All Destinations</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        {/* Location Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {LOCATIONS.map((loc) => (
            <div
              key={loc.name}
              onClick={() => handleSelectLocation(loc.name)}
              className="group relative h-72 rounded-2xl overflow-hidden cursor-pointer shadow-sm hover:shadow-xl transition-all duration-300"
            >
              {/* Image */}
              <img
                src={loc.image}
                alt={loc.name}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                loading="lazy"
              />

              {/* Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/40 to-transparent" />

              {/* Top Tag */}
              <div className="absolute top-4 left-4">
                <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-white/90 backdrop-blur-xs text-slate-900 shadow-xs">
                  {loc.tag}
                </span>
              </div>

              {/* Bottom Content */}
              <div className="absolute bottom-4 left-4 right-4">
                <div className="flex items-center justify-between text-white">
                  <div>
                    <h3 className="text-xl font-black tracking-tight group-hover:text-amber-400 transition-colors">
                      {loc.name}
                    </h3>
                    <p className="text-xs text-slate-300">{loc.state}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-amber-400">{loc.avgPrice}</p>
                    <p className="text-[11px] text-slate-300">{loc.propertiesCount}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
