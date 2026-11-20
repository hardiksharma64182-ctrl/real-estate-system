import React from 'react';
import { Star, Quote, CheckCircle2 } from 'lucide-react';

const TESTIMONIALS = [
  {
    name: 'Jonathan Reed',
    role: 'Managing Partner, TechCapital Global',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
    property: 'Acquired Miami Waterfront Villa',
    quote:
      'LuxeEstate completely streamlined our private estate acquisition. Within 48 hours of requesting a tour, Sophia arranged a private sunset walkthrough and coordinated the entire closing flawlessly.',
    rating: 5,
  },
  {
    name: 'Dr. Sarah Jenkins',
    role: 'Chief Medical Officer & Investor',
    image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80',
    property: 'Purchased Crown Tower Penthouse',
    quote:
      'The level of discretion, professionalism, and property verification was second to none. The booking portal made selecting visit times effortless, and the agent Alexander knew every detail of the building.',
    rating: 5,
  },
  {
    name: 'David Chen',
    role: 'Founder, Chen Properties Group',
    image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80',
    property: 'Multiple Austin Portfolio Listings',
    quote:
      'As an owner of multiple multi-million dollar modern houses, the owner portal gives me real-time visibility into scheduled viewings, active offers, and agent performance. Exceptional technology.',
    rating: 5,
  },
];

export const TestimonialsSection = () => {
  return (
    <section className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-xs font-bold uppercase tracking-wider text-amber-600 block mb-2">
            Client Experiences
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Trusted by Discerning Buyers & Owners
          </h2>
          <p className="mt-3 text-sm text-slate-600">
            Read firsthand accounts from prominent investors, corporate leaders, and homeowners who found their sanctuary through our platform.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {TESTIMONIALS.map((item) => (
            <div
              key={item.name}
              className="p-8 rounded-3xl bg-slate-50 border border-slate-200/80 shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
            >
              <div>
                {/* Rating & Quote Icon */}
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-1 text-amber-500">
                    {[...Array(item.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-amber-500" />
                    ))}
                  </div>
                  <Quote className="w-6 h-6 text-slate-300" />
                </div>

                {/* Quote Text */}
                <p className="text-sm text-slate-700 leading-relaxed italic">
                  "{item.quote}"
                </p>
              </div>

              {/* Author & Property */}
              <div className="mt-8 pt-6 border-t border-slate-200/60 flex items-center gap-3">
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-12 h-12 rounded-full object-cover border-2 border-amber-400/50 shadow-xs"
                />
                <div className="min-w-0">
                  <h4 className="text-sm font-bold text-slate-900 flex items-center gap-1.5 truncate">
                    {item.name}
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  </h4>
                  <p className="text-xs text-slate-500 truncate">{item.role}</p>
                  <p className="text-[11px] font-semibold text-amber-700 mt-0.5 truncate">
                    {item.property}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
