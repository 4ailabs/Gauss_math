import React from 'react';
import { useApp } from '../../contexts/AppContext';
import { Card } from '../ui/Card';

export const SubjectSelector: React.FC = React.memo(() => {
  const { state: { selectedSubject }, setSelectedSubject } = useApp();

  const subjects = [
    'Cálculo Diferencial',
    'Cálculo Integral',
    'Álgebra Lineal',
    'Álgebra Superior',
    'Geometría Analítica',
    'Ecuaciones Diferenciales',
    'Análisis Matemático',
    'Métodos Numéricos',
    'Probabilidad y Estadística',
    'Matemáticas Discretas',
    'Teoría de Números',
    'Geometría Diferencial',
    'Análisis Real',
    'Análisis Complejo',
    'Topología',
    'Álgebra Abstracta',
    'Física Matemática',
    'Optimización',
    'Investigación de Operaciones',
    'Teoría de Grafos'
  ];

  return (
    <Card>
      <label htmlFor="subject-select" className="block text-sm font-medium text-gray-800 mb-2">
        Seleccionar Materia
      </label>
      <div className="relative">
        <select
          id="subject-select"
          value={selectedSubject}
          onChange={(e) => setSelectedSubject(e.target.value)}
          className="w-full bg-gray-50 border border-gray-300 rounded-lg p-3 text-sm text-gray-900 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 focus:outline-none"
        >
          {subjects.map((subject) => (
            <option key={subject} value={subject}>
              {subject}
            </option>
          ))}
        </select>
      </div>
    </Card>
  );
});