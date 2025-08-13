import React from 'react';
import { Card } from '../ui/Card';

interface QuestionsSectionProps {
  questions: Array<{
    question: string;
    answer: string;
    type: string;
  }>;
}

export const QuestionsSection: React.FC<QuestionsSectionProps> = React.memo(({ questions }) => {
  const getTypeColor = (type: string) => {
    switch (type) {
      case 'definition':
        return 'bg-blue-100 text-blue-800';
      case 'problem':
        return 'bg-green-100 text-green-800';
      case 'theorem':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'definition':
        return 'Definición';
      case 'problem':
        return 'Problema';
      case 'theorem':
        return 'Teorema';
      default:
        return type;
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Preguntas de Práctica Generadas</h3>
        <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
          {questions.length} preguntas
        </div>
      </div>
      
      <div className="grid gap-4">
        {questions.map((question, index) => (
          <Card key={index} hover className="transition-all duration-200 hover:scale-[1.02]">
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-semibold flex-shrink-0">
                {index + 1}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-3">
                  <h4 className="text-lg font-semibold text-gray-900 flex-1">{question.question}</h4>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(question.type)}`}>
                    {getTypeLabel(question.type)}
                  </span>
                </div>
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <p className="text-gray-700 leading-relaxed">{question.answer}</p>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
});