import React from 'react';
import { useApp } from '../../context/AppContext';
import { formatCurrency, formatNumber } from '../../utils/formatters';
import { StatusBadge, TypeBadge } from '../common/Badge';
import {
  X,
  MapPin,
  Bed,
  Bath,
  Maximize2,
  Calendar,
  Phone,
  Mail,
  User,
  Shield,
  Star,
  CheckCircle,
  Building,
  Edit2,
  Trash2,
} from 'lucide-react';

export const PropertyDetailsModal = ({ onEdit, onDelete }) => {
  const {
    selectedProperty,
    setSelectedProperty,
    setBookingProperty,
    owners,
    agents,
    currentUser,
  } = useApp();

  if (!selectedProperty) return null;

  const property = selectedProperty;
  const owner = owners.find((o) => o.id === property.owner_id);
  const agent = agents.find((a) => a.id === property.agent_id);

  const canManage =
    currentUser &&
    (currentUser.role === 'admin' ||
      (currentUser.role === 'agent' && property.agent_id === currentUser.id));

  const handleBookTour = () => {
    setSelectedProperty(null);
    setBookingProperty(property);
  };

  const amenitiesList = Array.isArray(property.amenities)
    ? property.amenities
    : typeof property.amenities === 'string'
    ? property.amenities.split(',').map((s) => s.trim())
    : [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl my-8 bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden">
        {/* Close Button */}
        <button
          onClick={() => setSelectedProperty(null)}
          className="absolute top-4 right-4 z-20 p-2.5 rounded-full bg-slate-950/60 hover:bg-slate-950 text-white backdrop-blur-md transition-all cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Hero Photo Banner */}
        <div className="relative aspect-[21/9] sm:aspect-[2/1] w-full bg-slate-900 overflow-hidden">
          <img
            src={property.image}
            alt={property.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/20 to-transparent" />

          {/* Badges on Top */}
          <div className="absolute top-4 left-4 flex gap-2">
            <TypeBadge type={property.type} className="bg-white/95 font-bold shadow-md" />
            <StatusBadge status={property.availability} className="bg-white/95 font-bold shadow-md" />
          </div>

          {/* Title & Price on Bottom */}
          <div className="absolute bottom-6 left-6 right-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4 text-white">
            <div>
              <div className="flex items-center gap-1.5 text-xs text-amber-300 font-semibold mb-1">
                <MapPin className="w-4 h-4 text-amber-400 shrink-0" />
                <span>{property.location}</span>
                {property.address && <span className="opacity-80">({property.address})</span>}
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                {property.name}
              </h2>
            </div>
            <div className="sm:text-right shrink-0">
              <span className="text-xs uppercase font-bold tracking-wider text-slate-300 block">
                Listing Price
              </span>
              <span className="text-3xl sm:text-4xl font-black text-amber-400 drop-shadow-md">
                {formatCurrency(property.price)}
              </span>
            </div>
          </div>
        </div>

        {/* Modal Content Body */}
        <div className="p-6 sm:p-8 space-y-8 max-h-[60vh] overflow-y-auto">
          {/* Key Specifications Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-5 rounded-2xl bg-slate-50 border border-slate-200/80">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center shrink-0">
                <Bed className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-slate-500 font-medium">Bedrooms</p>
                <p className="text-base font-bold text-slate-900">{property.bedrooms} Suites</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center shrink-0">
                <Bath className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-slate-500 font-medium">Bathrooms</p>
                <p className="text-base font-bold text-slate-900">{property.bathrooms} Baths</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center shrink-0">
                <Maximize2 className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-slate-500 font-medium">Total Area</p>
                <p className="text-base font-bold text-slate-900">{formatNumber(property.area_sqft)} sq. ft.</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center shrink-0">
                <Building className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-slate-500 font-medium">Year Built</p>
                <p className="text-base font-bold text-slate-900">{property.year_built || '2024'}</p>
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 mb-2">
              Property Description & Architectural Highlights
            </h3>
            <p className="text-sm text-slate-700 leading-relaxed">
              {property.description}
            </p>
          </div>

          {/* Amenities & Features */}
          {amenitiesList.length > 0 && (
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 mb-3">
                Included Amenities & Premium Features
              </h3>
              <div className="flex flex-wrap gap-2">
                {amenitiesList.map((item, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 text-slate-800 text-xs font-semibold"
                  >
                    <CheckCircle className="w-3.5 h-3.5 text-amber-600" />
                    <span>{item}</span>
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Owner & Agent Representation Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
            {/* Owner Box */}
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
                <User className="w-4 h-4 text-amber-600" />
                <span>Verified Property Owner</span>
              </div>
              {owner ? (
                <div>
                  <h4 className="text-sm font-bold text-slate-900">{owner.name}</h4>
                  <p className="text-xs text-slate-500 mt-0.5">{owner.address}</p>
                  <div className="mt-3 space-y-1.5 text-xs text-slate-600">
                    <p className="flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5 text-slate-400" />
                      <a href={`tel:${owner.phone}`} className="hover:text-amber-600 transition-colors font-medium">
                        {owner.phone}
                      </a>
                    </p>
                    <p className="flex items-center gap-2">
                      <Mail className="w-3.5 h-3.5 text-slate-400" />
                      <a href={`mailto:${owner.email}`} className="hover:text-amber-600 transition-colors font-medium">
                        {owner.email}
                      </a>
                    </p>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-slate-400">Direct Institutional Ownership</p>
              )}
            </div>

            {/* Agent Box */}
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
                <Shield className="w-4 h-4 text-amber-600" />
                <span>Dedicated Listing Broker</span>
              </div>
              {agent ? (
                <div className="flex items-start gap-3.5">
                  <img
                    src={agent.photo}
                    alt={agent.name}
                    className="w-12 h-12 rounded-xl object-cover border border-amber-400/50 shrink-0"
                  />
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">{agent.name}</h4>
                    <p className="text-xs text-amber-700 font-semibold">{agent.specialty}</p>
                    <div className="mt-2 space-y-1 text-xs text-slate-600">
                      <p className="flex items-center gap-1.5">
                        <Phone className="w-3 h-3 text-slate-400" />
                        <span>{agent.phone}</span>
                      </p>
                      <p className="flex items-center gap-1.5">
                        <Mail className="w-3 h-3 text-slate-400" />
                        <span>{agent.email}</span>
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-slate-400">Concierge Desk Agent</p>
              )}
            </div>
          </div>
        </div>

        {/* Modal Actions Footer */}
        <div className="p-6 bg-slate-50 border-t border-slate-200/80 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            {canManage && (
              <>
                <button
                  type="button"
                  onClick={() => {
                    const toEdit = selectedProperty;
                    setSelectedProperty(null);
                    if (onEdit) onEdit(toEdit);
                  }}
                  className="px-4 py-2 text-xs font-semibold rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Edit2 className="w-3.5 h-3.5 text-slate-500" />
                  <span>Edit Property</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const toDelete = selectedProperty;
                    setSelectedProperty(null);
                    if (onDelete) onDelete(toDelete);
                  }}
                  className="px-4 py-2 text-xs font-semibold rounded-xl bg-rose-50 border border-rose-200 text-rose-700 hover:bg-rose-100 flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete</span>
                </button>
              </>
            )}
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              type="button"
              onClick={() => setSelectedProperty(null)}
              className="px-5 py-2.5 text-sm font-semibold text-slate-600 hover:text-slate-900 rounded-xl transition-colors cursor-pointer"
            >
              Close
            </button>
            <button
              type="button"
              onClick={handleBookTour}
              disabled={property.availability === 'Sold'}
              className={`flex-1 sm:flex-initial px-6 py-2.5 text-sm font-bold rounded-xl flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer ${
                property.availability === 'Sold'
                  ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
                  : 'bg-slate-900 hover:bg-slate-800 text-amber-400'
              }`}
            >
              <Calendar className="w-4 h-4 text-amber-400" />
              <span>Schedule Private Tour</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
