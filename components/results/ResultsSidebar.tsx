import React from 'react';
import { useApp } from '../../contexts/AppContext';
import { useChat } from '../../hooks/useChat';
import { ProcessedData } from '../../types';
import { Button } from '../ui/Button';
import { CheckIcon, RefreshCwIcon, ChevronRightIcon } from '../ui/Icons';

interface ResultsSidebarProps {
  processedData: ProcessedData;
}

export const ResultsSidebar: React.FC<ResultsSidebarProps> = React.memo(({ processedData }) => {
  const { 
    state: { assistantHistory, assistantInput }, 
    setActiveView, 
    clearAssistantHistory, 
    setAssistantInput 
  } = useApp();
  const { handleChatMessage } = useChat();

  const handleQuickChat = (input: HTMLInputElement) => {
    if (input.value.trim()) {
      handleChatMessage(input.value);
      input.value = '';
    }
  };

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

      {/* Quick Chat */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Chat Rápido</h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={clearAssistantHistory}
            icon={<RefreshCwIcon className="w-4 h-4" />}
          >
            Limpiar
          </Button>
        </div>
        
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-4 h-32 overflow-y-auto">
          {assistantHistory.length === 0 ? (
            <div className="text-center text-gray-500 text-sm">
              <p>Haz preguntas sobre el análisis</p>
            </div>
          ) : (
            <div className="space-y-2">
              {assistantHistory.slice(-3).map((message, index) => (
                <div key={index} className={`text-xs ${message.role === 'user' ? 'text-right' : 'text-left'}`}>
                  <div className={`inline-block px-2 py-1 rounded ${
                    message.role === 'user' 
                      ? 'bg-teal-600 text-white' 
                      : 'bg-white border border-gray-200'
                  }`}>
                    {message.content.substring(0, 100)}
                    {message.content.length > 100 && '...'}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Pregunta sobre el análisis..."
            className="flex-1 bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500 focus:outline-none"
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                handleQuickChat(e.currentTarget);
              }
            }}
          />
          <Button
            size="sm"
            onClick={(e) => {
              const input = e.currentTarget.parentElement?.querySelector('input') as HTMLInputElement;
              if (input) handleQuickChat(input);
            }}
            icon={<ChevronRightIcon className="w-4 h-4" />}
          >
          </Button>
        </div>
        
        <Button
          variant="secondary"
          size="sm"
          onClick={() => setActiveView('chat')}
          className="w-full mt-3"
        >
          Chat Completo
        </Button>
      </div>
    </div>
  );
});