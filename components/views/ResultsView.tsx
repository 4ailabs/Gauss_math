import React from 'react';
import { useApp } from '../../contexts/AppContext';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { DownloadIcon, ChevronRightIcon } from '../ui/Icons';
import { ResultsHeader } from '../results/ResultsHeader';
import { ResultsSummary } from '../results/ResultsSummary';
import { ConceptsSection } from '../results/ConceptsSection';
import { QuestionsSection } from '../results/QuestionsSection';
import { ProblemsSection } from '../results/ProblemsSection';
import { ResultsSidebar } from '../results/ResultsSidebar';

const ResultsView: React.FC = React.memo(() => {
  const { state: { processedData, selectedSubject }, setActiveView } = useApp();

  if (!processedData) {
    setActiveView('search');
    return null;
  }

  const handleExport = () => {
    const content = `
Análisis de ${selectedSubject}
${new Date().toLocaleDateString('es-ES')}

RESUMEN:
${processedData.summary}

CONCEPTOS CLAVE:
${processedData.keyConcepts.map((c, i) => `${i+1}. ${c.concept}: ${c.definition}`).join('\n')}

PREGUNTAS DE PRÁCTICA:
${processedData.quizQuestions.map((q, i) => `${i+1}. ${q.question}`).join('\n')}

PROBLEMAS RELACIONADOS:
${processedData.relatedProblems.map((p, i) => `${i+1}. ${p.problem}`).join('\n')}
    `;
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `analisis-${selectedSubject}-${new Date().toISOString().split('T')[0]}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex min-h-screen">
        <div className="flex-1 max-w-4xl">
          <ResultsHeader 
            subject={selectedSubject}
            onExport={handleExport}
          />
          
          <div className="space-y-8 p-6">
            <ResultsSummary summary={processedData.summary} />
            
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                METODOLOGÍA
                <ChevronRightIcon className="w-4 h-4" />
              </h2>
              <p className="text-gray-800 leading-relaxed text-sm">
                Analizamos los apuntes proporcionados usando inteligencia artificial avanzada. 
                Se identificaron {processedData.keyConcepts.length} conceptos clave, 
                se generaron {processedData.quizQuestions.length} preguntas de práctica, 
                y se crearon {processedData.relatedProblems.length} problemas relacionados. 
                Cada elemento fue revisado para asegurar precisión matemática y relevancia educativa.
              </p>
            </div>

            <div className="space-y-8">
              <h2 className="text-xl font-semibold text-gray-900">RESULTADOS</h2>
              
              <ConceptsSection concepts={processedData.keyConcepts} />
              <QuestionsSection questions={processedData.quizQuestions} />
              <ProblemsSection problems={processedData.relatedProblems} />
            </div>
          </div>
        </div>

        <ResultsSidebar processedData={processedData} />
      </div>
      
      <div className="text-center py-8">
        <Button
          variant="secondary"
          onClick={() => setActiveView('search')}
          icon={<span>←</span>}
        >
          Volver a Búsqueda
        </Button>
      </div>
    </div>
  );
});

export default ResultsView;