import React, { useState } from 'react';
import { useApp } from '../../contexts/AppContext';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { 
  ChevronRightIcon, 
  BookOpenIcon, 
  Trash2Icon, 
  AlertTriangleIcon,
  XIcon,
  CheckIcon
} from '../ui/Icons';

const LibraryView: React.FC = React.memo(() => {
  const { 
    state: { analysisHistory }, 
    loadFromHistory, 
    removeFromHistory, 
    clearAnalysisHistory 
  } = useApp();
  
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [clearConfirm, setClearConfirm] = useState(false);

  const handleDelete = (id: string) => {
    setDeleteConfirmId(id);
  };

  const confirmDelete = () => {
    if (deleteConfirmId) {
      removeFromHistory(deleteConfirmId);
      setDeleteConfirmId(null);
    }
  };

  const cancelDelete = () => {
    setDeleteConfirmId(null);
  };

  const handleClearAll = () => {
    setClearConfirm(true);
  };

  const confirmClearAll = () => {
    clearAnalysisHistory();
    setClearConfirm(false);
  };

  const cancelClearAll = () => {
    setClearConfirm(false);
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <Card padding="lg">
        {/* Header optimizado para móvil */}
        <div className="mb-4 sm:mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3">
              <BookOpenIcon className="w-6 h-6 sm:w-8 sm:h-8 text-slate-500" />
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-slate-600">Biblioteca</h2>
                <p className="text-slate-500 text-xs sm:text-sm">
                  Toca cualquier análisis para revisar
                </p>
              </div>
            </div>
            
            {analysisHistory.length > 0 && (
              <div className="flex items-center justify-end">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={handleClearAll}
                  icon={<Trash2Icon className="w-4 h-4" />}
                  className="text-slate-600 hover:text-slate-700 hover:bg-slate-50 text-sm px-3 py-2"
                >
                  <span className="hidden sm:inline">Limpiar Todo</span>
                  <span className="sm:hidden">Limpiar</span>
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Confirmación para limpiar todo */}
        {clearConfirm && (
                      <div className="mb-6 p-4 bg-slate-50 border border-slate-200 rounded-lg">
            <div className="flex items-start gap-3">
              <AlertTriangleIcon className="w-5 h-5 text-slate-500 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <h3 className="font-semibold text-slate-600 mb-2">
                  ¿Estás seguro de que quieres limpiar toda la biblioteca?
                </h3>
                <p className="text-slate-600 text-sm mb-3">
                  Esta acción eliminará permanentemente todo tu historial de análisis y no se puede deshacer.
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={confirmClearAll}
                    icon={<CheckIcon className="w-4 h-4" />}
                  >
                    Sí, Limpiar Todo
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={cancelClearAll}
                    icon={<XIcon className="w-4 h-4" />}
                  >
                    Cancelar
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="space-y-4">
          {analysisHistory.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <BookOpenIcon className="w-8 h-8 text-slate-400" />
              </div>
              <p className="text-gray-600 text-lg mb-2">Tu biblioteca está vacía</p>
              <p className="text-gray-500 text-sm">Los análisis que realices aparecerán aquí</p>
            </div>
          ) : (
            analysisHistory.map((item) => (
              <Card 
                key={item.id} 
                hover 
                className="transition-all duration-200 hover:scale-[1.01] sm:hover:scale-[1.02]"
                padding="md"
              >
                {/* Layout móvil optimizado */}
                <div className="space-y-3">
                  {/* Header de la card */}
                  <div className="flex items-start justify-between gap-3">
                    <div 
                      className="flex-1 cursor-pointer min-w-0"
                      onClick={() => loadFromHistory(item)}
                    >
                      <h3 className="font-semibold text-slate-800 mb-2 text-sm sm:text-base line-clamp-2">
                        {item.title}
                      </h3>
                    </div>
                    
                    {/* Botón eliminar móvil optimizado */}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(item.id)}
                      className="text-slate-400 hover:text-red-600 hover:bg-red-50 p-1.5 min-w-0 flex-shrink-0"
                      title="Eliminar análisis"
                    >
                      <Trash2Icon className="w-4 h-4" />
                    </Button>
                  </div>

                  {/* Contenido clickeable */}
                  <div 
                    className="cursor-pointer"
                    onClick={() => loadFromHistory(item)}
                  >
                    {/* Subject y fecha */}
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mb-3">
                      <span className="bg-teal-100 text-teal-800 px-2 py-1 rounded-full text-xs font-medium inline-block w-fit">
                        {item.subject}
                      </span>
                      <span className="text-xs text-slate-500">
                        {new Date(item.timestamp).toLocaleDateString('es-ES', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric'
                        })}
                      </span>
                    </div>
                    
                    {/* Estadísticas en grid móvil */}
                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div className="bg-slate-50 rounded-lg p-2">
                        <div className="text-sm font-semibold text-slate-700">
                          {item.processedData.keyConcepts.length}
                        </div>
                        <div className="text-xs text-slate-500">conceptos</div>
                      </div>
                      <div className="bg-slate-50 rounded-lg p-2">
                        <div className="text-sm font-semibold text-slate-700">
                          {item.processedData.quizQuestions.length}
                        </div>
                        <div className="text-xs text-slate-500">preguntas</div>
                      </div>
                      <div className="bg-slate-50 rounded-lg p-2">
                        <div className="text-sm font-semibold text-slate-700">
                          {item.processedData.relatedProblems.length}
                        </div>
                        <div className="text-xs text-slate-500">problemas</div>
                      </div>
                    </div>

                    {/* Indicador de estado */}
                    <div className="flex items-center justify-between mt-3 pt-2 border-t border-slate-100">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="text-xs text-slate-500">Completado</span>
                      </div>
                      <ChevronRightIcon className="w-4 h-4 text-slate-400" />
                    </div>
                  </div>
                </div>

                {/* Confirmación de eliminación individual */}
                {deleteConfirmId === item.id && (
                  <div className="mt-4 p-3 bg-slate-50 border border-slate-200 rounded-lg">
                    <div className="flex items-center gap-3">
                      <AlertTriangleIcon className="w-4 h-4 text-slate-500 flex-shrink-0" />
                      <div className="flex-1">
                        <p className="text-slate-600 text-sm mb-2">
                          ¿Estás seguro de que quieres eliminar este análisis?
                        </p>
                        <div className="flex gap-2">
                          <Button
                            variant="danger"
                            size="sm"
                            onClick={confirmDelete}
                            icon={<CheckIcon className="w-4 h-4" />}
                          >
                            Eliminar
                          </Button>
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={cancelDelete}
                            icon={<XIcon className="w-4 h-4" />}
                          >
                            Cancelar
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </Card>
            ))
          )}
        </div>

        {/* Estadísticas de la biblioteca - móvil optimizado */}
        {analysisHistory.length > 0 && (
          <div className="mt-4 sm:mt-6 pt-4 border-t border-slate-200">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 text-center">
              <div className="bg-slate-50 rounded-lg p-3">
                <div className="text-lg sm:text-2xl font-bold text-slate-700">{analysisHistory.length}</div>
                <div className="text-xs sm:text-sm text-slate-500">Análisis</div>
              </div>
              <div className="bg-slate-50 rounded-lg p-3">
                <div className="text-lg sm:text-2xl font-bold text-slate-700">
                  {analysisHistory.reduce((acc, item) => acc + item.processedData.keyConcepts.length, 0)}
                </div>
                <div className="text-xs sm:text-sm text-slate-500">Conceptos</div>
              </div>
              <div className="bg-slate-50 rounded-lg p-3">
                <div className="text-lg sm:text-2xl font-bold text-slate-700">
                  {analysisHistory.reduce((acc, item) => acc + item.processedData.quizQuestions.length, 0)}
                </div>
                <div className="text-xs sm:text-sm text-slate-500">Preguntas</div>
              </div>
              <div className="bg-slate-50 rounded-lg p-3">
                <div className="text-lg sm:text-2xl font-bold text-slate-700">
                  {analysisHistory.reduce((acc, item) => acc + item.processedData.relatedProblems.length, 0)}
                </div>
                <div className="text-xs sm:text-sm text-slate-500">Problemas</div>
              </div>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
});

export default LibraryView;