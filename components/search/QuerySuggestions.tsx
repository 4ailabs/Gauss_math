import React from 'react';
import { useApp } from '../../contexts/AppContext';

export const QuerySuggestions: React.FC = React.memo(() => {
  const { state: { selectedSubject } } = useApp();

  const getExamplesBySubject = () => {
    switch (selectedSubject) {
      case 'Investigación en Matemáticas Aplicadas y Computación':
        return {
          example: '"algoritmos + implementación" en lugar de solo "algoritmos"',
          suggestions: ['+ implementación', '+ complejidad', '+ optimización']
        };
      case 'Administración de Bases de Datos':
        return {
          example: '"normalización + ejemplos" en lugar de solo "normalización"',
          suggestions: ['+ consultas', '+ diseño', '+ optimización']
        };
      case 'Elementos de Finanzas e Inversiones':
        return {
          example: '"VAN + cálculo" en lugar de solo "VAN"',
          suggestions: ['+ cálculo', '+ comparación', '+ análisis']
        };
      default:
        return {
          example: '"concepto + ejemplos" en lugar de solo "concepto"',
          suggestions: ['+ ejemplos', '+ ejercicios', '+ teoría']
        };
    }
  };

  const examples = getExamplesBySubject();

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
        Ejemplo: <span className="font-medium">{examples.example}</span>
      </p>
      
      <div className="flex flex-wrap gap-2">
        {examples.suggestions.map((suggestion, index) => (
          <span key={index} className="px-2 py-1 bg-slate-100 text-slate-700 text-xs rounded">
            {suggestion}
          </span>
        ))}
      </div>
    </div>
  );
});