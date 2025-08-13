import React from 'react';
import { useApp } from '../../contexts/AppContext';

export const GatherOptions: React.FC = React.memo(() => {
  const { state: { gatherType }, setGatherType } = useApp();

  const options = [
    { key: 'papers', label: 'Resumen y Conceptos' },
    { key: 'trials', label: 'Problemas de Práctica' },
  ] as const;

  return (
    <div className="flex items-center gap-3">
      <span className="text-sm font-medium text-gray-800">Generar:</span>
      <div className="flex space-x-1">
        {options.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setGatherType(key)}
            className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
              gatherType === key
                ? 'bg-teal-100 text-teal-800'
                : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
            }`}
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  );
});