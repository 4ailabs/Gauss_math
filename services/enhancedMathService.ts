import { extract } from 'langextract';
import { ProcessedData } from '../types';

// Tipos mejorados para conceptos matemáticos
export interface EnhancedMathConcept {
  concept: string;
  definition: string;
  difficulty: 'basic' | 'intermediate' | 'advanced';
  prerequisites: string[];
  applications: string[];
  formulas?: string[];
  examples?: string[];
  sourceText: string; // Texto fuente del concepto
}

export interface EnhancedQuizQuestion {
  question: string;
  type: 'multiple_choice' | 'true_false' | 'development' | 'formula_completion';
  difficulty: 'basic' | 'intermediate' | 'advanced';
  concept: string;
  options?: string[];
  correctAnswer: string;
  explanation: string;
  sourceConcept: string;
}

export interface EnhancedMathProblem {
  problem: string;
  solution: string;
  concepts: string[];
  difficulty: 'basic' | 'intermediate' | 'advanced';
  steps: string[];
  relatedFormulas: string[];
  sourceContext: string;
}

export interface EnhancedProcessedData extends ProcessedData {
  enhancedConcepts: EnhancedMathConcept[];
  enhancedQuizQuestions: EnhancedQuizQuestion[];
  enhancedProblems: EnhancedMathProblem[];
  conceptMap: Array<{
    from: string;
    to: string;
    relationship: 'prerequisite' | 'application' | 'generalization' | 'specialization';
  }>;
  difficultyDistribution: {
    basic: number;
    intermediate: number;
    advanced: number;
  };
  subjectAreas: string[];
}

// Prompts especializados para extracción matemática
const mathConceptExtractionPrompt = `
Extrae conceptos matemáticos de nivel universitario (7mo semestre) con la siguiente estructura:

1. CONCEPTOS CLAVE:
   - Nombre del concepto
   - Definición precisa y matemáticamente correcta
   - Nivel de dificultad (básico/intermedio/avanzado)
   - Prerrequisitos necesarios
   - Aplicaciones prácticas
   - Fórmulas relacionadas (si aplica)
   - Ejemplos concretos

2. RELACIONES CONCEPTUALES:
   - Conexiones entre conceptos
   - Jerarquías de dependencia
   - Aplicaciones cruzadas

3. CLASIFICACIÓN POR ÁREA:
   - Cálculo diferencial e integral
   - Álgebra lineal
   - Análisis matemático
   - Geometría analítica
   - Ecuaciones diferenciales
   - Otros temas específicos

IMPORTANTE: Mantén rigor matemático y adapta al nivel universitario avanzado.
`;

const quizGenerationPrompt = `
Genera preguntas de evaluación variadas basadas en los conceptos extraídos:

1. TIPOS DE PREGUNTAS:
   - Opción múltiple (conceptos y aplicaciones)
   - Verdadero/Falso (definiciones y propiedades)
   - Desarrollo (problemas paso a paso)
   - Completar fórmulas

2. DISTRIBUCIÓN DE DIFICULTAD:
   - 40% básico (definiciones, conceptos fundamentales)
   - 40% intermedio (aplicaciones, conexiones)
   - 20% avanzado (análisis profundo, síntesis)

3. ESTRUCTURA:
   - Pregunta clara y específica
   - Opciones plausibles (para opción múltiple)
   - Respuesta correcta
   - Explicación detallada
   - Concepto asociado

IMPORTANTE: Las preguntas deben evaluar comprensión real, no solo memorización.
`;

const problemGenerationPrompt = `
Genera problemas de práctica relacionados con los conceptos extraídos:

1. TIPOS DE PROBLEMAS:
   - Cálculos directos
   - Demostraciones
   - Aplicaciones prácticas
   - Problemas de optimización
   - Análisis de casos

2. ESTRUCTURA:
   - Enunciado claro y contextualizado
   - Solución paso a paso
   - Conceptos aplicados
   - Fórmulas utilizadas
   - Conexiones con otros temas

3. NIVELES:
   - Básico: aplicación directa de fórmulas
   - Intermedio: combinación de conceptos
   - Avanzado: síntesis y análisis profundo

IMPORTANTE: Los problemas deben reforzar el aprendizaje y mostrar aplicaciones reales.
`;

export class EnhancedMathService {
  private static instance: EnhancedMathService;
  private apiKey: string;

  private constructor() {
    this.apiKey = process.env.LANGEXTRACT_API_KEY || process.env.GEMINI_API_KEY || '';
  }

  public static getInstance(): EnhancedMathService {
    if (!EnhancedMathService.instance) {
      EnhancedMathService.instance = new EnhancedMathService();
    }
    return EnhancedMathService.instance;
  }

  async extractMathConcepts(notes: string, subject: string): Promise<EnhancedMathConcept[]> {
    try {
      console.log('Iniciando extracción mejorada de conceptos matemáticos...');
      
      const result = await extract({
        text_or_documents: notes,
        prompt_description: mathConceptExtractionPrompt,
        examples: this.getMathExtractionExamples(),
        model_id: "gemini-2.5-flash",
        extraction_passes: 3,
        max_workers: 10,
        max_char_buffer: 2000,
        api_key: this.apiKey
      });

      console.log('Extracción completada, procesando resultados...');
      
      // Procesar y estructurar los resultados
      const concepts = this.processExtractionResults(result, notes);
      
      console.log(`Conceptos extraídos: ${concepts.length}`);
      return concepts;
      
    } catch (error) {
      console.error('Error en extracción mejorada:', error);
      // Fallback a extracción básica si LangExtract falla
      return this.fallbackConceptExtraction(notes, subject);
    }
  }

  async generateEnhancedQuiz(concepts: EnhancedMathConcept[]): Promise<EnhancedQuizQuestion[]> {
    try {
      console.log('Generando quiz mejorado...');
      
      const conceptText = concepts.map(c => `${c.concept}: ${c.definition}`).join('\n\n');
      
      const result = await extract({
        text_or_documents: conceptText,
        prompt_description: quizGenerationPrompt,
        examples: this.getQuizGenerationExamples(),
        model_id: "gemini-2.5-flash",
        extraction_passes: 2,
        max_workers: 8,
        max_char_buffer: 1500,
        api_key: this.apiKey
      });

      const questions = this.processQuizResults(result, concepts);
      console.log(`Preguntas generadas: ${questions.length}`);
      return questions;
      
    } catch (error) {
      console.error('Error generando quiz mejorado:', error);
      return this.fallbackQuizGeneration(concepts);
    }
  }

  async generateEnhancedProblems(concepts: EnhancedMathConcept[]): Promise<EnhancedMathProblem[]> {
    try {
      console.log('Generando problemas mejorados...');
      
      const conceptText = concepts.map(c => `${c.concept}: ${c.definition}`).join('\n\n');
      
      const result = await extract({
        text_or_documents: conceptText,
        prompt_description: problemGenerationPrompt,
        examples: this.getProblemGenerationExamples(),
        model_id: "gemini-2.5-flash",
        extraction_passes: 2,
        max_workers: 8,
        max_char_buffer: 1500,
        api_key: this.apiKey
      });

      const problems = this.processProblemResults(result, concepts);
      console.log(`Problemas generados: ${problems.length}`);
      return problems;
      
    } catch (error) {
      console.error('Error generando problemas mejorados:', error);
      return this.fallbackProblemGeneration(concepts);
    }
  }

  async processNotesEnhanced(notes: string, subject: string): Promise<EnhancedProcessedData> {
    console.log('Procesamiento mejorado de apuntes iniciado...');
    
    // Extraer conceptos mejorados
    const enhancedConcepts = await this.extractMathConcepts(notes, subject);
    
    // Generar quiz mejorado
    const enhancedQuizQuestions = await this.generateEnhancedQuiz(enhancedConcepts);
    
    // Generar problemas mejorados
    const enhancedProblems = await this.generateEnhancedProblems(enhancedConcepts);
    
    // Crear mapa conceptual
    const conceptMap = this.createConceptMap(enhancedConcepts);
    
    // Analizar distribución de dificultad
    const difficultyDistribution = this.analyzeDifficultyDistribution(enhancedConcepts);
    
    // Identificar áreas temáticas
    const subjectAreas = this.identifySubjectAreas(enhancedConcepts, subject);
    
    // Crear resumen mejorado
    const summary = this.createEnhancedSummary(enhancedConcepts, subject);
    
    // Convertir a formato compatible con la app existente
    const legacyData: ProcessedData = {
      summary,
      keyConcepts: enhancedConcepts.map(c => ({
        concept: c.concept,
        explanation: c.definition,
        importance: this.getImportanceLevel(c.difficulty)
      })),
      quizQuestions: enhancedQuizQuestions.map(q => ({
        question: q.question,
        answer: q.correctAnswer,
        explanation: q.explanation
      })),
      relatedProblems: enhancedProblems.map(p => ({
        problem: p.problem,
        solution: p.solution
      }))
    };

    return {
      ...legacyData,
      enhancedConcepts,
      enhancedQuizQuestions,
      enhancedProblems,
      conceptMap,
      difficultyDistribution,
      subjectAreas
    };
  }

  private getMathExtractionExamples() {
    return [
      {
        input: "La derivada de una función f(x) en un punto x=a es el límite del cociente incremental cuando h tiende a cero.",
        output: {
          concept: "Derivada de una función",
          definition: "La derivada de una función f(x) en un punto x=a es el límite del cociente incremental cuando h tiende a cero.",
          difficulty: "intermediate",
          prerequisites: ["Límites", "Funciones", "Cociente incremental"],
          applications: ["Velocidad instantánea", "Pendiente de recta tangente", "Optimización"],
          formulas: ["f'(a) = lim(h→0) [f(a+h) - f(a)]/h"],
          examples: ["Derivada de x² es 2x", "Derivada de sen(x) es cos(x)"]
        }
      }
    ];
  }

  private getQuizGenerationExamples() {
    return [
      {
        input: "Derivada de una función",
        output: {
          question: "¿Cuál es la derivada de f(x) = x³?",
          type: "multiple_choice",
          difficulty: "basic",
          concept: "Derivada de una función",
          options: ["3x²", "x²", "3x", "x³"],
          correctAnswer: "3x²",
          explanation: "La derivada de x^n es nx^(n-1), por lo tanto la derivada de x³ es 3x².",
          sourceConcept: "Regla de potencias para derivadas"
        }
      }
    ];
  }

  private getProblemGenerationExamples() {
    return [
      {
        input: "Derivada de una función",
        output: {
          problem: "Calcula la derivada de f(x) = 2x³ + 5x² - 3x + 1",
          solution: "Aplicando la regla de potencias: f'(x) = 6x² + 10x - 3",
          concepts: ["Derivada de una función", "Regla de potencias", "Derivada de suma"],
          difficulty: "basic",
          steps: [
            "Derivada de 2x³: 2 × 3x² = 6x²",
            "Derivada de 5x²: 5 × 2x = 10x",
            "Derivada de -3x: -3 × 1 = -3",
            "Derivada de 1: 0",
            "Resultado: 6x² + 10x - 3"
          ],
          relatedFormulas: ["d/dx(x^n) = nx^(n-1)", "d/dx(c) = 0"],
          sourceContext: "Aplicación directa de reglas de derivación"
        }
      }
    ];
  }

  private processExtractionResults(result: any, sourceText: string): EnhancedMathConcept[] {
    // Procesar resultados de LangExtract y convertirlos a nuestro formato
    try {
      const concepts: EnhancedMathConcept[] = [];
      
      if (result && result.extractions) {
        for (const extraction of result.extractions) {
          if (extraction.concept && extraction.definition) {
            concepts.push({
              concept: extraction.concept,
              definition: extraction.definition,
              difficulty: extraction.difficulty || 'intermediate',
              prerequisites: extraction.prerequisites || [],
              applications: extraction.applications || [],
              formulas: extraction.formulas || [],
              examples: extraction.examples || [],
              sourceText: this.findSourceText(extraction.concept, sourceText)
            });
          }
        }
      }
      
      return concepts.length > 0 ? concepts : this.fallbackConceptExtraction(sourceText, 'matemáticas');
      
    } catch (error) {
      console.error('Error procesando resultados de extracción:', error);
      return this.fallbackConceptExtraction(sourceText, 'matemáticas');
    }
  }

  private processQuizResults(result: any, concepts: EnhancedMathConcept[]): EnhancedQuizQuestion[] {
    try {
      const questions: EnhancedQuizQuestion[] = [];
      
      if (result && result.extractions) {
        for (const extraction of result.extractions) {
          if (extraction.question && extraction.correctAnswer) {
            questions.push({
              question: extraction.question,
              type: extraction.type || 'multiple_choice',
              difficulty: extraction.difficulty || 'intermediate',
              concept: extraction.concept || 'Concepto general',
              options: extraction.options || [],
              correctAnswer: extraction.correctAnswer,
              explanation: extraction.explanation || 'Explicación no disponible',
              sourceConcept: extraction.sourceConcept || 'Concepto general'
            });
          }
        }
      }
      
      return questions.length > 0 ? questions : this.fallbackQuizGeneration(concepts);
      
    } catch (error) {
      console.error('Error procesando resultados del quiz:', error);
      return this.fallbackQuizGeneration(concepts);
    }
  }

  private processProblemResults(result: any, concepts: EnhancedMathConcept[]): EnhancedMathProblem[] {
    try {
      const problems: EnhancedMathProblem[] = [];
      
      if (result && result.extractions) {
        for (const extraction of result.extractions) {
          if (extraction.problem && extraction.solution) {
            problems.push({
              problem: extraction.problem,
              solution: extraction.solution,
              concepts: extraction.concepts || [],
              difficulty: extraction.difficulty || 'intermediate',
              steps: extraction.steps || [],
              relatedFormulas: extraction.relatedFormulas || [],
              sourceContext: extraction.sourceContext || 'Contexto general'
            });
          }
        }
      }
      
      return problems.length > 0 ? problems : this.fallbackProblemGeneration(concepts);
      
    } catch (error) {
      console.error('Error procesando resultados de problemas:', error);
      return this.fallbackProblemGeneration(concepts);
    }
  }

  private createConceptMap(concepts: EnhancedMathConcept[]): Array<{from: string, to: string, relationship: string}> {
    const conceptMap: Array<{from: string, to: string, relationship: string}> = [];
    
    for (const concept of concepts) {
      // Crear relaciones basadas en prerrequisitos
      for (const prereq of concept.prerequisites) {
        conceptMap.push({
          from: prereq,
          to: concept.concept,
          relationship: 'prerequisite'
        });
      }
      
      // Crear relaciones basadas en aplicaciones
      for (const app of concept.applications) {
        conceptMap.push({
          from: concept.concept,
          to: app,
          relationship: 'application'
        });
      }
    }
    
    return conceptMap;
  }

  private analyzeDifficultyDistribution(concepts: EnhancedMathConcept[]) {
    const distribution = { basic: 0, intermediate: 0, advanced: 0 };
    
    for (const concept of concepts) {
      distribution[concept.difficulty]++;
    }
    
    return distribution;
  }

  private identifySubjectAreas(concepts: EnhancedMathConcept[], subject: string): string[] {
    const areas = new Set<string>();
    
    // Mapear conceptos a áreas temáticas
    for (const concept of concepts) {
      if (concept.concept.toLowerCase().includes('derivada') || 
          concept.concept.toLowerCase().includes('integral')) {
        areas.add('Cálculo');
      }
      if (concept.concept.toLowerCase().includes('matriz') || 
          concept.concept.toLowerCase().includes('vector')) {
        areas.add('Álgebra Lineal');
      }
      if (concept.concept.toLowerCase().includes('ecuación') || 
          concept.concept.toLowerCase().includes('diferencial')) {
        areas.add('Ecuaciones Diferenciales');
      }
      if (concept.concept.toLowerCase().includes('geometría') || 
          concept.concept.toLowerCase().includes('coordenada')) {
        areas.add('Geometría Analítica');
      }
    }
    
    if (areas.size === 0) {
      areas.add(subject || 'Matemáticas Generales');
    }
    
    return Array.from(areas);
  }

  private createEnhancedSummary(concepts: EnhancedMathConcept[], subject: string): string {
    const totalConcepts = concepts.length;
    const difficultyCounts = this.analyzeDifficultyDistribution(concepts);
    const areas = this.identifySubjectAreas(concepts, subject);
    
    return `Se han extraído ${totalConcepts} conceptos matemáticos de nivel universitario avanzado. 
    La distribución incluye ${difficultyCounts.basic} conceptos básicos, ${difficultyCounts.intermediate} intermedios y ${difficultyCounts.advanced} avanzados. 
    Los temas cubren las áreas de: ${areas.join(', ')}. 
    Cada concepto incluye definiciones precisas, prerrequisitos, aplicaciones prácticas y ejemplos relevantes para el ${subject || 'estudio matemático'} de 7mo semestre.`;
  }

  private getImportanceLevel(difficulty: string): string {
    switch (difficulty) {
      case 'basic': return 'alta';
      case 'intermediate': return 'media';
      case 'advanced': return 'alta';
      default: return 'media';
    }
  }

  private findSourceText(concept: string, sourceText: string): string {
    // Buscar el texto fuente del concepto
    const lines = sourceText.split('\n');
    for (const line of lines) {
      if (line.toLowerCase().includes(concept.toLowerCase())) {
        return line.trim();
      }
    }
    return 'Texto fuente no encontrado';
  }

  // Métodos de fallback para mantener compatibilidad
  private fallbackConceptExtraction(notes: string, subject: string): EnhancedMathConcept[] {
    // Implementación básica si LangExtract falla
    return [{
      concept: 'Concepto general',
      definition: 'Concepto extraído de los apuntes proporcionados',
      difficulty: 'intermediate',
      prerequisites: [],
      applications: [],
      sourceText: notes.substring(0, 100) + '...'
    }];
  }

  private fallbackQuizGeneration(concepts: EnhancedMathConcept[]): EnhancedQuizQuestion[] {
    return [{
      question: '¿Cuál es el concepto principal de estos apuntes?',
      type: 'multiple_choice',
      difficulty: 'basic',
      concept: 'Concepto general',
      correctAnswer: 'Concepto matemático',
      explanation: 'Pregunta básica de comprensión',
      sourceConcept: 'Concepto general'
    }];
  }

  private fallbackProblemGeneration(concepts: EnhancedMathConcept[]): EnhancedMathProblem[] {
    return [{
      problem: 'Problema de práctica basado en los conceptos estudiados',
      solution: 'Solución paso a paso del problema',
      concepts: ['Concepto general'],
      difficulty: 'intermediate',
      steps: ['Paso 1: Identificar el problema', 'Paso 2: Aplicar conceptos', 'Paso 3: Resolver'],
      relatedFormulas: [],
      sourceContext: 'Contexto general de los apuntes'
    }];
  }
}

export default EnhancedMathService;
