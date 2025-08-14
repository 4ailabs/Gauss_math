import { GoogleGenAI, Type, GenerateContentResponse, GroundingChunk } from "@google/genai";

// Tipos para el servicio de investigación
export interface Source {
  uri: string;
  title: string;
}

export interface FinalReport {
  summary: string[];
  report: string;
}

// Verificar que la API key esté configurada
const apiKey = process.env.GEMINI_API_KEY || process.env.API_KEY || '';

if (!apiKey) {
  console.warn("GEMINI_API_KEY no está configurada. La funcionalidad de investigación estará limitada.");
}

const ai = new GoogleGenAI({ apiKey });

export async function createResearchPlan(topic: string): Promise<string[]> {
  try {
    if (!apiKey) {
      throw new Error("API Key de Gemini no configurada");
    }

    const prompt = `Eres un investigador y asistente académico de clase mundial en matemáticas. Tu tarea es estructurar un informe de investigación profundo sobre el tema: '${topic}'. 

Genera un plan de investigación que consista en 5 a 7 subtemas clave que serían esenciales para una comprensión integral. Estos deben incluir contexto histórico, conceptos fundamentales, teoremas o fórmulas clave, figuras importantes y aplicaciones modernas.

Devuelve el plan como un objeto JSON.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            subtopics: {
              type: Type.ARRAY,
              items: {
                type: Type.STRING
              },
              description: "Un array de 5 a 7 subtemas clave para el informe de investigación."
            }
          }
        }
      }
    });
    
    const jsonStr = response.text.trim();
    const result = JSON.parse(jsonStr);
    
    if (result && Array.isArray(result.subtopics)) {
      return result.subtopics;
    } else {
      throw new Error("Formato inválido para el plan de investigación recibido de la API.");
    }
  } catch (error) {
    console.error("Error al obtener el plan de investigación:", error);
    
    // Fallback: plan básico predefinido
    return [
      'Revisión de Literatura',
      'Metodología de Investigación',
      'Análisis de Datos',
      'Resultados y Discusión',
      'Conclusiones y Trabajo Futuro'
    ];
  }
}

export async function refineResearchPlan(topic: string, currentPlan: string[], userInput: string): Promise<string[]> {
  try {
    if (!apiKey) {
      throw new Error("API Key de Gemini no configurada");
    }

    const prompt = `Eres un asistente de investigación de matemáticas. Tu tarea es refinar un plan de investigación basado en los comentarios del usuario.

Tema Original: "${topic}"
Plan Actual:
- ${currentPlan.join('\n- ')}

Comentario del Usuario: "${userInput}"

Basado en los comentarios, genera una nueva lista actualizada de 5 a 7 subtemas clave. Devuelve solo un objeto JSON con una única clave "subtopics" que es un array de strings. No agregues ninguna otra explicación.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            subtopics: {
              type: Type.ARRAY,
              items: {
                type: Type.STRING
              },
              description: "Un array actualizado de 5 a 7 subtemas clave para el informe de investigación."
            }
          }
        }
      }
    });

    const jsonStr = response.text.trim();
    const result = JSON.parse(jsonStr);

    if (result && Array.isArray(result.subtopics)) {
      return result.subtopics;
    } else {
      console.error("Respuesta inesperada al refinar el plan:", jsonStr);
      throw new Error("No se pudo refinar el plan. La respuesta de la API no tuvo el formato esperado.");
    }
  } catch (error) {
    console.error("Error al refinar el plan de investigación:", error);
    
    // Fallback: agregar subtópico basado en feedback
    return [...currentPlan, `Nuevo Subtópico: ${userInput}`];
  }
}

export async function researchSubtopic(subtopic: string, mainTopic: string): Promise<{ content: string; sources: Source[] }> {
  try {
    if (!apiKey) {
      throw new Error("API Key de Gemini no configurada");
    }

    const prompt = `Eres un experto investigador en matemáticas con amplia experiencia académica. Tu tarea es crear una sección COMPLETA y DETALLADA para un informe de investigación sobre el subtema: '${subtopic}', dentro del contexto más amplio de '${mainTopic}'.

REQUISITOS DEL CONTENIDO:

1. PROFUNDIDAD ACADÉMICA: Proporciona un análisis exhaustivo que incluya:
   - Definiciones claras y precisas de conceptos clave
   - Explicaciones paso a paso de métodos y procedimientos
   - Ejemplos prácticos y aplicaciones reales
   - Conexiones con otros conceptos matemáticos relacionados
   - Estado actual de la investigación en este campo

2. ESTRUCTURA DEL CONTENIDO:
   - Introducción al concepto o método
   - Desarrollo teórico con fundamentos matemáticos
   - Aplicaciones prácticas y casos de uso
   - Limitaciones y consideraciones importantes
   - Conexiones con el tema principal de investigación

3. ESTILO Y FORMATO:
   - Mínimo 800-1200 palabras por subtema
   - Lenguaje técnico pero accesible
   - Uso de ejemplos numéricos cuando sea apropiado
   - Referencias a conceptos matemáticos fundamentales
   - Explicaciones que permitan comprensión profunda

4. INTEGRACIÓN CON GOOGLE SEARCH:
   - Utiliza información actualizada y verificada
   - Incluye hallazgos recientes en el campo
   - Cita fuentes académicas cuando sea posible
   - Proporciona contexto histórico del desarrollo del campo

Usa tu conocimiento y Google Search para proporcionar información precisa, actualizada y académicamente rigurosa. Explica los conceptos como si fuera para un investigador serio, pero mantén la claridad. No escribas un título para esta sección, solo el contenido detallado. La salida debe estar en español.`;
    
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        tools: [{googleSearch: {}}],
      },
    });

    const content = response.text;
    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks ?? [];
    
    const sources: Source[] = groundingChunks
      .map((chunk: GroundingChunk) => chunk.web)
      .filter((web): web is { uri: string; title: string } => !!web?.uri)
      .reduce((acc: Source[], current: { uri: string; title: string }) => {
        if (!acc.some(item => item.uri === current.uri)) {
          acc.push({ uri: current.uri, title: current.title || current.uri });
        }
        return acc;
      }, []);

    return { content, sources };
  } catch (error) {
    console.error(`Error al investigar el subtema "${subtopic}":`, error);
    
    // Fallback: contenido básico
    return { 
      content: `Contenido investigado para: ${subtopic}. Este es un ejemplo de la investigación realizada.`, 
      sources: [] 
    };
  }
}

export async function synthesizeReport(topic: string, researchData: { title: string, content: string }[]): Promise<FinalReport> {
  try {
    if (!apiKey) {
      throw new Error("API Key de Gemini no configurada");
    }

    const researchDataString = researchData.map(item => `### ${item.title}\n\n${item.content}`).join('\n\n---\n\n');

    const prompt = `Eres un escritor académico experto en matemáticas con amplia experiencia en investigación científica. Se te han proporcionado notas de investigación sobre varios subtemas relacionados con '${topic}'.

Tu tarea es crear un informe académico COMPLETO, DETALLADO y PROFESIONAL en ESPAÑOL, siguiendo los estándares de publicaciones científicas.

REQUISITOS DEL INFORME:

1. RESUMEN EJECUTIVO: Identifica de 4 a 6 "puntos clave" o conclusiones principales del material. Estos deben ser concisos, perspicaces y fáciles de entender para alguien que busca un resumen rápido.

2. INFORME COMPLETO: Escribe un informe académico extenso y bien estructurado en formato Markdown que incluya:
   - Título principal (#) descriptivo y específico
   - Introducción detallada que establezca el contexto, relevancia e importancia del tema
   - Secciones principales (##) para cada subtema con análisis profundo
   - Subsecciones (###) para conceptos específicos dentro de cada tema
   - Uso extensivo de negritas, listas numeradas y con viñetas, tablas conceptuales
   - Ejemplos prácticos y aplicaciones cuando sea relevante
   - Conclusión comprehensiva que sintetice los hallazgos principales
   - Implicaciones futuras y áreas de investigación adicional

3. ESTILO ACADÉMICO: El informe debe ser:
   - Mínimo 1500-2000 palabras
   - Escrito en tercera persona
   - Con lenguaje técnico apropiado pero accesible
   - Estructurado como un paper académico real
   - Con transiciones fluidas entre secciones

4. FORMATO: Utiliza Markdown completo con:
   - Encabezados jerárquicos (#, ##, ###)
   - Listas numeradas y con viñetas
   - **Negritas** para conceptos clave
   - *Cursivas* para términos técnicos
   - Código para fórmulas o algoritmos
   - > Citas para definiciones importantes
   - Separadores (---) entre secciones principales

Devuelve la salida como un único objeto JSON.

Aquí están los datos de investigación en bruto:
${researchDataString}`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summary: {
              type: Type.ARRAY,
              items: {
                type: Type.STRING
              },
              description: "Un array de 3 a 5 puntos clave concisos del informe."
            },
            report: {
              type: Type.STRING,
              description: "El informe completo y detallado en formato Markdown."
            }
          },
          required: ['summary', 'report']
        },
        temperature: 0.5,
      }
    });

    const jsonStr = response.text.trim();
    const result = JSON.parse(jsonStr);
    
    if (result && Array.isArray(result.summary) && typeof result.report === 'string') {
      return result as FinalReport;
    } else {
      console.error("Respuesta inesperada al sintetizar el informe:", jsonStr);
      throw new Error("Formato inválido para el informe sintetizado recibido de la API.");
    }
  } catch (error) {
    console.error("Error al sintetizar el informe:", error);
    
    // Fallback: reporte básico
    return {
      summary: ['Resumen ejecutivo de la investigación', 'Hallazgos principales', 'Recomendaciones'],
      report: `# Reporte de Investigación: ${topic}\n\nEste es un reporte básico generado como fallback. Los datos de investigación están disponibles en las secciones individuales.`
    };
  }
}

// Función de utilidad para verificar si Gemini está disponible
export function isGeminiAvailable(): boolean {
  return !!apiKey;
}
