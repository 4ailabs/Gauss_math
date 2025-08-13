import React from 'react';
import { useApp } from '../../contexts/AppContext';

export const Header: React.FC = React.memo(() => {
  const { state: { activeView }, setActiveView } = useApp();

  const navItems = [
    { key: 'search', label: 'Buscar' },
    { key: 'library', label: 'Biblioteca' },
    { key: 'recent', label: 'Recientes' },
    { key: 'study', label: 'Estudio' },
    { key: 'help', label: 'Ayuda' },
  ] as const;

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <h1 className="text-xl font-semibold text-gray-900">Gauss∑ AI</h1>
          </div>
          <nav className="flex space-x-8">
            {navItems.map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setActiveView(key as any)}
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
        </div>
      </div>
    </header>
  );
});