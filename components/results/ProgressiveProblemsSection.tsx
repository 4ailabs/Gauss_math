import React, { useState } from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { ChevronDownIcon, ChevronRightIcon, BookOpenIcon, ZapIcon, StarIcon } from '../ui/Icons';

interface ProgressiveProblemsSectionProps {
  problems: Array<{
    problem: string;
    solution: string;
  }>;
}

export const ProgressiveProblemsSection: React.FC<ProgressiveProblemsSectionProps> = React.memo(({ problems }) => {
  const [expandedProblems, setExpandedProblems] = useState<{[key: number]: boolean}>({});
  const [currentLevel, setCurrentLevel] = useState(0);
  const [completedProblems, setCompletedProblems] = useState<{[key: number]: boolean}>({});

  const toggleProblem = (index: number) => {
    setExpandedProblems(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  const markAsCompleted = (index: number) => {
    setCompletedProblems(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  const getDifficultyLevel = (index: number) => {
    if (index < Math.ceil(problems.length / 3)) return 'Básico';
    if (index < Math.ceil((problems.length * 2) / 3)) return 'Intermedio';
    return 'Avanzado';
  };

  const getDifficultyColor = (index: number) => {
    if (index < Math.ceil(problems.length / 3)) return 'bg-green-100 text-green-800 border-green-200';
    if (index < Math.ceil((problems.length * 2) / 3)) return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    return 'bg-red-100 text-red-800 border-red-200';
  };

  const getDifficultyIcon = (index: number) => {
    if (index < Math.ceil(problems.length / 3)) return <BookOpenIcon className="w-4 h-4" />;
    if (index < Math.ceil((problems.length * 2) / 3)) return <ZapIcon className="w-4 h-4" />;
    return <StarIcon className="w-4 h-4" />;
  };

  const getCompletionStats = () => {
    const completed = Object.values(completedProblems).filter(Boolean).length;
    return { completed, total: problems.length };
  };

  const stats = getCompletionStats();

  return (
    <div className="space-y-6">
      {/* Header con estadísticas */}
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-4 sm:p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-green-800">Problemas de Práctica Progresiva</h3>
          <div className="flex items-center gap-2">
            <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
              {stats.completed}/{stats.total} completados
            </div>
          </div>
        </div>
        
        {/* Barra de progreso */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm text-green-700">
            <span>Progreso General</span>
            <span>{Math.round((stats.completed / stats.total) * 100)}%</span>
          </div>
          <div className="w-full bg-green-200 rounded-full h-2">
            <div 
              className="bg-green-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(stats.completed / stats.total) * 100}%` }}
            />
          </div>
        </div>

        {/* Niveles de dificultad */}
        <div className="grid grid-cols-3 gap-3 mt-4">
          {['Básico', 'Intermedio', 'Avanzado'].map((level, index) => {
            const levelProblems = problems.filter((_, pIndex) => {
              if (index === 0) return pIndex < Math.ceil(problems.length / 3);
              if (index === 1) return pIndex >= Math.ceil(problems.length / 3) && pIndex < Math.ceil((problems.length * 2) / 3);
              return pIndex >= Math.ceil((problems.length * 2) / 3);
            });
            
            const levelCompleted = levelProblems.filter((_, pIndex) => {
              const actualIndex = index === 0 ? pIndex : 
                                 index === 1 ? pIndex + Math.ceil(problems.length / 3) :
                                 pIndex + Math.ceil((problems.length * 2) / 3);
              return completedProblems[actualIndex];
            }).length;

            return (
              <div key={level} className="text-center">
                <div className={`p-2 rounded-lg text-xs font-medium border ${
                  index === 0 ? 'bg-green-100 text-green-800 border-green-200' :
                  index === 1 ? 'bg-yellow-100 text-yellow-800 border-yellow-200' :
                  'bg-red-100 text-red-800 border-red-200'
                }`}>
                  <div className="font-semibold">{level}</div>
                  <div>{levelCompleted}/{levelProblems.length}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Lista de problemas */}
      <div className="space-y-4">
        {problems.map((problem, index) => {
          const isExpanded = expandedProblems[index];
          const isCompleted = completedProblems[index];
          
          return (
            <Card 
              key={index} 
              className={`transition-all duration-200 ${
                isCompleted ? 'bg-green-50 border-green-200' : 'hover:shadow-md'
              }`}
            >
              <div className="space-y-4">
                {/* Header del problema */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                      isCompleted ? 'bg-green-500 text-white' : 'bg-slate-100 text-slate-600'
                    }`}>
                      {isCompleted ? '✓' : index + 1}
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getDifficultyColor(index)}`}>
                        {getDifficultyIcon(index)}
                        {getDifficultyLevel(index)}
                      </span>
                      
                      <h4 className="font-medium text-slate-700">Problema {index + 1}</h4>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => markAsCompleted(index)}
                      className={isCompleted ? 'text-green-600' : 'text-slate-500'}
                    >
                      {isCompleted ? 'Completado' : 'Marcar como completado'}
                    </Button>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleProblem(index)}
                      icon={isExpanded ? <ChevronDownIcon className="w-4 h-4" /> : <ChevronRightIcon className="w-4 h-4" />}
                    >
                      {isExpanded ? 'Ocultar' : 'Ver'}
                    </Button>
                  </div>
                </div>

                {/* Enunciado del problema */}
                <div className="pl-11">
                  <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
                    <h5 className="font-medium text-slate-800 mb-2">Enunciado:</h5>
                    <p className="text-slate-700 leading-relaxed">{problem.problem}</p>
                  </div>
                </div>

                {/* Solución expandible */}
                {isExpanded && (
                  <div className="pl-11">
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <h5 className="font-medium text-blue-800 mb-2 flex items-center gap-2">
                        <BookOpenIcon className="w-4 h-4" />
                        Solución Detallada:
                      </h5>
                      <div className="text-blue-700 leading-relaxed whitespace-pre-line">
                        {problem.solution}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </Card>
          );
        })}
      </div>

      {/* Resumen final */}
      {stats.completed === stats.total && stats.total > 0 && (
        <Card className="text-center p-6 bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
          <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <StarIcon className="w-8 h-8 text-white" />
          </div>
          <h3 className="text-xl font-bold text-green-800 mb-2">¡Felicitaciones!</h3>
          <p className="text-green-700">
            Has completado todos los problemas de práctica. ¡Excelente trabajo dominando estos conceptos!
          </p>
        </Card>
      )}
    </div>
  );
});