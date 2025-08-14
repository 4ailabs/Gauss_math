import { GoogleGenAI, Type, Chat, GenerateContentResponse } from "@google/genai";
import { ProcessedData, ChatMessage } from '../types';

// Función para verificar la configuración de la API
const checkApiConfiguration = () => {
    // Prioridad: VITE_GEMINI_API_KEY (desarrollo local) -> GEMINI_API_KEY (producción Vercel)
    let apiKey = import.meta.env.VITE_GEMINI_API_KEY || import.meta.env.GEMINI_API_KEY;
    
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
    console.log("Entorno:", import.meta.env.MODE);
    console.log("VITE_GEMINI_API_KEY:", import.meta.env.VITE_GEMINI_API_KEY ? "Sí" : "No");
    console.log("GEMINI_API_KEY:", import.meta.env.GEMINI_API_KEY ? "Sí" : "No");
    
    if (!apiKey) {
        throw new Error("API Key no configurada. Verifica que VITE_GEMINI_API_KEY (desarrollo) o GEMINI_API_KEY (producción) esté definida.");
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
    // Prioridad: VITE_GEMINI_API_KEY (desarrollo local) -> GEMINI_API_KEY (producción Vercel)
    let apiKey = import.meta.env.VITE_GEMINI_API_KEY || import.meta.env.GEMINI_API_KEY;
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
    try {
        console.log('Iniciando procesamiento de notas...');
        console.log('Notas recibidas:', notes.substring(0, 100) + '...');
        console.log('Materia:', subject);
        
        // Verificar API key
        const apiKey = getApiKey();
        if (!apiKey) {
            throw new Error('API Key no configurada');
        }
        
        console.log('API Key encontrada, procediendo con Gemini...');
        
        // Prompt simplificado para procesamiento
        const prompt = `
        Analiza los siguientes apuntes de matemáticas y genera:
        
        1. Un resumen conciso (2-3 párrafos)
        2. Los conceptos clave con definiciones
        3. 3 preguntas de quiz para evaluar comprensión
        4. 2 problemas de práctica relacionados
        
        APUNTES:
        ${notes}
        
        MATERIA: ${subject}
        
        Responde en formato JSON válido según el esquema especificado.
        `;
        
        console.log('Enviando prompt a Gemini...');
        
        const result = await ai.models.generateContent({
            model: model,
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: processNotesSchema,
                temperature: 0.2,
            }
        });
        
        const text = result.text;
        
        console.log('Respuesta recibida de Gemini:', text.substring(0, 200) + '...');
        
        // Parsear la respuesta JSON
        let data;
        try {
            data = JSON.parse(text);
        } catch (parseError) {
            console.error('Error parseando JSON:', parseError);
            // Crear respuesta de fallback
            data = {
                summary: `Resumen de los apuntes sobre ${subject}: ${notes.substring(0, 200)}...`,
                keyConcepts: [
                    {
                        concept: "Concepto Principal",
                        definition: "Definición basada en el contenido de los apuntes"
                    }
                ],
                quizQuestions: [
                    {
                        question: "¿Cuál es el tema principal de estos apuntes?",
                        answer: "El tema principal se relaciona con " + subject,
                        type: "definition"
                    }
                ],
                relatedProblems: [
                    {
                        problem: "Problema de práctica basado en los conceptos",
                        solution: "Solución que aplica los conceptos aprendidos"
                    }
                ]
            };
        }
        
        console.log('Datos procesados exitosamente:', data);
        return data;
        
    } catch (error) {
        console.error('Error en processNotes:', error);
        throw new Error(`Error procesando notas: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
}

export const extractTextFromImage = async (base64Image: string, mimeType: string = 'image/jpeg'): Promise<string> => {
    const prompt = `Extrae todo el texto de esta imagen, que contiene apuntes de matemáticas. Conserva el formato LaTeX tal como está (ej. \\( ... \\) o \\[ ... \\]). Devuelve únicamente el texto extraído. Si hay fórmulas matemáticas, asegúrate de preservar la sintaxis LaTeX correctamente.`;
    
    const imagePart = {
      inlineData: {
        mimeType: mimeType,
        data: base64Image,
      },
    };
    
    try {
        if (!import.meta.env.VITE_GEMINI_API_KEY) throw new Error("API Key no configurada.");
        
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
            
            // Usar generateContentStream para streaming real
            console.log("Llamando a generateContentStream...");
            
            const systemInstruction = `Eres una IA experta en "${subject}". Tu propósito es ayudar a los estudiantes a entender conceptos complejos, resolver dudas, y ser más eficientes en su estudio. Puedes responder preguntas generales sobre la materia, ayudar a formular ideas para tomar apuntes, y ofrecer ejemplos prácticos. Sé proactivo, amigable, y pedagógico en tus respuestas. Fomenta el pensamiento crítico haciendo preguntas de seguimiento.`;
            
            try {
                const response = await ai.models.generateContentStream({
                    model: model,
                    contents: `${systemInstruction}\n\nPregunta del estudiante: ${newQuestion}`,
                    config: {
                        temperature: 0.6
                    }
                });
                
                console.log("Stream generado:", !!response);
                responseStream = response;
                
            } catch (streamError) {
                console.log("Error con streaming, intentando sin stream:", streamError);
                
                // Fallback a respuesta sin stream si el streaming falla
                const response = await ai.models.generateContent({
                    model: model,
                    contents: `${systemInstruction}\n\nPregunta del estudiante: ${newQuestion}`,
                    config: {
                        temperature: 0.6
                    }
                });
                
                console.log("Respuesta sin stream generada:", !!response);
                
                // Extraer el texto de la respuesta
                let text = '';
                if (response && response.text) {
                    text = response.text;
                } else if (response && response.candidates && response.candidates[0]) {
                    const candidate = response.candidates[0];
                    if (candidate.content && candidate.content.parts && candidate.content.parts[0]) {
                        text = candidate.content.parts[0].text || '';
                    }
                }
                
                console.log("Texto extraído de la respuesta:", text);
                
                // Simular stream con la respuesta completa
                const words = text.split(' ');
                const stream = {
                    async *[Symbol.asyncIterator]() {
                        for (const word of words) {
                            yield word + ' ';
                            await new Promise(resolve => setTimeout(resolve, 30));
                        }
                    }
                };
                
                console.log("Stream simulado creado como fallback");
                responseStream = stream;
            }
        }
        
        if (!responseStream) {
            console.error("No se pudo obtener responseStream");
            throw new Error("No se pudo obtener respuesta del asistente.");
        }
        
        console.log("=== ÉXITO getAssistantResponseStream ===");
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
        if (!import.meta.env.VITE_GEMINI_API_KEY) {
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

// Schema para generar quiz estructurado
const generateQuizSchema = {
    type: Type.OBJECT,
    properties: {
        summary: {
            type: Type.STRING,
            description: "Un resumen breve del contenido sobre el cual se generó el quiz."
        },
        keyConcepts: {
            type: Type.ARRAY,
            description: "Los conceptos clave evaluados en el quiz.",
            items: {
                type: Type.OBJECT,
                properties: {
                    concept: { type: Type.STRING, description: "Nombre del concepto." },
                    definition: { type: Type.STRING, description: "Definición del concepto." }
                },
                required: ["concept", "definition"]
            }
        },
        quizQuestions: {
            type: Type.ARRAY,
            description: "Preguntas del quiz con opciones múltiples.",
            items: {
                type: Type.OBJECT,
                properties: {
                    question: { type: Type.STRING, description: "La pregunta del quiz." },
                    answer: { type: Type.STRING, description: "La respuesta correcta con explicación." },
                    type: { type: Type.STRING, enum: ['multiple_choice', 'true_false', 'problem'], description: "Tipo de pregunta." },
                    options: { 
                        type: Type.ARRAY, 
                        description: "Opciones para preguntas de opción múltiple.",
                        items: { type: Type.STRING }
                    },
                    correctOption: { type: Type.STRING, description: "Letra de la opción correcta (A, B, C, D)." }
                },
                required: ["question", "answer", "type"]
            }
        },
        relatedProblems: {
            type: Type.ARRAY,
            description: "Problemas adicionales para práctica.",
            items: {
                type: Type.OBJECT,
                properties: {
                    problem: { type: Type.STRING, description: "Enunciado del problema." },
                    solution: { type: Type.STRING, description: "Solución detallada." }
                },
                required: ["problem", "solution"]
            }
        }
    },
    required: ["summary", "keyConcepts", "quizQuestions", "relatedProblems"]
};

export const generateQuiz = async (notes: string, subject: string): Promise<ProcessedData> => {
    const prompt = `Eres un experto en educación matemática. Basándote en los siguientes apuntes de "${subject}", genera un quiz completo para evaluar la comprensión del estudiante.

    Instrucciones:
    1. Crea un resumen del contenido principal
    2. Identifica los conceptos clave que se evaluarán
    3. Genera 5 preguntas de quiz variadas (opción múltiple, verdadero/falso, problemas)
    4. Incluye 2-3 problemas adicionales para práctica
    5. Asegúrate de que las preguntas sean claras y apropiadas para el nivel

    Apuntes: ${notes}

    Genera una respuesta estructurada que incluya resumen, conceptos clave, preguntas de quiz y problemas de práctica.`;

    try {
        const response: GenerateContentResponse = await ai.models.generateContent({
            model: model,
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                temperature: 0.3,
            }
        });

        if (!response.text) {
            throw new Error("No se pudo generar el quiz.");
        }

        let parsedResponse;
        try {
            parsedResponse = JSON.parse(response.text);
        } catch (parseError) {
            console.error("Error parsing quiz response:", parseError);
            throw new Error("Formato de respuesta inválido del quiz.");
        }

        // Validar y estructurar la respuesta
        const processedData: ProcessedData = {
            summary: parsedResponse.summary || "Quiz generado basado en los apuntes proporcionados.",
            keyConcepts: parsedResponse.keyConcepts || [],
            quizQuestions: parsedResponse.quizQuestions || [],
            relatedProblems: parsedResponse.relatedProblems || []
        };

        return processedData;

    } catch (error: any) {
        console.error("Error generating quiz:", error);
        throw new Error("No se pudo generar el quiz. Inténtalo de nuevo.");
    }
};

export const findProblems = async (notes: string, subject: string): Promise<ProcessedData> => {
    const prompt = `Eres un experto en matemáticas y educación. Basándote en los siguientes apuntes de "${subject}", identifica y genera problemas matemáticos relacionados.

    Instrucciones:
    1. Analiza los conceptos y temas de los apuntes
    2. Identifica los tipos de problemas que se pueden generar
    3. Crea problemas variados (básicos, intermedios, avanzados)
    4. Proporciona soluciones detalladas paso a paso
    5. Incluye problemas que refuercen los conceptos principales

    Apuntes: ${notes}

    Genera una respuesta estructurada que incluya resumen, conceptos clave, preguntas de práctica y problemas relacionados.`;

    try {
        const response: GenerateContentResponse = await ai.models.generateContent({
            model: model,
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                temperature: 0.3,
            }
        });

        if (!response.text) {
            throw new Error("No se pudieron encontrar problemas.");
        }

        let parsedResponse;
        try {
            parsedResponse = JSON.parse(response.text);
        } catch (parseError) {
            console.error("Error parsing problems response:", parseError);
            throw new Error("Formato de respuesta inválido.");
        }

        // Validar y estructurar la respuesta
        const processedData: ProcessedData = {
            summary: parsedResponse.summary || "Problemas identificados basados en los apuntes proporcionados.",
            keyConcepts: parsedResponse.keyConcepts || [],
            quizQuestions: parsedResponse.quizQuestions || [],
            relatedProblems: parsedResponse.relatedProblems || []
        };

        return processedData;

    } catch (error: any) {
        console.error("Error finding problems:", error);
        throw new Error("No se pudieron encontrar problemas. Inténtalo de nuevo.");
    }
};