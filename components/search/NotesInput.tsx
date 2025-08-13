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

  return (
    <div className="notes-input-area space-y-4">
      <div className="relative">
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder={getPlaceholder()}
          className="w-full h-32 p-4 border border-gray-300 rounded-xl resize-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 focus:outline-none text-gray-900 placeholder-gray-500"
          disabled={isLoading}
        />
        
        {isRecording && (
          <div className="absolute top-2 right-2 flex items-center gap-2 bg-red-50 text-red-600 px-3 py-1 rounded-full text-sm">
            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
            Grabando...
          </div>
        )}
        
        <div className="absolute bottom-2 right-2 flex gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggleRecording}
            disabled={isLoading}
            className={isRecording ? 'bg-red-500 text-white hover:bg-red-600' : ''}
            icon={<MicIcon className="w-4 h-4" />}
          >
            {isRecording ? 'Detener' : 'Grabar'}
          </Button>
          
          <Button
            onClick={onSearch}
            disabled={isLoading || !notes.trim()}
            loading={isLoading}
            icon={!isLoading && <ChevronRightIcon className="w-4 h-4" />}
          >
            {getSearchButtonTitle()}
          </Button>
        </div>
      </div>

      <QuerySuggestions />
      <GatherOptions />
    </div>
  );
});