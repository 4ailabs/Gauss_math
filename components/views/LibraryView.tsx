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
    <div className="space-y-6">
      <Card padding="lg">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <BookOpenIcon className="w-8 h-8 text-slate-500" />
            <div>
              <h2 className="text-2xl font-bold text-slate-600">Biblioteca</h2>
              <p className="text-slate-500 text-sm">
                Haz click en cualquier análisis para revisar los resultados
              </p>
            </div>
          </div>
          
          {analysisHistory.length > 0 && (
            <div className="flex items-center gap-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={handleClearAll}
                icon={<Trash2Icon className="w-4 h-4" />}
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                Limpiar Todo
              </Button>
            </div>
          )}
        </div>

        {/* Confirmación para limpiar todo */}
        {clearConfirm && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-start gap-3">
              <AlertTriangleIcon className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <h3 className="font-semibold text-red-800 mb-2">
                  ¿Estás seguro de que quieres limpiar toda la biblioteca?
                </h3>
                <p className="text-red-700 text-sm mb-3">
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
                <span className="text-gray-400 text-2xl">📚</span>
              </div>
              <p className="text-gray-600 text-lg mb-2">Tu biblioteca está vacía</p>
              <p className="text-gray-500 text-sm">Los análisis que realices aparecerán aquí</p>
            </div>
          ) : (
            analysisHistory.map((item) => (
              <Card 
                key={item.id} 
                hover 
                className="transition-all duration-200 hover:scale-[1.02]"
              >
                <div className="flex items-start justify-between">
                  <div 
                    className="flex-1 cursor-pointer"
                    onClick={() => loadFromHistory(item)}
                  >
                    <h3 className="font-semibold text-gray-900 mb-2">{item.title}</h3>
                    <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
                      <span className="bg-teal-100 text-teal-800 px-2 py-1 rounded-full">
                        {item.subject}
                      </span>
                      <span>{new Date(item.timestamp).toLocaleDateString('es-ES')}</span>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-slate-500">
                      <span>{item.processedData.keyConcepts.length} conceptos</span>
                      <span>{item.processedData.quizQuestions.length} preguntas</span>
                      <span>{item.processedData.relatedProblems.length} problemas</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <div className="text-right mr-2">
                      <div className="w-2 h-2 bg-green-400 rounded-full mb-1"></div>
                      <span className="text-xs text-slate-500">Completado</span>
                    </div>
                    
                    {/* Botón de eliminar */}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(item.id)}
                      icon={<Trash2Icon className="w-4 h-4" />}
                      className="text-gray-400 hover:text-red-600 hover:bg-red-50 p-2"
                      title="Eliminar análisis"
                    >
                      Eliminar
                    </Button>
                    
                    <ChevronRightIcon className="w-5 h-5 text-slate-400" />
                  </div>
                </div>

                {/* Confirmación de eliminación individual */}
                {deleteConfirmId === item.id && (
                  <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <div className="flex items-center gap-3">
                      <AlertTriangleIcon className="w-4 h-4 text-red-600 flex-shrink-0" />
                      <div className="flex-1">
                        <p className="text-red-700 text-sm mb-2">
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

        {/* Estadísticas de la biblioteca */}
        {analysisHistory.length > 0 && (
          <div className="mt-6 pt-4 border-t border-slate-200">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-slate-600">{analysisHistory.length}</div>
                <div className="text-sm text-slate-500">Total Análisis</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-slate-600">
                  {analysisHistory.reduce((acc, item) => acc + item.processedData.keyConcepts.length, 0)}
                </div>
                <div className="text-sm text-slate-500">Conceptos Totales</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-slate-600">
                  {analysisHistory.reduce((acc, item) => acc + item.processedData.quizQuestions.length, 0)}
                </div>
                <div className="text-sm text-slate-500">Preguntas Generadas</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-slate-600">
                  {analysisHistory.reduce((acc, item) => acc + item.processedData.relatedProblems.length, 0)}
                </div>
                <div className="text-sm text-slate-500">Problemas Creados</div>
              </div>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
});

export default LibraryView;