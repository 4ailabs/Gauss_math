import React from 'react';

export const QuerySuggestions: React.FC = React.memo(() => {
  const suggestions = [
    'Conceptos matemáticos',
    'Fórmulas y ecuaciones',
    'Ejemplos de problemas',
  ];

  return (
    <div className="query-suggestions">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
        <p className="text-sm text-gray-700">
          Las preguntas más precisas funcionan mejor. Intenta agregar elementos como estos:
        </p>
      </div>
      <div className="flex flex-wrap gap-2">
        {suggestions.map((suggestion) => (
          <button
            key={suggestion}
            className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm hover:bg-gray-200 transition-colors"
          >
            {suggestion}
          </button>
        ))}
      </div>
    </div>
  );
});