import React from 'react';
import { useApp } from '../../contexts/AppContext';
import { ProcessedData } from '../../types';
import { Button } from '../ui/Button';
import { CheckIcon, ChevronRightIcon } from '../ui/Icons';

interface ResultsSidebarProps {
  processedData: ProcessedData;
}

export const ResultsSidebar: React.FC<ResultsSidebarProps> = React.memo(({ processedData }) => {
  const { 
    setActiveView
  } = useApp();

  return (
    <div className="h-full overflow-y-auto p-6 space-y-6">
      {/* Report Status */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Estado del Reporte</h3>
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
              <CheckIcon className="w-3 h-3 text-white" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">Procesar contenido</p>
              <p className="text-xs text-gray-600">Análisis completado</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
              <CheckIcon className="w-3 h-3 text-white" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">Extraer conceptos</p>
              <p className="text-xs text-gray-600">{processedData.keyConcepts.length} conceptos</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
              <CheckIcon className="w-3 h-3 text-white" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">Generar preguntas</p>
              <p className="text-xs text-gray-600">{processedData.quizQuestions.length} preguntas</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
              <CheckIcon className="w-3 h-3 text-white" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">Crear problemas</p>
              <p className="text-xs text-gray-600">{processedData.relatedProblems.length} problemas</p>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Actions */}
      <div className="space-y-3">
        <Button
          variant="primary"
          size="md"
          onClick={() => setActiveView('chat')}
          className="w-full"
          icon={<ChevronRightIcon className="w-4 h-4" />}
        >
          Hacer Preguntas con IA
        </Button>
        
        <Button
          variant="secondary"
          size="md"
          onClick={() => setActiveView('search')}
          className="w-full"
        >
          Nuevo Análisis
        </Button>
      </div>
    </div>
  );
});