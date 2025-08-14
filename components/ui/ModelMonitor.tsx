import React, { useState, useEffect } from 'react';
import { Card } from './Card';
import { Button } from './Button';
import { 
  BarChart3Icon, 
  ClockIcon, 
  CheckCircleIcon, 
  XCircleIcon, 
  TrendingUpIcon,
  RefreshCwIcon
} from 'lucide-react';

interface ModelStats {
  successCount: number;
  errorCount: number;
  avgResponseTime: number;
  totalRequests: number;
  lastUsed: number;
  successRate: string;
}

interface ModelMonitorProps {
  performanceStats: Record<string, ModelStats>;
  cacheStats: { total: number; expired: number; valid: number };
  currentModel: string;
  onRefresh: () => void;
}

export const ModelMonitor: React.FC<ModelMonitorProps> = ({
  performanceStats,
  cacheStats,
  currentModel,
  onRefresh
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState<'performance' | 'cache'>('performance');

  const formatTime = (timestamp: number): string => {
    if (timestamp === 0) return 'Nunca';
    const date = new Date(timestamp);
    return date.toLocaleTimeString();
  };

  const formatResponseTime = (ms: number): string => {
    if (ms < 1000) return `${ms.toFixed(0)}ms`;
    return `${(ms / 1000).toFixed(2)}s`;
  };

  const getModelColor = (model: string): string => {
    if (model.includes('1.5-pro')) return 'text-purple-600 bg-purple-50 border-purple-200';
    if (model.includes('2.0-pro')) return 'text-blue-600 bg-blue-50 border-blue-200';
    if (model.includes('2.0-flash')) return 'text-green-600 bg-green-50 border-green-200';
    if (model.includes('1.5-flash')) return 'text-orange-600 bg-orange-50 border-orange-200';
    return 'text-gray-600 bg-gray-50 border-gray-200';
  };

  const getPerformanceScore = (stats: ModelStats): number => {
    if (stats.totalRequests === 0) return 0;
    const successRate = stats.successCount / stats.totalRequests;
    const speedScore = Math.max(0, 1 - (stats.avgResponseTime / 10000)); // Normalizar a 10s
    return (successRate * 0.7 + speedScore * 0.3) * 100;
  };

  const sortedModels = Object.entries(performanceStats).sort(([,a], [,b]) => 
    getPerformanceScore(b) - getPerformanceScore(a)
  );

  return (
    <Card className="p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <BarChart3Icon className="w-5 h-5 text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-900">Monitor de Modelos Gemini</h3>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={onRefresh}
            icon={<RefreshCwIcon className="w-4 h-4" />}
            className="min-h-[32px]"
          >
            Actualizar
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="min-h-[32px]"
          >
            {isExpanded ? 'Contraer' : 'Expandir'}
          </Button>
        </div>
      </div>

      {/* Modelo actual */}
      <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
        <div className="flex items-center gap-2">
          <TrendingUpIcon className="w-4 h-4 text-blue-600" />
          <span className="text-sm font-medium text-blue-800">Modelo Activo:</span>
          <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getModelColor(currentModel)}`}>
            {currentModel}
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 mb-4">
        <button
          onClick={() => setActiveTab('performance')}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'performance'
              ? 'border-blue-500 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          Rendimiento
        </button>
        <button
          onClick={() => setActiveTab('cache')}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'cache'
              ? 'border-blue-500 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          Cache
        </button>
      </div>

      {activeTab === 'performance' && (
        <div className="space-y-4">
          {/* Estadísticas generales */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">
                {Object.values(performanceStats).reduce((sum, stats) => sum + stats.totalRequests, 0)}
              </div>
              <div className="text-xs text-gray-600">Total Requests</div>
            </div>
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {Object.values(performanceStats).reduce((sum, stats) => sum + stats.successCount, 0)}
              </div>
              <div className="text-xs text-gray-600">Exitosos</div>
            </div>
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-red-600">
                {Object.values(performanceStats).reduce((sum, stats) => sum + stats.errorCount, 0)}
              </div>
              <div className="text-xs text-gray-600">Errores</div>
            </div>
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">
                {Object.values(performanceStats).length}
              </div>
              <div className="text-xs text-gray-600">Modelos</div>
            </div>
          </div>

          {/* Tabla de modelos */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-2 font-medium text-gray-700">Modelo</th>
                  <th className="text-center py-2 font-medium text-gray-700">Score</th>
                  <th className="text-center py-2 font-medium text-gray-700">Requests</th>
                  <th className="text-center py-2 font-medium text-gray-700">Éxito</th>
                  <th className="text-center py-2 font-medium text-gray-700">Tiempo</th>
                  <th className="text-center py-2 font-medium text-gray-700">Último</th>
                </tr>
              </thead>
              <tbody>
                {sortedModels.map(([model, stats]) => (
                  <tr key={model} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getModelColor(model)}`}>
                        {model}
                      </span>
                    </td>
                    <td className="py-2 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <div className="w-16 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full transition-all"
                            style={{ width: `${getPerformanceScore(stats)}%` }}
                          />
                        </div>
                        <span className="text-xs font-medium text-gray-700">
                          {getPerformanceScore(stats).toFixed(0)}
                        </span>
                      </div>
                    </td>
                    <td className="py-2 text-center text-gray-700">
                      {stats.totalRequests}
                    </td>
                    <td className="py-2 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <CheckCircleIcon className="w-3 h-3 text-green-600" />
                        <span className="text-green-600 font-medium">{stats.successRate}</span>
                      </div>
                    </td>
                    <td className="py-2 text-center text-gray-700">
                      {formatResponseTime(stats.avgResponseTime)}
                    </td>
                    <td className="py-2 text-center text-gray-700">
                      {formatTime(stats.lastUsed)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'cache' && (
        <div className="space-y-4">
          {/* Estadísticas de cache */}
          <div className="grid grid-cols-3 gap-3">
            <div className="text-center p-3 bg-blue-50 rounded-lg border border-blue-200">
              <div className="text-2xl font-bold text-blue-600">{cacheStats.total}</div>
              <div className="text-xs text-blue-600">Total Entradas</div>
            </div>
            <div className="text-center p-3 bg-green-50 rounded-lg border border-green-200">
              <div className="text-2xl font-bold text-green-600">{cacheStats.valid}</div>
              <div className="text-xs text-green-600">Válidas</div>
            </div>
            <div className="text-center p-3 bg-red-50 rounded-lg border border-red-200">
              <div className="text-2xl font-bold text-red-600">{cacheStats.expired}</div>
              <div className="text-xs text-red-600">Expiradas</div>
            </div>
          </div>

          {/* Información del cache */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-2">Información del Cache</h4>
            <div className="space-y-2 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <ClockIcon className="w-4 h-4" />
                <span>TTL: 30 minutos</span>
              </div>
              <div className="flex items-center gap-2">
                <RefreshCwIcon className="w-4 h-4" />
                <span>Limpieza automática cada 5 minutos</span>
              </div>
              <div className="flex items-center gap-2">
                <BarChart3Icon className="w-4 h-4" />
                <span>Cache inteligente por modelo y tarea</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Información expandida */}
      {isExpanded && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <h4 className="font-medium text-gray-900 mb-3">Estrategia de Modelos</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
            <div className="p-3 bg-purple-50 rounded-lg border border-purple-200">
              <div className="font-medium text-purple-800 mb-1">PLANNING</div>
              <div className="text-purple-700">Flash para velocidad, bajo costo</div>
            </div>
            <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
              <div className="font-medium text-blue-800 mb-1">RESEARCH</div>
              <div className="text-blue-700">Pro para profundidad, balance costo-calidad</div>
            </div>
            <div className="p-3 bg-green-50 rounded-lg border border-green-200">
              <div className="font-medium text-green-800 mb-1">SYNTHESIS</div>
              <div className="text-green-700">1.5 Pro para máximo poder</div>
            </div>
            <div className="p-3 bg-orange-50 rounded-lg border border-orange-200">
              <div className="font-medium text-orange-800 mb-1">REFINEMENT</div>
              <div className="text-orange-700">2.0 Pro para inteligencia</div>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
};
