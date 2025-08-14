import React from 'react';
import { EnhancedMathConcept } from '../../services/enhancedMathService';
import { Card } from '../ui/Card';
import { BookOpenIcon, LightbulbIcon, ChartBarIcon, GraduationCapIcon } from '../ui/Icons';

interface EnhancedConceptsSectionProps {
  concepts: EnhancedMathConcept[];
  difficultyDistribution: {
    basic: number;
    intermediate: number;
    advanced: number;
  };
  subjectAreas: string[];
}

export const EnhancedConceptsSection: React.FC<EnhancedConceptsSectionProps> = ({
  concepts,
  difficultyDistribution,
  subjectAreas
}) => {
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'basic':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'intermediate':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'advanced':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getDifficultyIcon = (difficulty: string) => {
    switch (difficulty) {
      case 'basic':
        return <GraduationCapIcon className="w-4 h-4" />;
      case 'intermediate':
        return <ChartBarIcon className="w-4 h-4" />;
      case 'advanced':
        return <LightbulbIcon className="w-4 h-4" />;
      default:
        return <BookOpenIcon className="w-4 h-4" />;
    }
  };

  const getDifficultyLabel = (difficulty: string) => {
    switch (difficulty) {
      case 'basic':
        return 'Básico';
      case 'intermediate':
        return 'Intermedio';
      case 'advanced':
        return 'Avanzado';
      default:
        return 'Intermedio';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header con estadísticas */}
      <div className="bg-gradient-to-r from-teal-50 to-blue-50 rounded-xl p-6 border border-teal-100">
        <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-3">
          <BookOpenIcon className="w-8 h-8 text-teal-600" />
          Conceptos Matemáticos Mejorados
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div className="text-center">
            <div className="text-3xl font-bold text-teal-600">{concepts.length}</div>
            <div className="text-sm text-gray-600">Total Conceptos</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600">{subjectAreas.length}</div>
            <div className="text-sm text-gray-600">Áreas Temáticas</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-purple-600">
              {Math.round((difficultyDistribution.advanced / concepts.length) * 100)}%
            </div>
            <div className="text-sm text-gray-600">Nivel Avanzado</div>
          </div>
        </div>

        {/* Distribución de dificultad */}
        <div className="space-y-3">
          <h3 className="font-semibold text-gray-800">Distribución por Dificultad</h3>
          <div className="flex gap-2">
            <div className="flex-1 bg-green-200 rounded-full h-3">
              <div 
                className="bg-green-500 h-3 rounded-full transition-all duration-500"
                style={{ width: `${(difficultyDistribution.basic / concepts.length) * 100}%` }}
              />
            </div>
            <div className="flex-1 bg-yellow-200 rounded-full h-3">
              <div 
                className="bg-yellow-500 h-3 rounded-full transition-all duration-500"
                style={{ width: `${(difficultyDistribution.intermediate / concepts.length) * 100}%` }}
              />
            </div>
            <div className="flex-1 bg-red-200 rounded-full h-3">
              <div 
                className="bg-red-500 h-3 rounded-full transition-all duration-500"
                style={{ width: `${(difficultyDistribution.advanced / concepts.length) * 100}%` }}
              />
            </div>
          </div>
          <div className="flex justify-between text-xs text-gray-600">
            <span>Básico: {difficultyDistribution.basic}</span>
            <span>Intermedio: {difficultyDistribution.intermediate}</span>
            <span>Avanzado: {difficultyDistribution.advanced}</span>
          </div>
        </div>

        {/* Áreas temáticas */}
        <div className="mt-4">
          <h3 className="font-semibold text-gray-800 mb-2">Áreas Temáticas</h3>
          <div className="flex flex-wrap gap-2">
            {subjectAreas.map((area, index) => (
              <span
                key={index}
                className="px-3 py-1 bg-teal-100 text-teal-800 rounded-full text-sm font-medium border border-teal-200"
              >
                {area}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Lista de conceptos */}
      <div className="space-y-4">
        {concepts.map((concept, index) => (
          <Card key={index} className="p-6 hover:shadow-lg transition-shadow duration-200">
            <div className="space-y-4">
              {/* Header del concepto */}
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {concept.concept}
                  </h3>
                  <div className="flex items-center gap-2 mb-3">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium border flex items-center gap-2 ${getDifficultyColor(concept.difficulty)}`}>
                      {getDifficultyIcon(concept.difficulty)}
                      {getDifficultyLabel(concept.difficulty)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Definición */}
              <div>
                <h4 className="font-medium text-gray-800 mb-2 flex items-center gap-2">
                  <BookOpenIcon className="w-4 h-4 text-teal-600" />
                  Definición
                </h4>
                <p className="text-gray-700 leading-relaxed">{concept.definition}</p>
              </div>

              {/* Fórmulas */}
              {concept.formulas && concept.formulas.length > 0 && (
                <div>
                  <h4 className="font-medium text-gray-800 mb-2 flex items-center gap-2">
                    <ChartBarIcon className="w-4 h-4 text-blue-600" />
                    Fórmulas Relacionadas
                  </h4>
                  <div className="space-y-2">
                    {concept.formulas.map((formula, idx) => (
                      <div key={idx} className="bg-gray-50 p-3 rounded-lg font-mono text-sm">
                        {formula}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Ejemplos */}
              {concept.examples && concept.examples.length > 0 && (
                <div>
                  <h4 className="font-medium text-gray-800 mb-2 flex items-center gap-2">
                    <LightbulbIcon className="w-4 h-4 text-yellow-600" />
                    Ejemplos
                  </h4>
                  <div className="space-y-2">
                    {concept.examples.map((example, idx) => (
                      <div key={idx} className="bg-blue-50 p-3 rounded-lg text-sm">
                        {example}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Prerrequisitos y aplicaciones */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Prerrequisitos */}
                {concept.prerequisites && concept.prerequisites.length > 0 && (
                  <div>
                    <h4 className="font-medium text-gray-800 mb-2">Prerrequisitos</h4>
                    <div className="space-y-1">
                      {concept.prerequisites.map((prereq, idx) => (
                        <div key={idx} className="flex items-center gap-2 text-sm text-gray-600">
                          <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                          {prereq}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Aplicaciones */}
                {concept.applications && concept.applications.length > 0 && (
                  <div>
                    <h4 className="font-medium text-gray-800 mb-2">Aplicaciones</h4>
                    <div className="space-y-1">
                      {concept.applications.map((app, idx) => (
                        <div key={idx} className="flex items-center gap-2 text-sm text-gray-600">
                          <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                          {app}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Texto fuente */}
              {concept.sourceText && concept.sourceText !== 'Texto fuente no encontrado' && (
                <div className="bg-gray-50 p-3 rounded-lg">
                  <h4 className="font-medium text-gray-800 mb-2 text-sm">Texto Fuente</h4>
                  <p className="text-sm text-gray-600 italic">"{concept.sourceText}"</p>
                </div>
              )}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};
