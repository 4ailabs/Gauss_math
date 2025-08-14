import React from 'react';
import { Card } from '../ui/Card';
import { NetworkIcon, ArrowRightIcon, BookOpenIcon, LightbulbIcon, ChartBarIcon } from '../ui/Icons';

interface ConceptMapSectionProps {
  conceptMap: Array<{
    from: string;
    to: string;
    relationship: 'prerequisite' | 'application' | 'generalization' | 'specialization';
  }>;
}

export const ConceptMapSection: React.FC<ConceptMapSectionProps> = ({ conceptMap }) => {
  const getRelationshipIcon = (relationship: string) => {
    switch (relationship) {
      case 'prerequisite':
        return <BookOpenIcon className="w-4 h-4 text-blue-600" />;
      case 'application':
        return <LightbulbIcon className="w-4 h-4 text-green-600" />;
      case 'generalization':
        return <ChartBarIcon className="w-4 h-4 text-purple-600" />;
      case 'specialization':
        return <NetworkIcon className="w-4 h-4 text-orange-600" />;
      default:
        return <NetworkIcon className="w-4 h-4 text-gray-600" />;
    }
  };

  const getRelationshipLabel = (relationship: string) => {
    switch (relationship) {
      case 'prerequisite':
        return 'Prerrequisito';
      case 'application':
        return 'Aplicación';
      case 'generalization':
        return 'Generalización';
      case 'specialization':
        return 'Especialización';
      default:
        return 'Relación';
    }
  };

  const getRelationshipColor = (relationship: string) => {
    switch (relationship) {
      case 'prerequisite':
        return 'border-blue-200 bg-blue-50 text-blue-800';
      case 'application':
        return 'border-green-200 bg-green-50 text-green-800';
      case 'generalization':
        return 'border-purple-200 bg-purple-50 text-purple-800';
      case 'specialization':
        return 'border-orange-200 bg-orange-50 text-orange-800';
      default:
        return 'border-gray-200 bg-gray-50 text-gray-800';
    }
  };

  // Agrupar relaciones por tipo
  const groupedRelations = conceptMap.reduce((acc, relation) => {
    if (!acc[relation.relationship]) {
      acc[relation.relationship] = [];
    }
    acc[relation.relationship].push(relation);
    return acc;
  }, {} as Record<string, typeof conceptMap>);

  if (conceptMap.length === 0) {
    return (
      <Card className="p-6">
        <div className="text-center text-gray-500">
          <NetworkIcon className="w-12 h-12 mx-auto mb-4 text-gray-300" />
          <p>No se han identificado relaciones conceptuales en estos apuntes.</p>
          <p className="text-sm mt-2">Los conceptos se mostrarán de forma independiente.</p>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl p-6 border border-purple-100">
        <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-3">
          <NetworkIcon className="w-8 h-8 text-purple-600" />
          Mapa Conceptual
        </h2>
        <p className="text-gray-700">
          Visualiza las relaciones y conexiones entre los conceptos matemáticos extraídos de tus apuntes.
        </p>
        
        <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {groupedRelations.prerequisite?.length || 0}
            </div>
            <div className="text-sm text-gray-600">Prerrequisitos</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {groupedRelations.application?.length || 0}
            </div>
            <div className="text-sm text-gray-600">Aplicaciones</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">
              {groupedRelations.generalization?.length || 0}
            </div>
            <div className="text-sm text-gray-600">Generalizaciones</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">
              {groupedRelations.specialization?.length || 0}
            </div>
            <div className="text-sm text-gray-600">Especializaciones</div>
          </div>
        </div>
      </div>

      {/* Relaciones agrupadas por tipo */}
      {Object.entries(groupedRelations).map(([relationshipType, relations]) => (
        <Card key={relationshipType} className="p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
            {getRelationshipIcon(relationshipType)}
            {getRelationshipLabel(relationshipType)} ({relations.length})
          </h3>
          
          <div className="space-y-3">
            {relations.map((relation, index) => (
              <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <div className="flex-1">
                  <span className="font-medium text-gray-900">{relation.from}</span>
                </div>
                
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getRelationshipColor(relation.relationship)}`}>
                    {getRelationshipLabel(relation.relationship)}
                  </span>
                  <ArrowRightIcon className="w-4 h-4 text-gray-400" />
                </div>
                
                <div className="flex-1 text-right">
                  <span className="font-medium text-gray-900">{relation.to}</span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      ))}

      {/* Visualización de red conceptual */}
      <Card className="p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">Red de Conceptos</h3>
        <div className="bg-gray-50 rounded-lg p-6 text-center">
          <NetworkIcon className="w-16 h-16 mx-auto mb-4 text-gray-400" />
          <p className="text-gray-600 mb-2">
            Visualización interactiva del mapa conceptual
          </p>
          <p className="text-sm text-gray-500">
            {conceptMap.length} conexiones identificadas entre conceptos
          </p>
          
          {/* Gráfico simple de nodos */}
          <div className="mt-6 flex justify-center">
            <div className="relative">
              {/* Nodos de ejemplo */}
              <div className="flex items-center gap-8">
                <div className="w-16 h-16 bg-blue-100 border-2 border-blue-300 rounded-full flex items-center justify-center text-xs font-medium text-blue-800">
                  Concepto A
                </div>
                <div className="w-8 h-8 bg-green-100 border-2 border-green-300 rounded-full flex items-center justify-center">
                  <ArrowRightIcon className="w-4 h-4 text-green-600" />
                </div>
                <div className="w-16 h-16 bg-purple-100 border-2 border-purple-300 rounded-full flex items-center justify-center text-xs font-medium text-purple-800">
                  Concepto B
                </div>
              </div>
              
              {/* Líneas de conexión */}
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-24 h-0.5 bg-gray-300 -z-10"></div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};
