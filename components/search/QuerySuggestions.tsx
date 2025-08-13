import React from 'react';
import { useApp } from '../../contexts/AppContext';

export const QuerySuggestions: React.FC = React.memo(() => {
  const { state: { selectedSubject } } = useApp();

  const getSuggestions = () => {
    switch (selectedSubject) {
      case 'Investigación en Matemáticas Aplicadas y Computación':
        return [
          'Estructura IMRyD de artículos',
          'Revisión de literatura científica',
          'Metodología de investigación',
          'Presentación de resultados',
          'Discusión académica'
        ];
      case 'Administración de Bases de Datos':
        return [
          'Diseño de bases de datos',
          'Consultas SQL avanzadas',
          'Normalización y optimización',
          'Transacciones y concurrencia',
          'Seguridad de datos'
        ];
      case 'Elementos de Finanzas e Inversiones':
        return [
          'Interés simple y compuesto',
          'Valor presente y futuro',
          'Anualidades y rentas',
          'Tablas de amortización',
          'VAN y TIR',
          'Mercado de capitales',
          'Evaluación de proyectos'
        ];
      default:
        return [
          'Conceptos clave',
          'Ejemplos prácticos',
          'Metodología específica'
        ];
    }
  };

  const suggestions = getSuggestions();

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