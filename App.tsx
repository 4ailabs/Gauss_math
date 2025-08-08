import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { ProcessedData, ChatMessage, AnalysisHistory } from './types';
import { processNotes, getAssistantResponseStream, resetAssistantChat, extractTextFromImage } from './services/geminiService';
import {
  BrainCircuitIcon,
  MessageCircleIcon,
  SendIcon,
  UploadIcon,
  RefreshCwIcon,
  LoaderCircleIcon,
  AlertCircleIcon,
  BookOpenIcon,
  MicIcon,
  CameraIcon,
  SearchIcon,
  HelpCircleIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  MoreHorizontalIcon,
  CheckIcon,
  DownloadIcon,
  XIcon
} from './components/ui/Icons';

declare global {
  interface Window {
    renderMathInElement: (element: HTMLElement, options?: any) => void;
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

// Main App Component
const App: React.FC = () => {
  const [notes, setNotes] = useState<string>('');
  const [processedData, setProcessedData] = useState<ProcessedData | null>(null);
  const [assistantHistory, setAssistantHistory] = useState<ChatMessage[]>([]);
  const [assistantInput, setAssistantInput] = useState<string>('');
  const [assistantImage, setAssistantImage] = useState<string | null>(null);
  const [isQuizMode, setIsQuizMode] = useState(false);
  const [quizQuestions, setQuizQuestions] = useState<any[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<string[]>([]);
  const [quizScore, setQuizScore] = useState<number | null>(null);
  const [isGeneratingQuiz, setIsGeneratingQuiz] = useState(false);
  const [renderError, setRenderError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isAssistantLoading, setIsAssistantLoading] = useState<boolean>(false);
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [isSpeechSupported, setIsSpeechSupported] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isApiKeyMissing, setIsApiKeyMissing] = useState<boolean>(false);
  const [activeView, setActiveView] = useState<'search' | 'results' | 'chat' | 'library'>('search');
  const [searchType, setSearchType] = useState<'research' | 'systematic' | 'papers'>('research');
  const [gatherType, setGatherType] = useState<'papers' | 'trials'>('papers');
  const [selectedSubject, setSelectedSubject] = useState<string>('Cálculo Diferencial e Integral');
  const [analysisHistory, setAnalysisHistory] = useState<AnalysisHistory[]>([]);
  const [librarySearchTerm, setLibrarySearchTerm] = useState<string>('');
  const [selectedHistoryItem, setSelectedHistoryItem] = useState<AnalysisHistory | null>(null);
  
  // Funciones para manejar el historial
  const saveToHistory = useCallback((processedData: ProcessedData) => {
    const newHistoryItem: AnalysisHistory = {
      id: Date.now().toString(),
      title: notes.substring(0, 50) + (notes.length > 50 ? '...' : ''),
      subject: selectedSubject,
      notes: notes,
      processedData: processedData,
      timestamp: Date.now(),
      tags: [selectedSubject]
    };
    
    const updatedHistory = [newHistoryItem, ...analysisHistory];
    setAnalysisHistory(updatedHistory);
    localStorage.setItem('gaussmathmind_history', JSON.stringify(updatedHistory));
  }, [notes, selectedSubject, analysisHistory]);

  const loadHistoryFromStorage = useCallback(() => {
    try {
      const savedHistory = localStorage.getItem('gaussmathmind_history');
      if (savedHistory) {
        const parsedHistory = JSON.parse(savedHistory);
        setAnalysisHistory(parsedHistory);
      }
    } catch (error) {
      console.error('Error loading history:', error);
    }
  }, []);

  const deleteHistoryItem = useCallback((id: string) => {
    const updatedHistory = analysisHistory.filter(item => item.id !== id);
    setAnalysisHistory(updatedHistory);
    localStorage.setItem('gaussmathmind_history', JSON.stringify(updatedHistory));
  }, [analysisHistory]);

  const filteredHistory = useMemo(() => {
    if (!librarySearchTerm.trim()) return analysisHistory;
    
    const searchTerm = librarySearchTerm.toLowerCase();
    return analysisHistory.filter(item => 
      item.title.toLowerCase().includes(searchTerm) ||
      item.subject.toLowerCase().includes(searchTerm) ||
      item.notes.toLowerCase().includes(searchTerm) ||
      item.processedData.summary.toLowerCase().includes(searchTerm)
    );
  }, [analysisHistory, librarySearchTerm]);

  const imageInputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<any>(null);
  const notesOnRecordStartRef = useRef<string>('');
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const assistantImageInputRef = useRef<HTMLInputElement>(null);

  const subjects = [
    "Investigación en Matemáticas Aplicadas y Computación",
    "Administración de Bases de Datos",
    "Elementos de Finanzas e Inversiones"
  ];

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
      // resetAssistantChat(selectedSubject); // This line was removed as per the new_code
      setAssistantHistory([]);
    } catch(e) { console.error(e); } 
  }, [selectedSubject]);

  // Load history from localStorage on component mount
  useEffect(() => {
    loadHistoryFromStorage();
  }, [loadHistoryFromStorage]);

  // Load subject from localStorage
  useEffect(() => {
    try {
      const savedSubject = localStorage.getItem('gaussmathmind_subject');
      if (savedSubject && subjects.includes(savedSubject)) {
        setSelectedSubject(savedSubject);
      }
    } catch(e) { 
      console.error(e); 
    }
  }, []);

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
      setActiveView('results');
      saveToHistory(data); // Save to history after processing
    } catch (e: any) {
      console.error("Error processing notes:", e);
      setError(e.message || "Ocurrió un error desconocido al procesar los apuntes.");
      setProcessedData(null);
    } finally {
      setIsLoading(false);
    }
  }, [notes, selectedSubject, saveToHistory]);

  const handleSearch = () => {
    if (notes.trim()) {
      handleProcessNotes();
    }
  };

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

  const handleScanClick = () => imageInputRef.current?.click();

  const handleImageSelected = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
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

  const handleAssistantImageSelected = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      setError("La imagen es demasiado grande. Máximo 10MB.");
      return;
    }
    
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      setError("Formato de imagen no válido. Usa JPG, PNG o WebP.");
      return;
    }
    
    setError(null);
    
    const reader = new FileReader();
    reader.readAsDataURL(file);
    
    reader.onload = () => {
      const result = reader.result as string;
      setAssistantImage(result);
    };
    
    reader.onerror = () => {
      setError("Error al procesar la imagen.");
    };
  };

  useEffect(() => {
    // Verificar API key con fallback a localStorage
    const checkApiKey = () => {
      const envApiKey = process.env.GEMINI_API_KEY;
      const localApiKey = typeof window !== 'undefined' ? window.localStorage.getItem('temp_api_key') : null;
      
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
  useEffect(() => {
    if (selectedSubject) {
      try {
        // resetAssistantChat(selectedSubject); // This line was removed as per the new_code
      } catch (error) {
        console.error("Error inicializando asistente:", error);
        setError("Error al inicializar el asistente.");
      }
    }
  }, [selectedSubject]);

  if (isApiKeyMissing) {
    return (
      <div className="min-h-screen bg-white text-gray-900 flex items-center justify-center p-4">
        <div className="max-w-md text-center bg-white p-8 rounded-lg shadow-lg border">
          <h1 className="text-3xl font-bold text-red-500 mb-4">Error de Configuración</h1>
          <p className="text-gray-600 mb-6">
            La variable de entorno <code>GEMINI_API_KEY</code> no está configurada. Por favor, asegúrate de que tu API Key de Google AI está disponible para que la aplicación funcione.
          </p>
          
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="text-lg font-semibold text-blue-600 mb-2">Configuración Temporal</h3>
            <p className="text-sm text-gray-600 mb-3">
              Pega tu API key de Google AI Studio aquí para probar la aplicación:
            </p>
            <input
              type="password"
              id="temp-api-key"
              placeholder="AIzaSyC... (tu API key aquí)"
              className="w-full p-3 bg-white border border-gray-300 rounded text-gray-900 text-sm mb-3"
            />
            <div className="flex gap-2">
              <button
                onClick={() => {
                  const input = document.getElementById('temp-api-key') as HTMLInputElement;
                  const apiKey = input.value.trim();
                  
                  if (apiKey && apiKey.startsWith('AIza')) {
                    window.localStorage.setItem('temp_api_key', apiKey);
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
                  window.location.reload();
                }}
                className="px-3 py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded transition-colors"
                title="Limpiar API key temporal"
              >
                🗑️
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-gray-900">
      {/* Top Navigation Bar */}
      <header className="border-b border-gray-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Left side - Logo and Navigation */}
            <div className="flex items-center space-x-8">
              <div className="flex-shrink-0">
                <h1 className="text-2xl font-bold text-gray-900">Gauss∑ AI</h1>
              </div>
              <nav className="hidden md:flex space-x-8">
                <a 
                  href="#" 
                  onClick={(e) => {
                    e.preventDefault();
                    setActiveView('search');
                  }}
                  className="text-gray-700 hover:text-gray-900 px-3 py-2 text-sm font-medium"
                >
                  Búsqueda
                </a>
                <a href="#" className="text-gray-700 hover:text-gray-900 px-3 py-2 text-sm font-medium">Recientes</a>
                <a 
                  href="#" 
                  onClick={(e) => {
                    e.preventDefault();
                    setActiveView('library');
                  }}
                  className="text-gray-700 hover:text-gray-900 px-3 py-2 text-sm font-medium"
                >
                  Biblioteca
                </a>
                <a href="#" className="text-gray-700 hover:text-gray-900 px-3 py-2 text-sm font-medium">Ayuda</a>
              </nav>
            </div>

            {/* Right side - User Actions */}
            <div className="flex items-center space-x-4">
              <button className="text-gray-700 hover:text-gray-900 p-2">
                <HelpCircleIcon className="w-5 h-5" />
              </button>
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-teal-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
                  4
                </div>
                <span className="text-sm font-medium text-gray-900">4ailabs</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeView === 'search' && (
          <div className="space-y-8">
            {/* Search Type Selectors */}
            <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setSearchType('research')}
                className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-md text-sm font-medium transition-colors ${
                  searchType === 'research'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <BookOpenIcon className="w-4 h-4" />
                Procesar Apuntes
              </button>
              <button
                onClick={() => setSearchType('systematic')}
                className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-md text-sm font-medium transition-colors ${
                  searchType === 'systematic'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <MessageCircleIcon className="w-4 h-4" />
                Generar Quiz
              </button>
              <button
                onClick={() => setSearchType('papers')}
                className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-md text-sm font-medium transition-colors ${
                  searchType === 'papers'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <SearchIcon className="w-4 h-4" />
                Encontrar Problemas
              </button>
            </div>

            {/* Subject Selector */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
              <label htmlFor="subject-select" className="block text-sm font-medium text-gray-800 mb-2">
                Seleccionar Materia
              </label>
              <div className="relative">
                <select
                  id="subject-select"
                  value={selectedSubject}
                  onChange={(e) => setSelectedSubject(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-300 rounded-lg p-3 text-sm text-gray-900 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 focus:outline-none"
                >
                  {subjects.map(subject => (
                    <option key={subject} value={subject}>{subject}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Main Search Card */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                {/* Main Search Input */}
                <div className="relative">
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Pega tus apuntes de matemáticas aquí o describe lo que quieres estudiar..."
                    className="w-full h-32 p-4 border border-gray-300 rounded-xl resize-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 focus:outline-none text-gray-900 placeholder-gray-500"
                    disabled={isLoading}
                  />
                  {isRecording && (
                    <div className="absolute top-3 left-3 flex items-center gap-2 bg-red-100 text-red-700 px-2 py-1 rounded-full text-xs font-medium">
                      <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                      Grabando...
                    </div>
                  )}
                  <div className="absolute bottom-3 right-3 flex items-center gap-2">
                    <button
                      onClick={handleToggleRecording}
                      disabled={isLoading}
                      className={`p-2 rounded-full transition-colors ${
                        isRecording 
                          ? 'bg-red-500 hover:bg-red-600 text-white' 
                          : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
                      }`}
                      title={isRecording ? 'Detener grabación' : 'Grabar voz'}
                    >
                      <MicIcon className="w-4 h-4" />
                    </button>
                    <button
                      onClick={handleSearch}
                      disabled={isLoading || !notes.trim()}
                      className="bg-teal-600 hover:bg-teal-700 disabled:bg-gray-300 text-white p-3 rounded-full transition-colors"
                    >
                      <ChevronRightIcon className="w-6 h-6" />
                    </button>
                  </div>
                </div>

                {/* Query Refinement Suggestions */}
                <div className="mt-4">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                    <p className="text-sm text-gray-700">Las preguntas más precisas funcionan mejor. Intenta agregar elementos como estos:</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button className="px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-full text-sm font-medium transition-colors">
                      Conceptos matemáticos
                    </button>
                    <button className="px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-full text-sm font-medium transition-colors">
                      Fórmulas y ecuaciones
                    </button>
                    <button className="px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-full text-sm font-medium transition-colors">
                      Ejemplos de problemas
                    </button>
                  </div>
                </div>

                {/* Gather Options */}
                <div className="flex items-center gap-3 mt-4">
                  <span className="text-sm font-medium text-gray-800">Generar:</span>
                  <div className="flex space-x-1">
                    <button
                      onClick={() => setGatherType('papers')}
                      className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                        gatherType === 'papers'
                          ? 'bg-teal-100 text-teal-800'
                          : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                      }`}
                    >
                      Resumen y Conceptos
                    </button>
                    <button
                      onClick={() => setGatherType('trials')}
                      className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                        gatherType === 'trials'
                          ? 'bg-teal-100 text-teal-800'
                          : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                      }`}
                    >
                      Problemas de Práctica
                    </button>
                  </div>
                </div>
            </div>

            {/* More Tools Section */}
            <div className="mt-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Herramientas Adicionales</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <button 
                  onClick={handleScanClick}
                  className="flex items-center gap-3 p-4 bg-white border border-gray-200 rounded-xl hover:border-gray-300 transition-colors"
                >
                  <UploadIcon className="w-6 h-6 text-teal-600" />
                  <div className="text-left">
                    <h4 className="font-medium text-gray-900">Escanear Notas</h4>
                    <p className="text-sm text-gray-700">Sube imágenes de tus apuntes</p>
                  </div>
                </button>
                <button 
                  onClick={handleToggleRecording}
                  disabled={isLoading}
                  className={`flex items-center gap-3 p-4 bg-white border border-gray-200 rounded-xl hover:border-gray-300 transition-colors ${
                    isRecording ? 'border-red-300 bg-red-50' : ''
                  }`}
                >
                  <MicIcon className={`w-6 h-6 ${isRecording ? 'text-red-600' : 'text-teal-600'}`} />
                  <div className="text-left">
                    <h4 className="font-medium text-gray-900">
                      {isRecording ? 'Grabando...' : 'Grabar Voz'}
                    </h4>
                    <p className="text-sm text-gray-700">
                      {isRecording ? 'Toca para detener' : 'Dicta tus notas por voz'}
                    </p>
                  </div>
                </button>
                <button 
                  onClick={() => setActiveView('chat')}
                  className="flex items-center gap-3 p-4 bg-white border border-gray-200 rounded-xl hover:border-gray-300 transition-colors"
                >
                  <MessageCircleIcon className="w-6 h-6 text-teal-600" />
                  <div className="text-left">
                    <h4 className="font-medium text-gray-900">Hacer Preguntas</h4>
                    <p className="text-sm text-gray-700">Chat con IA sobre matemáticas</p>
                  </div>
                </button>
              </div>
            </div>

            {/* Recent Activity Section */}
            <div className="mt-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Reciente</h3>
              <div className="bg-white border border-gray-200 rounded-xl p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <CheckIcon className="w-4 h-4 text-teal-600" />
                    <span className="text-sm font-medium text-gray-900">Optimización de Descenso de Gradiente</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-600">Procesado</span>
                    <span className="text-xs text-gray-500">9:49am Abr 7</span>
                    <MoreHorizontalIcon className="w-4 h-4 text-gray-400" />
                  </div>
                </div>
              </div>
            </div>

            {/* Inputs ocultos para imágenes */}
            <input type="file" ref={imageInputRef} onChange={handleImageSelected} accept="image/*" className="hidden"/>
          </div>
        )}

        {activeView === 'results' && processedData && (
          <div className="space-y-6">
            {/* Progress Indicator */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-teal-500 rounded-full"></div>
                  <div className="w-2 h-2 bg-teal-500 rounded-full"></div>
                  <div className="w-2 h-2 bg-teal-500 rounded-full"></div>
                  <div className="w-2 h-2 bg-teal-500 rounded-full"></div>
                  <div className="w-2 h-2 bg-teal-500 rounded-full"></div>
                </div>
                <span className="text-sm font-medium text-gray-900">Análisis de Apuntes</span>
                <button className="text-sm text-gray-500 hover:text-gray-700">
                  <ChevronDownIcon className="w-4 h-4" />
                </button>
              </div>
              <div className="flex items-center gap-2">
                <button className="text-sm text-gray-500 hover:text-gray-700">Compartir</button>
                <button className="text-sm text-gray-500 hover:text-gray-700">
                  <DownloadIcon className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Research Topic */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900">{selectedSubject}</h2>
                <div className="flex items-center gap-2">
                  <UploadIcon className="w-4 h-4 text-gray-500" />
                  <ChevronDownIcon className="w-4 h-4 text-gray-500" />
                </div>
              </div>

              {/* Summary Section */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Resumen</h3>
                <div className="bg-gray-50 border border-gray-200 rounded-xl p-6">
                  <p className="text-gray-800 leading-relaxed">{processedData.summary}</p>
                </div>
              </div>

              {/* Key Concepts Section */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Conceptos Clave</h3>
                <div className="space-y-3">
                  {processedData.keyConcepts.map((concept, index) => (
                    <div key={index} className="bg-white border border-gray-200 rounded-xl p-4">
                      <div className="flex items-start gap-3">
                        <div className="w-6 h-6 bg-teal-600 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                          <span className="text-xs font-bold text-white">{index + 1}</span>
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900 mb-2">{concept.concept}</h4>
                          <p className="text-gray-700 text-sm leading-relaxed">{concept.definition}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quiz Questions Section */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Preguntas de Práctica</h3>
                <div className="space-y-4">
                  {processedData.quizQuestions.map((question, index) => (
                    <div key={index} className="bg-white border border-gray-200 rounded-xl p-4">
                      <div className="flex items-start gap-3">
                        <div className="w-6 h-6 bg-teal-600 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                          <span className="text-xs font-bold text-white">{index + 1}</span>
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900 mb-2">{question.question}</h4>
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-xs bg-teal-100 text-teal-800 px-2 py-1 rounded-full font-medium">
                              {question.type}
                            </span>
                          </div>
                          <p className="text-gray-700 text-sm leading-relaxed">{question.answer}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Related Problems Section */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Problemas Relacionados</h3>
                <div className="space-y-4">
                  {processedData.relatedProblems.map((problem, index) => (
                    <div key={index} className="bg-white border border-gray-200 rounded-xl p-4">
                      <div className="flex items-start gap-3">
                        <div className="w-6 h-6 bg-teal-600 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                          <span className="text-xs font-bold text-white">{index + 1}</span>
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900 mb-2">{problem.problem}</h4>
                          <p className="text-gray-700 text-sm leading-relaxed">{problem.solution}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Report Status Sidebar */}
            <div className="w-80 bg-white border-l border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Estado del Análisis</h3>
              <div className="space-y-6">
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 bg-teal-600 rounded-full flex items-center justify-center">
                    <CheckIcon className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Procesar contenido</p>
                    <p className="text-sm text-gray-600">Análisis de notas completado</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 bg-teal-600 rounded-full flex items-center justify-center">
                    <CheckIcon className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Extraer conceptos</p>
                    <p className="text-sm text-gray-600">Conceptos clave identificados</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 bg-teal-600 rounded-full flex items-center justify-center">
                    <CheckIcon className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Generar preguntas</p>
                    <p className="text-sm text-gray-600">Preguntas de práctica creadas</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 bg-teal-600 rounded-full flex items-center justify-center">
                    <CheckIcon className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Crear problemas</p>
                    <p className="text-sm text-gray-600">Problemas relacionados generados</p>
                  </div>
                </div>
              </div>
              
              {/* Action Buttons */}
              <div className="mt-8 space-y-3">
                <button 
                  onClick={() => setActiveView('search')}
                  className="w-full bg-teal-600 hover:bg-teal-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                >
                  Nuevo Análisis
                </button>
                <button 
                  onClick={() => setActiveView('chat')}
                  className="w-full bg-gray-100 hover:bg-gray-200 text-gray-900 font-medium py-2 px-4 rounded-lg transition-colors"
                >
                  Hacer Preguntas
                </button>
              </div>
            </div>
            {/* Back to Search Button */}
            <div className="mt-8 text-center">
              <button
                onClick={() => setActiveView('search')}
                className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-3 rounded-lg font-medium transition-colors"
              >
                ← Nueva Búsqueda
              </button>
            </div>
          </div>
        )}

        {activeView === 'chat' && (
          <div className="h-full flex flex-col">
            {/* Input oculto para imágenes del asistente */}
            <input
              ref={assistantImageInputRef}
              type="file"
              accept="image/*"
              onChange={handleAssistantImageSelected}
              className="hidden"
            />
            
            <div className="w-full h-full flex flex-col px-2 sm:px-4">
              <div className="flex justify-between items-center mb-2 sm:mb-4">
                <div className="text-center flex-1">
                  <h2 className="text-base sm:text-2xl font-bold text-gray-900 mb-1 flex items-center justify-center gap-2 sm:gap-3">
                    <MessageCircleIcon className="w-4 h-4 sm:w-6 sm:h-6 text-teal-600"/>
                    Hacer Preguntas
                  </h2>
                  <p className="text-gray-600 text-xs sm:text-sm px-1 sm:px-2">Haz preguntas sobre tus apuntes procesados</p>
                  
                  {/* Subject Selector for Chat */}
                  <div className="mt-4 max-w-xs mx-auto">
                    <label htmlFor="chat-subject-select" className="block text-xs font-medium text-gray-600 mb-1">
                      Materia
                    </label>
                    <div className="relative">
                      <select
                        id="chat-subject-select"
                        value={selectedSubject}
                        onChange={(e) => setSelectedSubject(e.target.value)}
                        className="w-full bg-gray-50 border border-gray-300 rounded-lg px-3 py-1.5 text-xs text-gray-900 focus:ring-1 focus:ring-teal-500 focus:border-teal-500 focus:outline-none"
                      >
                        {subjects.map(subject => (
                          <option key={subject} value={subject}>{subject}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
                <button 
                  onClick={() => {
                    // resetAssistantChat(selectedSubject); // This line was removed as per the new_code
                    setAssistantHistory([]);
                  }}
                  title="Reset conversation"
                  className="text-gray-500 hover:text-teal-600 transition-colors disabled:opacity-50 p-1 sm:p-2 hover:bg-gray-100 rounded-lg"
                  disabled={isAssistantLoading}
                >
                  <RefreshCwIcon className="w-3 h-3 sm:w-5 sm:h-5"/>
                </button>
              </div>
              
              <div className="bg-white border border-gray-200 rounded-lg shadow-sm flex-grow p-2 sm:p-4 mb-4">
                <div className="h-full flex flex-col">
                  <div 
                    ref={chatContainerRef}
                    className="flex-grow overflow-y-auto pr-2 space-y-3 mb-4 scroll-smooth"
                    style={{ maxHeight: '60vh' }}
                  >
                    {assistantHistory.length === 0 ? (
                      <div className="flex items-center justify-center h-full">
                        <div className="text-center space-y-3">
                          <div className="w-12 h-12 mx-auto bg-gradient-to-r from-teal-500 to-teal-600 rounded-full flex items-center justify-center">
                            <BrainCircuitIcon className="w-6 h-6 text-white"/>
                          </div>
                          <div>
                            <p className="text-base font-semibold text-gray-900 mb-1">Pregúntame sobre</p>
                            <p className="text-lg font-bold text-teal-600">{selectedSubject}</p>
                            <p className="text-gray-600 mt-1 text-sm">¡Puedo ayudarte a entender conceptos, resolver problemas y explicar temas matemáticos!</p>
                          </div>
                        </div>
                      </div>
                    ) : (
                      assistantHistory.map((msg, index) => {
                        try {
                          if (!msg || typeof msg.content !== 'string') {
                            return (
                              <div key={index} className="flex items-start gap-2">
                                <div className="w-6 h-6 rounded-full bg-red-500 flex items-center justify-center flex-shrink-0 mt-1">
                                  <AlertCircleIcon className="w-3 h-3 text-white"/>
                                </div>
                                <div className="max-w-[85%] p-3 rounded-xl text-sm bg-red-50 border border-red-200">
                                  <p className="text-red-600">Mensaje inválido</p>
                                </div>
                              </div>
                            );
                          }

                          return (
                            <div key={index} className={`flex items-start gap-2 ${msg.role === 'user' ? 'justify-end' : ''}`}>
                              {msg.role === 'model' && (
                                <div className="w-6 h-6 rounded-full bg-gradient-to-r from-teal-500 to-teal-600 flex items-center justify-center flex-shrink-0 mt-1 shadow-lg">
                                  <BrainCircuitIcon className="w-3 h-3 text-white"/>
                                </div>
                              )}
                              <div className={`max-w-[85%] p-3 rounded-xl text-sm shadow-sm ${
                                msg.role === 'user' 
                                  ? 'bg-teal-600 text-white' 
                                  : 'bg-gray-50 text-gray-900 border border-gray-200'
                              }`}>
                                <p className="whitespace-pre-wrap break-words leading-relaxed">{msg.content}</p>
                              </div>
                            </div>
                          );
                        } catch (error) {
                          return (
                            <div key={index} className="flex items-start gap-2">
                              <div className="w-6 h-6 rounded-full bg-red-500 flex items-center justify-center flex-shrink-0 mt-1">
                                <AlertCircleIcon className="w-3 h-3 text-white"/>
                              </div>
                              <div className="max-w-[85%] p-3 rounded-xl text-sm bg-red-50 border border-red-200">
                                <p className="text-red-600">Error al mostrar mensaje</p>
                              </div>
                            </div>
                          );
                        }
                      })
                    )}
                    {isAssistantLoading && assistantHistory[assistantHistory.length-1]?.role === 'user' && (
                      <div className="flex items-start gap-2">
                        <div className="w-6 h-6 rounded-full bg-gradient-to-r from-teal-500 to-teal-600 flex items-center justify-center flex-shrink-0 mt-1 shadow-lg">
                          <BrainCircuitIcon className="w-3 h-3 text-white"/>
                        </div>
                        <div className="max-w-[85%] p-3 rounded-xl bg-gray-50 border border-gray-200 shadow-sm">
                          <div className="flex items-center gap-2">
                            <LoaderCircleIcon className="w-4 h-4 animate-spin text-teal-600"/>
                            <span className="text-gray-600 text-sm">Pensando...</span>
                          </div>
                        </div>
                      </div>
                    )}
                    <div ref={chatEndRef} />
                  </div>
                  
                  <div className="pb-6 sm:pb-8">
                    {/* Imagen seleccionada */}
                    {assistantImage && (
                      <div className="mb-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm text-gray-600">Imagen seleccionada:</span>
                          <button
                            onClick={() => {
                              setAssistantImage(null);
                              if (assistantImageInputRef.current) {
                                assistantImageInputRef.current.value = '';
                              }
                            }}
                            className="text-red-500 hover:text-red-600 transition-colors"
                          >
                            <XIcon className="w-4 h-4" />
                          </button>
                        </div>
                        <img 
                          src={assistantImage} 
                          alt="Imagen para el asistente" 
                          className="max-w-full h-20 object-cover rounded-lg"
                        />
                      </div>
                    )}
                    
                    <form onSubmit={async (e) => {
                      e.preventDefault();
                      
                      if (!assistantInput.trim() && !assistantImage) return;
                      if (isAssistantLoading) return;

                      const userMessage = assistantInput.trim();
                      const hasImage = !!assistantImage;
                      
                      if (!userMessage.trim() && !hasImage) return;
                      
                      const userMsg: ChatMessage = {
                        role: 'user',
                        content: hasImage ? `${userMessage} [Includes image]` : userMessage
                      };
                      
                      setAssistantHistory(prev => [...prev, userMsg]);
                      setAssistantInput('');
                      setIsAssistantLoading(true);
                      setError(null);

                      try {
                        let fullResponse = '';
                        let isFirstChunk = true;

                        const stream = await getAssistantResponseStream(userMessage, selectedSubject, assistantImage);
                        
                        const modelMsg: ChatMessage = { role: 'model', content: '' };
                        setAssistantHistory(prev => [...prev, modelMsg]);
                        
                        for await (const chunk of stream) {
                          let chunkText = '';
                          if (typeof chunk === 'string') {
                            chunkText = chunk;
                          } else if (chunk && typeof chunk === 'object') {
                            if (chunk.text) {
                              chunkText = chunk.text;
                            } else if (chunk.candidates && chunk.candidates.length > 0) {
                              const candidate = chunk.candidates[0];
                              if (candidate.content && candidate.content.parts && candidate.content.parts.length > 0) {
                                chunkText = candidate.content.parts[0].text || '';
                              }
                            } else if (chunk.response && chunk.response.text) {
                              chunkText = chunk.response.text;
                            }
                          }
                          if (chunkText && chunkText.trim().length > 0) {
                            if (isFirstChunk) {
                              fullResponse = chunkText;
                              isFirstChunk = false;
                            } else {
                              fullResponse += chunkText;
                            }

                            setTimeout(() => {
                              setAssistantHistory(prev => {
                                const newHistory = prev.map((msg, index) => 
                                  index === prev.length - 1 ? { ...msg, content: fullResponse } : msg
                                );
                                return newHistory;
                              });
                            }, 100);
                          }
                        }

                        if (fullResponse === undefined || fullResponse === null) {
                          throw new Error("Empty response from assistant");
                        }

                        if (fullResponse.trim() === '') {
                          fullResponse = "I'm sorry, I couldn't generate a response. Could you please rephrase your question?";
                        }

                        setAssistantHistory(prev => 
                          prev.map((msg, index) => 
                            index === prev.length - 1 ? { ...msg, content: fullResponse } : msg
                          )
                        );

                        setAssistantImage(null);
                        if (assistantImageInputRef.current) {
                          assistantImageInputRef.current.value = '';
                        }

                      } catch (error: any) {
                        setAssistantHistory(prev => {
                          const filteredHistory = prev.filter((msg, index) => {
                            if (index === prev.length - 1 && msg.content === '') {
                              return false;
                            }
                            return true;
                          });
                          return filteredHistory;
                        });
                        
                        const errorMsg: ChatMessage = {
                          role: 'model',
                          content: `❌ Error: ${error.message || 'Error communicating with assistant'}`
                        };
                        
                        setAssistantHistory(prev => [...prev, errorMsg]);
                        setError(error.message || 'Error communicating with assistant');
                      } finally {
                        setIsAssistantLoading(false);
                      }
                    }} className="flex gap-2">
                      <div className="flex-1 flex gap-2">
                        <input
                          type="text"
                          value={assistantInput}
                          onChange={(e) => setAssistantInput(e.target.value)}
                          placeholder="Pregunta sobre conceptos matemáticos, fórmulas o problemas..."
                          className="flex-grow bg-gray-50 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500 focus:outline-none placeholder-gray-500"
                          disabled={isAssistantLoading}
                        />
                        <button
                          onClick={handleToggleRecording}
                          disabled={isAssistantLoading}
                          className={`p-2 rounded-full transition-colors ${
                            isRecording 
                              ? 'bg-red-500 hover:bg-red-600 text-white' 
                              : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
                          }`}
                          title={isRecording ? 'Detener grabación' : 'Grabar voz'}
                        >
                          <MicIcon className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => assistantImageInputRef.current?.click()}
                          className="bg-gray-200 hover:bg-gray-300 text-gray-600 hover:text-gray-700 p-2 rounded-lg transition-colors flex-shrink-0"
                          title="Agregar imagen"
                        >
                          <CameraIcon className="w-4 h-4" />
                        </button>
                        <button 
                          type="submit" 
                          disabled={isAssistantLoading || (!assistantInput.trim() && !assistantImage)} 
                          className="bg-teal-600 hover:bg-teal-700 disabled:bg-gray-300 text-white font-semibold p-2 rounded-lg transition-colors transform hover:scale-105 disabled:transform-none flex-shrink-0 shadow-sm"
                        >
                          <SendIcon className="w-4 h-4"/>
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Back to Search Button */}
            <div className="mt-8 text-center">
              <button
                onClick={() => setActiveView('search')}
                className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-3 rounded-lg font-medium transition-colors"
              >
                ← Volver a Búsqueda
              </button>
            </div>
          </div>
        )}

        {activeView === 'library' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Library Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Biblioteca</h1>
              <p className="text-gray-600">Tu historial de análisis y notas procesadas</p>
            </div>

            {/* Search Bar */}
            <div className="mb-6">
              <div className="relative">
                <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  value={librarySearchTerm}
                  onChange={(e) => setLibrarySearchTerm(e.target.value)}
                  placeholder="Buscar en el historial por título, materia o contenido..."
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 focus:outline-none text-gray-900 placeholder-gray-500"
                />
              </div>
            </div>

            {/* History List */}
            <div className="space-y-4">
              {filteredHistory.length === 0 ? (
                <div className="text-center py-12">
                  <BookOpenIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    {librarySearchTerm ? 'No se encontraron resultados' : 'No hay análisis guardados'}
                  </h3>
                  <p className="text-gray-500">
                    {librarySearchTerm 
                      ? 'Intenta con otros términos de búsqueda' 
                      : 'Procesa algunos apuntes para verlos aquí'
                    }
                  </p>
                </div>
              ) : (
                filteredHistory.map((item) => (
                  <div key={item.id} className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">{item.title}</h3>
                        <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                          <span className="bg-teal-100 text-teal-800 px-2 py-1 rounded-full font-medium">
                            {item.subject}
                          </span>
                          <span>{new Date(item.timestamp).toLocaleDateString('es-ES', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}</span>
                        </div>
                        <p className="text-gray-700 line-clamp-2">{item.processedData.summary}</p>
                      </div>
                      <div className="flex gap-2 ml-4">
                        <button
                          onClick={() => {
                            setSelectedHistoryItem(item);
                            setProcessedData(item.processedData);
                            setNotes(item.notes);
                            setSelectedSubject(item.subject);
                            setActiveView('results');
                          }}
                          className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                        >
                          Ver Análisis
                        </button>
                        <button
                          onClick={() => deleteHistoryItem(item.id)}
                          className="bg-red-100 hover:bg-red-200 text-red-700 px-3 py-2 rounded-lg text-sm font-medium transition-colors"
                          title="Eliminar del historial"
                        >
                          <XIcon className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    
                    {/* Quick Stats */}
                    <div className="flex gap-6 text-sm text-gray-600">
                      <span>{item.processedData.keyConcepts.length} conceptos clave</span>
                      <span>{item.processedData.quizQuestions.length} preguntas</span>
                      <span>{item.processedData.relatedProblems.length} problemas</span>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Back to Search Button */}
            <div className="mt-8 text-center">
              <button
                onClick={() => setActiveView('search')}
                className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-3 rounded-lg font-medium transition-colors"
              >
                ← Volver a Búsqueda
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default App;