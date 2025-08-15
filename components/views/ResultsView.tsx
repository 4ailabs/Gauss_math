import React, { useEffect } from 'react';
import { useApp } from '../../contexts/AppContext';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { DownloadIcon, ChevronRightIcon, HomeIcon, BookOpenIcon } from '../ui/Icons';
import { ResultsHeader } from '../results/ResultsHeader';
import { ResultsSummary } from '../results/ResultsSummary';
import { ConceptsSection } from '../results/ConceptsSection';
import { QuestionsSection } from '../results/QuestionsSection';
import { ProblemsSection } from '../results/ProblemsSection';
import { ResultsSidebar } from '../results/ResultsSidebar';
import { EnhancedConceptsSection } from '../results/EnhancedConceptsSection';
import { ConceptMapSection } from '../results/ConceptMapSection';
import { InteractiveQuizSection } from '../results/InteractiveQuizSection';
import { ProgressiveProblemsSection } from '../results/ProgressiveProblemsSection';

const ResultsView: React.FC = React.memo(() => {
  const { state: { processedData, selectedSubject, searchType }, setActiveView } = useApp();

  // Prevent body scroll when results view is open
  useEffect(() => {
    // Función para manejar el scroll del body
    const handleBodyScroll = () => {
      const isMobile = window.innerWidth < 768;
      
      if (isMobile) {
        // En móvil, no interferir con el scroll natural del body
        // Dejar que results-fullscreen maneje el scroll internamente
        document.body.style.overflow = 'hidden';
        document.body.style.position = 'relative';
      } else {
        // En desktop, prevenir scroll del body
        document.body.style.overflow = 'hidden';
        document.body.style.position = 'fixed';
        document.body.style.width = '100%';
        document.body.style.height = '100%';
      }
    };

    // Aplicar configuración inicial
    handleBodyScroll();
    
    // Debug: Log sidebar visibility
    console.log('ResultsView mounted, processedData:', processedData);
    console.log('Sidebar should be visible on desktop');
    console.log('Mobile scroll enabled:', window.innerWidth < 768);

    // Agregar listener para resize
    window.addEventListener('resize', handleBodyScroll);

    // Cleanup: restore body scroll when component unmounts
    return () => {
      window.removeEventListener('resize', handleBodyScroll);
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.width = '';
      document.body.style.height = '';
    };
  }, [processedData]);

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
      
      {/* Main Content Area */}
      <div className="results-content-area">
        {/* Left Content Panel */}
        <div className="results-main-panel">
          <div className="max-w-5xl mx-auto p-4 sm:p-6 md:p-8 space-y-6 md:space-y-8">
            <ResultsSummary summary={processedData.summary} />
            
            <div className="bg-white border border-slate-200 rounded-xl p-4 sm:p-6 shadow-sm">
              <h2 className="text-sm sm:text-base font-medium text-slate-700 mb-3 flex items-center gap-2">
                METODOLOGÍA
                <ChevronRightIcon className="w-3 h-3" />
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Analizamos los apuntes proporcionados usando inteligencia artificial avanzada. 
                Se identificaron <span className="font-medium text-slate-600">{processedData.keyConcepts.length} conceptos clave</span>, 
                se generaron <span className="font-medium text-slate-600">{processedData.quizQuestions.length} preguntas de práctica</span>, 
                y se crearon <span className="font-medium text-slate-600">{processedData.relatedProblems.length} problemas relacionados</span>. 
                Cada elemento fue revisado para asegurar precisión matemática y relevancia educativa.
              </p>
            </div>

            <div className="space-y-6 md:space-y-8">
              {/* Renderizado diferenciado según el tipo de búsqueda */}
              {searchType === 'systematic' ? (
                // Vista especializada para Quiz
                <>
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-blue-600 font-bold text-lg">Q</span>
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-slate-700">Quiz Generado</h2>
                      <p className="text-sm text-slate-500">Evaluación interactiva sobre {selectedSubject}</p>
                    </div>
                  </div>
                  
                  {processedData.summary && (
                    <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 sm:p-6">
                      <h3 className="text-sm font-medium text-blue-800 mb-2">RESUMEN DEL CONTENIDO</h3>
                      <p className="text-blue-700 leading-relaxed">{processedData.summary}</p>
                    </div>
                  )}
                  
                  <InteractiveQuizSection questions={processedData.quizQuestions} />
                  
                  {processedData.keyConcepts.length > 0 && (
                    <div className="bg-slate-50 rounded-xl p-4 sm:p-6">
                      <h3 className="text-sm font-medium text-slate-700 mb-4">CONCEPTOS CLAVE EVALUADOS</h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {processedData.keyConcepts.map((concept, index) => (
                          <div key={index} className="bg-white p-3 rounded-lg border border-slate-200">
                            <h4 className="font-medium text-slate-700 text-sm">{concept.concept}</h4>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              ) : searchType === 'papers' ? (
                // Vista especializada para Problemas
                <>
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                      <span className="text-green-600 font-bold text-lg">P</span>
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-slate-700">Problemas de Práctica</h2>
                      <p className="text-sm text-slate-500">Ejercicios específicos de {selectedSubject}</p>
                    </div>
                  </div>
                  
                  {processedData.summary && (
                    <div className="bg-green-50 border border-green-200 rounded-xl p-4 sm:p-6">
                      <h3 className="text-sm font-medium text-green-800 mb-2">ANÁLISIS DEL TEMA</h3>
                      <p className="text-green-700 leading-relaxed">{processedData.summary}</p>
                    </div>
                  )}
                  
                  <ProgressiveProblemsSection problems={processedData.relatedProblems} />
                  
                  {processedData.quizQuestions.length > 0 && (
                    <div className="bg-slate-50 rounded-xl p-4 sm:p-6">
                      <h3 className="text-sm font-medium text-slate-700 mb-4">PREGUNTAS ADICIONALES</h3>
                      <div className="space-y-3">
                        {processedData.quizQuestions.map((question, index) => (
                          <div key={index} className="bg-white p-3 rounded-lg border border-slate-200">
                            <h4 className="font-medium text-slate-700 text-sm mb-1">{question.question}</h4>
                            <p className="text-xs text-slate-500">{question.answer}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {processedData.keyConcepts.length > 0 && (
                    <div className="bg-slate-50 rounded-xl p-4 sm:p-6">
                      <h3 className="text-sm font-medium text-slate-700 mb-4">CONCEPTOS RELACIONADOS</h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {processedData.keyConcepts.map((concept, index) => (
                          <div key={index} className="bg-white p-3 rounded-lg border border-slate-200">
                            <h4 className="font-medium text-slate-700 text-sm">{concept.concept}</h4>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              ) : (
                // Vista completa para Procesamiento de Apuntes (modo research)
                <>
                  <h2 className="text-base sm:text-lg font-medium text-slate-700 border-b border-slate-200 pb-2">RESULTADOS</h2>
                  
                  {/* Mostrar conceptos mejorados si están disponibles */}
                  {(processedData as any).enhancedConcepts ? (
                    <>
                      <EnhancedConceptsSection 
                        concepts={(processedData as any).enhancedConcepts}
                        difficultyDistribution={(processedData as any).difficultyDistribution || { basic: 0, intermediate: 0, advanced: 0 }}
                        subjectAreas={(processedData as any).subjectAreas || []}
                      />
                      
                      {/* Mapa conceptual si está disponible */}
                      {(processedData as any).conceptMap && (processedData as any).conceptMap.length > 0 && (
                        <ConceptMapSection conceptMap={(processedData as any).conceptMap} />
                      )}
                    </>
                  ) : (
                    <ConceptsSection concepts={processedData.keyConcepts} />
                  )}
                  
                  <QuestionsSection questions={processedData.quizQuestions} />
                  <ProblemsSection problems={processedData.relatedProblems} />
                </>
              )}
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
            
            {/* Footer del Reporte */}
            <div className="border-t border-gray-200 pt-8 md:pt-12">
              <div className="text-center space-y-4">
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                  <Button
                    variant="primary"
                    size="md"
                    onClick={() => setActiveView('search')}
                    icon={<HomeIcon className="w-5 h-5" />}
                    className="w-full sm:w-auto"
                  >
                    Ir al Inicio
                  </Button>
                  
                  <Button
                    variant="ghost"
                    size="md"
                    onClick={() => setActiveView('library')}
                    icon={<BookOpenIcon className="w-5 h-5" />}
                    className="w-full sm:w-auto text-gray-600 hover:text-gray-800"
                  >
                    Ver Biblioteca
                  </Button>
                </div>
                
                <div className="text-xs text-gray-400 pt-4">
                  <p>Reporte generado con Gauss∑ AI</p>
                  <p className="mt-1">Powered by 4ailabs</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Sidebar - Solo visible en desktop */}
        <div className="hidden md:block w-80 min-w-w-80 border-l border-gray-200 bg-white">
          <ResultsSidebar processedData={processedData} />
        </div>
      </div>
    </div>
  );
});

export default ResultsView;