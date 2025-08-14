import React from 'react';
import { useApp } from '../../contexts/AppContext';
import { BookOpenIcon, MessageCircleIcon, SearchIcon } from '../ui/Icons';

export const SearchTypeSelector: React.FC = React.memo(() => {
  const { state: { searchType }, setSearchType } = useApp();

  const searchTypes = [
    { key: 'research', icon: BookOpenIcon, label: 'Procesar Apuntes' },
    { key: 'systematic', icon: MessageCircleIcon, label: 'Generar Quiz' },
    { key: 'papers', icon: SearchIcon, label: 'Encontrar Problemas' },
  ] as const;

  return (
    <div className="search-type-selector flex rounded-lg bg-gray-100 p-1">
      {searchTypes.map(({ key, icon: Icon, label }) => (
        <button
          key={key}
          onClick={() => setSearchType(key)}
          className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-md text-sm font-medium transition-colors ${
            searchType === key
              ? 'bg-white text-slate-600 shadow-sm'
              : 'text-slate-500 hover:text-slate-600'
          }`}
        >
          <Icon className="w-4 h-4" />
          {label}
        </button>
      ))}
    </div>
  );
});