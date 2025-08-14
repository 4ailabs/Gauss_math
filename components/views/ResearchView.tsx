import React, { useState, useCallback, useEffect } from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { useApp } from '../../contexts/AppContext';
import { 
  BookOpenIcon, 
  LightbulbIcon, 
  MessageCircleIcon, 
  TargetIcon,
  CheckIcon,
  RefreshCwIcon,
  FileTextIcon,
  GraduationCapIcon,
  CopyIcon
} from '../ui/Icons';
import { 
  createResearchPlan, 
  refineResearchPlan, 
  researchSubtopic, 
  synthesizeReport,
  isGeminiAvailable,
  type Source,
  type FinalReport
} from '../../services/researchService';
import { useResearchPersistence } from '../../hooks/useResearchPersistence';
import { usePageVisibility } from '../../hooks/usePageVisibility';
import { ResearchExitWarning } from '../ui/ResearchExitWarning';
import { EnhancedSourcesDisplay } from '../ui/EnhancedSourcesDisplay';

// Estados de investigación
enum ResearchState {
  IDLE = 'idle',
  PLANNING = 'planning',
  PLAN_REVIEW = 'plan_review',
  REFINING_PLAN = 'refining_plan',
  RESEARCHING = 'researching',
  SYNTHESIZING = 'synthesizing',
  DONE = 'done',
  ERROR = 'error'
}

// Interfaces
interface Subtopic {
  title: string;
  content: string;
  sources: Source[];
  status: 'pending' | 'loading' | 'complete';
}

interface ChatMessage {
  role: 'user' | 'model';
  content: string;
}

const ResearchView: React.FC = React.memo(() => {
  const { setActiveView } = useApp();
  
  // Hooks de robustez
  const {
    currentSession,
    createSession,
    updateResearchState,
    updateSubtopicStatus,
    addChatMessage,
    clearSession,
    hasActiveResearch,
    getResearchProgress,
    isSessionExpired
  } = useResearchPersistence();
  
  const { isVisible, isHiddenTooLong } = usePageVisibility();
  
  // Estado local de investigación
  const [researchState, setResearchState] = useState<ResearchState>(ResearchState.IDLE);
  const [topic, setTopic] = useState('');
  const [subtopics, setSubtopics] = useState<string[]>([]);
  const [subtopicObjects, setSubtopicObjects] = useState<Subtopic[]>([]);
  const [finalReport, setFinalReport] = useState<FinalReport | null>(null);
  const [sources, setSources] = useState<Source[]>([]);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [error, setError] = useState<string | null>(null);
  
  // Estado para el warning de salida
  const [showExitWarning, setShowExitWarning] = useState(false);

  // Cargar sesión existente al inicializar
  useEffect(() => {
    if (currentSession && !isSessionExpired()) {
      // Restaurar estado de la investigación
      setTopic(currentSession.topic);
      setSubtopics(currentSession.subtopics.map(s => s.title));
      setResearchState(currentSession.researchState);
      setChatHistory(currentSession.chatHistory);
      
      // Restaurar subtópicos con su estado
      const restoredSubtopicObjects = currentSession.subtopics.map(s => ({
        title: s.title,
        content: s.content || '',
        sources: s.sources || [],
        status: s.status
      }));
      setSubtopicObjects(restoredSubtopicObjects);
      
      console.log('Sesión de investigación restaurada:', currentSession.topic);
    }
  }, [currentSession, isSessionExpired]);

  // Detectar cuando la página se oculta y mostrar warning
  useEffect(() => {
    const handlePageHidden = () => {
      if (hasActiveResearch()) {
        setShowExitWarning(true);
      }
    };

    document.addEventListener('pageHidden', handlePageHidden);
    return () => document.removeEventListener('pageHidden', handlePageHidden);
  }, [hasActiveResearch]);

  const handleReset = () => {
    setResearchState(ResearchState.IDLE);
    setTopic('');
    setSubtopics([]);
    setSubtopicObjects([]);
    setFinalReport(null);
    setSources([]);
    setChatHistory([]);
    setError(null);
    
    // Limpiar sesión persistente
    clearSession();
    setShowExitWarning(false);
  };

  const handleGeneratePlan = useCallback(async (newTopic: string) => {
    handleReset();
    setTopic(newTopic);
    setResearchState(ResearchState.PLANNING);

    try {
      // Usar el servicio real de Gemini
      const plan = await createResearchPlan(newTopic);
      
      setSubtopics(plan);
      setChatHistory([{ 
        role: 'model', 
        content: `Aquí tienes un borrador del plan de investigación para '${newTopic}'. Puedes aprobarlo o sugerir cambios.` 
      }]);
      setResearchState(ResearchState.PLAN_REVIEW);
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'Ocurrió un error desconocido.');
      setResearchState(ResearchState.ERROR);
    }
  }, []);

  const handleRefinePlan = useCallback(async (feedback: string) => {
    setChatHistory(prev => [...prev, { role: 'user', content: feedback }]);
    setResearchState(ResearchState.REFINING_PLAN);
    
    try {
      // Usar el servicio real de Gemini
      const refinedPlan = await refineResearchPlan(topic, subtopics, feedback);
      setSubtopics(refinedPlan);
      setChatHistory(prev => [...prev, { 
        role: 'model', 
        content: 'He actualizado el plan basándome en tus comentarios. ¿Qué te parece ahora?' 
      }]);
      setResearchState(ResearchState.PLAN_REVIEW);
    } catch (err) {
      console.error(err);
      const errorMessage = err instanceof Error ? err.message : 'Ocurrió un error desconocido.';
      setError(errorMessage);
      setChatHistory(prev => [...prev, { 
        role: 'model', 
        content: `Lo siento, hubo un error al refinar el plan: ${errorMessage}` 
      }]);
      setResearchState(ResearchState.PLAN_REVIEW);
    }
  }, [topic, subtopics]);

  const handleApprovePlan = useCallback(async () => {
    setResearchState(ResearchState.RESEARCHING);
    
    try {
      const initialSubtopics = subtopics.map(title => ({ 
        title, 
        content: '', 
        sources: [], 
        status: 'pending' as 'pending' | 'loading' | 'complete' 
      }));

      setSubtopicObjects(initialSubtopics);

      // Usar el servicio real de Gemini para investigar subtópicos
      for (let i = 0; i < subtopics.length; i++) {
        setSubtopicObjects(prev => prev.map((st, index) => 
          index === i ? { ...st, status: 'loading' } : st
        ));

        try {
          const { content, sources: subtopicSources } = await researchSubtopic(subtopics[i], topic);
          
          setSubtopicObjects(prev => prev.map((st, index) => 
            index === i ? { ...st, content, sources: subtopicSources, status: 'complete' } : st
          ));
          
          // Agregar fuentes únicas
          setSources(prev => {
            const newSources = [...prev, ...subtopicSources];
            return newSources.filter((source, index, self) => 
              index === self.findIndex(s => s.uri === source.uri)
            );
          });
        } catch (err) {
          console.error(`Error investigando subtópico ${subtopics[i]}:`, err);
          setSubtopicObjects(prev => prev.map((st, index) => 
            index === i ? { ...st, content: `Error al investigar: ${subtopics[i]}`, sources: [], status: 'complete' } : st
          ));
        }
      }

      setResearchState(ResearchState.SYNTHESIZING);
      
      // Usar el servicio real de Gemini para sintetizar el reporte
      try {
        const researchedContent = subtopicObjects
          .filter(st => st.status === 'complete')
          .map(st => ({ title: st.title, content: st.content }));
        
        const report = await synthesizeReport(topic, researchedContent);
        setFinalReport(report);
        setResearchState(ResearchState.DONE);
      } catch (err) {
        console.error('Error al sintetizar el reporte:', err);
        setError('Error al generar el reporte final');
        setResearchState(ResearchState.ERROR);
      }
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'Ocurrió un error desconocido.');
      setResearchState(ResearchState.ERROR);
    }
  }, [subtopics]);

  const renderContent = () => {
    switch (researchState) {
      case ResearchState.IDLE:
        return <TopicInput onStartResearch={handleGeneratePlan} isLoading={false} />;
      
      case ResearchState.PLANNING:
        return <TopicInput onStartResearch={handleGeneratePlan} isLoading={true} />;
      
      case ResearchState.PLAN_REVIEW:
      case ResearchState.REFINING_PLAN:
        return (
          <PlanReview
            topic={topic}
            subtopics={subtopics}
            onApprove={handleApprovePlan}
            onRefine={handleRefinePlan}
            chatHistory={chatHistory}
            isRefining={researchState === ResearchState.REFINING_PLAN}
          />
        );
      
      case ResearchState.RESEARCHING:
      case ResearchState.SYNTHESIZING:
        return (
          <ResearchStatus 
            state={researchState} 
            subtopics={subtopicObjects} 
          />
        );
      
      case ResearchState.DONE:
        return finalReport ? (
          <ReportDisplay 
            report={finalReport} 
            sources={sources} 
            topic={topic} 
            onReset={handleReset}
          />
        ) : null;
      
      case ResearchState.ERROR:
        return (
          <Card className="p-6 text-center">
            <div className="text-center animate-fade-in">
              <h2 className="text-2xl text-red-600 mb-4">Ocurrió un Error</h2>
              <p className="text-gray-600 mb-6">{error}</p>
              <Button
                onClick={handleReset}
                variant="primary"
                size="md"
                icon={<RefreshCwIcon className="w-4 h-4" />}
              >
                Intentar de Nuevo
              </Button>
            </div>
          </Card>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-4">
      {/* Header Optimizado - Títulos más pequeños */}
      <div className="text-center py-4">
        <div className="flex items-center justify-center gap-2 mb-2">
          <TargetIcon className="w-6 h-6 text-teal-600" />
          <h1 className="text-lg md:text-xl font-semibold text-gray-800">
            Agente de Investigación Matemática
          </h1>
        </div>
        
        <p className="text-sm text-gray-500 max-w-lg mx-auto mb-3">
          Genera, refina y ejecuta planes de investigación con IA avanzada
        </p>
        
        {/* Indicador de estado de Gemini */}
        <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-teal-50 to-blue-50 border border-teal-200 rounded-full text-sm font-medium">
          {isGeminiAvailable() ? (
            <>
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-teal-700">Gemini AI Conectado</span>
            </>
          ) : (
            <>
              <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
              <span className="text-yellow-700">Modo Fallback</span>
            </>
          )}
        </div>
      </div>

      {/* Contenido Principal */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        <div className="p-6">
          {renderContent()}
        </div>
      </div>

      {/* Botones de Navegación */}
      <Card className="p-6 text-center">
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button
            variant="primary"
            size="md"
            onClick={() => setActiveView('search')}
            icon={<BookOpenIcon className="w-4 h-4" />}
          >
            Ir a Búsqueda
          </Button>
          <Button
            variant="secondary"
            size="md"
            onClick={() => setActiveView('library')}
            icon={<GraduationCapIcon className="w-4 h-4" />}
          >
            Ver Biblioteca
          </Button>
        </div>
      </Card>

      {/* Warning de salida con investigación activa */}
      <ResearchExitWarning
        isVisible={showExitWarning}
        onContinue={() => setShowExitWarning(false)}
        onExit={() => {
          clearSession();
          setShowExitWarning(false);
          handleReset();
        }}
        researchTopic={topic}
        progress={getResearchProgress()}
      />
    </div>
  );
});

// Componente de entrada de tema optimizado
const TopicInput: React.FC<{ onStartResearch: (topic: string) => void; isLoading: boolean }> = ({ 
  onStartResearch, 
  isLoading 
}) => {
  const [inputTopic, setInputTopic] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputTopic.trim()) {
      onStartResearch(inputTopic.trim());
    }
  };

  return (
    <Card className="p-6">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-4">
          <h2 className="text-base font-medium text-gray-800 mb-1">
            ¿Qué quieres investigar?
          </h2>
          <p className="text-xs text-gray-500">
            Describe tu tema de investigación matemática
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <textarea
              value={inputTopic}
              onChange={(e) => setInputTopic(e.target.value)}
              placeholder="Ej: Análisis de algoritmos de optimización para redes neuronales, Teoría de grafos en criptografía, Aplicaciones del cálculo tensorial..."
              className="w-full h-28 p-4 pr-12 border border-gray-300 rounded-xl resize-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 focus:outline-none text-gray-900 placeholder-gray-500 text-sm"
              disabled={isLoading}
            />
            <div className="absolute top-3 right-3">
              <LightbulbIcon className="w-5 h-5 text-gray-400" />
            </div>
          </div>
          
          <Button
            type="submit"
            variant="primary"
            size="lg"
            disabled={!inputTopic.trim() || isLoading}
            loading={isLoading}
            className="w-full"
            icon={!isLoading && <TargetIcon className="w-5 h-5" />}
          >
            {isLoading ? 'Generando Plan...' : 'Generar Plan de Investigación'}
          </Button>
        </form>
      </div>
    </Card>
  );
};

// Componente de revisión de plan optimizado
const PlanReview: React.FC<{
  topic: string;
  subtopics: string[];
  onApprove: () => void;
  onRefine: (feedback: string) => void;
  chatHistory: ChatMessage[];
  isRefining: boolean;
}> = ({ topic, subtopics, onApprove, onRefine, chatHistory, isRefining }) => {
  const [feedback, setFeedback] = useState('');

  const handleRefine = () => {
    if (feedback.trim()) {
      onRefine(feedback.trim());
      setFeedback('');
    }
  };

  return (
    <div className="space-y-4">
      {/* Header compacto - Títulos más pequeños */}
      <div className="text-center mb-3">
        <h2 className="text-base font-medium text-gray-800 mb-1">
          Plan de Investigación
        </h2>
        <p className="text-xs text-gray-500">
          {topic}
        </p>
      </div>

      {/* Subtópicos y Chat en grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Subtópicos */}
        <Card className="p-4">
          <h3 className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
            <FileTextIcon className="w-3 h-3 text-blue-600" />
            Estructura
          </h3>
          <div className="space-y-2">
            {subtopics.map((subtopic, index) => (
              <div key={index} className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                <span className="w-5 h-5 bg-teal-100 text-teal-600 rounded-full flex items-center justify-center text-xs font-medium">
                  {index + 1}
                </span>
                <span className="text-sm text-gray-700">{subtopic}</span>
              </div>
            ))}
          </div>
        </Card>

        {/* Chat de refinamiento */}
        <Card className="p-4">
          <h3 className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
            <MessageCircleIcon className="w-3 h-3 text-purple-600" />
            Refinar
          </h3>
          
          <div className="space-y-3 mb-3 max-h-48 overflow-y-auto">
            {chatHistory.map((message, index) => (
              <div
                key={index}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-full px-3 py-2 rounded-lg text-sm ${
                    message.role === 'user'
                      ? 'bg-teal-500 text-white'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {message.content}
                </div>
              </div>
            ))}
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="Sugiere mejoras..."
              className="flex-1 p-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 focus:outline-none"
              disabled={isRefining}
            />
            <Button
              onClick={handleRefine}
              variant="secondary"
              size="sm"
              disabled={!feedback.trim() || isRefining}
              loading={isRefining}
            >
              Refinar
            </Button>
          </div>
        </Card>
      </div>

      {/* Botón de acción principal */}
      <div className="flex justify-center pt-2">
        <Button
          onClick={onApprove}
          variant="primary"
          size="lg"
          icon={<CheckIcon className="w-5 h-5" />}
          disabled={isRefining}
          className="min-w-[280px]"
        >
          Aprobar Plan e Iniciar Investigación
        </Button>
      </div>
    </div>
  );
};

// Componente de estado de investigación
const ResearchStatus: React.FC<{ state: ResearchState; subtopics: Subtopic[] }> = ({ 
  state, 
  subtopics 
}) => {
  const getStatusText = () => {
    switch (state) {
      case ResearchState.RESEARCHING:
        return 'Investigando Subtópicos';
      case ResearchState.SYNTHESIZING:
        return 'Sintetizando Reporte Final';
      default:
        return 'Procesando...';
    }
  };

  const getStatusIcon = () => {
    switch (state) {
      case ResearchState.RESEARCHING:
        return <BookOpenIcon className="w-8 h-8 text-blue-500" />;
      case ResearchState.SYNTHESIZING:
        return <FileTextIcon className="w-8 h-8 text-purple-500" />;
      default:
        return <RefreshCwIcon className="w-8 h-8 text-teal-500 animate-spin" />;
    }
  };

  return (
    <div className="space-y-4">
      <div className="text-center">
        <div className="mb-4">
          {getStatusIcon()}
        </div>
        <h2 className="text-xl font-semibold text-gray-700 mb-2">
          {getStatusText()}
        </h2>
        <p className="text-gray-500">
          {state === ResearchState.RESEARCHING 
            ? 'Analizando cada subtópico de la investigación...'
            : 'Generando el reporte final de la investigación...'
          }
        </p>
      </div>

      {/* Progreso de subtópicos */}
      <Card className="p-4">
        <h3 className="text-sm font-medium text-gray-700 mb-3">
          Progreso de la Investigación
        </h3>
        <div className="space-y-2">
          {subtopics.map((subtopic, index) => (
            <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-100">
              <div className="flex-shrink-0">
                {subtopic.status === 'pending' && (
                  <div className="w-5 h-5 bg-gray-200 rounded-full" />
                )}
                {subtopic.status === 'loading' && (
                  <RefreshCwIcon className="w-5 h-5 text-blue-500 animate-spin" />
                )}
                {subtopic.status === 'complete' && (
                  <CheckIcon className="w-5 h-5 text-green-500" />
                )}
              </div>
              <div className="flex-1">
                <div className="font-medium text-gray-700 text-sm">{subtopic.title}</div>
                {subtopic.status === 'complete' && (
                  <div className="text-xs text-gray-500 mt-1">
                    {subtopic.content.substring(0, 100)}...
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};

// Función para convertir Markdown a HTML con estilo profesional
const formatMarkdownToHTML = (markdown: string): string => {
  return markdown
    // Encabezados principales
    .replace(/^# (.+)$/gm, '<h1 class="text-xl font-bold text-gray-900 mb-4 mt-6 first:mt-0">$1</h1>')
    .replace(/^## (.+)$/gm, '<h2 class="text-lg font-semibold text-gray-800 mb-3 mt-5">$1</h2>')
    .replace(/^### (.+)$/gm, '<h3 class="text-base font-medium text-gray-700 mb-2 mt-4">$1</h3>')
    
    // Negritas
    .replace(/\*\*(.+?)\*\*/g, '<strong class="font-semibold text-gray-900">$1</strong>')
    
    // Cursivas
    .replace(/\*(.+?)\*/g, '<em class="italic text-gray-800">$1</em>')
    
    // Código inline
    .replace(/`(.+?)`/g, '<code class="bg-gray-100 px-1 py-0.5 rounded text-sm font-mono text-gray-800">$1</code>')
    
    // Citas
    .replace(/^> (.+)$/gm, '<blockquote class="border-l-4 border-teal-500 pl-4 py-2 my-3 bg-teal-50 italic text-gray-700">$1</blockquote>')
    
    // Separadores
    .replace(/^---$/gm, '<hr class="my-6 border-gray-300">')
    
    // Listas con viñetas
    .replace(/^\- (.+)$/gm, '<li class="ml-4 mb-1">• $1</li>')
    .replace(/(<li.*<\/li>)/gs, '<ul class="list-none space-y-1 mb-3">$1</ul>')
    
    // Listas numeradas
    .replace(/^\d+\. (.+)$/gm, '<li class="ml-4 mb-1">$&</li>')
    .replace(/(<li.*<\/li>)/gs, '<ol class="list-decimal ml-4 space-y-1 mb-3">$1</ol>')
    
    // Párrafos
    .replace(/^(?!<[h|u|o|b|h|r])(.+)$/gm, '<p class="mb-3">$1</p>')
    
    // Limpiar HTML mal formado
    .replace(/<ul>\s*<\/ul>/g, '')
    .replace(/<ol>\s*<\/ol>/g, '')
    .replace(/<p>\s*<\/p>/g, '');
};

// Componente de visualización de reporte optimizado
const ReportDisplay: React.FC<{
  report: FinalReport;
  sources: Source[];
  topic: string;
  onReset: () => void;
}> = ({ report, sources, topic, onReset }) => {
  const [showCopyToast, setShowCopyToast] = useState(false);

  const handleCopyReport = async () => {
    try {
      await navigator.clipboard.writeText(report.report);
      setShowCopyToast(true);
      setTimeout(() => setShowCopyToast(false), 3000);
    } catch (err) {
      console.error('Error al copiar:', err);
    }
  };
  return (
    <div className="space-y-4">
      <div className="text-center">
        <h2 className="text-base font-medium text-gray-800 mb-1">
          Reporte de Investigación Completado
        </h2>
        <p className="text-xs text-gray-500">
          Tema: {topic}
        </p>
      </div>

      {/* Resumen ejecutivo */}
      <Card className="p-4">
        <h3 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
          <LightbulbIcon className="w-4 h-4 text-yellow-600" />
          Resumen Ejecutivo
        </h3>
        <div className="space-y-3">
          {report.summary.map((item, index) => (
            <div key={index} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg border-l-4 border-teal-500">
              <span className="text-teal-600 font-bold text-lg">#{index + 1}</span>
              <span 
                className="text-black text-sm leading-relaxed flex-1"
                style={{ 
                  fontFamily: 'Georgia, "Times New Roman", serif',
                  lineHeight: '1.6'
                }}
              >
                {item}
              </span>
            </div>
          ))}
        </div>
      </Card>

      {/* Reporte completo */}
      <Card className="p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-medium text-gray-700 flex items-center gap-2">
            <FileTextIcon className="w-4 h-4 text-blue-600" />
            Reporte Completo
          </h3>
          <Button
            variant="secondary"
            size="sm"
            onClick={handleCopyReport}
            icon={<CopyIcon className="w-4 h-4" />}
          >
            Copiar Reporte
          </Button>
        </div>
        <div className="prose max-w-none">
          <div 
            className="text-black leading-relaxed text-sm"
            style={{ 
              fontFamily: 'Georgia, "Times New Roman", serif',
              lineHeight: '1.6',
              textAlign: 'justify'
            }}
            dangerouslySetInnerHTML={{
              __html: formatMarkdownToHTML(report.report)
            }}
          />
        </div>
      </Card>

      {/* Fuentes Mejoradas */}
      {sources.length > 0 && (
        <EnhancedSourcesDisplay 
          sources={sources.map(source => ({
            uri: source.uri,
            title: source.title,
            domain: '', // Se calculará automáticamente
            type: 'other' as const, // Se categorizará automáticamente
            reliability: 'medium' as const // Se evaluará automáticamente
          }))}
          title="Fuentes Consultadas en la Investigación"
          collapsible={true}
        />
      )}

      {/* Botones de acción */}
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Button
          onClick={onReset}
          variant="primary"
          size="lg"
          icon={<RefreshCwIcon className="w-5 h-5" />}
        >
          Nueva Investigación
        </Button>
      </div>

      {/* Toast de confirmación de copia */}
      {showCopyToast && (
        <div className="fixed bottom-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-50 animate-in slide-in-from-bottom-2">
          <div className="flex items-center gap-2">
            <CheckIcon className="w-4 h-4" />
            <span>Reporte copiado al portapapeles</span>
          </div>
        </div>
      )}

      {/* Warning de salida con investigación activa */}
      <ResearchExitWarning
        isVisible={showExitWarning}
        onContinue={() => setShowExitWarning(false)}
        onExit={() => {
          clearSession();
          setShowExitWarning(false);
          handleReset();
        }}
        researchTopic={topic}
        progress={getResearchProgress()}
      />
    </div>
  );
};

export default ResearchView;
