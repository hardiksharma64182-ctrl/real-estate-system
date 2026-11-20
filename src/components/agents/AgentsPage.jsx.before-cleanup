import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { AgentFormModal } from './AgentFormModal';
import { ConfirmModal } from '../common/ConfirmModal';
import { formatCurrency } from '../../utils/formatters';
import {
  Users,
  Search,
  Plus,
  Phone,
  Mail,
  Award,
  Star,
  Building,
  Edit2,
  Trash2,
  Briefcase,
  ExternalLink,
  ShieldCheck,
} from 'lucide-react';

export const AgentsPage = () => {
  const { agents, properties, deleteAgent, setSelectedProperty } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [agentToEdit, setAgentToEdit] = useState(null);
  const [agentToDelete, setAgentToDelete] = useState(null);

  const filteredAgents = useMemo(() => {
    return agents.filter((agent) => {
      if (!searchTerm) return true;
      const term = searchTerm.toLowerCase();
      return (
        agent.name?.toLowerCase().includes(term) ||
        agent.email?.toLowerCase().includes(term) ||
        agent.specialty?.toLowerCase().includes(term) ||
        agent.experience?.toLowerCase().includes(term)
      );
    });
  }, [agents, searchTerm]);

  const getAssignedProperties = (agentId) => {
    return properties.filter((p) => p.agent_id === agentId);
  };

  const totalDeals = useMemo(() => {
    return agents.reduce((sum, a) => sum + (Number(a.deals_closed) || 0), 0);
  }, [agents]);

  const handleDeleteConfirm = async () => {
    if (agentToDelete) {
      await deleteAgent(agentToDelete.id);
      setAgentToDelete(null);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-10 sm:py-14">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-8 border-b border-slate-200">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs uppercase font-bold tracking-widest text-amber-600">
                Elite Advisory Network
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Agents Management
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Licensed luxury brokers and commercial real estate specialists representing our clients.
            </p>
          </div>

          <button
            onClick={() => {
              setAgentToEdit(null);
              setFormModalOpen(true);
            }}
            className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm shadow-md transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4 text-amber-400" />
            <span>Add New Agent</span>
          </button>
        </div>

        {/* Stats Row */}
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs">
            <span className="text-xs uppercase font-bold text-slate-400">Total Licensed Agents</span>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-slate-900">{agents.length}</span>
              <span className="text-xs font-semibold text-emerald-600">Active Brokers</span>
            </div>
          </div>

          <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs">
            <span className="text-xs uppercase font-bold text-slate-400">Total Deals Completed</span>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-amber-600">{totalDeals}</span>
              <span className="text-xs font-semibold text-slate-500">Transactions</span>
            </div>
          </div>

          <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs">
            <span className="text-xs uppercase font-bold text-slate-400">Average Client Rating</span>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-slate-900">4.9</span>
              <span className="text-xs font-semibold text-amber-600 flex items-center gap-1">
                <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" /> Top Rated
              </span>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="mt-8 bg-white rounded-3xl p-4 sm:p-5 border border-slate-200/80 shadow-xs">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search agent by name, specialty, email, or experience..."
              className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all"
            />
          </div>
        </div>

        {/* Agents Grid */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-8">
          {filteredAgents.map((agent) => {
            const assignedListings = getAssignedProperties(agent.id);

            return (
              <div
                key={agent.id}
                className="bg-white rounded-3xl border border-slate-200/80 shadow-xs hover:shadow-xl transition-all p-6 sm:p-8 flex flex-col justify-between"
              >
                <div>
                  {/* Top Profile Header */}
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="relative">
                        <img
                          src={agent.photo}
                          alt={agent.name}
                          className="w-18 h-18 rounded-2xl object-cover border-2 border-amber-400/50 shadow-md"
                        />
                        <span className="absolute -bottom-1.5 -right-1.5 p-1 rounded-full bg-slate-900 text-amber-400 border border-amber-400/50">
                          <ShieldCheck className="w-3.5 h-3.5" />
                        </span>
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-slate-900">{agent.name}</h3>
                        <p className="text-xs font-semibold text-amber-700">{agent.specialty}</p>
                        <div className="flex items-center gap-3 mt-1.5 text-xs text-slate-500">
                          <span className="flex items-center gap-1">
                            <Award className="w-3.5 h-3.5 text-slate-400" />
                            {agent.experience}
                          </span>
                          <span>•</span>
                          <span className="flex items-center gap-1 font-semibold text-slate-700">
                            <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                            {agent.rating || '4.9'}
                          </span>
                          <span>•</span>
                          <span className="text-slate-600 font-medium">
                            {agent.deals_closed || 30} Deals
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => {
                          setAgentToEdit(agent);
                          setFormModalOpen(true);
                        }}
                        className="p-2 text-slate-500 hover:text-amber-600 hover:bg-amber-50 rounded-xl transition-colors cursor-pointer"
                        title="Edit Agent"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setAgentToDelete(agent)}
                        className="p-2 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
                        title="Remove Agent"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Bio */}
                  {agent.bio && (
                    <p className="mt-4 text-xs text-slate-600 leading-relaxed italic bg-slate-50 p-3 rounded-2xl border border-slate-100">
                      "{agent.bio}"
                    </p>
                  )}

                  {/* Contact Info */}
                  <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    <a
                      href={`tel:${agent.phone}`}
                      className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 hover:bg-amber-50/50 border border-slate-100 text-slate-700 transition-colors"
                    >
                      <Phone className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                      <span className="truncate font-medium">{agent.phone}</span>
                    </a>
                    <a
                      href={`mailto:${agent.email}`}
                      className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 hover:bg-amber-50/50 border border-slate-100 text-slate-700 transition-colors"
                    >
                      <Mail className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                      <span className="truncate font-medium">{agent.email}</span>
                    </a>
                  </div>
                </div>

                {/* Assigned Properties */}
                <div className="mt-6 pt-5 border-t border-slate-100">
                  <div className="flex items-center justify-between text-xs mb-3">
                    <span className="font-bold text-slate-700 flex items-center gap-1.5">
                      <Building className="w-3.5 h-3.5 text-amber-600" />
                      Assigned Listings ({assignedListings.length})
                    </span>
                  </div>

                  {assignedListings.length === 0 ? (
                    <p className="text-xs text-slate-400 italic">No properties currently assigned to this broker.</p>
                  ) : (
                    <div className="space-y-2">
                      {assignedListings.map((prop) => (
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
                              <p className="text-[10px] text-slate-500 truncate">
                                {prop.location} • {formatCurrency(prop.price)}
                              </p>
                            </div>
                          </div>
                          <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-amber-600 shrink-0 ml-2" />
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

      {/* Agent Modal */}
      <AgentFormModal
        isOpen={formModalOpen}
        onClose={() => setFormModalOpen(false)}
        initialData={agentToEdit}
      />

      {/* Delete Confirmation */}
      <ConfirmModal
        isOpen={Boolean(agentToDelete)}
        title="Remove Broker"
        message={`Are you sure you want to remove agent "${agentToDelete?.name}"? Assigned listings will remain active and can be assigned to another broker.`}
        confirmText="Yes, Remove Agent"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setAgentToDelete(null)}
      />
    </div>
  );
};
