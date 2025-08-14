import React from 'react';
import { useApp } from '../../contexts/AppContext';
import { Card } from '../ui/Card';

export const SubjectSelector: React.FC = React.memo(() => {
  const { state: { selectedSubject }, setSelectedSubject } = useApp();

  const subjects = [
    'Investigación en Matemáticas Aplicadas y Computación',
    'Administración de Bases de Datos',
    'Elementos de Finanzas e Inversiones'
  ];

  return (
    <Card>
      <label htmlFor="subject-select" className="block text-sm font-medium text-slate-600 mb-2">
        Seleccionar Materia
      </label>
      <div className="relative">
        <select
          id="subject-select"
          value={selectedSubject}
          onChange={(e) => setSelectedSubject(e.target.value)}
          className="w-full bg-slate-50 border border-slate-300 rounded-lg p-3 text-sm text-slate-700 focus:ring-2 focus:ring-slate-500 focus:border-slate-500 focus:outline-none"
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