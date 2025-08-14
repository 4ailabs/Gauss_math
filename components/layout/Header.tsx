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
    <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <div>
              <h1 className="text-xl font-semibold text-gray-900">Gauss∑ AI</h1>
              <p className="text-[10px] text-gray-300 -mt-0.5 leading-none">Powered by 4ailabs</p>
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
                    ? 'text-teal-600 border-b-2 border-teal-600' 
                    : 'text-gray-500 hover:text-gray-700'
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
              className="text-gray-700 hover:text-gray-900 focus:outline-none focus:text-gray-900 p-3 border border-gray-300 rounded-lg bg-white shadow-md transition-all duration-200 hover:shadow-lg"
              aria-label={isMobileMenuOpen ? "Cerrar menú" : "Abrir menú"}
            >
              {isMobileMenuOpen ? (
                <XCloseIcon className="h-6 w-6" />
              ) : (
                <MenuIcon className="h-6 w-6" />
              )}
            </button>
            {/* Debug indicator */}
            <span className="ml-2 text-xs text-gray-400 md:hidden">
              {isMobileMenuOpen ? 'Abierto' : 'Menú'}
            </span>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div ref={mobileMenuRef} className="md:hidden border-t border-gray-200 bg-white shadow-lg">
            <div className="px-4 pt-3 pb-4 space-y-2">
              {navItems.map(({ key, label }) => (
                <button
                  key={key}
                  onClick={() => handleNavClick(key)}
                  className={`block w-full text-left px-4 py-3 rounded-lg text-base font-medium transition-all duration-200 ${
                    activeView === key
                      ? 'text-teal-600 bg-teal-50 border-l-4 border-teal-600 shadow-sm'
                      : 'text-gray-700 hover:text-gray-900 hover:bg-gray-50 border-l-4 border-transparent'
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