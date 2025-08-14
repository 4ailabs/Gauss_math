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
  CopyIcon,
  DownloadIcon
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
import { useAdvancedResearch } from '../../hooks/useAdvancedResearch';
import { useResearchPersistence } from '../../hooks/useResearchPersistence';
import { usePageVisibility } from '../../hooks/usePageVisibility';
import { ResearchExitWarning } from '../ui/ResearchExitWarning';
import { EnhancedSourcesDisplay } from '../ui/EnhancedSourcesDisplay';

import { exportReportToPDF } from '../../utils/pdfExport';


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
  
  // Estado para el diagnóstico de API

  
  // Ref para mantener los datos de investigación de forma síncrona
  const researchDataRef = React.useRef<Subtopic[]>([]);
  
  // Hook avanzado de investigación (solo funciones principales)
  const {
    createResearchPlan: createAdvancedPlan,
    researchSubtopic: researchAdvancedSubtopic,
    synthesizeReport: synthesizeAdvancedReport
  } = useAdvancedResearch();
  


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
      console.log('Iniciando investigación de subtópicos...');
      console.log('🔑 Verificando API de Gemini disponible:', isGeminiAvailable());
      console.log('📋 Subtópicos a investigar:', subtopics);
      
      if (!isGeminiAvailable()) {
        console.error('❌ API de Gemini no está disponible');
        throw new Error('La API de Gemini no está configurada. Verifica tu API_KEY.');
      }
      
      const initialSubtopics = subtopics.map(title => ({ 
        title, 
        content: '', 
        sources: [], 
        status: 'pending' as 'pending' | 'loading' | 'complete' 
      }));

      setSubtopicObjects(initialSubtopics);
      researchDataRef.current = [...initialSubtopics]; // Inicializar ref
      console.log('📝 Subtópicos inicializados:', initialSubtopics);
      console.log('📝 Ref inicializado con:', researchDataRef.current.length, 'elementos');

      // Usar el servicio real de Gemini para investigar subtópicos
      for (let i = 0; i < subtopics.length; i++) {
        console.log(`🔍 Investigando subtópico ${i + 1}/${subtopics.length}: ${subtopics[i]}`);
        
        setSubtopicObjects(prev => prev.map((st, index) => 
          index === i ? { ...st, status: 'loading' } : st
        ));

        try {
          console.log(`📚 Llamando a researchSubtopic para: ${subtopics[i]}`);
          const startTime = Date.now();
          const { content, sources: subtopicSources } = await researchSubtopic(subtopics[i], topic);
          const endTime = Date.now();
          
          console.log(`✅ Subtópico ${subtopics[i]} investigado exitosamente en ${endTime - startTime}ms`);
          console.log(`📄 Contenido generado (${content.length} chars):`, content.substring(0, 100) + '...');
          console.log(`🔗 Fuentes encontradas:`, subtopicSources.length);
          
          if (!content || content.trim().length < 100) {
            console.warn(`⚠️ Contenido de subtópico "${subtopics[i]}" es muy corto o vacío:`, content);
          }
          
          const updatedSubtopic = {
            title: subtopics[i],
            content,
            sources: subtopicSources,
            status: 'complete' as const
          };
          
          // Actualizar el estado
          setSubtopicObjects(prev => {
            const updated = prev.map((st, index) => 
              index === i ? updatedSubtopic : st
            );
            return updated;
          });
          
          // Actualizar el ref directamente después
          researchDataRef.current[i] = updatedSubtopic;
          console.log(`🔄 Ref actualizado directamente - Subtópico ${i + 1}: ${updatedSubtopic.title}`);
          console.log(`🔄 Ref total: ${researchDataRef.current.length} elementos`);
          
          // Agregar fuentes únicas
          setSources(prev => {
            const newSources = [...prev, ...subtopicSources];
            const uniqueSources = newSources.filter((source, index, self) => 
              index === self.findIndex(s => s.uri === source.uri)
            );
            console.log(`📊 Fuentes totales acumuladas: ${uniqueSources.length}`);
            return uniqueSources;
          });
        } catch (err) {
          console.error(`❌ Error investigando subtópico ${subtopics[i]}:`, err);
          const errorSubtopic = {
            title: subtopics[i],
            content: `Error al investigar: ${subtopics[i]}`,
            sources: [],
            status: 'complete' as const
          };
          
          // Actualizar el estado
          setSubtopicObjects(prev => {
            const updated = prev.map((st, index) => 
              index === i ? errorSubtopic : st
            );
            return updated;
          });
          
          // Actualizar el ref directamente
          researchDataRef.current[i] = errorSubtopic;
          console.log(`❌ Ref actualizado con error - Subtópico ${i + 1}: ${errorSubtopic.title}`);
        }
      }

      // Esperar un momento para asegurar que el estado se actualice
      await new Promise(resolve => setTimeout(resolve, 100));
      
      console.log('🔄 Todos los subtópicos investigados, procediendo a síntesis...');
      
      // Usar el ref para acceso síncrono a los datos actualizados
      const localSubtopicObjects = [...researchDataRef.current];
      console.log('📊 Estado final de subtópicos obtenido:', localSubtopicObjects.length, 'elementos');
      console.log('📊 Estado actual de subtópicos obtenido:', localSubtopicObjects.length, 'elementos');
      console.log('📊 Detalles del ref:', localSubtopicObjects.map(st => ({ 
        title: st.title, 
        status: st.status, 
        contentLength: st.content?.length || 0 
      })));
      
      setResearchState(ResearchState.SYNTHESIZING);
      
      // Usar el servicio real de Gemini para sintetizar el reporte
      try {
        console.log('🔄 Iniciando síntesis del reporte...');
        
        // Verificar que tenemos los datos localmente
        if (localSubtopicObjects.length === 0) {
          console.error('❌ No hay subtópicos en la copia local');
          throw new Error('Los datos de investigación se perdieron durante el proceso');
        }
        
        console.log('📊 Subtópicos disponibles para síntesis:', localSubtopicObjects.length);
        console.log('🔍 Detalles de subtópicos:', localSubtopicObjects.map(st => ({ 
          title: st.title, 
          status: st.status, 
          hasContent: !!st.content && st.content.trim().length > 0,
          contentLength: st.content ? st.content.length : 0
        })));
        
        const currentSubtopicObjects = localSubtopicObjects;
        
        const researchedContent = currentSubtopicObjects
          .filter(st => {
            const isValid = st.status === 'complete' && st.content && st.content.trim().length > 50;
            console.log(`📋 Validando subtópico "${st.title}": status=${st.status}, hasContent=${!!st.content}, contentLength=${st.content?.length || 0}, isValid=${isValid}`);
            return isValid;
          })
          .map(st => ({ title: st.title, content: st.content }));
        
        console.log('📝 Contenido filtrado para síntesis:', researchedContent.length, 'subtópicos válidos');
        console.log('📊 Títulos de subtópicos válidos:', researchedContent.map(r => r.title));
        
        if (researchedContent.length === 0) {
          console.error('❌ No hay contenido válido para sintetizar');
          console.log('🔍 Estado detallado de subtópicos:');
          currentSubtopicObjects.forEach((st, index) => {
            console.log(`   ${index + 1}. "${st.title}":`, {
              status: st.status,
              hasContent: !!st.content,
              contentLength: st.content?.length || 0,
              contentPreview: st.content?.substring(0, 100) + '...' || 'Sin contenido'
            });
          });
          
          // Intentar usar contenido parcial si existe algo
          const partialContent = currentSubtopicObjects
            .filter(st => st.content && st.content.trim().length > 10)
            .map(st => ({ title: st.title, content: st.content }));
          
          if (partialContent.length > 0) {
            console.log('🔄 Usando contenido parcial para síntesis:', partialContent.length, 'subtópicos');
            console.log('📚 Llamando a synthesizeReport con contenido parcial');
            const report = await synthesizeReport(topic, partialContent);
            console.log('✅ Reporte generado exitosamente con contenido parcial:', report);
            
            // Validar y guardar el reporte
            if (report && report.summary && report.report) {
              setFinalReport(report);
              setResearchState(ResearchState.DONE);
              console.log('🎉 Estado actualizado a DONE con contenido parcial');
              return; // Salir de la función aquí
            } else {
              throw new Error('El reporte generado con contenido parcial no tiene la estructura esperada');
            }
          } else {
            throw new Error('No hay contenido de investigación disponible para sintetizar. Verifica que la API esté funcionando correctamente.');
          }
        } else {
          console.log('📚 Llamando a synthesizeReport con:', researchedContent.length, 'subtópicos');
          const report = await synthesizeReport(topic, researchedContent);
          console.log('✅ Reporte generado exitosamente:', report);
          
          // Validar que el reporte tenga la estructura correcta
          if (!report || !report.summary || !report.report) {
            console.error('❌ Reporte inválido recibido:', report);
            throw new Error('El reporte generado no tiene la estructura esperada');
          }
          
          if (!Array.isArray(report.summary) || report.summary.length === 0) {
            console.error('❌ Resumen inválido en el reporte:', report.summary);
            throw new Error('El resumen del reporte no es válido');
          }
          
          if (typeof report.report !== 'string' || report.report.trim().length === 0) {
            console.error('❌ Contenido del reporte inválido:', report.report);
            throw new Error('El contenido del reporte está vacío o es inválido');
          }
          
          setFinalReport(report);
          setResearchState(ResearchState.DONE);
          console.log('🎉 Estado actualizado a DONE');
        }
      } catch (err) {
        console.error('❌ Error al sintetizar el reporte:', err);
        
        // Crear un reporte de fallback más informativo
        const fallbackReport = {
          summary: [
            'Error en la generación del reporte',
            'Se recomienda revisar la configuración de la API',
            'Los datos de investigación están disponibles en las secciones individuales'
          ],
          report: `# Error en la Generación del Reporte

## Problema Detectado
Ocurrió un error durante la generación del reporte final de la investigación sobre "${topic}".

## Estado de la Investigación
${subtopicObjects.map((st, index) => `
### Subtópico ${index + 1}: ${st.title}
- **Estado:** ${st.status}
- **Contenido:** ${st.content ? `${st.content.substring(0, 100)}...` : 'Sin contenido'}
- **Fuentes:** ${st.sources ? st.sources.length : 0} encontradas
`).join('\n')}

## Solución Recomendada
1. **Verificar la configuración de la API de Gemini** - Asegúrate de que la API_KEY esté configurada
2. **Revisar la conexión a internet** - Verifica que puedas acceder a Google AI Studio
3. **Intentar generar el reporte nuevamente** - El problema puede ser temporal
4. **Revisar los logs en consola** - Busca mensajes de error específicos

## Información Técnica
**Error:** ${err instanceof Error ? err.message : 'Error desconocido'}

**Subtópicos investigados:** ${subtopicObjects.filter(st => st.status === 'complete').length}/${subtopics.length}

**Fuentes totales:** ${sources.length}

---
*Este es un reporte de fallback generado automáticamente debido a un error en la síntesis.*`
        };
        
        console.log('🔄 Aplicando reporte de fallback:', fallbackReport);
        setFinalReport(fallbackReport);
        setResearchState(ResearchState.DONE);
      }
    } catch (err) {
      console.error('❌ Error general en la investigación:', err);
      setError(err instanceof Error ? err.message : 'Ocurrió un error desconocido.');
      setResearchState(ResearchState.ERROR);
    }
  }, [topic, subtopics]);

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
        console.log('🎯 Estado DONE - Renderizando reporte...');
        console.log('📊 finalReport disponible:', !!finalReport);
        console.log('📋 finalReport contenido:', finalReport);
        
        if (!finalReport) {
          console.error('❌ finalReport es null/undefined en estado DONE');
          return (
            <Card className="p-6 text-center">
              <div className="text-center">
                <h2 className="text-xl text-slate-600 mb-4">Error: Reporte No Generado</h2>
                <p className="text-gray-600 mb-6">El reporte no se generó correctamente. Esto puede deberse a un problema con la API.</p>
                <div className="space-y-3">
                  <Button
                    onClick={handleReset}
                    variant="primary"
                    size="md"
                    icon={<RefreshCwIcon className="w-4 h-4" />}
                  >
                    Intentar de Nuevo
                  </Button>
                  <Button
                    onClick={() => setResearchState(ResearchState.IDLE)}
                    variant="secondary"
                    size="md"
                    icon={<TargetIcon className="w-4 h-4" />}
                  >
                    Volver al Inicio
                  </Button>
                </div>
              </div>
            </Card>
          );
        }
        
        return (
          <ReportDisplay 
            report={finalReport} 
            sources={sources} 
            topic={topic} 
            onReset={handleReset}
          />
        );
      
      case ResearchState.ERROR:
        return (
          <Card className="p-6 text-center">
            <div className="text-center animate-fade-in">
                              <h2 className="text-2xl text-slate-600 mb-4">Ocurrió un Error</h2>
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
    <div className="max-w-6xl mx-auto space-y-2 sm:space-y-4 px-3 sm:px-4 research-agent-mobile">
      {/* Header Optimizado - Títulos más pequeños y responsive */}
      <div className="text-center py-3 sm:py-4">
        <div className="flex items-center justify-center gap-2 mb-2">
          <TargetIcon className="w-5 h-5 sm:w-6 sm:h-6 text-slate-500" />
          <h1 className="text-base sm:text-lg md:text-xl font-semibold text-slate-600">
            Agente de Investigación Matemática
          </h1>
        </div>
        
        <p className="text-xs sm:text-sm text-slate-500 max-w-lg mx-auto mb-2 sm:mb-3 px-2">
          Genera, refina y ejecuta planes de investigación con IA avanzada
        </p>
        
        {/* Indicador de estado de Gemini - Responsive */}
        <div className="flex items-center gap-3">
          <div className="inline-flex items-center gap-2 px-2 sm:px-3 py-1 sm:py-1.5 bg-gradient-to-r from-slate-50 to-gray-50 border border-slate-200 rounded-full text-xs sm:text-sm font-medium">
            {isGeminiAvailable() ? (
              <>
                <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-slate-600">Gemini AI Conectado</span>
              </>
            ) : (
              <>
                <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-yellow-500 rounded-full"></div>
                <span className="text-slate-600">Modo Fallback</span>
              </>
            )}
          </div>
          

        </div>
        

      </div>





      {/* Contenido Principal - Padding responsive */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
        <div className="p-3 sm:p-4 md:p-6">
          {renderContent()}
        </div>
      </div>

      {/* Botones de Navegación - Responsive y táctiles */}
      <Card className="p-3 sm:p-4 md:p-6 text-center">
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 justify-center">
          <Button
            variant="primary"
            size="lg"
            onClick={() => setActiveView('search')}
            icon={<BookOpenIcon className="w-4 h-4" />}
            className="min-h-[44px] sm:min-h-[40px]"
          >
            Ir a Búsqueda
          </Button>
          <Button
            variant="secondary"
            size="lg"
            onClick={() => setActiveView('library')}
            icon={<GraduationCapIcon className="w-4 h-4" />}
            className="min-h-[44px] sm:min-h-[40px]"
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
    <Card className="p-3 sm:p-4 md:p-6">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-3 sm:mb-4">
          <h2 className="text-sm sm:text-base font-medium text-slate-600 mb-1">
            ¿Qué quieres investigar?
          </h2>
          <p className="text-xs text-slate-500 px-2">
            Describe tu tema de investigación matemática
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
          <div className="relative">
            <textarea
              value={inputTopic}
              onChange={(e) => setInputTopic(e.target.value)}
              placeholder="Ej: Análisis de algoritmos de optimización para redes neuronales, Teoría de grafos en criptografía, Aplicaciones del cálculo tensorial..."
              className="w-full h-24 sm:h-28 p-3 sm:p-4 pr-12 border border-slate-300 rounded-xl resize-none focus:ring-2 focus:ring-slate-500 focus:border-slate-500 focus:outline-none text-slate-700 placeholder-slate-500 text-sm"
              disabled={isLoading}
            />
            <div className="absolute top-2 sm:top-3 right-2 sm:right-3">
              <LightbulbIcon className="w-4 h-4 sm:w-5 sm:h-5 text-slate-400" />
            </div>
          </div>
          
          <Button
            type="submit"
            variant="primary"
            size="lg"
            disabled={!inputTopic.trim() || isLoading}
            loading={isLoading}
            className="w-full min-h-[48px] sm:min-h-[44px]"
            icon={!isLoading && <TargetIcon className="w-4 h-4 sm:w-5 sm:h-5" />}
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
    <div className="space-y-3 sm:space-y-4">
      {/* Header compacto - Títulos más pequeños y responsive */}
      <div className="text-center mb-2 sm:mb-3">
        <h2 className="text-sm sm:text-base font-medium text-gray-800 mb-1">
          Plan de Investigación
        </h2>
        <p className="text-xs text-gray-500 px-2">
          {topic}
        </p>
      </div>

      {/* Subtópicos y Chat en grid responsive */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
        {/* Subtópicos */}
        <Card className="p-3 sm:p-4">
          <h3 className="text-xs sm:text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
            <FileTextIcon className="w-3 h-3 sm:w-4 sm:h-4 text-slate-500" />
            Estructura
          </h3>
          
          <div className="space-y-2 sm:space-y-3">
            {subtopics.map((subtopic, index) => (
              <div 
                key={index} 
                className="flex items-center gap-2 p-2 sm:p-3 bg-slate-50 rounded-lg border border-slate-100"
              >
                <div className="w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-slate-100 flex items-center justify-center flex-shrink-0">
                  <span className="text-xs sm:text-sm font-medium text-slate-600">{index + 1}</span>
                </div>
                <span className="text-xs sm:text-sm text-gray-700 flex-1">{subtopic}</span>
              </div>
            ))}
          </div>
        </Card>

        {/* Chat de refinamiento */}
        <Card className="p-3 sm:p-4">
          <h3 className="text-xs sm:text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
            <MessageCircleIcon className="w-3 h-3 sm:w-4 sm:h-4 text-slate-500" />
            Refinar Plan
          </h3>
          
          <div className="space-y-2 sm:space-y-3">
            <textarea
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="¿Qué quieres cambiar o agregar al plan?"
              className="w-full h-20 sm:h-24 p-2 sm:p-3 text-xs sm:text-sm border border-slate-300 rounded-lg resize-none focus:ring-2 focus:ring-slate-500 focus:border-slate-500 focus:outline-none"
            />
            
            <div className="flex gap-2 sm:gap-3">
              <Button
                variant="primary"
                size="sm"
                onClick={handleRefine}
                disabled={!feedback.trim() || isRefining}
                loading={isRefining}
                className="flex-1 min-h-[40px] sm:min-h-[36px]"
              >
                Refinar
              </Button>
              
              <Button
                variant="secondary"
                size="sm"
                onClick={onApprove}
                className="flex-1 min-h-[40px] sm:min-h-[36px]"
              >
                Aprobar
              </Button>
            </div>
          </div>
        </Card>
      </div>

      {/* Historial del chat */}
      {chatHistory.length > 0 && (
        <Card className="p-3 sm:p-4">
          <h3 className="text-xs sm:text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
            <MessageCircleIcon className="w-3 h-3 sm:w-4 sm:h-4 text-slate-500" />
            Conversación
          </h3>
          
          <div className="space-y-2 sm:space-y-3 max-h-40 sm:max-h-48 overflow-y-auto">
            {chatHistory.map((message, index) => (
              <div 
                key={index} 
                className={`p-2 sm:p-3 rounded-lg text-xs sm:text-sm ${
                  message.role === 'user' 
                    ? 'bg-slate-50 text-slate-700 ml-4' 
                    : 'bg-slate-50 text-slate-700 mr-4'
                }`}
              >
                <div className="font-medium mb-1">
                  {message.role === 'user' ? 'Tú' : 'IA'}
                </div>
                <div>{message.content}</div>
              </div>
            ))}
          </div>
        </Card>
      )}
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
        return <BookOpenIcon className="w-8 h-8 text-slate-500" />;
      case ResearchState.SYNTHESIZING:
        return <FileTextIcon className="w-8 h-8 text-slate-500" />;
      default:
        return <RefreshCwIcon className="w-8 h-8 text-slate-500 animate-spin" />;
    }
  };

  return (
    <div className="space-y-3 sm:space-y-4">
      {/* Estado principal */}
      <div className="text-center py-3 sm:py-4">
        <div className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-4">
          {getStatusIcon()}
        </div>
        <h2 className="text-lg sm:text-xl font-semibold text-gray-700 mb-2">
          {getStatusText()}
        </h2>
        <p className="text-sm sm:text-base text-gray-500 px-2">
          {state === ResearchState.RESEARCHING 
            ? 'Analizando cada subtópico de la investigación...'
            : 'Generando el reporte final de la investigación...'
          }
        </p>
      </div>

      {/* Progreso de subtópicos */}
      <Card className="p-3 sm:p-4">
        <h3 className="text-xs sm:text-sm font-medium text-gray-700 mb-2 sm:mb-3">
          Progreso de la Investigación
        </h3>
        <div className="space-y-2 sm:space-y-3">
          {subtopics.map((subtopic, index) => (
            <div key={index} className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 bg-gray-50 rounded-lg border border-gray-100">
              <div className="flex-shrink-0">
                {subtopic.status === 'pending' && (
                  <div className="w-4 h-4 sm:w-5 sm:h-5 bg-gray-200 rounded-full" />
                )}
                {subtopic.status === 'loading' && (
                  <RefreshCwIcon className="w-4 h-4 sm:w-5 sm:h-5 text-slate-500 animate-spin" />
                )}
                {subtopic.status === 'complete' && (
                  <CheckIcon className="w-4 h-4 sm:w-5 sm:h-5 text-slate-500" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-medium text-gray-700 text-xs sm:text-sm">{subtopic.title}</div>
                {subtopic.status === 'complete' && (
                  <div className="text-xs text-gray-500 mt-1 line-clamp-2">
                    {subtopic.content.substring(0, 80)}...
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
  try {
    console.log('🔄 Procesando Markdown a HTML...');
    console.log('📝 Markdown recibido (primeros 200 chars):', markdown.substring(0, 200) + '...');
    
    if (!markdown || typeof markdown !== 'string') {
      console.error('❌ Markdown inválido recibido:', markdown);
      return '<p class="text-red-600">Error: Contenido Markdown inválido</p>';
    }
    
    const result = markdown
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
      .replace(/^> (.+)$/gm, '<blockquote class="border-l-4 border-slate-500 pl-4 py-2 my-3 bg-slate-50 italic text-slate-700">$1</blockquote>')
      
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
    
    console.log('✅ Markdown procesado exitosamente');
    console.log('🔍 HTML resultante (primeros 300 chars):', result.substring(0, 300) + '...');
    
    return result;
  } catch (error) {
    console.error('❌ Error al procesar Markdown:', error);
    return `<p class="text-red-600">Error al procesar el contenido: ${error instanceof Error ? error.message : 'Error desconocido'}</p>`;
  }
};

// Componente de visualización de reporte optimizado
const ReportDisplay: React.FC<{
  report: FinalReport;
  sources: Source[];
  topic: string;
  onReset: () => void;
}> = ({ report, sources, topic, onReset }) => {
  const [showCopyToast, setShowCopyToast] = useState(false);
  const [isExportingPDF, setIsExportingPDF] = useState(false);

  // Logging para debugging
  console.log('🔍 ReportDisplay renderizando con:', { report, sources, topic });
  console.log('📊 Reporte recibido:', report);
  console.log('📋 Resumen:', report?.summary);
  console.log('📄 Contenido del reporte:', report?.report?.substring(0, 200) + '...');

  // Validación de seguridad
  if (!report) {
    console.error('❌ ReportDisplay: report es null/undefined');
    return (
      <Card className="p-6 text-center">
        <div className="text-center">
          <h2 className="text-xl text-red-600 mb-4">Error: Reporte No Disponible</h2>
          <p className="text-gray-600 mb-6">El reporte no se generó correctamente.</p>
          <Button onClick={onReset} variant="primary" size="md">
            Intentar de Nuevo
          </Button>
        </div>
      </Card>
    );
  }

  if (!report.summary || !Array.isArray(report.summary) || report.summary.length === 0) {
    console.error('❌ ReportDisplay: summary inválido:', report.summary);
    return (
      <Card className="p-6 text-center">
        <div className="text-center">
          <h2 className="text-xl text-red-600 mb-4">Error: Resumen No Disponible</h2>
          <p className="text-gray-600 mb-6">El resumen del reporte no se generó correctamente.</p>
          <Button onClick={onReset} variant="primary" size="md">
            Intentar de Nuevo
          </Button>
        </div>
      </Card>
    );
  }

  if (!report.report || typeof report.report !== 'string' || report.report.trim().length === 0) {
    console.error('❌ ReportDisplay: contenido del reporte inválido:', report.report);
    return (
      <Card className="p-6 text-center">
        <div className="text-center">
          <h2 className="text-xl text-red-600 mb-4">Error: Contenido del Reporte No Disponible</h2>
          <p className="text-gray-600 mb-6">El contenido del reporte no se generó correctamente.</p>
          <Button onClick={onReset} variant="primary" size="md">
            Intentar de Nuevo
          </Button>
        </div>
      </Card>
    );
  }

  const handleCopyReport = async () => {
    try {
      await navigator.clipboard.writeText(report.report);
      setShowCopyToast(true);
      setTimeout(() => setShowCopyToast(false), 3000);
    } catch (err) {
      console.error('Error al copiar:', err);
    }
  };

  const handleExportToPDF = async () => {
    try {
      setIsExportingPDF(true);
      console.log('🔄 Iniciando exportación a PDF...');
      
      await exportReportToPDF(report, topic, sources, {
        filename: `reporte-${topic.replace(/[^a-zA-Z0-9\s]/g, '').replace(/\s+/g, '-').toLowerCase()}`,
        includeMetadata: true,
        includeSources: true,
        format: 'a4'
      });
      
      // Mostrar notificación de éxito
      setShowCopyToast(true);
      setTimeout(() => setShowCopyToast(false), 3000);
      
    } catch (error) {
      console.error('❌ Error al exportar PDF:', error);
      alert('Error al exportar el reporte a PDF. Por favor, inténtalo de nuevo.');
    } finally {
      setIsExportingPDF(false);
    }
  };
  return (
    <div className="space-y-3 sm:space-y-4">
      <div className="text-center">
        <h2 className="text-sm sm:text-base font-medium text-gray-800 mb-1">
          Reporte de Investigación Completado
        </h2>
        <p className="text-xs text-gray-500 px-2">
          Tema: {topic}
        </p>
      </div>

      {/* Resumen ejecutivo */}
      <Card className="p-3 sm:p-4">
        <h3 className="text-xs sm:text-sm font-medium text-gray-700 mb-2 sm:mb-3 flex items-center gap-2">
          <LightbulbIcon className="w-3 h-3 sm:w-4 sm:h-4 text-slate-500" />
          Resumen Ejecutivo
        </h3>
        <div className="space-y-2 sm:space-y-3">
          {report.summary.map((item, index) => (
            <div key={index} className="flex items-start gap-2 sm:gap-3 p-2 sm:p-3 bg-slate-50 rounded-lg border-l-4 border-slate-500">
              <span className="text-slate-600 font-bold text-base sm:text-lg flex-shrink-0">#{index + 1}</span>
              <span 
                className="text-black text-xs sm:text-sm leading-relaxed flex-1"
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
      <Card className="p-3 sm:p-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-3 mb-2 sm:mb-3">
          <h3 className="text-xs sm:text-sm font-medium text-gray-700 flex items-center gap-2">
            <FileTextIcon className="w-3 h-3 sm:w-4 sm:h-4 text-slate-500" />
            Reporte Completo
          </h3>
          <div className="flex gap-2 sm:gap-3">
            <Button
              variant="secondary"
              size="sm"
              onClick={handleCopyReport}
              icon={<CopyIcon className="w-3 h-3 sm:w-4 sm:h-4" />}
              className="min-h-[40px] sm:min-h-[36px]"
            >
              Copiar
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleExportToPDF}
              disabled={isExportingPDF}
              loading={isExportingPDF}
              icon={!isExportingPDF && <DownloadIcon className="w-3 h-3 sm:w-4 sm:h-4" />}
              className="min-h-[40px] sm:min-h-[36px]"
            >
              {isExportingPDF ? 'Exportando...' : 'PDF'}
            </Button>
          </div>
        </div>
        <div className="prose max-w-none">
          <div 
            className="text-black leading-relaxed text-xs sm:text-sm"
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
      <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 justify-center">
        <Button
          onClick={onReset}
          variant="primary"
          size="lg"
          icon={<RefreshCwIcon className="w-4 h-4 sm:w-5 sm:h-5" />}
          className="min-h-[48px] sm:min-h-[44px]"
        >
          Nueva Investigación
        </Button>
      </div>

      {/* Toast de confirmación */}
      {showCopyToast && (
        <div className="fixed bottom-3 sm:bottom-4 right-3 sm:right-4 bg-green-500 text-white px-3 sm:px-4 py-2 rounded-lg shadow-lg z-50 animate-in slide-in-from-bottom-2">
          <div className="flex items-center gap-2">
            <CheckIcon className="w-3 h-3 sm:w-4 sm:h-4" />
            <span className="text-sm">
              {isExportingPDF ? 'PDF exportado exitosamente' : 'Reporte copiado al portapapeles'}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResearchView;
