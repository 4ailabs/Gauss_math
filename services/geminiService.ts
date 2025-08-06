import { GoogleGenAI, Type, Chat, GenerateContentResponse } from "@google/genai";
import { ProcessedData, ChatMessage } from '../types';

// The app will now handle API key errors gracefully in the UI.
if (!process.env.GEMINI_API_KEY) {
  console.error("La variable de entorno GEMINI_API_KEY no está configurada.");
}

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
const model = "gemini-2.5-flash";

const processNotesSchema = {
    type: Type.OBJECT,
    properties: {
        summary: {
            type: Type.STRING,
            description: "Un resumen conciso (2-3 párrafos) de los apuntes matemáticos proporcionados, explicando los temas principales y sus conexiones."
        },
        keyConcepts: {
            type: Type.ARRAY,
            description: "Una lista de los conceptos, teoremas o definiciones más importantes de los apuntes.",
            items: {
                type: Type.OBJECT,
                properties: {
                    concept: { type: Type.STRING, description: "El nombre del concepto matemático, teorema o término (p. ej., 'Teorema Fundamental del Cálculo')." },
                    definition: { type: Type.STRING, description: "Una definición o explicación clara y precisa del concepto." }
                },
                required: ["concept", "definition"]
            }
        },
        quizQuestions: {
            type: Type.ARRAY,
            description: "Una lista de preguntas para evaluar la comprensión del material. Incluye una mezcla de tipos.",
            items: {
                type: Type.OBJECT,
                properties: {
                    question: { type: Type.STRING, description: "La pregunta del cuestionario." },
                    answer: { type: Type.STRING, description: "La respuesta correcta a la pregunta. Para problemas, muestra los pasos principales o el resultado final." },
                    type: { type: Type.STRING, enum: ['definition', 'problem', 'theorem'], description: "El tipo de pregunta." }
                },
                required: ["question", "answer", "type"]
            }
        },
        relatedProblems: {
            type: Type.ARRAY,
            description: "Una lista de 2-3 problemas de práctica adicionales, similares pero no idénticos a los de los apuntes, para reforzar el aprendizaje.",
            items: {
                type: Type.OBJECT,
                properties: {
                    problem: { type: Type.STRING, description: "El enunciado del problema de práctica." },
                    solution: { type: Type.STRING, description: "La solución detallada al problema de práctica."}
                },
                required: ["problem", "solution"]
            }
        }
    },
    required: ["summary", "keyConcepts", "quizQuestions", "relatedProblems"]
};

export const processNotes = async (notes: string, subject: string): Promise<ProcessedData> => {
    const prompt = `Eres un asistente experto de IA para estudiantes de la materia "${subject}". Analiza los siguientes apuntes, que pueden incluir texto y fórmulas LaTeX. Tu tarea es estructurar esta información para un estudio efectivo.
    
    Apuntes:
    ---
    ${notes}
    ---
    
    Por favor, procesa estos apuntes y proporciona una salida JSON estructurada que contenga:
    1.  Un resumen conciso enfocado en la relevancia para la materia.
    2.  Una lista de conceptos clave, teoremas y definiciones.
    3.  Un conjunto de preguntas de cuestionario para ayudar al estudiante a probar su conocimiento sobre el tema.
    4.  Una lista de 2-3 problemas de práctica adicionales para reforzar el aprendizaje, con sus soluciones detalladas.
    `;

    try {
        if (!process.env.GEMINI_API_KEY) throw new Error("API Key no configurada.");
        const response: GenerateContentResponse = await ai.models.generateContent({
            model: model,
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: processNotesSchema,
                temperature: 0.2,
            }
        });

        const jsonString = response.text;
        if (!jsonString) {
            throw new Error("La API devolvió una respuesta vacía.");
        }

        const parsedJson = JSON.parse(jsonString);
        return parsedJson as ProcessedData;

    } catch (error) {
        console.error("Error processing notes with Gemini:", error);
        throw new Error("No se pudieron procesar los apuntes. La API podría haber devuelto un formato no válido o haber ocurrido un error.");
    }
};

export const extractTextFromImage = async (base64Image: string, mimeType: string = 'image/jpeg'): Promise<string> => {
    const prompt = `Extrae todo el texto de esta imagen, que contiene apuntes de matemáticas. Conserva el formato LaTeX tal como está (ej. \\( ... \\) o \\[ ... \\]). Devuelve únicamente el texto extraído. Si hay fórmulas matemáticas, asegúrate de preservar la sintaxis LaTeX correctamente.`;
    
    const imagePart = {
      inlineData: {
        mimeType: mimeType,
        data: base64Image,
      },
    };
    
    try {
        if (!process.env.GEMINI_API_KEY) throw new Error("API Key no configurada.");
        
        // Validar que la imagen no esté vacía
        if (!base64Image || base64Image.length < 100) {
            throw new Error("La imagen parece estar vacía o ser muy pequeña.");
        }
        
        const response: GenerateContentResponse = await ai.models.generateContent({
            model: model,
            contents: { parts: [imagePart, { text: prompt }] },
            config: {
                temperature: 0.1, // Baja temperatura para mayor precisión en extracción
            }
        });
        
        if (!response.text || response.text.trim().length === 0) {
            throw new Error("No se pudo extraer texto de la imagen. Asegúrate de que la imagen contenga texto legible.");
        }
        
        return response.text.trim();
    } catch(error: any) {
        console.error("Error extracting text from image:", error);
        
        // Manejo específico de errores
        if (error.message?.includes('API Key')) {
            throw new Error("Error de configuración: API Key no válida.");
        } else if (error.message?.includes('quota')) {
            throw new Error("Se ha excedido la cuota de la API. Inténtalo más tarde.");
        } else if (error.message?.includes('invalid')) {
            throw new Error("Formato de imagen no válido. Usa JPG, PNG o WebP.");
        } else {
            throw new Error("No se pudo extraer texto de la imagen. Verifica que la imagen sea clara y contenga texto legible.");
        }
    }
};


let assistantChatInstance: Chat | null = null;

const initializeAssistantChat = (subject: string): Chat => {
    try {
        if (!process.env.GEMINI_API_KEY) {
            throw new Error("API Key no configurada.");
        }
        
        const systemInstruction = `Eres una IA experta en "${subject}". Tu propósito es ayudar a los estudiantes a entender conceptos complejos, resolver dudas, y ser más eficientes en su estudio. Puedes responder preguntas generales sobre la materia, ayudar a formular ideas para tomar apuntes, y ofrecer ejemplos prácticos. Sé proactivo, amigable, y pedagógico en tus respuestas. Fomenta el pensamiento crítico haciendo preguntas de seguimiento.`;

        assistantChatInstance = ai.chats.create({
            model: model,
            config: {
                systemInstruction: systemInstruction,
                temperature: 0.6
            },
        });
        
        if (!assistantChatInstance) {
            throw new Error("No se pudo inicializar el chat.");
        }
        
        return assistantChatInstance;
    } catch (error) {
        console.error("Error initializing assistant chat:", error);
        throw error;
    }
};


export const getAssistantResponseStream = async (newQuestion: string, subject: string) => {
    if (!assistantChatInstance) {
        assistantChatInstance = initializeAssistantChat(subject);
    }

    try {
        if (!process.env.GEMINI_API_KEY) throw new Error("API Key no configurada.");
        
        const responseStream = await assistantChatInstance.sendMessageStream({ message: newQuestion });
        
        if (!responseStream) {
            throw new Error("No se pudo obtener respuesta del asistente.");
        }
        
        return responseStream;
    } catch (error: any) {
        console.error("Error getting assistant response:", error);
        
        // Manejo específico de errores
        if (error.message?.includes('API Key')) {
            throw new Error("Error de configuración: API Key no válida.");
        } else if (error.message?.includes('quota') || error.message?.includes('rate limit')) {
            throw new Error("Se ha excedido la cuota de la API. Inténtalo más tarde.");
        } else if (error.message?.includes('network') || error.message?.includes('fetch')) {
            throw new Error("Error de conexión. Verifica tu conexión a internet.");
        } else if (error.message?.includes('invalid')) {
            throw new Error("Solicitud inválida. Verifica tu pregunta.");
        } else {
            throw new Error("Lo siento, encontré un error. Por favor, inténtalo de nuevo.");
        }
    }
};

export const resetAssistantChat = (subject: string) => {
    assistantChatInstance = initializeAssistantChat(subject);
};