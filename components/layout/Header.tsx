import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../../contexts/AppContext';
import { MenuIcon, XCloseIcon } from '../ui/Icons';

export const Header: React.FC = React.memo(() => {
  const { state: { activeView }, setActiveView } = useApp();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const mobileMenuRef = useRef<HTMLDivElement>(null);

  const navItems = [
    { key: 'search', label: 'Buscar' },
    { key: 'library', label: 'Biblioteca' },
    { key: 'recent', label: 'Recientes' },
    { key: 'study', label: 'Estudio' },
    { key: 'research', label: 'Investigación' },
    { key: 'help', label: 'Ayuda' },
  ] as const;

  const handleNavClick = (key: string) => {
    setActiveView(key as any);
    setIsMobileMenuOpen(false); // Cerrar menú móvil al navegar
  };

  // Cerrar menú móvil al hacer click fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target as Node)) {
        setIsMobileMenuOpen(false);
      }
    };

    if (isMobileMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMobileMenuOpen]);

  return (
    <header className="bg-white shadow-sm border-b border-slate-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <div>
              <h1 className="text-xl font-semibold text-slate-800">Gauss∑ AI</h1>
              <p className="text-[10px] text-slate-500 -mt-0.5 leading-none">Powered by 4ailabs</p>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-6 lg:space-x-8">
            {navItems.map(({ key, label }) => (
              <button
                key={key}
                onClick={() => handleNavClick(key)}
                className={`text-sm font-medium transition-colors ${
                  activeView === key 
                    ? 'text-slate-800 border-b-2 border-teal-700' 
                    : 'text-slate-600 hover:text-slate-800'
                }`}
              >
                {label}
              </button>
            ))}
          </nav>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
                          <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="text-slate-800 hover:text-slate-900 focus:outline-none focus:text-slate-900 p-3 border border-slate-300 rounded-lg bg-white shadow-md transition-all duration-200 hover:shadow-lg"
                aria-label={isMobileMenuOpen ? "Cerrar menú" : "Abrir menú"}
              >
              {isMobileMenuOpen ? (
                <XCloseIcon className="h-6 w-6" />
              ) : (
                <MenuIcon className="h-6 w-6" />
              )}
            </button>
            {/* Debug indicator */}
            <span className="ml-2 text-xs text-slate-400 md:hidden">
              {isMobileMenuOpen ? 'Abierto' : 'Menú'}
            </span>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div ref={mobileMenuRef} className="md:hidden border-t border-slate-200 bg-white shadow-lg">
            <div className="px-4 pt-3 pb-4 space-y-2">
              {navItems.map(({ key, label }) => (
                <button
                  key={key}
                  onClick={() => handleNavClick(key)}
                  className={`block w-full text-left px-4 py-3 rounded-lg text-base font-medium transition-all duration-200 ${
                    activeView === key
                      ? 'text-slate-800 bg-slate-100 border-l-4 border-teal-700 shadow-sm'
                      : 'text-slate-700 hover:text-slate-800 hover:bg-slate-100 border-l-4 border-transparent'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </header>
  );
});