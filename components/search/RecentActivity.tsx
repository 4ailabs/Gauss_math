import React from 'react';
import { useApp } from '../../contexts/AppContext';
import { Card } from '../ui/Card';
import { CheckIcon, MoreHorizontalIcon, FileTextIcon } from '../ui/Icons';

export const RecentActivity: React.FC = React.memo(() => {
  const { state: { analysisHistory } } = useApp();
  
  // Obtener el análisis más reciente
  const mostRecent = analysisHistory.length > 0 ? analysisHistory[0] : null;

  return (
    <div className="mt-8">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Reciente</h3>
      
      {mostRecent ? (
        <Card>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <CheckIcon className="w-4 h-4 text-teal-600" />
              <span className="text-sm font-medium text-gray-900">
                {mostRecent.title || 'Análisis de Apuntes'}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-600">Procesado</span>
              <span className="text-xs text-gray-500">
                {new Date(mostRecent.timestamp).toLocaleTimeString('es-ES', {
                  hour: '2-digit',
                  minute: '2-digit'
                })} {new Date(mostRecent.timestamp).toLocaleDateString('es-ES', {
                  month: 'short',
                  day: 'numeric'
                })}
              </span>
              <button className="p-1 hover:bg-gray-100 rounded">
                <MoreHorizontalIcon className="w-4 h-4 text-gray-400" />
              </button>
            </div>
          </div>
        </Card>
      ) : (
        <Card>
          <div className="text-center py-6">
            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <FileTextIcon className="w-5 h-5 text-slate-400" />
            </div>
            <p className="text-gray-600 text-sm">No hay análisis recientes</p>
            <p className="text-gray-500 text-xs">Procesa algunos apuntes para comenzar</p>
          </div>
        </Card>
      )}
    </div>
  );
});