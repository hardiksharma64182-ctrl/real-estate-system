import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  Building2,
  CalendarCheck,
  TrendingUp,
  Key,
  Shield,
  FileCheck2,
  ArrowRight,
} from 'lucide-react';

export const ServicesSection = () => {
  const { setActiveTab } = useApp();

  const services = [
    {
      icon: Building2,
      title: 'Property Sales & Acquisitions',
      desc: 'Full-service representation for purchasing or divesting trophy residential estates, waterfront compounds, and penthouses.',
      linkText: 'Browse Estates',
      targetTab: 'properties',
    },
    {
      icon: Key,
      title: 'Owner Asset Management',
      desc: 'End-to-end management for property owners: tenant verification, asset maintenance, lease renewals, and financial yield tracking.',
      linkText: 'View Owner Hub',
      targetTab: 'owners',
    },
    {
      icon: CalendarCheck,
      title: 'Private Tour Scheduling',
      desc: 'Seamless booking workflow allowing prospective buyers to inspect properties with dedicated licensed agents.',
      linkText: 'Request a Tour',
      targetTab: 'bookings',
    },
    {
      icon: TrendingUp,
      title: 'Valuation & Advisory',
      desc: 'Institutional-grade real estate analytics, comparative market studies, and capitalization rate forecasting.',
      linkText: 'Explore Insights',
      targetTab: 'admin',
    },
    {
      icon: Shield,
      title: 'Agent Network Representation',
      desc: 'Direct synergy between client inquiries and specialized neighborhood brokers with proven track records.',
      linkText: 'Meet The Team',
      targetTab: 'agents',
    },
    {
      icon: FileCheck2,
      title: 'Commercial Corporate Hubs',
      desc: 'Turnkey leasing and purchasing of Class-A tech headquarters, corporate campuses, and creative open studios.',
      linkText: 'Commercial Listings',
      targetTab: 'properties',
    },
  ];

  return (
    <section className="py-20 bg-slate-50 border-b border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-xs font-bold uppercase tracking-wider text-amber-600 block mb-2">
            Comprehensive Solutions
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Our Premium Services
          </h2>
          <p className="mt-3 text-sm text-slate-600">
            Tailored solutions designed for investors, property owners, corporate clients, and homebuyers requiring excellence at every step.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((svc) => {
            const Icon = svc.icon;
            return (
              <div
                key={svc.title}
                className="group p-8 rounded-3xl bg-white border border-slate-200/80 shadow-xs hover:shadow-xl transition-all duration-300 hover:-translate-y-1 flex flex-col justify-between"
              >
                <div>
                  <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-600 flex items-center justify-center mb-6 group-hover:bg-slate-900 group-hover:text-amber-400 transition-colors">
                    <Icon className="w-7 h-7" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 mb-2.5">{svc.title}</h3>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">{svc.desc}</p>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100">
                  <button
                    onClick={() => {
                      setActiveTab(svc.targetTab);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-900 group-hover:text-amber-600 transition-colors cursor-pointer"
                  >
                    <span>{svc.linkText}</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
