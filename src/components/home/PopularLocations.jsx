import React from 'react';
import { useApp } from '../../context/AppContext';
import { MapPin, ArrowRight } from 'lucide-react';

export const PopularLocations = () => {
  const { setActiveTab, setSearchFilters, properties = [] } = useApp();

  const locationGroups = Object.values(
    properties.reduce((groups, property) => {
      const name = (property.location || '').trim();
      if (!name) return groups;

      if (!groups[name]) {
        groups[name] = {
          name,
          count: 0,
          image: property.image_url || property.image || property.photo ||
            (Array.isArray(property.images) ? property.images[0] : '')
        };
      }

      groups[name].count += 1;

      if (!groups[name].image) {
        groups[name].image = property.image_url || property.image || property.photo ||
          (Array.isArray(property.images) ? property.images[0] : '');
      }

      return groups;
    }, {})
  );

  const handleSelectLocation = (name) => {
    setSearchFilters((prev) => ({ ...prev, location: name }));
    setActiveTab('properties');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-amber-600 block mb-2">
              Explore Properties
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Popular Locations
            </h2>
            <p className="mt-2 text-sm text-slate-600 max-w-xl">
              Explore locations based on properties currently listed on our platform.
            </p>
          </div>

          <button
            onClick={() => {
              setActiveTab('properties');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="inline-flex items-center gap-1.5 text-sm font-bold text-slate-900 hover:text-amber-600 transition-colors cursor-pointer group"
          >
            <span>View All Properties</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        {locationGroups.length === 0 ? (
          <div className="text-center py-16 rounded-2xl border border-slate-200 bg-slate-50">
            <MapPin className="w-10 h-10 mx-auto text-slate-400 mb-3" />
            <h3 className="text-lg font-bold text-slate-800">
              No Locations Available Yet
            </h3>
            <p className="text-sm text-slate-500 mt-2">
              Locations will appear here when properties are added.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {locationGroups.map((loc) => (
              <div
                key={loc.name}
                onClick={() => handleSelectLocation(loc.name)}
                className="group relative h-72 rounded-2xl overflow-hidden cursor-pointer shadow-sm hover:shadow-xl transition-all duration-300 bg-slate-800"
              >
                {loc.image && (
                  <img
                    src={loc.image}
                    alt={loc.name}
                    className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    loading="lazy"
                  />
                )}

                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/30 to-transparent" />

                <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between text-white">
                  <div>
                    <h3 className="text-xl font-black tracking-tight group-hover:text-amber-400 transition-colors">
                      {loc.name}
                    </h3>
                    <p className="text-xs text-slate-300 flex items-center gap-1 mt-1">
                      <MapPin className="w-3 h-3" />
                      Actual listed properties
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-amber-400">{loc.count}</p>
                    <p className="text-[11px] text-slate-300">Properties</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};
