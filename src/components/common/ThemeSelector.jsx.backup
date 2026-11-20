import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { Palette, Check, Sparkles } from 'lucide-react';

export const THEMES = [
  {
    id: 'emerald',
    name: 'Emerald & Gold',
    subtitle: 'British & Beverly Hills Prestige',
    primaryColor: '#064030',
    accentColor: '#eab308',
  },
  {
    id: 'sapphire',
    name: 'Royal Sapphire',
    subtitle: 'Deep Ocean & Radiant Gold',
    primaryColor: '#0c1e4a',
    accentColor: '#f59e0b',
  },
  {
    id: 'burgundy',
    name: 'Burgundy Chateau',
    subtitle: 'Imperial Wine & Rose Gold',
    primaryColor: '#3d071b',
    accentColor: '#f43f5e',
  },
  {
    id: 'bronze',
    name: 'Espresso & Copper',
    subtitle: 'Warm Roast & Burnished Bronze',
    primaryColor: '#291c16',
    accentColor: '#f97316',
  },
  {
    id: 'navy',
    name: 'Midnight Slate',
    subtitle: 'Classic Slate & Warm Amber',
    primaryColor: '#0f172a',
    accentColor: '#d97706',
  },
];

export const ThemeSelector = () => {
  const { currentTheme, changeTheme, addToast } = useApp();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (theme) => {
    changeTheme(theme.id);
    setIsOpen(false);
    addToast({
      type: 'success',
      title: 'Palette Changed',
      message: `Theme set to ${theme.name}.`,
    });
  };

  const activeTheme = THEMES.find((t) => t.id === currentTheme) || THEMES[0];

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold border border-slate-200 hover:border-amber-400 bg-white hover:bg-slate-50 text-slate-700 transition-all cursor-pointer shadow-2xs"
        title="Change Website Color Scheme"
      >
        <div className="flex items-center -space-x-1">
          <span
            className="w-3 h-3 rounded-full border border-white shadow-2xs"
            style={{ backgroundColor: activeTheme.primaryColor }}
          />
          <span
            className="w-3 h-3 rounded-full border border-white shadow-2xs"
            style={{ backgroundColor: activeTheme.accentColor }}
          />
        </div>
        <span className="hidden sm:inline text-[11px] font-bold">{activeTheme.name}</span>
        <Palette className="w-3.5 h-3.5 text-slate-400" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-2xl border border-slate-100 py-2.5 z-50 animate-in fade-in slide-in-from-top-2">
          <div className="px-4 py-2 border-b border-slate-100 flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 flex items-center gap-1.5">
              <Sparkles className="w-3 h-3 text-amber-500" />
              Website Color Palette
            </span>
          </div>

          <div className="p-2 space-y-1">
            {THEMES.map((t) => {
              const isCurrent = t.id === currentTheme;
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => handleSelect(t)}
                  className={`w-full text-left p-2.5 rounded-xl transition-all flex items-center justify-between cursor-pointer ${
                    isCurrent
                      ? 'bg-slate-50 border border-slate-200/80 shadow-2xs'
                      : 'hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="flex items-center -space-x-1.5">
                      <span
                        className="w-5 h-5 rounded-full border-2 border-white shadow-xs"
                        style={{ backgroundColor: t.primaryColor }}
                      />
                      <span
                        className="w-5 h-5 rounded-full border-2 border-white shadow-xs"
                        style={{ backgroundColor: t.accentColor }}
                      />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-900">{t.name}</p>
                      <p className="text-[10px] text-slate-400">{t.subtitle}</p>
                    </div>
                  </div>

                  {isCurrent && (
                    <div className="w-5 h-5 rounded-full bg-slate-900 text-amber-400 flex items-center justify-center">
                      <Check className="w-3 h-3" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
