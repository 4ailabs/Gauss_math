import React from 'react';
import { useApp } from '../../contexts/AppContext';
import { Card } from '../ui/Card';
import { ChevronRightIcon, BookOpenIcon } from '../ui/Icons';

const LibraryView: React.FC = React.memo(() => {
  const { state: { analysisHistory }, loadFromHistory } = useApp();

  return (
    <div className="space-y-6">
      <Card padding="lg">
        <div className="flex items-center gap-3 mb-6">
          <BookOpenIcon className="w-8 h-8 text-teal-600" />
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Biblioteca</h2>
            <p className="text-gray-600 text-sm">Haz click en cualquier análisis para revisar los resultados</p>
          </div>
        </div>
        <div className="space-y-4">
          {analysisHistory.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-gray-400 text-2xl">📚</span>
              </div>
              <p className="text-gray-600 text-lg mb-2">Tu biblioteca está vacía</p>
              <p className="text-gray-500 text-sm">Los análisis que realices aparecerán aquí</p>
            </div>
          ) : (
            analysisHistory.map((item) => (
              <Card 
                key={item.id} 
                hover 
                className="cursor-pointer transition-all duration-200 hover:scale-[1.02]"
                onClick={() => loadFromHistory(item)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 mb-2">{item.title}</h3>
                    <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
                      <span className="bg-teal-100 text-teal-800 px-2 py-1 rounded-full">
                        {item.subject}
                      </span>
                      <span>{new Date(item.timestamp).toLocaleDateString('es-ES')}</span>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span>{item.processedData.keyConcepts.length} conceptos</span>
                      <span>{item.processedData.quizQuestions.length} preguntas</span>
                      <span>{item.processedData.relatedProblems.length} problemas</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="text-right mr-2">
                      <div className="w-2 h-2 bg-green-400 rounded-full mb-1"></div>
                      <span className="text-xs text-gray-500">Completado</span>
                    </div>
                    <ChevronRightIcon className="w-5 h-5 text-gray-400" />
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
      </Card>
    </div>
  );
});

export default LibraryView;