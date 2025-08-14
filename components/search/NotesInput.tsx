import React from 'react';
import { useApp } from '../../contexts/AppContext';
import { Button } from '../ui/Button';
import { MicIcon, ChevronRightIcon } from '../ui/Icons';
import { QuerySuggestions } from './QuerySuggestions';
import { GatherOptions } from './GatherOptions';

interface NotesInputProps {
  onToggleRecording: () => void;
  onSearch: () => void;
}

export const NotesInput: React.FC<NotesInputProps> = React.memo(({
  onToggleRecording,
  onSearch,
}) => {
  const {
    state: { notes, searchType, isLoading, isRecording },
    setNotes,
  } = useApp();

  const getPlaceholder = () => {
    switch (searchType) {
      case 'research':
        return "Pega tus apuntes de matemáticas aquí o describe lo que quieres estudiar...";
      case 'systematic':
        return "Describe el tema o concepto para generar un quiz de evaluación...";
      case 'papers':
        return "Describe el tipo de problemas que quieres encontrar o generar...";
      default:
        return "Escribe aquí...";
    }
  };

  const getSearchButtonTitle = () => {
    switch (searchType) {
      case 'research':
        return 'Procesar apuntes';
      case 'systematic':
        return 'Generar quiz';
      case 'papers':
        return 'Encontrar problemas';
      default:
        return 'Procesar';
    }
  };

  const getMobileButtonTitle = () => {
    switch (searchType) {
      case 'research':
        return 'Procesar';
      case 'systematic':
        return 'Generar';
      case 'papers':
        return 'Buscar';
      default:
        return 'Procesar';
    }
  };

  return (
    <div className="notes-input-area space-y-3 sm:space-y-4">
      <div className="space-y-3 sm:space-y-4">
        <div className="relative">
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder={getPlaceholder()}
            className="w-full h-32 sm:h-40 md:h-48 p-3 sm:p-4 border border-gray-300 rounded-xl resize-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 focus:outline-none text-gray-900 placeholder-gray-500 text-base sm:text-base"
            disabled={isLoading}
          />
          
          {isRecording && (
            <div className="absolute top-2 right-2 sm:top-3 sm:right-3 flex items-center gap-1 sm:gap-2 bg-red-50 text-red-600 px-2 py-1 sm:px-3 sm:py-1 rounded-full text-xs sm:text-sm border border-red-200">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
              <span className="hidden sm:inline">Grabando...</span>
              <span className="sm:hidden">Rec</span>
            </div>
          )}
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-0 sm:justify-between sm:items-center">
          <div className="flex justify-center sm:justify-start">
            <Button
              variant="secondary"
              size="md"
              onClick={onToggleRecording}
              disabled={isLoading}
              className={`w-full sm:w-auto ${isRecording ? 'bg-red-50 text-red-600 border-red-300 hover:bg-red-100' : ''}`}
              icon={<MicIcon className="w-4 h-4 sm:w-5 sm:h-5" />}
            >
              <span className="hidden sm:inline">
                {isRecording ? 'Detener grabación' : 'Grabar audio'}
              </span>
              <span className="sm:hidden">
                {isRecording ? 'Detener' : 'Grabar'}
              </span>
            </Button>
          </div>
          
          <Button
            onClick={onSearch}
            disabled={isLoading || !notes.trim()}
            loading={isLoading}
            size="lg"
            className="w-full sm:w-auto px-4 sm:px-6 py-3 sm:py-3"
            icon={!isLoading && <ChevronRightIcon className="w-5 h-5 sm:w-6 sm:h-6" />}
          >
            <span className="hidden sm:inline">
              {getSearchButtonTitle()}
            </span>
            <span className="sm:hidden">
              {getMobileButtonTitle()}
            </span>
          </Button>
        </div>
      </div>

      <QuerySuggestions />
      <GatherOptions />
    </div>
  );
});