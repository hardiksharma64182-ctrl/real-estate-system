import React from 'react';
import { useApp } from '../../context/AppContext';
import { formatCurrency, formatNumber } from '../../utils/formatters';
import { StatusBadge, TypeBadge } from '../common/Badge';
import { MapPin, Bed, Bath, Maximize2, Calendar, Eye, Edit2, Trash2 } from 'lucide-react';

export const PropertyCard = ({
  property,
  onEdit,
  onDelete,
  showAdminActions = true,
}) => {
  const { setSelectedProperty, setBookingProperty, currentUser } = useApp();

  const canManage =
    showAdminActions &&
    currentUser &&
    (currentUser.role === 'admin' ||
      (currentUser.role === 'agent' && property.agent_id === currentUser.id));

  return (
    <div className="group bg-white rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col overflow-hidden hover:-translate-y-1">
      {/* Property Image Container */}
      <div className="relative aspect-[16/10] overflow-hidden bg-slate-100">
        <img
          src={property.image}
          alt={property.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
          loading="lazy"
          onError={(e) => {
            e.target.src =
              'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1000&q=80';
          }}
        />

        {/* Gradient Overlay for Top Badges */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-black/30 pointer-events-none" />

        {/* Top Badges */}
        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5 z-10">
          <TypeBadge type={property.type} className="bg-white/95 backdrop-blur-xs font-semibold shadow-xs" />
          {property.featured && (
            <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-bold bg-amber-500 text-slate-950 shadow-xs">
              Featured
            </span>
          )}
        </div>

        <div className="absolute top-3 right-3 z-10">
          <StatusBadge status={property.availability} className="bg-white/95 backdrop-blur-xs font-semibold shadow-xs" />
        </div>

        {/* Price Tag in Bottom Left of Image */}
        <div className="absolute bottom-3 left-3 z-10">
          <span className="text-xl sm:text-2xl font-black text-white drop-shadow-md">
            {formatCurrency(property.price)}
          </span>
        </div>
      </div>

      {/* Property Details Body */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          {/* Location */}
          <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-1.5">
            <MapPin className="w-3.5 h-3.5 text-amber-600 shrink-0" />
            <span className="truncate">{property.location}</span>
          </div>

          {/* Property Name */}
          <h3
            onClick={() => setSelectedProperty(property)}
            className="text-base font-bold text-slate-900 group-hover:text-amber-700 transition-colors line-clamp-1 cursor-pointer"
            title={property.name}
          >
            {property.name}
          </h3>

          {/* Description Snippet */}
          <p className="mt-2 text-xs text-slate-500 line-clamp-2 leading-relaxed">
            {property.description || 'Exclusive luxury listing offering modern bespoke architecture and supreme comfort.'}
          </p>
        </div>

        <div>
          {/* Key Property Specs */}
          <div className="mt-4 pt-3.5 border-t border-slate-100 grid grid-cols-3 gap-2 text-slate-600 text-xs">
            <div className="flex items-center gap-1.5">
              <Bed className="w-4 h-4 text-slate-400" />
              <span>
                <strong className="text-slate-900">{property.bedrooms}</strong> {property.type === 'Commercial' ? 'Offices' : 'Beds'}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <Bath className="w-4 h-4 text-slate-400" />
              <span>
                <strong className="text-slate-900">{property.bathrooms}</strong> Baths
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <Maximize2 className="w-4 h-4 text-slate-400" />
              <span>
                <strong className="text-slate-900">{formatNumber(property.area_sqft)}</strong> sqft
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-4 pt-3.5 border-t border-slate-100 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 flex-1">
              <button
                type="button"
                onClick={() => setSelectedProperty(property)}
                className="flex-1 py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <Eye className="w-3.5 h-3.5 text-slate-600" />
                <span>Details</span>
              </button>

              <button
                type="button"
                onClick={() => setBookingProperty(property)}
                disabled={property.availability === 'Sold'}
                className={`flex-1 py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all shadow-xs cursor-pointer ${
                  property.availability === 'Sold'
                    ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                    : 'bg-slate-900 hover:bg-slate-800 text-white hover:text-amber-300'
                }`}
              >
                <Calendar className="w-3.5 h-3.5 text-amber-400" />
                <span>Book Tour</span>
              </button>
            </div>

            {/* Quick Admin Actions */}
            {canManage && (
              <div className="flex items-center gap-1 pl-1 border-l border-slate-100">
                {onEdit && (
                  <button
                    type="button"
                    onClick={() => onEdit(property)}
                    className="p-2 text-slate-500 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors cursor-pointer"
                    title="Edit Property"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                )}
                {onDelete && (
                  <button
                    type="button"
                    onClick={() => onDelete(property)}
                    className="p-2 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                    title="Delete Property"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
