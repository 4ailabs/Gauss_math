import React, { useState, useCallback } from 'react';
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
  GraduationCapIcon
} from '../ui/Icons';

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

interface Source {
  uri: string;
  title: string;
}

interface ChatMessage {
  role: 'user' | 'model';
  content: string;
}

interface FinalReport {
  summary: string[];
  report: string;
}

const ResearchView: React.FC = React.memo(() => {
  const { setActiveView } = useApp();
  
  // Estado local de investigación
  const [researchState, setResearchState] = useState<ResearchState>(ResearchState.IDLE);
  const [topic, setTopic] = useState('');
  const [subtopics, setSubtopics] = useState<string[]>([]);
  const [subtopicObjects, setSubtopicObjects] = useState<Subtopic[]>([]);
  const [finalReport, setFinalReport] = useState<FinalReport | null>(null);
  const [sources, setSources] = useState<Source[]>([]);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [error, setError] = useState<string | null>(null);

  const handleReset = () => {
    setResearchState(ResearchState.IDLE);
    setTopic('');
    setSubtopics([]);
    setSubtopicObjects([]);
    setFinalReport(null);
    setSources([]);
    setChatHistory([]);
    setError(null);
  };

  const handleGeneratePlan = useCallback(async (newTopic: string) => {
    handleReset();
    setTopic(newTopic);
    setResearchState(ResearchState.PLANNING);

    try {
      // Simular generación de plan (aquí se integraría con el servicio real)
      const mockPlan = [
        'Revisión de Literatura',
        'Metodología de Investigación',
        'Análisis de Datos',
        'Resultados y Discusión',
        'Conclusiones y Trabajo Futuro'
      ];
      
      setSubtopics(mockPlan);
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
      // Simular refinamiento del plan
      const refinedPlan = [...subtopics, 'Nuevo Subtópico Basado en Feedback'];
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
  }, [subtopics]);

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

      // Simular investigación de subtópicos
      for (let i = 0; i < subtopics.length; i++) {
        setSubtopicObjects(prev => prev.map((st, index) => 
          index === i ? { ...st, status: 'loading' } : st
        ));

        // Simular tiempo de investigación
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const mockContent = `Contenido investigado para: ${subtopics[i]}. Este es un ejemplo de la investigación realizada.`;
        const mockSources = [{ uri: `https://example.com/${i}`, title: `Fuente ${i + 1}` }];
        
        setSubtopicObjects(prev => prev.map((st, index) => 
          index === i ? { ...st, content: mockContent, sources: mockSources, status: 'complete' } : st
        ));
      }

      setSources([{ uri: 'https://example.com', title: 'Fuente Principal' }]);
      setResearchState(ResearchState.SYNTHESIZING);
      
      // Simular síntesis del reporte
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const mockReport: FinalReport = {
        summary: ['Resumen ejecutivo de la investigación', 'Hallazgos principales', 'Recomendaciones'],
        report: 'Reporte completo de la investigación matemática...'
      };
      
      setFinalReport(mockReport);
      setResearchState(ResearchState.DONE);
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
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center py-8">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
          Agente de Investigación Matemática
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Genera, refina y ejecuta planes de investigación matemática con IA avanzada
        </p>
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
    </div>
  );
});

// Componente de entrada de tema
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
    <Card className="p-8 text-center">
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <TargetIcon className="w-16 h-16 text-teal-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Inicia tu Investigación Matemática
          </h2>
          <p className="text-gray-600">
            Describe el tema o problema matemático que quieres investigar
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <textarea
            value={inputTopic}
            onChange={(e) => setInputTopic(e.target.value)}
            placeholder="Ej: Análisis de algoritmos de optimización para redes neuronales..."
            className="w-full h-32 p-4 border border-gray-300 rounded-xl resize-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 focus:outline-none text-gray-900 placeholder-gray-500"
            disabled={isLoading}
          />
          
          <Button
            type="submit"
            variant="primary"
            size="lg"
            disabled={!inputTopic.trim() || isLoading}
            loading={isLoading}
            icon={!isLoading && <LightbulbIcon className="w-5 h-5" />}
          >
            {isLoading ? 'Generando Plan...' : 'Generar Plan de Investigación'}
          </Button>
        </form>
      </div>
    </Card>
  );
};

// Componente de revisión de plan
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
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Plan de Investigación: {topic}
        </h2>
        <p className="text-gray-600">
          Revisa el plan generado y apróbalo o sugiere mejoras
        </p>
      </div>

      {/* Subtópicos */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <FileTextIcon className="w-5 h-5 text-blue-600" />
          Estructura de la Investigación
        </h3>
        <div className="space-y-3">
          {subtopics.map((subtopic, index) => (
            <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <span className="w-6 h-6 bg-teal-100 text-teal-600 rounded-full flex items-center justify-center text-sm font-medium">
                {index + 1}
              </span>
              <span className="text-gray-700">{subtopic}</span>
            </div>
          ))}
        </div>
      </Card>

      {/* Chat de refinamiento */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <MessageCircleIcon className="w-5 h-5 text-purple-600" />
          Refinar Plan
        </h3>
        
        <div className="space-y-4 mb-4 max-h-64 overflow-y-auto">
          {chatHistory.map((message, index) => (
            <div
              key={index}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
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

        <div className="flex gap-3">
          <input
            type="text"
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            placeholder="Sugiere mejoras al plan..."
            className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 focus:outline-none"
            disabled={isRefining}
          />
          <Button
            onClick={handleRefine}
            variant="secondary"
            size="md"
            disabled={!feedback.trim() || isRefining}
            loading={isRefining}
          >
            Refinar
          </Button>
        </div>
      </Card>

      {/* Botones de acción */}
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Button
          onClick={onApprove}
          variant="primary"
          size="lg"
          icon={<CheckIcon className="w-5 h-5" />}
          disabled={isRefining}
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
        return <BookOpenIcon className="w-6 h-6 text-blue-600" />;
      case ResearchState.SYNTHESIZING:
        return <FileTextIcon className="w-6 h-6 text-purple-600" />;
      default:
        return <RefreshCwIcon className="w-6 h-6 text-teal-600 animate-spin" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="mb-4">
          {getStatusIcon()}
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          {getStatusText()}
        </h2>
        <p className="text-gray-600">
          {state === ResearchState.RESEARCHING 
            ? 'Analizando cada subtópico de la investigación...'
            : 'Generando el reporte final de la investigación...'
          }
        </p>
      </div>

      {/* Progreso de subtópicos */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Progreso de la Investigación
        </h3>
        <div className="space-y-3">
          {subtopics.map((subtopic, index) => (
            <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <div className="flex-shrink-0">
                {subtopic.status === 'pending' && (
                  <div className="w-6 h-6 bg-gray-300 rounded-full" />
                )}
                {subtopic.status === 'loading' && (
                  <RefreshCwIcon className="w-6 h-6 text-blue-600 animate-spin" />
                )}
                {subtopic.status === 'complete' && (
                  <CheckIcon className="w-6 h-6 text-green-600" />
                )}
              </div>
              <div className="flex-1">
                <div className="font-medium text-gray-900">{subtopic.title}</div>
                {subtopic.status === 'complete' && (
                  <div className="text-sm text-gray-600 mt-1">
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

// Componente de visualización de reporte
const ReportDisplay: React.FC<{
  report: FinalReport;
  sources: Source[];
  topic: string;
  onReset: () => void;
}> = ({ report, sources, topic, onReset }) => {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Reporte de Investigación Completado
        </h2>
        <p className="text-gray-600">
          Tema: {topic}
        </p>
      </div>

      {/* Resumen ejecutivo */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <LightbulbIcon className="w-5 h-5 text-yellow-600" />
          Resumen Ejecutivo
        </h3>
        <div className="space-y-2">
          {report.summary.map((item, index) => (
            <div key={index} className="flex items-start gap-2">
              <span className="text-teal-500 mt-1">•</span>
              <span className="text-gray-700">{item}</span>
            </div>
          ))}
        </div>
      </Card>

      {/* Reporte completo */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <FileTextIcon className="w-5 h-5 text-blue-600" />
          Reporte Completo
        </h3>
        <div className="prose max-w-none">
          <p className="text-gray-700 leading-relaxed">{report.report}</p>
        </div>
      </Card>

      {/* Fuentes */}
      {sources.length > 0 && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <BookOpenIcon className="w-5 h-5 text-green-600" />
            Fuentes Consultadas
          </h3>
          <div className="space-y-2">
            {sources.map((source, index) => (
              <div key={index} className="flex items-center gap-2">
                <span className="text-teal-500">•</span>
                <a
                  href={source.uri}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 underline"
                >
                  {source.title}
                </a>
              </div>
            ))}
          </div>
        </Card>
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
    </div>
  );
};

export default ResearchView;
