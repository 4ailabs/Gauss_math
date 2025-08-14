import { GoogleGenAI } from '@google/genai';

// Tipos para la estrategia avanzada
export type ResearchTask = 'PLANNING' | 'RESEARCH' | 'SYNTHESIS' | 'REFINEMENT';

export interface ModelStrategy {
  primary: string;
  fallback: string;
  reason: string;
  maxTokens?: number;
  temperature?: number;
}

export interface ResearchData {
  title: string;
  content: string;
  sources: any[];
}

export interface ResearchResult {
  content: string;
  sources: any[];
}

export interface FinalReport {
  summary: string[];
  report: string;
}

// Estrategia de modelos por tarea
export const MODEL_STRATEGY: Record<ResearchTask, ModelStrategy> = {
  PLANNING: {
    primary: 'gemini-2.0-flash-exp',
    fallback: 'gemini-2.0-flash',
    reason: 'Rápido para planificación, bajo costo',
    maxTokens: 2048,
    temperature: 0.3
  },
  
  RESEARCH: {
    primary: 'gemini-2.0-pro',
    fallback: 'gemini-1.5-flash',
    reason: 'Profundo para investigación, balance costo-calidad',
    maxTokens: 8192,
    temperature: 0.2
  },
  
  SYNTHESIS: {
    primary: 'gemini-1.5-pro',
    fallback: 'gemini-2.0-pro',
    reason: 'Máximo poder para síntesis compleja',
    maxTokens: 16384,
    temperature: 0.1
  },
  
  REFINEMENT: {
    primary: 'gemini-2.0-pro',
    fallback: 'gemini-1.5-flash',
    reason: 'Inteligencia para refinamiento iterativo',
    maxTokens: 4096,
    temperature: 0.4
  }
};

// Cache inteligente para respuestas de modelos
export class ModelResponseCache {
  private cache = new Map<string, { response: any; timestamp: number; model: string }>();
  private readonly TTL = 30 * 60 * 1000; // 30 minutos

  async getCachedResponse(key: string, model: string): Promise<any | null> {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < this.TTL) {
      console.log(`🔄 Respuesta cacheada encontrada para: ${key}`);
      return cached.response;
    }
    return null;
  }

  setCachedResponse(key: string, response: any, model: string): void {
    this.cache.set(key, { response, timestamp: Date.now(), model });
    console.log(`💾 Respuesta cacheada para: ${key} con modelo ${model}`);
  }

  clearExpiredCache(): void {
    const now = Date.now();
    for (const [key, value] of this.cache.entries()) {
      if (now - value.timestamp > this.TTL) {
        this.cache.delete(key);
      }
    }
    console.log(`🧹 Cache limpiado, entradas expiradas removidas`);
  }

  getCacheStats(): { total: number; expired: number; valid: number } {
    const now = Date.now();
    let expired = 0;
    let valid = 0;

    for (const value of this.cache.values()) {
      if (now - value.timestamp > this.TTL) {
        expired++;
      } else {
        valid++;
      }
    }

    return {
      total: this.cache.size,
      expired,
      valid
    };
  }
}

// Monitoreo avanzado de rendimiento por modelo
export class ModelPerformanceMonitor {
  private metrics = new Map<string, {
    successCount: number;
    errorCount: number;
    avgResponseTime: number;
    totalRequests: number;
    lastUsed: number;
  }>();

  recordRequest(model: string, success: boolean, responseTime: number): void {
    const current = this.metrics.get(model) || {
      successCount: 0,
      errorCount: 0,
      avgResponseTime: 0,
      totalRequests: 0,
      lastUsed: Date.now()
    };

    current.totalRequests++;
    current.lastUsed = Date.now();
    
    if (success) {
      current.successCount++;
    } else {
      current.errorCount++;
    }

    // Promedio móvil ponderado
    current.avgResponseTime = (current.avgResponseTime * 0.9) + (responseTime * 0.1);
    
    this.metrics.set(model, current);
  }

  getBestModelForTask(task: ResearchTask): string {
    const taskModels = [MODEL_STRATEGY[task].primary, MODEL_STRATEGY[task].fallback];
    
    return taskModels.reduce((best, current) => {
      const bestMetrics = this.metrics.get(best) || { 
        successCount: 0, 
        avgResponseTime: Infinity,
        totalRequests: 0
      };
      const currentMetrics = this.metrics.get(current) || { 
        successCount: 0, 
        avgResponseTime: Infinity,
        totalRequests: 0
      };
      
      // Score basado en éxito y velocidad
      const bestScore = bestMetrics.totalRequests > 0 
        ? (bestMetrics.successCount / bestMetrics.totalRequests) / Math.max(bestMetrics.avgResponseTime, 1)
        : 0;
      const currentScore = currentMetrics.totalRequests > 0
        ? (currentMetrics.successCount / currentMetrics.totalRequests) / Math.max(currentMetrics.avgResponseTime, 1)
        : 0;
      
      return currentScore > bestScore ? current : best;
    });
  }

  getModelStats(model: string) {
    return this.metrics.get(model) || {
      successCount: 0,
      errorCount: 0,
      avgResponseTime: 0,
      totalRequests: 0,
      lastUsed: 0
    };
  }

  getAllModelStats() {
    const stats: Record<string, any> = {};
    for (const [model, metric] of this.metrics.entries()) {
      stats[model] = {
        ...metric,
        successRate: metric.totalRequests > 0 ? (metric.successCount / metric.totalRequests * 100).toFixed(2) + '%' : '0%'
      };
    }
    return stats;
  }
}

// Sistema de fallback inteligente
export const getOptimalModel = async (task: ResearchTask, performanceMonitor: ModelPerformanceMonitor): Promise<string> => {
  const strategy = MODEL_STRATEGY[task];
  
  try {
    // Obtener el mejor modelo basado en métricas de rendimiento
    const bestModel = performanceMonitor.getBestModelForTask(task);
    console.log(`🎯 Modelo óptimo seleccionado para ${task}: ${bestModel}`);
    return bestModel;
  } catch (error) {
    console.error(`❌ Error al seleccionar modelo óptimo, usando fallback:`, error);
    return strategy.fallback;
  }
};

// Sistema de retry inteligente con backoff exponencial
export const executeWithRetry = async <T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<T> => {
  let lastError: Error;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const startTime = Date.now();
      const result = await operation();
      const responseTime = Date.now() - startTime;
      
      console.log(`✅ Operación exitosa en intento ${attempt} (${responseTime}ms)`);
      return result;
      
    } catch (error) {
      lastError = error as Error;
      console.log(`❌ Intento ${attempt} falló:`, error.message);
      
      if (attempt < maxRetries) {
        const delay = baseDelay * Math.pow(2, attempt - 1);
        console.log(`⏳ Esperando ${delay}ms antes del siguiente intento...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  
  throw lastError!;
};

// Prompts adaptativos según el modelo
export const getOptimizedPrompt = (task: ResearchTask, model: string, content: string): string => {
  const basePrompt = getBasePrompt(task, content);
  
  switch (model) {
    case 'gemini-1.5-pro':
      return `${basePrompt}

INSTRUCCIONES ESPECÍFICAS PARA GEMINI 1.5 PRO:
- Utiliza todo el contexto disponible (hasta 1M tokens)
- Profundiza en conexiones matemáticas complejas
- Genera análisis más detallados y académicos
- Incluye referencias cruzadas entre conceptos
- Aprovecha la capacidad de razonamiento matemático avanzado`;
      
    case 'gemini-2.0-pro':
      return `${basePrompt}

INSTRUCCIONES ESPECÍFICAS PARA GEMINI 2.0 PRO:
- Enfócate en razonamiento matemático avanzado
- Utiliza el contexto de manera eficiente
- Genera respuestas estructuradas y coherentes
- Prioriza la precisión técnica
- Aprovecha las capacidades de razonamiento lógico`;
      
    case 'gemini-2.0-flash-exp':
      return `${basePrompt}

INSTRUCCIONES ESPECÍFICAS PARA GEMINI 2.0 FLASH:
- Respuestas concisas pero completas
- Estructura clara y directa
- Optimiza para velocidad sin perder calidad
- Enfócate en puntos clave
- Mantén la precisión matemática`;
      
    case 'gemini-1.5-flash':
      return `${basePrompt}

INSTRUCCIONES ESPECÍFICAS PARA GEMINI 1.5 FLASH:
- Balance entre velocidad y profundidad
- Estructura organizada y clara
- Enfócate en información esencial
- Mantén coherencia lógica
- Optimiza el uso del contexto`;
      
    default:
      return basePrompt;
  }
};

// Prompts base por tarea
const getBasePrompt = (task: ResearchTask, content: string): string => {
  switch (task) {
    case 'PLANNING':
      return `Eres un experto en investigación matemática. Tu tarea es crear un plan de investigación estructurado para el tema: "${content}".

REQUISITOS:
- Genera 4-6 subtópicos específicos y bien definidos
- Cada subtópico debe ser investigable de forma independiente
- Los subtópicos deben cubrir diferentes aspectos del tema principal
- Enfócate en conceptos matemáticos fundamentales
- Considera la progresión lógica del aprendizaje

FORMATO DE SALIDA:
Debes responder SOLO con un array JSON de strings, cada uno representando un subtópico:
["subtópico 1", "subtópico 2", "subtópico 3", ...]`;
      
    case 'RESEARCH':
      return `Eres un investigador matemático experto. Investiga el subtópico: "${content}".

REQUISITOS:
- Genera un análisis académico profundo (800-1200 palabras mínimo)
- Incluye definiciones matemáticas precisas
- Proporciona ejemplos concretos y aplicaciones
- Cita fuentes académicas relevantes
- Estructura el contenido de manera lógica

FORMATO DE SALIDA:
Debes responder con un JSON que contenga:
{
  "content": "contenido del análisis...",
  "sources": [
    {
      "uri": "URL de la fuente",
      "title": "Título de la fuente"
    }
  ]
}`;
      
    case 'SYNTHESIS':
      return `Eres un experto en síntesis matemática. Crea un reporte final basado en la investigación de: "${content}".

REQUISITOS:
- Genera un reporte académico completo (1500-2000 palabras mínimo)
- Estructura con introducción, desarrollo y conclusiones
- Integra todos los subtópicos de manera coherente
- Incluye un resumen ejecutivo con 4-6 puntos clave
- Mantén rigor matemático y claridad expositiva

FORMATO DE SALIDA:
Debes responder con un JSON que contenga:
{
  "summary": ["punto clave 1", "punto clave 2", ...],
  "report": "# Título del Reporte\n\n## Introducción\n\n[contenido en Markdown...]"
}`;
      
    case 'REFINEMENT':
      return `Eres un editor matemático experto. Refina y mejora el contenido: "${content}".

REQUISITOS:
- Mejora la claridad y precisión
- Corrige errores matemáticos si los hay
- Optimiza la estructura y flujo
- Mantén el rigor académico
- Asegura consistencia en la terminología

FORMATO DE SALIDA:
Debes responder con el contenido refinado en el mismo formato que recibiste.`;
      
    default:
      return `Analiza el siguiente contenido: ${content}`;
  }
};

// Servicio principal de investigación avanzada
export class AdvancedResearchService {
  private genAI: GoogleGenAI;
  private cache: ModelResponseCache;
  private performanceMonitor: ModelPerformanceMonitor;
  private currentModel: string = '';

  constructor(apiKey: string) {
    this.genAI = new GoogleGenAI({ apiKey });
    this.cache = new ModelResponseCache();
    this.performanceMonitor = new ModelPerformanceMonitor();
    
    // Limpiar cache expirado cada 5 minutos
    setInterval(() => this.cache.clearExpiredCache(), 5 * 60 * 1000);
  }

  private async callGeminiAPI(model: string, task: ResearchTask, content: any): Promise<any> {
    const startTime = Date.now();
    
    try {
      // Obtener prompt optimizado para el modelo
      const prompt = getOptimizedPrompt(task, model, content);
      
      // Ejecutar la llamada usando la API correcta
      const result = await this.genAI.models.generateContent({
        model: model,
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          maxOutputTokens: MODEL_STRATEGY[task].maxTokens || 8192,
          temperature: MODEL_STRATEGY[task].temperature || 0.2,
        }
      });
      
      const text = result.text;
      const responseTime = Date.now() - startTime;
      
      // Registrar métricas de éxito
      this.performanceMonitor.recordRequest(model, true, responseTime);
      
      console.log(`✅ API call exitoso con modelo ${model} en ${responseTime}ms`);
      
      // Parsear respuesta JSON
      try {
        return JSON.parse(text);
      } catch (parseError) {
        console.warn(`⚠️ Error al parsear JSON, devolviendo texto plano:`, parseError);
        return { content: text, sources: [] };
      }
      
    } catch (error) {
      const responseTime = Date.now() - startTime;
      this.performanceMonitor.recordRequest(model, false, responseTime);
      
      console.error(`❌ Error en API call con modelo ${model}:`, error);
      throw error;
    }
  }

  async createResearchPlan(topic: string): Promise<string[]> {
    const task: ResearchTask = 'PLANNING';
    const model = await getOptimalModel(task, this.performanceMonitor);
    this.currentModel = model;
    
    const cacheKey = `plan:${topic}:${model}`;
    
    // Intentar cache primero
    const cached = await this.cache.getCachedResponse(cacheKey, model);
    if (cached) return cached;
    
    const result = await executeWithRetry(
      () => this.callGeminiAPI(model, task, topic),
      3
    );
    
    // Cachear resultado
    await this.cache.setCachedResponse(cacheKey, result, model);
    return result;
  }
  
  async researchSubtopic(subtopic: string, mainTopic: string): Promise<ResearchResult> {
    const task: ResearchTask = 'RESEARCH';
    const model = await getOptimalModel(task, this.performanceMonitor);
    this.currentModel = model;
    
    const cacheKey = `research:${subtopic}:${mainTopic}:${model}`;
    
    const cached = await this.cache.getCachedResponse(cacheKey, model);
    if (cached) return cached;
    
    const result = await executeWithRetry(
      () => this.callGeminiAPI(model, task, { subtopic, mainTopic }),
      3
    );
    
    await this.cache.setCachedResponse(cacheKey, result, model);
    return result;
  }
  
  async synthesizeReport(topic: string, researchData: ResearchData[]): Promise<FinalReport> {
    const task: ResearchTask = 'SYNTHESIS';
    const model = await getOptimalModel(task, this.performanceMonitor);
    this.currentModel = model;
    
    // Para síntesis, no usamos cache (siempre fresco)
    return await executeWithRetry(
      () => this.callGeminiAPI(model, task, { topic, researchData }),
      3
    );
  }

  async refineContent(content: string): Promise<string> {
    const task: ResearchTask = 'REFINEMENT';
    const model = await getOptimalModel(task, this.performanceMonitor);
    this.currentModel = model;
    
    const cacheKey = `refine:${content.substring(0, 100)}:${model}`;
    
    const cached = await this.cache.getCachedResponse(cacheKey, model);
    if (cached) return cached;
    
    const result = await executeWithRetry(
      () => this.callGeminiAPI(model, task, content),
      3
    );
    
    await this.cache.setCachedResponse(cacheKey, result, model);
    return result;
  }

  // Métodos de utilidad
  getCurrentModel(): string {
    return this.currentModel;
  }

  getCacheStats() {
    return this.cache.getCacheStats();
  }

  getPerformanceStats() {
    return this.performanceMonitor.getAllModelStats();
  }

  getModelForTask(task: ResearchTask): string {
    return this.performanceMonitor.getBestModelForTask(task);
  }
}

export default AdvancedResearchService;
