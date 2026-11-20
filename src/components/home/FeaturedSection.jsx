import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { PropertyCard } from '../properties/PropertyCard';
import { Sparkles, ArrowRight } from 'lucide-react';

export const FeaturedSection = () => {
  const { properties, setActiveTab } = useApp();
  const [filterType, setFilterType] = useState('All');

  const categories = ['All', 'Villa', 'Apartment', 'House', 'Commercial'];

  const filteredProperties = properties.filter((p) => {
    if (filterType === 'All') return true;
    return p.type.toLowerCase() === filterType.toLowerCase();
  });

  return (
    <section className="py-20 bg-slate-50 border-b border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-amber-600 mb-2">
              <Sparkles className="w-4 h-4" />
              <span>Curated Selection</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Featured Properties
            </h2>
            <p className="mt-2 text-sm text-slate-600 max-w-xl">
              Handpicked luxury estates, prestigious penthouses, and high-yield commercial investments verified by our team.
            </p>
          </div>

          {/* Filter Tabs */}
          <div className="flex flex-wrap gap-2 p-1.5 bg-white rounded-2xl border border-slate-200/80 shadow-xs">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setFilterType(cat)}
                className={`px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                  filterType === cat
                    ? 'bg-slate-950 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                {cat === 'All' ? 'All Estates' : cat}
              </button>
            ))}
          </div>
        </div>

        {/* Properties Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredProperties.slice(0, 6).map((property) => (
            <PropertyCard
              key={property.id}
              property={property}
              showAdminActions={false}
            />
          ))}
        </div>

        {/* View All CTA */}
        <div className="mt-14 text-center">
          <button
            onClick={() => {
              setActiveTab('properties');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white text-sm font-bold shadow-md hover:shadow-lg transition-all cursor-pointer group"
          >
            <span>Explore All {properties.length} Properties</span>
            <ArrowRight className="w-4 h-4 text-amber-400 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>
    </section>
  );
};
