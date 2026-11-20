import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { OwnerFormModal } from './OwnerFormModal';
import { ConfirmModal } from '../common/ConfirmModal';
import { formatCurrency } from '../../utils/formatters';
import {
  Users,
  Search,
  Plus,
  Phone,
  Mail,
  MapPin,
  Building,
  Edit2,
  Trash2,
  ExternalLink,
  ShieldCheck,
} from 'lucide-react';

export const OwnersPage = () => {
  const { owners, properties, deleteOwner, setSelectedProperty } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [ownerToEdit, setOwnerToEdit] = useState(null);
  const [ownerToDelete, setOwnerToDelete] = useState(null);

  // Filter owners
  const filteredOwners = useMemo(() => {
    return owners.filter((owner) => {
      if (!searchTerm) return true;
      const term = searchTerm.toLowerCase();
      return (
        owner.name?.toLowerCase().includes(term) ||
        owner.email?.toLowerCase().includes(term) ||
        owner.phone?.toLowerCase().includes(term) ||
        owner.address?.toLowerCase().includes(term)
      );
    });
  }, [owners, searchTerm]);

  // Derive owned properties for an owner
  const getOwnedProperties = (ownerId) => {
    return properties.filter((p) => p.owner_id === ownerId);
  };

  const totalPortfolioValue = useMemo(() => {
    return properties.reduce((sum, p) => sum + (Number(p.price) || 0), 0);
  }, [properties]);

  const handleDeleteConfirm = async () => {
    if (ownerToDelete) {
      await deleteOwner(ownerToDelete.id);
      setOwnerToDelete(null);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-10 sm:py-14">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-8 border-b border-slate-200">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs uppercase font-bold tracking-widest text-amber-600">
                Asset Stewardship
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Owners Management
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Manage verified title holders, private investment entities, and their active asset portfolios.
            </p>
          </div>

          <button
            onClick={() => {
              setOwnerToEdit(null);
              setFormModalOpen(true);
            }}
            className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm shadow-md transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4 text-amber-400" />
            <span>Add Property Owner</span>
          </button>
        </div>

        {/* Stats Row */}
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs">
            <span className="text-xs uppercase font-bold text-slate-400">Total Registered Owners</span>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-slate-900">{owners.length}</span>
              <span className="text-xs font-semibold text-emerald-600">Active Partners</span>
            </div>
          </div>

          <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs">
            <span className="text-xs uppercase font-bold text-slate-400">Total Owned Estates</span>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-amber-600">{properties.length}</span>
              <span className="text-xs font-semibold text-slate-500">Under Contract</span>
            </div>
          </div>

          <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs">
            <span className="text-xs uppercase font-bold text-slate-400">Combined Portfolio Value</span>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-slate-900">{formatCurrency(totalPortfolioValue)}</span>
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="mt-8 bg-white rounded-3xl p-4 sm:p-5 border border-slate-200/80 shadow-xs">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search owner by legal name, email, phone, or address..."
              className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all"
            />
          </div>
        </div>

        {/* Owners Cards Grid */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredOwners.map((owner) => {
            const ownedListings = getOwnedProperties(owner.id);
            const totalValue = ownedListings.reduce((sum, p) => sum + (Number(p.price) || 0), 0);

            return (
              <div
                key={owner.id}
                className="bg-white rounded-3xl border border-slate-200/80 shadow-xs hover:shadow-lg transition-all p-6 sm:p-7 flex flex-col justify-between"
              >
                <div>
                  {/* Top Bar */}
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3.5">
                      <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-600 border border-amber-500/20 flex items-center justify-center font-bold text-lg">
                        {owner.name.charAt(0)}
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-slate-900 flex items-center gap-1.5">
                          {owner.name}
                          <ShieldCheck className="w-4 h-4 text-emerald-500" />
                        </h3>
                        <span className="text-xs text-slate-400 font-mono">ID: {owner.id}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => {
                          setOwnerToEdit(owner);
                          setFormModalOpen(true);
                        }}
                        className="p-2 text-slate-500 hover:text-amber-600 hover:bg-amber-50 rounded-xl transition-colors cursor-pointer"
                        title="Edit Owner"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setOwnerToDelete(owner)}
                        className="p-2 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
                        title="Delete Owner"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Contact Info */}
                  <div className="mt-5 space-y-2 text-xs text-slate-600 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                    <div className="flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                      <a href={`tel:${owner.phone}`} className="hover:text-amber-600 font-medium">
                        {owner.phone}
                      </a>
                    </div>
                    <div className="flex items-center gap-2">
                      <Mail className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                      <a href={`mailto:${owner.email}`} className="hover:text-amber-600 font-medium truncate">
                        {owner.email}
                      </a>
                    </div>
                    {owner.address && (
                      <div className="flex items-start gap-2">
                        <MapPin className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                        <span className="truncate">{owner.address}</span>
                      </div>
                    )}
                  </div>

                  {owner.notes && (
                    <p className="mt-3 text-xs text-slate-500 italic bg-amber-50/40 p-2.5 rounded-xl border border-amber-200/40">
                      "{owner.notes}"
                    </p>
                  )}
                </div>

                {/* Owned Properties List */}
                <div className="mt-6 pt-5 border-t border-slate-100">
                  <div className="flex items-center justify-between text-xs mb-3">
                    <span className="font-bold text-slate-700 flex items-center gap-1.5">
                      <Building className="w-3.5 h-3.5 text-amber-600" />
                      Owned Assets ({ownedListings.length})
                    </span>
                    <span className="font-bold text-amber-700">
                      Value: {formatCurrency(totalValue)}
                    </span>
                  </div>

                  {ownedListings.length === 0 ? (
                    <p className="text-xs text-slate-400 italic">No active properties currently registered.</p>
                  ) : (
                    <div className="space-y-2">
                      {ownedListings.map((prop) => (
                        <div
                          key={prop.id}
                          onClick={() => setSelectedProperty(prop)}
                          className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 hover:bg-amber-50/60 border border-slate-200/60 hover:border-amber-300 transition-all cursor-pointer group"
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <img
                              src={prop.image}
                              alt={prop.name}
                              className="w-10 h-10 rounded-lg object-cover shrink-0"
                            />
                            <div className="min-w-0">
                              <p className="text-xs font-bold text-slate-900 group-hover:text-amber-700 truncate">
                                {prop.name}
                              </p>
                              <p className="text-[10px] text-slate-500 truncate">{prop.location}</p>
                            </div>
                          </div>
                          <div className="text-right shrink-0 pl-2">
                            <span className="text-xs font-bold text-slate-900">
                              {formatCurrency(prop.price)}
                            </span>
                            <ExternalLink className="w-3 h-3 text-slate-400 group-hover:text-amber-600 ml-auto mt-0.5" />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Owner Form Modal */}
      <OwnerFormModal
        isOpen={formModalOpen}
        onClose={() => setFormModalOpen(false)}
        initialData={ownerToEdit}
      />

      {/* Delete Confirmation */}
      <ConfirmModal
        isOpen={Boolean(ownerToDelete)}
        title="Delete Property Owner"
        message={`Are you sure you want to remove owner record for "${ownerToDelete?.name}"? Assigned properties will be unlinked.`}
        confirmText="Yes, Delete Owner"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setOwnerToDelete(null)}
      />
    </div>
  );
};
