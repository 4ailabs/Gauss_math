import React from 'react';
import { Button } from '../ui/Button';
import { DownloadIcon } from '../ui/Icons';

interface ResultsHeaderProps {
  subject: string;
  onExport: () => void;
}

export const ResultsHeader: React.FC<ResultsHeaderProps> = React.memo(({ 
  subject, 
  onExport 
}) => {
  const currentDate = new Date().toLocaleDateString('es-ES', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `Análisis de ${subject}`,
        url: window.location.href
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Enlace copiado al portapapeles');
    }
  };

  return (
    <div className="bg-white border-b border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="text-sm text-gray-500 mb-2 uppercase tracking-wide">
            {currentDate}
          </p>
          <h1 className="text-3xl font-bold text-gray-900">{subject}</h1>
        </div>
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleShare}
          >
            Compartir
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={onExport}
            icon={<DownloadIcon className="w-4 h-4" />}
          >
            Descargar
          </Button>
        </div>
      </div>
      
      <div className="flex items-center gap-2">
        <div className="flex space-x-1">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="w-2 h-2 bg-teal-500 rounded-full"></div>
          ))}
        </div>
        <span className="text-sm font-medium text-gray-700 ml-2">Análisis Completado</span>
      </div>
    </div>
  );
});