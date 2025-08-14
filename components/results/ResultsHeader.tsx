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
    <div className="bg-white border-b border-gray-200 p-4 sm:p-6 h-full">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-3 sm:gap-0">
        <div>
          <p className="text-xs sm:text-sm text-gray-500 mb-1 uppercase tracking-wide font-medium">
            {currentDate}
          </p>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 leading-tight">{subject}</h1>
        </div>
        <div className="flex items-center gap-2 sm:gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleShare}
            className="flex-1 sm:flex-none"
          >
            Compartir
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={onExport}
            icon={<DownloadIcon className="w-4 h-4" />}
            className="flex-1 sm:flex-none"
          >
            <span className="hidden sm:inline">Descargar</span>
            <span className="sm:hidden">PDF</span>
          </Button>
        </div>
      </div>
      
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <div className="flex items-center gap-3">
          <div className="flex space-x-1">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="w-2 h-2 sm:w-3 sm:h-3 bg-teal-500 rounded-full animate-pulse" style={{ animationDelay: `${i * 0.1}s` }}></div>
            ))}
          </div>
          <span className="text-xs sm:text-sm font-semibold text-gray-700">Análisis Completado</span>
        </div>
        <div className="flex-1"></div>
        <div className="text-xs text-gray-500 bg-gray-100 px-2 sm:px-3 py-1 rounded-full self-start sm:self-auto">
          Reporte Científico • {new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
        </div>
      </div>
    </div>
  );
});