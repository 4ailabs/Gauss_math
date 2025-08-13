import React from 'react';
import { Card } from '../ui/Card';

interface ProblemsSectionProps {
  problems: Array<{
    problem: string;
    solution: string;
  }>;
}

export const ProblemsSection: React.FC<ProblemsSectionProps> = React.memo(({ problems }) => {
  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Problemas Relacionados</h3>
        <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
          {problems.length} problemas
        </div>
      </div>
      
      <div className="grid gap-4">
        {problems.map((problem, index) => (
          <Card key={index} hover className="transition-all duration-200 hover:scale-[1.02]">
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-sm font-semibold flex-shrink-0">
                {index + 1}
              </div>
              <div className="flex-1">
                <h4 className="text-lg font-semibold text-gray-900 mb-3">{problem.problem}</h4>
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <h5 className="text-sm font-medium text-gray-900 mb-2">Solución:</h5>
                  <p className="text-gray-700 leading-relaxed">{problem.solution}</p>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
});