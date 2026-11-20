import React from 'react';
import { MessageSquareQuote } from 'lucide-react';

export const TestimonialsSection = () => {
  return (
    <section className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-xs font-bold uppercase tracking-wider text-amber-600 block mb-2">
            Client Experiences
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Trusted by Buyers & Owners
          </h2>
          <p className="mt-3 text-sm text-slate-600">
            Genuine customer feedback will appear here when reviews are available.
          </p>
        </div>

        <div className="max-w-xl mx-auto p-10 rounded-3xl bg-slate-50 border border-dashed border-slate-300 text-center">
          <MessageSquareQuote className="w-10 h-10 text-slate-400 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-slate-800">
            No Reviews Available Yet
          </h3>
          <p className="text-sm text-slate-500 mt-2">
            Customer testimonials will be displayed here after genuine reviews are received.
          </p>
        </div>
      </div>
    </section>
  );
};
