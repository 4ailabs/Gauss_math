import React from 'react';
import { useApp } from '../../contexts/AppContext';
import { Card } from '../ui/Card';

const StudyView: React.FC = React.memo(() => {
  const { state: { analysisHistory } } = useApp();

  const getSubjectStats = () => {
    const subjects = analysisHistory.reduce((acc, item) => {
      acc[item.subject] = (acc[item.subject] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    return Object.entries(subjects).map(([subject, count]) => ({ subject, count }));
  };

  const subjectStats = getSubjectStats();
  const totalConcepts = analysisHistory.reduce((acc, item) => acc + item.processedData.keyConcepts.length, 0);
  const totalQuestions = analysisHistory.reduce((acc, item) => acc + item.processedData.quizQuestions.length, 0);

  return (
    <div className="space-y-6">
      <Card padding="lg">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Progreso de Estudio</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="text-center">
            <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-teal-600 text-2xl font-bold">{analysisHistory.length}</span>
            </div>
            <h3 className="font-semibold text-gray-900">Análisis Realizados</h3>
            <p className="text-sm text-gray-600">Total de sesiones de estudio</p>
          </div>
          
          <div className="text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-blue-600 text-2xl font-bold">{totalConcepts}</span>
            </div>
            <h3 className="font-semibold text-gray-900">Conceptos Estudiados</h3>
            <p className="text-sm text-gray-600">Conceptos identificados y revisados</p>
          </div>
          
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-green-600 text-2xl font-bold">{totalQuestions}</span>
            </div>
            <h3 className="font-semibold text-gray-900">Preguntas Generadas</h3>
            <p className="text-sm text-gray-600">Preguntas de práctica creadas</p>
          </div>
        </div>

        {subjectStats.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Materias Estudiadas</h3>
            <div className="grid gap-4">
              {subjectStats.map(({ subject, count }) => (
                <div key={subject} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <span className="font-medium text-gray-900">{subject}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600">{count} análisis</span>
                    <div className="w-16 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-teal-600 h-2 rounded-full" 
                        style={{ width: `${(count / Math.max(...subjectStats.map(s => s.count))) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </Card>
    </div>
  );
});

export default StudyView;