import React from 'react';
import { Card } from '../ui/Card';

interface ConceptsSectionProps {
  concepts: Array<{
    concept: string;
    definition: string;
  }>;
}

export const ConceptsSection: React.FC<ConceptsSectionProps> = React.memo(({ concepts }) => {
  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Conceptos Clave Identificados</h3>
        <div className="bg-teal-100 text-teal-800 px-3 py-1 rounded-full text-sm font-medium">
          {concepts.length} conceptos
        </div>
      </div>
      
      <div className="grid gap-4">
        {concepts.map((concept, index) => (
          <Card key={index} hover className="transition-all duration-200 hover:scale-[1.02]">
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 bg-teal-100 text-teal-600 rounded-full flex items-center justify-center text-sm font-semibold flex-shrink-0">
                {index + 1}
              </div>
              <div className="flex-1">
                <h4 className="text-lg font-semibold text-gray-900 mb-3">{concept.concept}</h4>
                <p className="text-gray-700 leading-relaxed">{concept.definition}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
});