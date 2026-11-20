import React from 'react';
import { useApp } from '../../context/AppContext';
import { ShieldCheck, Award, Clock, Sparkles, CheckCircle2, ArrowRight } from 'lucide-react';

export const AboutSection = () => {
  const { setActiveTab } = useApp();

  const values = [
    {
      title: '100% Verified Ownership',
      desc: 'Every property in our portfolio is thoroughly vetted with certified title deeds and authenticated property owners.',
    },
    {
      title: 'Dedicated Elite Brokers',
      desc: 'Direct representation by top-1% licensed luxury realtors and commercial advisors with deep local expertise.',
    },
    {
      title: 'Seamless Tour Scheduling',
      desc: 'Instant booking requests with flexible time slots, live status tracking, and private VIP walkthroughs.',
    },
    {
      title: 'Secure Full-Lifecycle Platform',
      desc: 'From initial search to tenant screening, owner management, and closing coordination via our centralized system.',
    },
  ];

  return (
    <section className="py-24 bg-slate-900 text-white overflow-hidden relative">
      {/* Background ambient lighting */}
      <div className="absolute top-0 right-1/4 w-96 h-96 rounded-full bg-amber-500/10 blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Left Column: Image Collage */}
          <div className="relative">
            <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-slate-800 aspect-[4/3]">
              <img
                src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80"
                alt="Architectural Masterpiece"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent" />
            </div>

            {/* Floating Experience Badge */}
            <div className="absolute -bottom-8 -right-4 sm:right-6 bg-slate-950/95 border border-amber-500/30 backdrop-blur-md p-5 rounded-2xl shadow-2xl max-w-xs">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
                  <Award className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-2xl font-black text-white">15+ Years</div>
                  <div className="text-xs text-slate-400">Industry Distinction</div>
                </div>
              </div>
              <p className="mt-2 text-xs text-slate-300">
                Pioneering the modern standard of high-touch digital real estate management.
              </p>
            </div>
          </div>

          {/* Right Column: Narrative Content */}
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>About LuxeEstate</span>
            </div>

            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white leading-tight">
              Redefining Luxury & Commercial <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-200 to-amber-500">
                Property Management.
              </span>
            </h2>

            <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
              Founded on the belief that acquiring and managing world-class real estate should be transparent, swift, and inspiring. We unify verified property owners, premier broker networks, and high-net-worth buyers into a single cohesive platform.
            </p>

            {/* Four Pillars */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
              {values.map((v) => (
                <div
                  key={v.title}
                  className="p-4 rounded-2xl bg-slate-800/50 border border-slate-700/60 hover:border-amber-500/40 transition-colors"
                >
                  <div className="flex items-center gap-2 mb-1.5">
                    <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
                    <h4 className="text-sm font-bold text-white">{v.title}</h4>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">{v.desc}</p>
                </div>
              ))}
            </div>

            <div className="pt-4 flex items-center gap-4">
              <button
                onClick={() => {
                  setActiveTab('agents');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-sm font-bold shadow-md transition-all flex items-center gap-2 cursor-pointer"
              >
                <span>Meet Our Licensed Agents</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => {
                  setActiveTab('owners');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="px-6 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-semibold transition-all cursor-pointer"
              >
                Owner Portal
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
