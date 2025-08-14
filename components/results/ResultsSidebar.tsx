import React, { useState, useEffect } from 'react';
import { useApp } from '../../contexts/AppContext';
import { ProcessedData } from '../../types';
import { Button } from '../ui/Button';
import { CheckIcon, ChevronRightIcon, ChevronDownIcon, ChevronUpIcon } from '../ui/Icons';

interface ResultsSidebarProps {
  processedData: ProcessedData;
}

export const ResultsSidebar: React.FC<ResultsSidebarProps> = React.memo(({ processedData }) => {
  const { 
    setActiveView
  } = useApp();
  
  // Estado colapsado por defecto en móvil, expandido en desktop
  const [isStatusCollapsed, setIsStatusCollapsed] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  // Detectar si es móvil y ajustar el estado inicial
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768; // breakpoint md de Tailwind
      setIsMobile(mobile);
      setIsStatusCollapsed(mobile); // Colapsado por defecto en móvil
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return (
    <div className="h-full overflow-y-auto p-6 space-y-6">
      {/* Report Status - Collapsible */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Estado del Reporte</h3>
          <button
            onClick={() => setIsStatusCollapsed(!isStatusCollapsed)}
            className="p-1 text-gray-500 hover:text-gray-700 transition-colors"
            aria-label={isStatusCollapsed ? 'Expandir estado' : 'Colapsar estado'}
          >
            {isStatusCollapsed ? (
              <ChevronDownIcon className="w-4 h-4" />
            ) : (
              <ChevronUpIcon className="w-4 h-4" />
            )}
          </button>
        </div>
        
        {!isStatusCollapsed && (
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
        )}

        {/* Indicador visual para móvil cuando está colapsado */}
        {isStatusCollapsed && isMobile && (
          <div className="text-center py-2">
            <p className="text-xs text-gray-500">
              Toca para ver el estado del reporte
            </p>
          </div>
        )}
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