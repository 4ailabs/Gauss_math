import React, { useState, useCallback, useEffect, useRef } from 'react';
import { ProcessedData, ChatMessage } from './types';
import { processNotes, getAssistantResponseStream, resetAssistantChat, extractTextFromImage } from './services/geminiService';
import { 
  BrainCircuitIcon, 
  BookOpenIcon, 
  MessageCircleIcon, 
  LoaderCircleIcon, 
  MicIcon, 
  CameraIcon, 
  SendIcon, 
  HashIcon, 
  RefreshCwIcon, 
  DownloadIcon,
  SparklesIcon,
  CalculatorIcon,
  LightbulbIcon,
  TargetIcon,
  CheckCircleIcon,
  AlertCircleIcon,
  ZapIcon,
  FileTextIcon,
  CopyIcon
} from './components/ui/Icons';

declare global {
  interface Window {
    renderMathInElement: (element: HTMLElement, options?: any) => void;
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

// Helper component for styled textareas
const StyledTextarea = React.forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement>>((props, ref) => (
  <textarea
    ref={ref}
    {...props}
    className="w-full h-full bg-transparent border-none outline-none resize-none text-white placeholder-slate-400 p-4 text-sm sm:text-base leading-relaxed"
  />
));

const TabButton: React.FC<{onClick: () => void; active: boolean; children: React.ReactNode; icon: React.ReactNode}> = ({ onClick, active, children, icon }) => (
    <button
      onClick={onClick}
      className={`flex-1 flex flex-col items-center gap-1 py-2 sm:py-3 px-1 text-xs sm:text-sm font-medium transition-colors ${
        active ? 'text-blue-400 border-b-2 border-blue-400' : 'text-slate-400 hover:text-white'
      }`}
    >
      {icon}
      {children}
    </button>
  );

// Main App Component
const App: React.FC = () => {
  const [notes, setNotes] = useState<string>('');
  const [processedData, setProcessedData] = useState<ProcessedData | null>(null);
  const [assistantHistory, setAssistantHistory] = useState<ChatMessage[]>([]);
  const [assistantInput, setAssistantInput] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isAssistantLoading, setIsAssistantLoading] = useState<boolean>(false);
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [isSpeechSupported, setIsSpeechSupported] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isApiKeyMissing, setIsApiKeyMissing] = useState<boolean>(false);
  const [activeView, setActiveView] = useState<'editor' | 'assistant' | 'summary'>('editor');
  
  const imageInputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<any>(null);
  const notesOnRecordStartRef = useRef<string>('');
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);


  const subjects = [
    "Investigación en Matemáticas Aplicadas y Computación",
    "Administración de Bases de Datos",
    "Elementos de Finanzas e Inversiones"
  ];
  const [selectedSubject, setSelectedSubject] = useState<string>(subjects[0]);

  const initialNotes = `\\section{Optimización: Descenso de Gradiente}

El Descenso de Gradiente es un algoritmo de optimización iterativo de primer orden para encontrar un mínimo local de una función diferenciable. La idea es dar pasos repetidamente en la dirección opuesta al gradiente (o la derivada) de la función en el punto actual, ya que esta es la dirección de descenso más pronunciado.

La regla de actualización principal es:
\\[ \\theta_{n+1} = \\theta_n - \\eta \\nabla J(\\theta_n) \\]
Donde:
- \\(\\theta_n\\) es el valor actual del parámetro.
- \\(\\eta\\) (eta) es la tasa de aprendizaje (learning rate), un escalar positivo que determina el tamaño del paso.
- \\(\\nabla J(\\theta_n)\\) es el gradiente de la función de coste \\(J\\) evaluado en \\(\\theta_n\\).

\\subsection{Ejemplo Simple}
Supongamos que queremos minimizar la función \\(J(\\theta) = \\theta^2\\).
El gradiente es \\(\\nabla J(\\theta) = 2\\theta\\).

Si comenzamos con \\(\\theta_0 = 4\\) y una tasa de aprendizaje \\(\\eta = 0.1\\), los primeros pasos son:
1. \\(\\theta_1 = 4 - 0.1 \\cdot (2 \\cdot 4) = 4 - 0.8 = 3.2\\)
2. \\(\\theta_2 = 3.2 - 0.1 \\cdot (2 \\cdot 3.2) = 3.2 - 0.64 = 2.56\\)
3. \\(\\theta_3 = 2.56 - 0.1 \\cdot (2 \\cdot 2.56) = 2.56 - 0.512 = 2.048\\)

Como podemos ver, el valor de \\(\\theta\\) se acerca iterativamente a 0, que es el mínimo de la función.
`;

  useEffect(() => {
    if (!process.env.API_KEY) {
      setIsApiKeyMissing(true);
      return;
    }
    try {
      const savedNotes = localStorage.getItem('gaussmathmind_notes');
      const savedSubject = localStorage.getItem('gaussmathmind_subject');
      setNotes(savedNotes || initialNotes);
      if (savedSubject && subjects.includes(savedSubject)) {
        setSelectedSubject(savedSubject);
      }
    } catch (e) {
      console.error("Failed to load from localStorage:", e);
      setNotes(initialNotes);
    }
  }, []);
  
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      setIsSpeechSupported(true);
      recognitionRef.current = new SpeechRecognition();
      const recognition = recognitionRef.current;
      recognition.continuous = true;
      recognition.lang = 'es-ES';
      recognition.interimResults = true;

      recognition.onresult = (event: any) => {
        let interimTranscript = '';
        let finalTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript + ' ';
          } else {
            interimTranscript += event.results[i][0].transcript;
          }
        }
        if (finalTranscript) {
          notesOnRecordStartRef.current += finalTranscript;
        }
        setNotes((notesOnRecordStartRef.current + interimTranscript).trim());
      };

      recognition.onend = () => {
        setIsRecording(false);
      };

      recognition.onerror = (event: any) => {
        let errorMessage = `Error de reconocimiento de voz: ${event.error}`;
        if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
          errorMessage = 'Permiso para el micrófono denegado. Por favor, habilítalo en los ajustes de tu navegador.';
        } else if (event.error === 'no-speech') {
          errorMessage = 'No se detectó voz. Intenta hablar más claro.';
        }
        setError(errorMessage);
        setIsRecording(false);
      };
    } else {
      setIsSpeechSupported(false);
    }
    return () => {
      recognitionRef.current?.stop();
    };
  }, []);

  useEffect(() => { try { localStorage.setItem('gaussmathmind_notes', notes); } catch(e) { console.error(e); }}, [notes]);
  useEffect(() => { 
    try { 
      localStorage.setItem('gaussmathmind_subject', selectedSubject); 
      resetAssistantChat(selectedSubject);
      setAssistantHistory([]);
    } catch(e) { console.error(e); } 
  }, [selectedSubject]);

  useEffect(() => {
    if (processedData && window.renderMathInElement) {
        setTimeout(() => {
            const outputElement = document.getElementById('processed-output');
            if (outputElement) {
                window.renderMathInElement(outputElement, {
                    delimiters: [
                        {left: '$$', right: '$$', display: true},
                        {left: '\\[', right: '\\]', display: true},
                        {left: '$', right: '$', display: false},
                        {left: '\\(', right: '\\)', display: false}
                    ]
                });
            }
        }, 100);
    }
  }, [processedData, activeView]);
  
  const handleToggleRecording = () => {
    if (!isSpeechSupported || isLoading || isScanning || isExporting) return;
    if (isRecording) {
      recognitionRef.current?.stop();
    } else {
      notesOnRecordStartRef.current = notes ? notes + ' ' : '';
      recognitionRef.current?.start();
      setIsRecording(true);
      setError(null);
    }
  };

  const handleProcessNotes = useCallback(async () => {
    if (!notes.trim()) {
      setError("Los apuntes no pueden estar vacíos.");
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const data = await processNotes(notes, selectedSubject);
      setProcessedData(data);
      setActiveView('summary');
    } catch (e: any) {
      console.error("Error processing notes:", e);
      setError(e.message || "Ocurrió un error desconocido al procesar los apuntes.");
      setProcessedData(null);
    } finally {
      setIsLoading(false);
    }
  }, [notes, selectedSubject]);
  
    const handleExportToPdf = useCallback(async () => {
    console.log("Iniciando exportación...");
    
    if (!processedData) {
      console.error("No hay datos procesados");
      setError("No hay datos procesados para exportar.");
      return;
    }

    setIsExporting(true);
    setError(null);

    try {
      // Crear contenido formateado
      let content = `GAUSS MATHMIND - APUNTES PROCESADOS\n`;
      content += `Materia: ${selectedSubject}\n`;
      content += `Fecha: ${new Date().toLocaleDateString('es-ES')}\n`;
      content += `\n${'='.repeat(50)}\n\n`;

      // Resumen
      content += `📋 RESUMEN\n`;
      content += `${processedData.summary.replace(/<[^>]*>/g, '')}\n\n`;

      // Conceptos Clave
      content += `🎯 CONCEPTOS CLAVE\n`;
      processedData.keyConcepts.forEach((concept, index) => {
        content += `${index + 1}. ${concept.concept}\n`;
        content += `   ${concept.definition}\n\n`;
      });

      // Preguntas de Quiz
      content += `❓ PREGUNTAS DE QUIZ\n`;
      processedData.quizQuestions.forEach((question, index) => {
        content += `${index + 1}. ${question.question}\n`;
        content += `   Respuesta: ${question.answer}\n\n`;
      });

      // Problemas Relacionados
      content += `🧮 PROBLEMAS RELACIONADOS\n`;
      processedData.relatedProblems.forEach((problem, index) => {
        content += `${index + 1}. ${problem.problem}\n`;
        content += `   Solución: ${problem.solution}\n\n`;
      });

      // Crear y descargar archivo
      const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Gauss_MathMind_Apuntes_${selectedSubject.replace(/[^a-zA-Z0-9]/g, '_')}.txt`;
      
      // Simular clic para descargar
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Limpiar URL
      window.URL.revokeObjectURL(url);
      
      console.log("Archivo descargado exitosamente");
      alert('✅ Archivo descargado exitosamente');
      
    } catch (e) {
      console.error("Error al generar archivo:", e);
      setError(`Error al generar el archivo: ${e.message}. Intenta usar la opción "Copiar" en su lugar.`);
    } finally {
      setIsExporting(false);
    }
  }, [processedData, selectedSubject]);

  const handleCopyToClipboard = useCallback(async () => {
    if (!processedData) {
      setError("No hay datos procesados para copiar.");
      return;
    }

    try {
      // Crear texto formateado para copiar
      let textToCopy = `GAUSS MATHMIND - APUNTES PROCESADOS\n`;
      textToCopy += `Materia: ${selectedSubject}\n`;
      textToCopy += `Fecha: ${new Date().toLocaleDateString('es-ES')}\n`;
      textToCopy += `\n${'='.repeat(50)}\n\n`;

      // Resumen
      textToCopy += `📋 RESUMEN\n`;
      textToCopy += `${processedData.summary.replace(/<[^>]*>/g, '')}\n\n`;

      // Conceptos Clave
      textToCopy += `🎯 CONCEPTOS CLAVE\n`;
      processedData.keyConcepts.forEach((concept, index) => {
        textToCopy += `${index + 1}. ${concept.concept}\n`;
        textToCopy += `   ${concept.definition}\n\n`;
      });

      // Preguntas de Quiz
      textToCopy += `❓ PREGUNTAS DE QUIZ\n`;
      processedData.quizQuestions.forEach((question, index) => {
        textToCopy += `${index + 1}. ${question.question}\n`;
        textToCopy += `   Respuesta: ${question.answer}\n\n`;
      });

      // Problemas Relacionados
      textToCopy += `🧮 PROBLEMAS RELACIONADOS\n`;
      processedData.relatedProblems.forEach((problem, index) => {
        textToCopy += `${index + 1}. ${problem.problem}\n`;
        textToCopy += `   Solución: ${problem.solution}\n\n`;
      });

      // Copiar al portapapeles
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(textToCopy);
      } else {
        // Fallback para navegadores que no soportan clipboard API
        const textArea = document.createElement('textarea');
        textArea.value = textToCopy;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
      }

      // Mostrar mensaje de éxito
      setError(null);
      alert('✅ Contenido copiado al portapapeles exitosamente');
      
    } catch (e) {
      console.error("Error al copiar al portapapeles:", e);
      setError("No se pudo copiar al portapapeles. Intenta seleccionar y copiar manualmente.");
    }
  }, [processedData, selectedSubject]);

  const handleScanClick = () => imageInputRef.current?.click();

  const handleImageSelected = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    // Validaciones del archivo
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      setError("El archivo es demasiado grande. Máximo 10MB.");
      return;
    }
    
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      setError("Formato de imagen no válido. Usa JPG, PNG o WebP.");
      return;
    }
    
    setIsScanning(true);
    setError(null);
    
    const reader = new FileReader();
    reader.readAsDataURL(file);
    
    reader.onload = async () => {
        try {
            const result = reader.result as string;
            const base64String = result.split(',')[1];
            
            if (!base64String) {
                throw new Error("Error al procesar la imagen.");
            }
            
            const extractedText = await extractTextFromImage(base64String, file.type);
            
            if (extractedText.trim()) {
                setNotes(prev => `${prev}\n\n${extractedText}`.trim());
            } else {
                setError("No se encontró texto en la imagen. Asegúrate de que sea clara y legible.");
            }
        } catch(e: any) {
            setError(e.message || "Error al escanear la imagen.");
        } finally {
            setIsScanning(false);
            if(imageInputRef.current) imageInputRef.current.value = "";
        }
    };
    
    reader.onerror = () => {
        setError("Error al leer el archivo de imagen.");
        setIsScanning(false);
    };
  };

  const handleAssistantSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!assistantInput.trim() || isAssistantLoading) return;

    const newQuestion: ChatMessage = { role: 'user', content: assistantInput };
    setAssistantHistory(prev => [...prev, newQuestion]);
    setIsAssistantLoading(true);
    setAssistantInput('');

    try {
      const stream = await getAssistantResponseStream(assistantInput, selectedSubject);
      let fullResponse = "";
      const modelResponse: ChatMessage = { role: 'model', content: "" };
      setAssistantHistory(prev => [...prev, modelResponse]);

      // Usar un debounce para actualizar menos frecuentemente
      let updateTimeout: NodeJS.Timeout;
      
      for await (const chunk of stream) {
          fullResponse += chunk.text;
          
          // Actualizar cada 100ms en lugar de en cada chunk
          clearTimeout(updateTimeout);
          updateTimeout = setTimeout(() => {
              setAssistantHistory(prev => prev.map((msg, index) => 
                index === prev.length - 1 ? { ...msg, content: fullResponse } : msg
              ));
          }, 100);
      }
      
      // Actualización final
      clearTimeout(updateTimeout);
      setAssistantHistory(prev => prev.map((msg, index) => 
        index === prev.length - 1 ? { ...msg, content: fullResponse } : msg
      ));
      
    } catch (e: any) {
      console.error("Error en asistente:", e);
      let errorMessage = "Lo siento, no pude obtener una respuesta. Por favor, inténtalo de nuevo.";
      
      if (e.message?.includes('API Key')) {
        errorMessage = "Error de configuración: API Key no válida. Verifica tu configuración.";
      } else if (e.message?.includes('quota')) {
        errorMessage = "Se ha excedido la cuota de la API. Inténtalo más tarde.";
      } else if (e.message?.includes('network')) {
        errorMessage = "Error de conexión. Verifica tu conexión a internet.";
      }
      
      const errorResponse: ChatMessage = { role: 'model', content: errorMessage };
      setAssistantHistory(prev => [...prev, errorResponse]);
    } finally {
      setIsAssistantLoading(false);
    }
  }, [assistantInput, isAssistantLoading, selectedSubject]);
  
  const handleResetAssistantChat = () => {
      resetAssistantChat(selectedSubject);
      setAssistantHistory([]);
  };

  useEffect(() => {
    // Verificar API key con fallback a localStorage
    const checkApiKey = () => {
      const envApiKey = process.env.GEMINI_API_KEY;
      const localApiKey = typeof window !== 'undefined' ? window.localStorage.getItem('temp_api_key') : null;
      
      console.log("Verificando API key:");
      console.log("- Env API key:", envApiKey ? "Presente" : "Ausente");
      console.log("- Local API key:", localApiKey ? "Presente" : "Ausente");
      
      if (envApiKey || localApiKey) {
        setIsApiKeyMissing(false);
        return;
      }
      
      setIsApiKeyMissing(true);
    };

    checkApiKey();
  }, []);

  // Scroll automático para el chat
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [assistantHistory]);

  // Efecto para inicializar el asistente cuando cambia la materia

  if (isApiKeyMissing) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-200 flex items-center justify-center p-4">
        <div className="max-w-md text-center bg-slate-900 p-8 rounded-lg shadow-lg">
          <h1 className="text-3xl font-bold text-red-500 mb-4">Error de Configuración</h1>
          <p className="text-slate-300 mb-6">
            La variable de entorno <code>GEMINI_API_KEY</code> no está configurada. Por favor, asegúrate de que tu API Key de Google AI está disponible para que la aplicación funcione.
          </p>
          
          {/* Debugging temporal */}
          <div className="mt-6 p-4 bg-slate-800 rounded-lg">
            <h3 className="text-lg font-semibold text-blue-400 mb-2">Configuración Temporal</h3>
            <p className="text-sm text-slate-400 mb-3">
              Pega tu API key de Google AI Studio aquí para probar la aplicación:
            </p>
            <input
              type="password"
              id="temp-api-key"
              placeholder="AIzaSyC... (tu API key aquí)"
              className="w-full p-3 bg-slate-700 border border-slate-600 rounded text-white text-sm mb-3"
            />
            <div className="flex gap-2">
              <button
                onClick={() => {
                  const input = document.getElementById('temp-api-key') as HTMLInputElement;
                  const apiKey = input.value.trim();
                  
                  if (apiKey && apiKey.startsWith('AIza')) {
                    window.localStorage.setItem('temp_api_key', apiKey);
                    console.log("API key guardada en localStorage");
                    window.location.reload();
                  } else {
                    alert("Por favor, ingresa una API key válida que empiece con 'AIza'");
                  }
                }}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition-colors"
              >
                Aplicar API Key
              </button>
              <button
                onClick={() => {
                  window.localStorage.removeItem('temp_api_key');
                  console.log("API key temporal eliminada");
                  window.location.reload();
                }}
                className="px-3 py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded transition-colors"
                title="Limpiar API key temporal"
              >
                🗑️
              </button>
            </div>
            <p className="text-xs text-slate-500 mt-2">
              Esta es solo para debugging. La key se guarda temporalmente en tu navegador.
            </p>
          </div>
          
          <div className="mt-4 text-xs text-slate-500">
            <p className="font-semibold mb-2">Para configuración permanente en Vercel:</p>
            <ol className="text-left space-y-1">
              <li>1. Ve a tu proyecto en vercel.com</li>
              <li>2. Settings → Environment Variables</li>
              <li>3. Agrega: GEMINI_API_KEY = tu_api_key</li>
              <li>4. Redeploy la aplicación</li>
            </ol>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      <div className="w-full mx-auto px-3 sm:px-6 lg:max-w-7xl lg:mx-auto py-2 sm:py-6 h-screen flex flex-col safe-area-bottom">
        {/* Header */}
        <header className="text-center mb-2 sm:mb-6 flex-shrink-0">
          <h1 className="text-lg sm:text-2xl lg:text-3xl font-bold bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 bg-clip-text text-transparent tracking-tight leading-tight">
            Gauss MathMind <span className="text-blue-500">IA</span>
          </h1>
          <p className="mt-1 sm:mt-2 text-xs sm:text-sm lg:text-base text-slate-400 px-1 sm:px-4">
            Captura, procesa y domina tus apuntes de matemáticas avanzadas
          </p>
        </header>

        {/* Navigation */}
        <nav className="flex justify-center mb-2 sm:mb-6 flex-shrink-0">
          <div className="flex bg-slate-800/50 backdrop-blur-sm rounded-xl p-1 border border-slate-700/50 shadow-lg w-full sm:w-auto mx-1 sm:mx-0">
            {['Editor', 'IA', 'Resumen'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveView(tab === 'Editor' ? 'editor' : tab === 'IA' ? 'assistant' : 'summary')}
                className={`flex items-center justify-center gap-1 sm:gap-2 px-2 sm:px-6 py-1.5 sm:py-3 rounded-lg text-xs sm:text-sm font-semibold transition-all duration-200 flex-1 sm:flex-none ${
                  activeView === (tab === 'Editor' ? 'editor' : tab === 'IA' ? 'assistant' : 'summary')
                    ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg'
                    : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
                }`}
              >
                {tab === 'Editor' && <BookOpenIcon className="w-3 h-3 sm:w-5 sm:h-5" />}
                {tab === 'IA' && <MessageCircleIcon className="w-3 h-3 sm:w-5 sm:h-5" />}
                {tab === 'Resumen' && <FileTextIcon className="w-3 h-3 sm:w-5 sm:h-5" />}
                <span className="hidden sm:inline">{tab}</span>
                <span className="sm:hidden">{tab === 'Editor' ? 'Edit' : tab === 'IA' ? 'IA' : 'Res'}</span>
              </button>
            ))}
          </div>
        </nav>

        {/* Main Content */}
        <main className="flex-grow overflow-hidden pb-2 sm:pb-4">
          {activeView === 'editor' && (
            <div className="h-full flex flex-col">
              <div className="flex-grow overflow-y-auto">
                <div className="w-full space-y-3 sm:space-y-6">
                  <div className="text-center px-2 sm:px-4">
                    <h2 className="text-lg sm:text-3xl font-bold text-white mb-1 sm:mb-2 flex items-center justify-center gap-2 sm:gap-3">
                      <BookOpenIcon className="w-5 h-5 sm:w-8 sm:h-8 text-blue-500"/>
                      Editor de Apuntes
                    </h2>
                    <p className="text-xs sm:text-base text-slate-400">Escribe, pega o escanea tus apuntes matemáticos</p>
                  </div>
                  
                  <div className="relative">
                    <label htmlFor="subject-select" className="block text-xs sm:text-sm font-medium text-slate-300 mb-1 sm:mb-2">Seleccionar Materia</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 flex items-center pl-2 sm:pl-4 pointer-events-none">
                        <HashIcon className="w-3 h-3 sm:w-5 sm:h-5 text-blue-500" />
                      </div>
                      <select
                        id="subject-select"
                        value={selectedSubject}
                        onChange={(e) => setSelectedSubject(e.target.value)}
                        className="w-full bg-slate-800/50 border border-slate-600 rounded-xl p-2 pl-8 sm:p-4 sm:pl-12 text-xs sm:text-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none appearance-none backdrop-blur-sm"
                      >
                        {subjects.map(subject => ( <option key={subject} value={subject}>{subject}</option>))}
                      </select>
                    </div>
                  </div>

                  <div className="bg-slate-800/30 backdrop-blur-sm rounded-xl border border-slate-700/50 shadow-xl min-h-[150px] sm:min-h-[300px]">
                    <StyledTextarea
                      placeholder="Escribe, pega o escanea tus apuntes de matemáticas aquí. Usa LaTeX para las fórmulas, ej., \\( \\int_a^b x^2 dx \\)..."
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      style={{ minHeight: '150px' }}
                    />
                  </div>
                  
                  {error && (
                    <div className="bg-red-900/20 border border-red-500/30 rounded-xl p-3 sm:p-4 animate-fade-in">
                      <div className="flex items-center gap-2 sm:gap-3 text-red-400">
                        <AlertCircleIcon className="w-4 h-4 sm:w-6 sm:h-6 flex-shrink-0" />
                        <span className="font-medium text-xs sm:text-sm">{error}</span>
                      </div>
                      <button 
                        onClick={handleProcessNotes} 
                        disabled={isLoading || isScanning || isExporting || isRecording}
                        className="mt-2 sm:mt-3 w-full flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white font-semibold py-2 sm:py-3 px-3 sm:px-4 rounded-lg transition-all text-xs sm:text-sm"
                      >
                        <RefreshCwIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                        Reintentar
                      </button>
                    </div>
                  )}
                  
                  <div className="space-y-2 sm:space-y-4">
                    <button 
                      onClick={handleProcessNotes} 
                      disabled={isLoading || isScanning || isExporting || isRecording} 
                      className="w-full flex items-center justify-center gap-2 sm:gap-3 bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 hover:from-blue-600 hover:via-blue-700 hover:to-blue-800 disabled:from-slate-700 disabled:to-slate-800 text-white font-bold py-2 sm:py-4 px-3 sm:px-6 rounded-xl transition-all transform hover:scale-105 text-sm sm:text-lg shadow-lg disabled:transform-none"
                    >
                      {isLoading ? (
                        <>
                          <LoaderCircleIcon className="animate-spin w-4 h-4 sm:w-6 sm:h-6"/> 
                          Procesando...
                        </>
                      ) : (
                        <>
                          <BrainCircuitIcon className="w-4 h-4 sm:w-6 sm:h-6"/> 
                          Procesar Apuntes
                        </>
                      )}
                    </button>
                    
                    <div className="grid grid-cols-2 gap-2 sm:gap-4">
                      <button
                        onClick={handleToggleRecording}
                        disabled={isLoading || isScanning || isExporting || !isSpeechSupported}
                        className={`flex items-center justify-center gap-1 sm:gap-3 font-semibold py-2 sm:py-4 px-2 sm:px-6 rounded-xl transition-all text-xs sm:text-lg ${
                          !isSpeechSupported
                          ? 'bg-slate-700 text-slate-500 cursor-not-allowed'
                          : isRecording
                          ? 'bg-gradient-to-r from-red-600 to-red-700 text-white shadow-lg'
                          : 'bg-slate-800/50 hover:bg-slate-700/50 text-white border border-slate-600/50'
                        }`}
                        title={!isSpeechSupported ? "El reconocimiento de voz no es compatible con este navegador." : isRecording ? "Detener grabación" : "Grabar audio"}
                      >
                        {isRecording ? (
                          <>
                            <MicIcon className="w-4 h-4 sm:w-6 sm:h-6 animate-pulse" /> 
                            <span className="hidden xs:inline">Detener</span>
                            <span className="xs:hidden">Stop</span>
                          </>
                        ) : (
                          <>
                            <MicIcon className="w-4 h-4 sm:w-6 sm:h-6" /> 
                            <span className="hidden xs:inline">Grabar</span>
                            <span className="xs:hidden">Mic</span>
                          </>
                        )}
                      </button>
                      <button 
                        onClick={handleScanClick} 
                        disabled={isLoading || isScanning || isExporting || isRecording} 
                        className="flex items-center justify-center gap-1 sm:gap-3 bg-slate-800/50 hover:bg-slate-700/50 disabled:bg-slate-700 text-white font-semibold py-2 sm:py-4 px-2 sm:px-6 rounded-xl transition-all text-xs sm:text-lg border border-slate-600/50"
                        title="Escanea imágenes de apuntes (JPG, PNG, WebP, máx. 10MB)"
                      >
                        {isScanning ? (
                          <>
                            <LoaderCircleIcon className="animate-spin w-4 h-4 sm:w-6 sm:h-6"/> 
                            <span className="hidden xs:inline">Escaneando...</span>
                            <span className="xs:hidden">Scan...</span>
                          </>
                        ) : (
                          <>
                            <CameraIcon className="w-4 h-4 sm:w-6 sm:h-6" /> 
                            <span className="hidden xs:inline">Escanear</span>
                            <span className="xs:hidden">Cam</span>
                          </>
                        )}
                      </button>
                    </div>
                    <input type="file" ref={imageInputRef} onChange={handleImageSelected} accept="image/*" className="hidden"/>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {activeView === 'assistant' && (
            <div className="h-full flex flex-col">
              <div className="w-full h-full flex flex-col px-2 sm:px-4">
                <div className="flex justify-between items-center mb-2 sm:mb-4">
                  <div className="text-center flex-1">
                    <h2 className="text-base sm:text-2xl font-bold text-white mb-1 flex items-center justify-center gap-2 sm:gap-3">
                      <MessageCircleIcon className="w-4 h-4 sm:w-6 sm:h-6 text-blue-500"/>
                      Asistente IA
                    </h2>
                    <p className="text-slate-400 text-xs sm:text-sm px-1 sm:px-2">Pregúntale cualquier cosa sobre {selectedSubject}</p>
                  </div>
                  <button 
                    onClick={handleResetAssistantChat} 
                    title="Reiniciar conversación"
                    className="text-slate-400 hover:text-blue-500 transition-colors disabled:opacity-50 p-1 sm:p-2 hover:bg-slate-800/50 rounded-lg"
                    disabled={isAssistantLoading}
                  >
                    <RefreshCwIcon className="w-3 h-3 sm:w-5 sm:h-5"/>
                  </button>
                </div>
                
                <div className="bg-slate-800/30 backdrop-blur-sm rounded-xl border border-slate-700/50 shadow-xl flex-grow p-2 sm:p-4 mb-4">
                  <div className="h-full flex flex-col">
                    <div 
                      ref={chatContainerRef}
                      className="flex-grow overflow-y-auto pr-2 space-y-3 mb-4 scroll-smooth"
                      style={{ maxHeight: '60vh' }}
                    >
                      {assistantHistory.length === 0 ? (
                        <div className="flex items-center justify-center h-full">
                          <div className="text-center space-y-3">
                            <div className="w-12 h-12 mx-auto bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                              <BrainCircuitIcon className="w-6 h-6 text-white"/>
                            </div>
                            <div>
                              <p className="text-base font-semibold text-white mb-1">Soy tu IA para</p>
                              <p className="text-lg font-bold bg-gradient-to-r from-blue-500 to-blue-600 bg-clip-text text-transparent">{selectedSubject}</p>
                              <p className="text-slate-400 mt-1 text-sm">¡Pregúntame cualquier cosa!</p>
                            </div>
                          </div>
                        </div>
                      ) : (
                        assistantHistory.map((msg, index) => (
                          <div key={index} className={`flex items-start gap-2 ${msg.role === 'user' ? 'justify-end' : ''}`}>
                            {msg.role === 'model' && (
                              <div className="w-6 h-6 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center flex-shrink-0 mt-1 shadow-lg">
                                <BrainCircuitIcon className="w-3 h-3 text-white"/>
                              </div>
                            )}
                            <div className={`max-w-[85%] p-3 rounded-xl text-sm shadow-lg ${
                              msg.role === 'user' 
                                ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white' 
                                : 'bg-slate-700/50 backdrop-blur-sm text-slate-200 border border-slate-600/30'
                            }`}>
                              <p className="whitespace-pre-wrap break-words leading-relaxed">{msg.content}</p>
                            </div>
                          </div>
                        ))
                      )}
                      {isAssistantLoading && assistantHistory[assistantHistory.length-1]?.role === 'user' && (
                        <div className="flex items-start gap-2">
                          <div className="w-6 h-6 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center flex-shrink-0 mt-1 shadow-lg">
                            <BrainCircuitIcon className="w-3 h-3 text-white"/>
                          </div>
                          <div className="max-w-[85%] p-3 rounded-xl bg-slate-700/50 backdrop-blur-sm border border-slate-600/30 shadow-lg">
                            <div className="flex items-center gap-2">
                              <LoaderCircleIcon className="w-4 h-4 animate-spin text-blue-500"/>
                              <span className="text-slate-300 text-sm">Pensando...</span>
                            </div>
                          </div>
                        </div>
                      )}
                      <div ref={chatEndRef} />
                    </div>
                    
                    <div className="pb-6 sm:pb-8">
                      <form onSubmit={handleAssistantSubmit} className="flex gap-2">
                        <input
                          type="text"
                          value={assistantInput}
                          onChange={(e) => setAssistantInput(e.target.value)}
                          placeholder="Pregúntale algo a la IA..."
                          className="flex-grow bg-slate-700/50 border border-slate-600/50 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none backdrop-blur-sm placeholder-slate-400"
                          disabled={isAssistantLoading}
                        />
                        <button 
                          type="submit" 
                          disabled={isAssistantLoading || !assistantInput.trim()} 
                          className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 disabled:from-slate-700 disabled:to-slate-800 text-white font-semibold p-2 rounded-lg transition-all transform hover:scale-105 disabled:transform-none flex-shrink-0 shadow-lg"
                        >
                          <SendIcon className="w-4 h-4"/>
                        </button>
                      </form>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {activeView === 'summary' && (
            <div className="h-full flex flex-col">
              <div className="flex-grow overflow-y-auto">
                <div className="w-full px-2 sm:px-4">
                  <div className="text-center mb-3 sm:mb-6">
                    <h2 className="text-lg sm:text-3xl font-bold text-white mb-1 sm:mb-2 flex items-center justify-center gap-2 sm:gap-3">
                      <BrainCircuitIcon className="w-5 h-5 sm:w-8 sm:h-8 text-blue-500"/>
                      Apuntes Procesados
                    </h2>
                    <p className="text-xs sm:text-base text-slate-400 px-1 sm:px-2">Resumen, conceptos clave y ejercicios generados por IA</p>
                  </div>
                  <div id="processed-output" className="bg-slate-800/30 backdrop-blur-sm rounded-xl border border-slate-700/50 shadow-xl p-2 sm:p-6 min-h-[300px] sm:min-h-[500px] max-h-[60vh] sm:max-h-[600px] overflow-y-auto">
                    <SummaryView data={processedData} isLoading={isLoading} onExport={handleExportToPdf} onCopy={handleCopyToClipboard} isExporting={isExporting} />
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>

        {/* Footer */}
        <footer className="text-center text-slate-500 text-xs sm:text-sm mt-2 sm:mt-6 flex-shrink-0 safe-area-bottom">
          <p className="font-medium px-1 sm:px-2">Desarrollado por <span className="text-blue-500">4ailabs</span></p>
        </footer>
      </div>
    </div>
  );
};

const Flashcard: React.FC<{ concept: string; definition: string }> = ({ concept, definition }) => {
    const [isFlipped, setIsFlipped] = useState(false);
    return (
        <div className="[perspective:1000px] w-full" onClick={() => setIsFlipped(!isFlipped)} role="button" tabIndex={0} onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && setIsFlipped(!isFlipped)}>
            <div className={`relative w-full h-24 sm:h-32 rounded-lg shadow-md cursor-pointer transition-transform duration-700 [transform-style:preserve-3d] ${isFlipped ? '[transform:rotateY(180deg)]' : ''}`}>
                <div className="absolute inset-0 w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-slate-800/70 to-slate-900/70 p-2 sm:p-4 rounded-lg [backface-visibility:hidden] border border-slate-700 text-center">
                    <TargetIcon className="w-4 h-4 sm:w-5 sm:h-5 text-blue-400 mb-1" />
                    <h4 className="text-sm sm:text-md font-bold text-white">{concept}</h4>
                    <div className="absolute bottom-1 right-1 sm:bottom-2 sm:right-2 flex items-center gap-1 text-xs text-slate-400">
                        <RefreshCwIcon className="w-3 h-3"/> 
                        <span className="hidden sm:inline">Voltear</span>
                    </div>
                </div>
                <div className="absolute inset-0 w-full h-full bg-gradient-to-br from-slate-800 to-slate-900 p-2 sm:p-4 rounded-lg [backface-visibility:hidden] [transform:rotateY(180deg)] overflow-y-auto">
                    <div className="flex items-center gap-2 mb-2">
                        <LightbulbIcon className="w-4 h-4 text-yellow-400 flex-shrink-0" />
                        <span className="text-xs text-slate-400 font-medium">Definición</span>
                    </div>
                    <p className="text-slate-300 text-xs sm:text-sm">{definition}</p>
                </div>
            </div>
        </div>
    );
};

const SummaryView: React.FC<{data: ProcessedData | null, isLoading: boolean, onExport: () => void, onCopy: () => void, isExporting: boolean}> = ({ data, isLoading, onExport, onCopy, isExporting }) => {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 mx-auto bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
            <LoaderCircleIcon className="w-8 h-8 text-white animate-spin"/>
          </div>
          <div>
            <p className="text-lg font-semibold text-white">Procesando apuntes...</p>
            <p className="text-slate-400">La IA está analizando tu contenido</p>
          </div>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 mx-auto bg-gradient-to-r from-slate-500 to-slate-600 rounded-full flex items-center justify-center">
            <FileTextIcon className="w-8 h-8 text-white"/>
          </div>
          <div>
            <p className="text-lg font-semibold text-white">Sin datos procesados</p>
            <p className="text-slate-400">Procesa tus apuntes para ver los resultados</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div id="processed-output-content" className="space-y-6">
      {/* Header con botón de exportar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-0">
        <h3 className="text-lg sm:text-2xl font-bold text-white">Resultados del Procesamiento</h3>
        <div className="flex gap-2 w-full sm:w-auto">
          <button
            onClick={onCopy}
            className="flex items-center gap-2 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold py-2 px-3 sm:px-4 rounded-lg transition-all transform hover:scale-105 shadow-lg text-sm sm:text-base w-full sm:w-auto justify-center sm:justify-start"
          >
            <CopyIcon className="w-4 h-4" />
            Copiar
          </button>
          <button
            onClick={onExport}
            disabled={isExporting}
            className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 disabled:from-slate-700 disabled:to-slate-800 text-white font-semibold py-2 px-3 sm:px-4 rounded-lg transition-all transform hover:scale-105 disabled:transform-none shadow-lg text-sm sm:text-base w-full sm:w-auto justify-center sm:justify-start"
          >
            {isExporting ? (
              <>
                <LoaderCircleIcon className="w-4 h-4 animate-spin" />
                Exportando...
              </>
            ) : (
              <>
                <DownloadIcon className="w-4 h-4" />
                Descargar
              </>
            )}
          </button>
        </div>
      </div>

      {/* Resumen */}
      <div className="bg-slate-700/30 backdrop-blur-sm rounded-xl border border-slate-600/30 p-4 sm:p-6 shadow-lg">
        <div className="flex items-center gap-3 mb-3 sm:mb-4">
          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
            <FileTextIcon className="w-4 h-4 sm:w-5 sm:h-5 text-white"/>
          </div>
          <h4 className="text-lg sm:text-xl font-bold text-white">Resumen</h4>
        </div>
        <div className="prose prose-invert max-w-none text-sm sm:text-base">
          <div dangerouslySetInnerHTML={{ __html: data.summary }} />
        </div>
      </div>

      {/* Conceptos Clave */}
      <div className="bg-slate-700/30 backdrop-blur-sm rounded-xl border border-slate-600/30 p-4 sm:p-6 shadow-lg">
        <div className="flex items-center gap-3 mb-3 sm:mb-4">
          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
            <TargetIcon className="w-4 h-4 sm:w-5 sm:h-5 text-white"/>
          </div>
          <h4 className="text-lg sm:text-xl font-bold text-white">Conceptos Clave</h4>
        </div>
        <div className="grid gap-3 sm:gap-4">
          {data.keyConcepts.map((concept, index) => (
            <div key={index} className="p-3 sm:p-4 bg-slate-600/20 rounded-lg border border-slate-500/20">
              <div className="flex items-start gap-3">
                <div className="w-5 h-5 sm:w-6 sm:h-6 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs font-bold text-white">{index + 1}</span>
                </div>
                <div className="flex-1">
                  <h5 className="font-semibold text-white mb-1 sm:mb-2 text-sm sm:text-base">{concept.concept}</h5>
                  <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">{concept.definition}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Preguntas de Quiz */}
      <div className="bg-slate-700/30 backdrop-blur-sm rounded-xl border border-slate-600/30 p-4 sm:p-6 shadow-lg">
        <div className="flex items-center gap-3 mb-3 sm:mb-4">
          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
            <CalculatorIcon className="w-4 h-4 sm:w-5 sm:h-5 text-white"/>
          </div>
          <h4 className="text-lg sm:text-xl font-bold text-white">Preguntas de Quiz</h4>
        </div>
        <div className="space-y-3 sm:space-y-4">
          {data.quizQuestions.map((question, index) => (
            <div key={index} className="p-3 sm:p-4 bg-slate-600/20 rounded-lg border border-slate-500/20">
              <div className="flex items-start gap-3 mb-2 sm:mb-3">
                <div className="w-5 h-5 sm:w-6 sm:h-6 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs font-bold text-white">{index + 1}</span>
                </div>
                <div className="flex-1">
                  <h5 className="font-semibold text-white mb-1 sm:mb-2 text-sm sm:text-base">{question.question}</h5>
                  <div className="flex items-center gap-2 mb-1 sm:mb-2">
                    <span className="text-xs bg-blue-900/50 text-blue-300 px-2 py-1 rounded-full font-medium">
                      {question.type}
                    </span>
                  </div>
                  <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">{question.answer}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Problemas Relacionados */}
      <div className="bg-slate-700/30 backdrop-blur-sm rounded-xl border border-slate-600/30 p-4 sm:p-6 shadow-lg">
        <div className="flex items-center gap-3 mb-3 sm:mb-4">
          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
            <BrainCircuitIcon className="w-4 h-4 sm:w-5 sm:h-5 text-white"/>
          </div>
          <h4 className="text-lg sm:text-xl font-bold text-white">Problemas Relacionados</h4>
        </div>
        <div className="space-y-3 sm:space-y-4">
          {data.relatedProblems.map((problem, index) => (
            <div key={index} className="p-3 sm:p-4 bg-slate-600/20 rounded-lg border border-slate-500/20">
              <div className="flex items-start gap-3">
                <div className="w-5 h-5 sm:w-6 sm:h-6 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs font-bold text-white">{index + 1}</span>
                </div>
                <div className="flex-1">
                  <h5 className="font-semibold text-white mb-1 sm:mb-2 text-sm sm:text-base">{problem.problem}</h5>
                  <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">{problem.solution}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default App;