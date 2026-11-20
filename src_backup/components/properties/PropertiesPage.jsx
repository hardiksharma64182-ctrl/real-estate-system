import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { PropertyCard } from './PropertyCard';
import { PropertyFormModal } from './PropertyFormModal';
import { PropertyDetailsModal } from './PropertyDetailsModal';
import { ConfirmModal } from '../common/ConfirmModal';
import { formatCurrency, formatNumber } from '../../utils/formatters';
import { StatusBadge, TypeBadge } from '../common/Badge';
import {
  Search,
  Filter,
  Plus,
  LayoutGrid,
  List,
  RotateCcw,
  Building,
  MapPin,
  Bed,
  Bath,
  Maximize2,
  Calendar,
  Eye,
  Edit2,
  Trash2,
} from 'lucide-react';

export const PropertiesPage = () => {
  const {
    properties,
    deleteProperty,
    searchFilters,
    setSearchFilters,
    setSelectedProperty,
    setBookingProperty,
    currentUser,
  } = useApp();

  // Local state for UI controls
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'table'
  const [searchTerm, setSearchTerm] = useState(searchFilters.keyword || '');
  const [selectedLocation, setSelectedLocation] = useState(searchFilters.location || '');
  const [selectedType, setSelectedType] = useState(searchFilters.type || '');
  const [selectedAvailability, setSelectedAvailability] = useState('');
  const [selectedBudget, setSelectedBudget] = useState(searchFilters.budget || '');
  const [minBeds, setMinBeds] = useState('');
  const [sortBy, setSortBy] = useState('newest'); // 'newest', 'price-asc', 'price-desc', 'area-desc'

  // Modals
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [propertyToEdit, setPropertyToEdit] = useState(null);
  const [propertyToDelete, setPropertyToDelete] = useState(null);

  // Sync external search filter changes
  React.useEffect(() => {
    if (searchFilters.location) setSelectedLocation(searchFilters.location);
    if (searchFilters.type) setSelectedType(searchFilters.type);
    if (searchFilters.budget) setSelectedBudget(searchFilters.budget);
  }, [searchFilters]);

  // Extract unique locations from data
  const locationsList = useMemo(() => {
    const set = new Set();
    properties.forEach((p) => {
      if (p.location) set.add(p.location.split(',')[0].trim());
    });
    return Array.from(set);
  }, [properties]);

  // Filtered & Sorted Properties
  const filteredProperties = useMemo(() => {
    return properties
      .filter((p) => {
        // Search term (name, location, address, description)
        if (searchTerm) {
          const term = searchTerm.toLowerCase();
          const matchName = p.name?.toLowerCase().includes(term);
          const matchLoc = p.location?.toLowerCase().includes(term);
          const matchAddr = p.address?.toLowerCase().includes(term);
          const matchDesc = p.description?.toLowerCase().includes(term);
          if (!matchName && !matchLoc && !matchAddr && !matchDesc) return false;
        }

        // Location
        if (selectedLocation) {
          if (!p.location.toLowerCase().includes(selectedLocation.toLowerCase())) return false;
        }

        // Type
        if (selectedType && selectedType !== 'All') {
          if (p.type.toLowerCase() !== selectedType.toLowerCase()) return false;
        }

        // Availability
        if (selectedAvailability && selectedAvailability !== 'All') {
          if (p.availability.toLowerCase() !== selectedAvailability.toLowerCase()) return false;
        }

        // Bedrooms
        if (minBeds) {
          if (p.bedrooms < Number(minBeds)) return false;
        }

        // Budget
        if (selectedBudget) {
          if (selectedBudget === 'under2m' && p.price >= 2000000) return false;
          if (selectedBudget === '2m-4m' && (p.price < 2000000 || p.price > 4000000)) return false;
          if (selectedBudget === '4m-8m' && (p.price < 4000000 || p.price > 8000000)) return false;
          if (selectedBudget === 'over8m' && p.price < 8000000) return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'price-asc') return a.price - b.price;
        if (sortBy === 'price-desc') return b.price - a.price;
        if (sortBy === 'area-desc') return b.area_sqft - a.area_sqft;
        // Default newest
        return new Date(b.created_at || 0) - new Date(a.created_at || 0);
      });
  }, [
    properties,
    searchTerm,
    selectedLocation,
    selectedType,
    selectedAvailability,
    selectedBudget,
    minBeds,
    sortBy,
  ]);

  const handleResetFilters = () => {
    setSearchTerm('');
    setSelectedLocation('');
    setSelectedType('');
    setSelectedAvailability('');
    setSelectedBudget('');
    setMinBeds('');
    setSortBy('newest');
    setSearchFilters({ location: '', type: '', budget: '', keyword: '' });
  };

  const handleOpenAddModal = () => {
    setPropertyToEdit(null);
    setFormModalOpen(true);
  };

  const handleOpenEditModal = (prop) => {
    setPropertyToEdit(prop);
    setFormModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (propertyToDelete) {
      await deleteProperty(propertyToDelete.id);
      setPropertyToDelete(null);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-10 sm:py-14">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top Header & Add Button */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-8 border-b border-slate-200">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs uppercase font-bold tracking-widest text-amber-600">
                Portfolio Catalog
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Properties Management
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Showing {filteredProperties.length} of {properties.length} total listings in real-time.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleOpenAddModal}
              className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm shadow-md hover:shadow-lg transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4 text-amber-400" />
              <span>Add Property</span>
            </button>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="mt-8 bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/80 shadow-xs space-y-4">
          {/* Top Search Input & View Toggle */}
          <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by property title, address, or architecture keyword..."
                className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all"
              />
            </div>

            <div className="flex items-center gap-2 w-full md:w-auto justify-end">
              {/* Sort by dropdown */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3.5 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700 focus:outline-none cursor-pointer"
              >
                <option value="newest">Sort: Newest First</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="area-desc">Area: Largest Sq. Ft.</option>
              </select>

              {/* View Toggle */}
              <div className="flex bg-slate-100 p-1 rounded-2xl border border-slate-200">
                <button
                  type="button"
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-xl transition-all cursor-pointer ${
                    viewMode === 'grid' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'
                  }`}
                  title="Grid View"
                >
                  <LayoutGrid className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('table')}
                  className={`p-2 rounded-xl transition-all cursor-pointer ${
                    viewMode === 'table' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'
                  }`}
                  title="List/Table View"
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Detailed Filters Row */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-3 border-t border-slate-100">
            {/* Location Filter */}
            <div>
              <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">City / Region</label>
              <select
                value={selectedLocation}
                onChange={(e) => setSelectedLocation(e.target.value)}
                className="w-full px-3 py-2 text-xs font-semibold rounded-xl bg-slate-50 border border-slate-200 text-slate-700 focus:outline-none cursor-pointer"
              >
                <option value="">All Locations</option>
                {locationsList.map((loc) => (
                  <option key={loc} value={loc}>
                    {loc}
                  </option>
                ))}
              </select>
            </div>

            {/* Type Filter */}
            <div>
              <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Property Type</label>
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="w-full px-3 py-2 text-xs font-semibold rounded-xl bg-slate-50 border border-slate-200 text-slate-700 focus:outline-none cursor-pointer"
              >
                <option value="">All Types</option>
                <option value="Villa">Villa</option>
                <option value="Apartment">Apartment</option>
                <option value="House">House</option>
                <option value="Commercial">Commercial</option>
              </select>
            </div>

            {/* Availability Filter */}
            <div>
              <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Availability</label>
              <select
                value={selectedAvailability}
                onChange={(e) => setSelectedAvailability(e.target.value)}
                className="w-full px-3 py-2 text-xs font-semibold rounded-xl bg-slate-50 border border-slate-200 text-slate-700 focus:outline-none cursor-pointer"
              >
                <option value="">All Statuses</option>
                <option value="Available">Available</option>
                <option value="Under Offer">Under Offer</option>
                <option value="Sold">Sold</option>
                <option value="Rented">Rented</option>
              </select>
            </div>

            {/* Budget Filter */}
            <div>
              <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Budget</label>
              <select
                value={selectedBudget}
                onChange={(e) => setSelectedBudget(e.target.value)}
                className="w-full px-3 py-2 text-xs font-semibold rounded-xl bg-slate-50 border border-slate-200 text-slate-700 focus:outline-none cursor-pointer"
              >
                <option value="">Any Budget</option>
                <option value="under2m">Under $2M</option>
                <option value="2m-4m">$2M - $4M</option>
                <option value="4m-8m">$4M - $8M</option>
                <option value="over8m">$8M+</option>
              </select>
            </div>

            {/* Bedrooms & Reset Filter */}
            <div className="col-span-2 sm:col-span-1 flex items-end gap-2">
              <div className="flex-1">
                <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Min Beds</label>
                <select
                  value={minBeds}
                  onChange={(e) => setMinBeds(e.target.value)}
                  className="w-full px-3 py-2 text-xs font-semibold rounded-xl bg-slate-50 border border-slate-200 text-slate-700 focus:outline-none cursor-pointer"
                >
                  <option value="">Any</option>
                  <option value="2">2+ Beds</option>
                  <option value="3">3+ Beds</option>
                  <option value="4">4+ Beds</option>
                  <option value="5">5+ Beds</option>
                </select>
              </div>

              <button
                type="button"
                onClick={handleResetFilters}
                className="p-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 text-slate-600 transition-colors cursor-pointer"
                title="Reset all filters"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Results Container */}
        <div className="mt-8">
          {filteredProperties.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-3xl border border-slate-200 p-8">
              <Building className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h3 className="text-lg font-bold text-slate-900">No properties match your filters</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                Try widening your price range, clearing location restrictions, or resetting filters.
              </p>
              <button
                onClick={handleResetFilters}
                className="mt-4 px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-semibold cursor-pointer"
              >
                Reset Filters
              </button>
            </div>
          ) : viewMode === 'grid' ? (
            /* Grid View */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredProperties.map((prop) => (
                <PropertyCard
                  key={prop.id}
                  property={prop}
                  onEdit={handleOpenEditModal}
                  onDelete={(p) => setPropertyToDelete(p)}
                />
              ))}
            </div>
          ) : (
            /* Table / List View */
            <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] font-bold tracking-wider border-b border-slate-200">
                    <tr>
                      <th className="px-6 py-4">Property</th>
                      <th className="px-6 py-4">Location</th>
                      <th className="px-6 py-4">Type</th>
                      <th className="px-6 py-4">Specs</th>
                      <th className="px-6 py-4">Price</th>
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredProperties.map((prop) => (
                      <tr key={prop.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <img
                              src={prop.image}
                              alt={prop.name}
                              className="w-14 h-12 rounded-xl object-cover shrink-0 border border-slate-200"
                            />
                            <div>
                              <p
                                onClick={() => setSelectedProperty(prop)}
                                className="font-bold text-slate-900 hover:text-amber-600 cursor-pointer line-clamp-1"
                              >
                                {prop.name}
                              </p>
                              <span className="text-[11px] text-slate-400 font-mono">
                                ID: {prop.id}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-xs text-slate-600 font-medium whitespace-nowrap">
                          {prop.location}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <TypeBadge type={prop.type} />
                        </td>
                        <td className="px-6 py-4 text-xs text-slate-600 whitespace-nowrap">
                          {prop.bedrooms} bds • {prop.bathrooms} ba • {formatNumber(prop.area_sqft)} sqft
                        </td>
                        <td className="px-6 py-4 font-bold text-slate-900 whitespace-nowrap">
                          {formatCurrency(prop.price)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <StatusBadge status={prop.availability} />
                        </td>
                        <td className="px-6 py-4 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => setSelectedProperty(prop)}
                              className="p-1.5 text-slate-500 hover:text-slate-900 rounded-lg hover:bg-slate-100"
                              title="View Details"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => setBookingProperty(prop)}
                              disabled={prop.availability === 'Sold'}
                              className="p-1.5 text-amber-600 hover:text-amber-700 rounded-lg hover:bg-amber-50 disabled:opacity-40"
                              title="Book Tour"
                            >
                              <Calendar className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleOpenEditModal(prop)}
                              className="p-1.5 text-slate-500 hover:text-amber-600 rounded-lg hover:bg-amber-50"
                              title="Edit"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => setPropertyToDelete(prop)}
                              className="p-1.5 text-slate-500 hover:text-rose-600 rounded-lg hover:bg-rose-50"
                              title="Delete"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Property Add/Edit Modal */}
      <PropertyFormModal
        isOpen={formModalOpen}
        onClose={() => setFormModalOpen(false)}
        initialData={propertyToEdit}
      />

      {/* Property Details Modal */}
      <PropertyDetailsModal
        onEdit={handleOpenEditModal}
        onDelete={(p) => setPropertyToDelete(p)}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={Boolean(propertyToDelete)}
        title="Delete Property Listing"
        message={`Are you sure you want to remove "${propertyToDelete?.name}"? This action removes the listing from the database.`}
        confirmText="Yes, Delete Property"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setPropertyToDelete(null)}
      />
    </div>
  );
};
