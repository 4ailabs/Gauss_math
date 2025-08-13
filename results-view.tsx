import React from 'react';
import { ProcessedData } from './types';
import { CheckIcon, ChevronRightIcon, RefreshCwIcon } from './components/ui/Icons';

interface ResultsViewProps {
  processedData: ProcessedData;
  selectedSubject: string;
  setActiveView: (view: string) => void;
  handleChatMessage: (message: string) => void;
  setAssistantHistory: React.Dispatch<React.SetStateAction<any[]>>;
}

export const ResultsView: React.FC<ResultsViewProps> = ({
  processedData,
  selectedSubject,
  setActiveView,
  handleChatMessage,
  setAssistantHistory
}) => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation Bar */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6">
            <h2 className="text-lg font-semibold text-gray-900">{selectedSubject}</h2>
            <div className="flex items-center gap-2">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              </div>
              <span className="text-sm text-gray-600">Análisis de apuntes</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={() => {
                if (navigator.share) {
                  navigator.share({
                    title: `Análisis de ${selectedSubject}`,
                    text: processedData.summary,
                    url: window.location.href
                  });
                } else {
                  navigator.clipboard.writeText(processedData.summary);
                  alert('Análisis copiado al portapapeles');
                }
              }}
              className="text-sm text-gray-600 hover:text-gray-800 transition-colors"
            >
              Compartir
            </button>
            <button 
              onClick={() => {
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
              }}
              className="text-sm text-gray-600 hover:text-gray-800 transition-colors"
            >
              Descargar
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex min-h-screen">
        {/* Left Content Area */}
        <div className="flex-1 overflow-y-auto">
          {/* Report Header */}
          <div className="bg-white border-b border-gray-200 px-8 py-8">
            <div className="mb-6">
              <p className="text-sm text-gray-500 mb-2">{new Date().toLocaleDateString('es-ES', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              }).toUpperCase()}</p>
              <h1 className="text-4xl font-bold text-gray-900">{selectedSubject}</h1>
            </div>
            
            <div className="text-gray-700 leading-relaxed">
              <p className="text-lg">
                Análisis completo de apuntes procesados con inteligencia artificial para identificar conceptos clave, 
                generar preguntas de práctica y crear problemas relacionados para reforzar el aprendizaje.
              </p>
            </div>
          </div>

          {/* Report Content */}
          <div className="bg-white px-8 py-8">
            {/* ABSTRACT Section */}
            <div className="mb-10">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">RESUMEN</h2>
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
                <p className="text-gray-800 leading-relaxed text-lg">{processedData.summary}</p>
              </div>
            </div>

            {/* METHODS Section */}
            <div className="mb-10">
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                METODOLOGÍA
                <ChevronRightIcon className="w-4 h-4" />
              </h2>
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
                <p className="text-gray-800 leading-relaxed text-lg">
                  Analizamos los apuntes proporcionados usando inteligencia artificial avanzada. 
                  Se identificaron {processedData.keyConcepts.length} conceptos clave, 
                  se generaron {processedData.quizQuestions.length} preguntas de práctica, 
                  y se crearon {processedData.relatedProblems.length} problemas relacionados. 
                  Cada elemento fue revisado para asegurar precisión matemática y relevancia educativa.
                </p>
              </div>
            </div>

            {/* RESULTS Section */}
            <div className="mb-10">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">RESULTADOS</h2>
              
              {/* Summary Statistics */}
              <div className="mb-8">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Resumen del Análisis</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-teal-100 rounded-full flex items-center justify-center">
                        <span className="text-teal-600 font-bold text-xl">{processedData.keyConcepts.length}</span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">Conceptos Clave</p>
                        <p className="text-xs text-gray-600">Identificados</p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-blue-600 font-bold text-xl">{processedData.quizQuestions.length}</span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">Preguntas</p>
                        <p className="text-xs text-gray-600">De práctica</p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                        <span className="text-green-600 font-bold text-xl">{processedData.relatedProblems.length}</span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">Problemas</p>
                        <p className="text-xs text-gray-600">Relacionados</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Key Concepts */}
              <div className="mb-8">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Conceptos Clave Identificados</h3>
                <div className="space-y-4">
                  {processedData.keyConcepts.map((concept, index) => (
                    <div key={index} className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
                      <div className="flex items-start gap-4">
                        <div className="w-8 h-8 bg-teal-600 rounded-full flex items-center justify-center flex-shrink-0">
                          <span className="text-sm font-bold text-white">{index + 1}</span>
                        </div>
                        <div className="flex-1">
                          <h4 className="text-lg font-semibold text-gray-900 mb-3">{concept.concept}</h4>
                          <p className="text-gray-700 leading-relaxed">{concept.definition}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Practice Questions */}
              <div className="mb-8">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Preguntas de Práctica Generadas</h3>
                <div className="space-y-4">
                  {processedData.quizQuestions.map((question, index) => (
                    <div key={index} className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
                      <div className="flex items-start gap-4">
                        <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                          <span className="text-sm font-bold text-white">{index + 1}</span>
                        </div>
                        <div className="flex-1">
                          <h4 className="text-lg font-semibold text-gray-900 mb-3">{question.question}</h4>
                          <div className="flex items-center gap-2 mb-3">
                            <span className="text-xs bg-blue-100 text-blue-800 px-3 py-1 rounded-full font-medium">
                              {question.type}
                            </span>
                          </div>
                          <p className="text-gray-700 leading-relaxed">{question.answer}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Related Problems */}
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Problemas Relacionados</h3>
                <div className="space-y-4">
                  {processedData.relatedProblems.map((problem, index) => (
                    <div key={index} className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
                      <div className="flex items-start gap-4">
                        <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center flex-shrink-0">
                          <span className="text-sm font-bold text-white">{index + 1}</span>
                        </div>
                        <div className="flex-1">
                          <h4 className="text-lg font-semibold text-gray-900 mb-3">{problem.problem}</h4>
                          <p className="text-gray-700 leading-relaxed">{problem.solution}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="w-80 bg-white border-l border-gray-200 flex flex-col">
          {/* Report Status */}
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Reporte</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-900">Estado</span>
                <button className="text-gray-500 hover:text-gray-700">
                  <div className="flex">
                    <div className="w-3 h-3 border-t border-l border-gray-400 transform rotate-45"></div>
                    <div className="w-3 h-3 border-b border-r border-gray-400 transform -rotate-45"></div>
                  </div>
                </button>
              </div>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 bg-teal-600 rounded-full flex items-center justify-center">
                    <CheckIcon className="w-3 h-3 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">Procesar contenido</p>
                    <p className="text-xs text-gray-600">Análisis completado</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 bg-teal-600 rounded-full flex items-center justify-center">
                    <CheckIcon className="w-3 h-3 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">Extraer conceptos</p>
                    <p className="text-xs text-gray-600">{processedData.keyConcepts.length} conceptos</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 bg-teal-600 rounded-full flex items-center justify-center">
                    <CheckIcon className="w-3 h-3 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">Generar preguntas</p>
                    <p className="text-xs text-gray-600">{processedData.quizQuestions.length} preguntas</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 bg-teal-600 rounded-full flex items-center justify-center">
                    <CheckIcon className="w-3 h-3 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">Crear problemas</p>
                    <p className="text-xs text-gray-600">{processedData.relatedProblems.length} problemas</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Chat Section */}
          <div className="flex-1 p-6 flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Chat</h3>
              <button 
                onClick={() => setAssistantHistory([])}
                className="text-gray-500 hover:text-gray-700"
                title="Limpiar chat"
              >
                <RefreshCwIcon className="w-4 h-4" />
              </button>
            </div>
            
            {/* Chat Messages */}
            <div className="flex-1 bg-gray-50 rounded-lg p-3 mb-4 overflow-y-auto max-h-64">
              <div className="text-center text-gray-500 text-sm">
                <p>Haz preguntas sobre el análisis</p>
              </div>
            </div>
            
            {/* Chat Input */}
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Pregunta sobre el análisis..."
                className="flex-1 bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500 focus:outline-none"
                onKeyPress={(e) => e.key === 'Enter' && handleChatMessage(e.currentTarget.value)}
              />
              <button 
                onClick={() => {
                  const input = document.querySelector('input[placeholder="Pregunta sobre el análisis..."]') as HTMLInputElement;
                  if (input) handleChatMessage(input.value);
                }}
                className="px-3 py-2 rounded-lg text-sm font-medium bg-teal-600 hover:bg-teal-700 text-white transition-colors"
              >
                <ChevronRightIcon className="w-4 h-4" />
              </button>
            </div>
            
            <button 
              onClick={() => setActiveView('chat')}
              className="w-full mt-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2 px-4 rounded-lg transition-colors"
            >
              Chat Completo
            </button>
          </div>
        </div>
      </div>
      
      {/* Back to Search Button */}
      <div className="mt-8 text-center">
        <button
          onClick={() => setActiveView('search')}
          className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-3 rounded-lg font-medium transition-colors"
        >
          ← Volver a Búsqueda
        </button>
      </div>
    </div>
  );
};
