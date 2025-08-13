import React from 'react';
import { Card } from '../ui/Card';
import { CheckIcon, MoreHorizontalIcon } from '../ui/Icons';

export const RecentActivity: React.FC = React.memo(() => {
  return (
    <div className="mt-8">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Reciente</h3>
      <Card>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <CheckIcon className="w-4 h-4 text-teal-600" />
            <span className="text-sm font-medium text-gray-900">
              Optimización de Descenso de Gradiente
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-600">Procesado</span>
            <span className="text-xs text-gray-500">9:49am Abr 7</span>
            <button className="p-1 hover:bg-gray-100 rounded">
              <MoreHorizontalIcon className="w-4 h-4 text-gray-400" />
            </button>
          </div>
        </div>
      </Card>
    </div>
  );
});