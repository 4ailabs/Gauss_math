import React, { useEffect, useState } from 'react';
import { useApp } from '../../contexts/AppContext';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { DownloadIcon, ChevronRightIcon, MenuIcon, XCloseIcon } from '../ui/Icons';
import { ResultsHeader } from '../results/ResultsHeader';
import { ResultsSummary } from '../results/ResultsSummary';
import { ConceptsSection } from '../results/ConceptsSection';
import { QuestionsSection } from '../results/QuestionsSection';
import { ProblemsSection } from '../results/ProblemsSection';
import { ResultsSidebar } from '../results/ResultsSidebar';

const ResultsView: React.FC = React.memo(() => {
  const { state: { processedData, selectedSubject }, setActiveView } = useApp();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Prevent body scroll when results view is open
  useEffect(() => {
    // Disable body scroll
    document.body.style.overflow = 'hidden';
    
    // Cleanup: restore body scroll when component unmounts
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  if (!processedData) {
    setActiveView('search');
    return null;
  }

  return (
    <div className="results-fullscreen">
      {/* Fixed Header */}
      <div className="results-header-fixed">
        <ResultsHeader 
          subject={selectedSubject}
          processedData={processedData}
        />
      </div>
      
      {/* Mobile Sidebar Toggle Button */}
      <button
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        className="md:hidden fixed bottom-4 right-4 z-50 bg-teal-600 text-white p-4 rounded-full shadow-lg hover:bg-teal-700 transition-colors min-h-[56px] min-w-[56px] flex items-center justify-center touch-manipulation safe-area-bottom safe-area-right"
        aria-label={isSidebarOpen ? 'Cerrar panel' : 'Abrir panel'}
        style={{ 
          bottom: `calc(1rem + env(safe-area-inset-bottom, 0px))`,
          right: `calc(1rem + env(safe-area-inset-right, 0px))`
        }}
      >
        {isSidebarOpen ? (
          <XCloseIcon className="w-6 h-6" />
        ) : (
          <MenuIcon className="w-6 h-6" />
        )}
      </button>

      {/* Main Content Area */}
      <div className="results-content-area">
        {/* Left Content Panel */}
        <div className="results-main-panel">
          <div className="max-w-5xl mx-auto p-4 sm:p-6 md:p-8 space-y-6 md:space-y-8">
            <ResultsSummary summary={processedData.summary} />
            
            <div className="bg-white border border-gray-200 rounded-xl p-4 sm:p-6 shadow-sm">
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                METODOLOGÍA
                <ChevronRightIcon className="w-4 h-4" />
              </h2>
              <p className="text-sm sm:text-base text-gray-800 leading-relaxed">
                Analizamos los apuntes proporcionados usando inteligencia artificial avanzada. 
                Se identificaron <span className="font-semibold text-teal-600">{processedData.keyConcepts.length} conceptos clave</span>, 
                se generaron <span className="font-semibold text-blue-600">{processedData.quizQuestions.length} preguntas de práctica</span>, 
                y se crearon <span className="font-semibold text-green-600">{processedData.relatedProblems.length} problemas relacionados</span>. 
                Cada elemento fue revisado para asegurar precisión matemática y relevancia educativa.
              </p>
            </div>

            <div className="space-y-6 md:space-y-8">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 border-b border-gray-200 pb-3">RESULTADOS</h2>
              
              <ConceptsSection concepts={processedData.keyConcepts} />
              <QuestionsSection questions={processedData.quizQuestions} />
              <ProblemsSection problems={processedData.relatedProblems} />
            </div>
            
            {/* Back Button */}
            <div className="text-center py-8 md:py-12">
              <Button
                variant="secondary"
                size="lg"
                onClick={() => setActiveView('search')}
                icon={<span>←</span>}
                className="w-full sm:w-auto"
              >
                Volver a Búsqueda
              </Button>
            </div>
          </div>
        </div>

        {/* Right Sidebar */}
        <div className={`results-sidebar-panel ${isSidebarOpen ? 'mobile-sidebar-open' : 'mobile-sidebar-closed'} md:block`}>
          <ResultsSidebar processedData={processedData} />
        </div>
      </div>

      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
    </div>
  );
});

export default ResultsView;