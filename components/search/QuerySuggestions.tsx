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
    <div className="bg-white rounded-lg p-4 border border-slate-200">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
        <span className="text-sm font-medium text-slate-700">Tip</span>
      </div>
      
      <p className="text-sm text-slate-600 mb-3">
        Agrega palabras clave para obtener respuestas más específicas
      </p>
      
      <p className="text-xs text-slate-500 mb-3">
        Ejemplo: <span className="font-medium">"derivadas + ejemplos"</span> en lugar de solo <span className="font-medium">"derivadas"</span>
      </p>
      
      <div className="flex flex-wrap gap-2">
        <span className="px-2 py-1 bg-slate-100 text-slate-700 text-xs rounded">+ ejemplos</span>
        <span className="px-2 py-1 bg-slate-100 text-slate-700 text-xs rounded">+ ejercicios</span>
        <span className="px-2 py-1 bg-slate-100 text-slate-700 text-xs rounded">+ teoría</span>
      </div>
    </div>
  );
});