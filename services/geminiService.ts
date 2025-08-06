import { GoogleGenAI, Type, Chat, GenerateContentResponse } from "@google/genai";
import { ProcessedData, ChatMessage } from '../types';

// Función para verificar la configuración de la API
const checkApiConfiguration = () => {
    let apiKey = process.env.GEMINI_API_KEY;
    
    // Fallback para debugging temporal
    if (!apiKey && typeof window !== 'undefined') {
        apiKey = window.localStorage.getItem('temp_api_key');
        if (apiKey) {
            console.log("Usando API key temporal de localStorage");
        }
    }
    
    console.log("API Key configurada:", apiKey ? "Sí" : "No");
    console.log("API Key length:", apiKey ? apiKey.length : 0);
    console.log("API Key preview:", apiKey ? `${apiKey.substring(0, 10)}...` : "No disponible");
    
    if (!apiKey) {
        throw new Error("API Key no configurada. Verifica que GEMINI_API_KEY esté definida en las variables de entorno.");
    }
    
    if (apiKey.length < 20) {
        throw new Error("API Key parece ser muy corta. Verifica que sea válida.");
    }
    
    return apiKey;
};

// The app will now handle API key errors gracefully in the UI.
try {
    checkApiConfiguration();
} catch (error) {
    console.error("Error en configuración de API:", error);
}

// Función para obtener la API key con fallback
const getApiKey = () => {
    let apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey && typeof window !== 'undefined') {
        apiKey = window.localStorage.getItem('temp_api_key');
    }
    return apiKey || "";
};

const ai = new GoogleGenAI({ apiKey: getApiKey() });
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
        // Verificar configuración de API
        const apiKey = checkApiConfiguration();
        console.log("Procesando apuntes para materia:", subject);
        console.log("Longitud de apuntes:", notes.length);
        
        if (!notes || notes.trim().length === 0) {
            throw new Error("Los apuntes no pueden estar vacíos.");
        }
        
        if (notes.length > 20000) {
            throw new Error("Los apuntes son demasiado largos. Máximo 20,000 caracteres.");
        }

        console.log("Enviando solicitud a Gemini API...");
        const response: GenerateContentResponse = await ai.models.generateContent({
            model: model,
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: processNotesSchema,
                temperature: 0.2,
            }
        });

        console.log("Respuesta recibida de Gemini API");
        const jsonString = response.text;
        if (!jsonString) {
            throw new Error("La API devolvió una respuesta vacía.");
        }

        console.log("Parseando respuesta JSON...");
        let parsedJson;
        try {
            parsedJson = JSON.parse(jsonString);
        } catch (parseError) {
            console.error("Error parsing JSON response:", parseError);
            console.error("JSON string recibido:", jsonString);
            throw new Error("La API devolvió un formato JSON inválido.");
        }

        // Validar que la respuesta tenga la estructura esperada
        if (!parsedJson.summary || !parsedJson.keyConcepts || !parsedJson.quizQuestions || !parsedJson.relatedProblems) {
            console.error("Estructura de respuesta inválida:", parsedJson);
            throw new Error("La respuesta de la API no tiene la estructura esperada.");
        }

        console.log("Procesamiento completado exitosamente");
        return parsedJson as ProcessedData;

    } catch (error: any) {
        console.error("Error processing notes with Gemini:", error);
        
        // Manejo específico de errores
        if (error.message?.includes('API Key')) {
            throw new Error("Error de configuración: API Key no válida. Verifica tu configuración.");
        } else if (error.message?.includes('quota') || error.message?.includes('rate limit')) {
            throw new Error("Se ha excedido la cuota de la API. Inténtalo más tarde.");
        } else if (error.message?.includes('network') || error.message?.includes('fetch')) {
            throw new Error("Error de conexión. Verifica tu conexión a internet.");
        } else if (error.message?.includes('JSON')) {
            throw new Error("Error en el formato de respuesta. Inténtalo de nuevo.");
        } else if (error.message?.includes('estructura')) {
            throw new Error("La respuesta no tiene el formato esperado. Inténtalo de nuevo.");
        } else if (error.message?.includes('vacío')) {
            throw new Error("Los apuntes no pueden estar vacíos.");
        } else if (error.message?.includes('largo')) {
            throw new Error("Los apuntes son demasiado largos. Reduce el contenido.");
        } else {
            throw new Error("No se pudieron procesar los apuntes. Verifica tu conexión e inténtalo de nuevo.");
        }
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
        const apiKey = getApiKey();
        if (!apiKey) {
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


export const getAssistantResponseStream = async (newQuestion: string, subject: string, imageData?: string | null) => {
    console.log("=== INICIO getAssistantResponseStream ===");
    console.log("Parámetros:", { newQuestion, subject, hasImage: !!imageData });
    
    try {
        console.log("Verificando assistantChatInstance...");
        if (!assistantChatInstance) {
            console.log("assistantChatInstance es null, inicializando...");
            assistantChatInstance = initializeAssistantChat(subject);
            console.log("assistantChatInstance inicializado:", !!assistantChatInstance);
        }

        console.log("Verificando API key...");
        const apiKey = getApiKey();
        if (!apiKey) {
            console.error("API Key no encontrada");
            throw new Error("API Key no configurada.");
        }
        console.log("API Key encontrada, longitud:", apiKey.length);
        
        console.log("Enviando pregunta al asistente:", { newQuestion, subject, hasImage: !!imageData });
        
        let responseStream;
        
        if (imageData) {
            console.log("Procesando con imagen...");
            // Si hay imagen, extraer el base64 y mime type
            const base64Match = imageData.match(/^data:([^;]+);base64,(.+)$/);
            if (!base64Match) {
                console.error("Formato de imagen inválido");
                throw new Error("Formato de imagen inválido.");
            }
            
            const mimeType = base64Match[1];
            const base64Image = base64Match[2];
            
            console.log("Imagen procesada, mimeType:", mimeType);
            
            // Crear parte de imagen
            const imagePart = {
                inlineData: {
                    mimeType: mimeType,
                    data: base64Image,
                },
            };
            
            console.log("Procesando pregunta con imagen...");
            
            // Enviar mensaje con imagen usando generateContent directamente
            const response = await ai.models.generateContent({
                model: model,
                contents: [
                    {
                        role: 'user',
                        parts: [
                            { text: newQuestion },
                            imagePart
                        ]
                    }
                ],
                config: {
                    temperature: 0.6
                }
            });
            
            console.log("Respuesta con imagen recibida");
            
            // Simular stream con la respuesta completa
            const text = response.text || '';
            const chunks = text.split(' ');
            const stream = {
                async *[Symbol.asyncIterator]() {
                    for (const chunk of chunks) {
                        yield chunk + ' ';
                        await new Promise(resolve => setTimeout(resolve, 50));
                    }
                }
            };
            
            console.log("=== ÉXITO getAssistantResponseStream (con imagen) ===");
            return stream;
        } else {
            console.log("Procesando pregunta sin imagen...");
            // Enviar mensaje sin imagen
            console.log("Llamando a sendMessageStream...");
            responseStream = await assistantChatInstance.sendMessageStream({ message: newQuestion });
            console.log("Stream sin imagen creado:", !!responseStream);
            
            // Verificar que el stream sea válido
            if (!responseStream || typeof responseStream[Symbol.asyncIterator] !== 'function') {
                console.error("Stream inválido recibido:", responseStream);
                throw new Error("Stream de respuesta inválido");
            }
        }
        
        if (!responseStream) {
            console.error("No se pudo obtener responseStream");
            throw new Error("No se pudo obtener respuesta del asistente.");
        }
        
        console.log("=== ÉXITO getAssistantResponseStream (sin imagen) ===");
        return responseStream;
    } catch (error: any) {
        console.error("=== ERROR en getAssistantResponseStream ===");
        console.error("Error getting assistant response:", error);
        console.error("Error message:", error.message);
        console.error("Error name:", error.name);
        console.error("Error stack:", error.stack);
        
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
            throw new Error(`Error del asistente: ${error.message || 'Error desconocido'}`);
        }
    }
};

export const resetAssistantChat = (subject: string) => {
    assistantChatInstance = initializeAssistantChat(subject);
};

export const generateQuizFromContent = async (content: string, subject: string): Promise<any> => {
    try {
        if (!process.env.GEMINI_API_KEY) {
            throw new Error("API Key no configurada.");
        }

        const quizPrompt = `Basándote en este contenido sobre "${subject}", genera un quiz de 5 preguntas para evaluar la comprensión. 

        Formato JSON requerido:
        {
          "questions": [
            {
              "question": "Pregunta aquí",
              "options": ["A) Opción 1", "B) Opción 2", "C) Opción 3", "D) Opción 4"],
              "correctAnswer": "A",
              "explanation": "Explicación de por qué es correcta"
            }
          ]
        }

        Las preguntas deben ser de comprensión, aplicación y análisis. Incluye solo el JSON, sin texto adicional.

        Contenido: ${content}`;

        const response: GenerateContentResponse = await ai.models.generateContent({
            model: model,
            contents: quizPrompt,
            config: {
                responseMimeType: "application/json",
                temperature: 0.3,
            }
        });

        if (!response.text) {
            throw new Error("No se pudo generar el quiz.");
        }

        // Parsear la respuesta JSON
        let parsedResponse;
        try {
            parsedResponse = JSON.parse(response.text);
        } catch (parseError) {
            console.error("Error parsing quiz response:", parseError);
            console.error("Response text:", response.text);
            throw new Error("Formato de respuesta inválido del quiz.");
        }

        // Validar estructura
        if (!parsedResponse.questions || !Array.isArray(parsedResponse.questions)) {
            throw new Error("Estructura de quiz inválida.");
        }

        return parsedResponse;

    } catch (error: any) {
        console.error("Error generating quiz:", error);
        
        if (error.message?.includes('API Key')) {
            throw new Error("Error de configuración: API Key no válida.");
        } else if (error.message?.includes('quota')) {
            throw new Error("Se ha excedido la cuota de la API. Inténtalo más tarde.");
        } else if (error.message?.includes('network')) {
            throw new Error("Error de conexión. Verifica tu conexión a internet.");
        } else {
            throw new Error("No se pudo generar el quiz. Inténtalo de nuevo.");
        }
    }
};