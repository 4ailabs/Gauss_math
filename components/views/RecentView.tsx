import React from 'react';
import { useApp } from '../../contexts/AppContext';
import { Card } from '../ui/Card';

const RecentView: React.FC = React.memo(() => {
  const { state: { analysisHistory } } = useApp();
  const recentItems = analysisHistory.slice(0, 5);

  return (
    <div className="space-y-6">
      <Card padding="lg">
        <h2 className="text-2xl font-bold text-slate-600 mb-6">Análisis Recientes</h2>
        <div className="space-y-4">
          {recentItems.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-gray-400 text-2xl">⏰</span>
              </div>
              <p className="text-slate-500 text-lg mb-2">No hay análisis recientes</p>
              <p className="text-slate-500 text-sm">Comienza procesando algunos apuntes</p>
            </div>
          ) : (
            recentItems.map((item) => (
              <Card key={item.id} hover className="cursor-pointer transition-all duration-200 hover:scale-[1.02]">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-slate-600 mb-1">{item.title}</h3>
                    <div className="flex items-center gap-3 text-sm text-slate-500">
                      <span className="bg-slate-100 text-slate-700 px-2 py-1 rounded-full text-xs">
                        {item.subject}
                      </span>
                      <span>{new Date(item.timestamp).toLocaleDateString('es-ES')}</span>
                    </div>
                  </div>
                  <div className="text-xs text-slate-500">
                    {new Date(item.timestamp).toLocaleTimeString('es-ES', { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
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

export default RecentView;