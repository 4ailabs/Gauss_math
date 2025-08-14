import { useState, useCallback, useEffect } from 'react';
import AdvancedResearchService, { ResearchTask, ResearchData, ResearchResult, FinalReport } from '../services/advancedGeminiService';

export const useAdvancedResearch = () => {
  const [advancedService] = useState(() => {
    const apiKey = process.env.GEMINI_API_KEY || process.env.API_KEY || '';
    return new AdvancedResearchService(apiKey);
  });

  const [currentModel, setCurrentModel] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Función para crear plan de investigación
  const createResearchPlan = useCallback(async (topic: string): Promise<string[]> => {
    setIsLoading(true);
    setError(null);
    
    try {
      console.log('🚀 Creando plan de investigación con servicio avanzado...');
      const result = await advancedService.createResearchPlan(topic);
      setCurrentModel(advancedService.getCurrentModel());
      console.log('✅ Plan creado exitosamente con modelo:', advancedService.getCurrentModel());
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido al crear el plan';
      console.error('❌ Error al crear plan:', errorMessage);
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [advancedService]);

  // Función para investigar subtópico
  const researchSubtopic = useCallback(async (subtopic: string, mainTopic: string): Promise<ResearchResult> => {
    setIsLoading(true);
    setError(null);
    
    try {
      console.log('🔍 Investigando subtópico con servicio avanzado...');
      const result = await advancedService.researchSubtopic(subtopic, mainTopic);
      setCurrentModel(advancedService.getCurrentModel());
      console.log('✅ Subtópico investigado exitosamente con modelo:', advancedService.getCurrentModel());
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido al investigar subtópico';
      console.error('❌ Error al investigar subtópico:', errorMessage);
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [advancedService]);

  // Función para sintetizar reporte
  const synthesizeReport = useCallback(async (topic: string, researchData: ResearchData[]): Promise<FinalReport> => {
    setIsLoading(true);
    setError(null);
    
    try {
      console.log('🔄 Sintetizando reporte con servicio avanzado...');
      const result = await advancedService.synthesizeReport(topic, researchData);
      setCurrentModel(advancedService.getCurrentModel());
      console.log('✅ Reporte sintetizado exitosamente con modelo:', advancedService.getCurrentModel());
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido al sintetizar reporte';
      console.error('❌ Error al sintetizar reporte:', errorMessage);
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [advancedService]);

  // Función para refinar contenido
  const refineContent = useCallback(async (content: string): Promise<string> => {
    setIsLoading(true);
    setError(null);
    
    try {
      console.log('✨ Refinando contenido con servicio avanzado...');
      const result = await advancedService.refineContent(content);
      setCurrentModel(advancedService.getCurrentModel());
      console.log('✅ Contenido refinado exitosamente con modelo:', advancedService.getCurrentModel());
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido al refinar contenido';
      console.error('❌ Error al refinar contenido:', errorMessage);
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [advancedService]);

  // Función para obtener estadísticas
  const getPerformanceStats = useCallback(() => {
    return advancedService.getPerformanceStats();
  }, [advancedService]);

  const getCacheStats = useCallback(() => {
    return advancedService.getCacheStats();
  }, [advancedService]);

  const getCurrentModel = useCallback(() => {
    return advancedService.getCurrentModel();
  }, [advancedService]);

  // Función para obtener el mejor modelo para una tarea
  const getBestModelForTask = useCallback((task: ResearchTask): string => {
    return advancedService.getModelForTask(task);
  }, [advancedService]);

  // Función para limpiar errores
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Función para obtener información del modelo actual
  const getModelInfo = useCallback(() => {
    const model = advancedService.getCurrentModel();
    if (!model) return null;

    const task = getTaskFromModel(model);
    return {
      model,
      task,
      description: getModelDescription(model),
      capabilities: getModelCapabilities(model)
    };
  }, [advancedService, getBestModelForTask]);

  // Función auxiliar para determinar la tarea del modelo
  const getTaskFromModel = (model: string): ResearchTask | null => {
    if (model.includes('flash')) return 'PLANNING';
    if (model.includes('2.0-pro')) return 'RESEARCH';
    if (model.includes('1.5-pro')) return 'SYNTHESIS';
    return null;
  };

  // Función para obtener descripción del modelo
  const getModelDescription = (model: string): string => {
    if (model.includes('1.5-pro')) return 'Modelo de máxima potencia para síntesis compleja';
    if (model.includes('2.0-pro')) return 'Modelo avanzado para investigación y razonamiento';
    if (model.includes('2.0-flash')) return 'Modelo rápido para planificación y tareas simples';
    if (model.includes('1.5-flash')) return 'Modelo balanceado para tareas intermedias';
    return 'Modelo desconocido';
  };

  // Función para obtener capacidades del modelo
  const getModelCapabilities = (model: string): string[] => {
    if (model.includes('1.5-pro')) {
      return [
        'Contexto de hasta 1M tokens',
        'Razonamiento matemático avanzado',
        'Síntesis compleja',
        'Análisis profundo'
      ];
    }
    if (model.includes('2.0-pro')) {
      return [
        'Razonamiento lógico avanzado',
        'Investigación profunda',
        'Precisión técnica',
        'Estructura coherente'
      ];
    }
    if (model.includes('2.0-flash')) {
      return [
        'Respuestas rápidas',
        'Bajo costo',
        'Estructura clara',
        'Puntos clave'
      ];
    }
    if (model.includes('1.5-flash')) {
      return [
        'Balance velocidad-profundidad',
        'Estructura organizada',
        'Información esencial',
        'Coherencia lógica'
      ];
    }
    return ['Capacidades estándar'];
  };

  // Efecto para actualizar el modelo actual
  useEffect(() => {
    const model = advancedService.getCurrentModel();
    if (model) {
      setCurrentModel(model);
    }
  }, [advancedService]);

  return {
    // Funciones principales
    createResearchPlan,
    researchSubtopic,
    synthesizeReport,
    refineContent,
    
    // Estado
    isLoading,
    error,
    currentModel,
    
    // Estadísticas y monitoreo
    getPerformanceStats,
    getCacheStats,
    getCurrentModel,
    getBestModelForTask,
    getModelInfo,
    
    // Utilidades
    clearError,
    
    // Información del servicio
    service: advancedService
  };
};
