import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { ProcessedData, ChatMessage, AnalysisHistory, Flashcard, StudyProgress, StudyReminder } from './types';
import { processNotes, getAssistantResponseStream, resetAssistantChat, extractTextFromImage, generateQuiz, findProblems } from './services/geminiService';
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
  const [activeView, setActiveView] = useState<'search' | 'results' | 'chat' | 'library' | 'help' | 'recent' | 'study'>('search');
  const [searchType, setSearchType] = useState<'research' | 'systematic' | 'papers'>('research');
  const [gatherType, setGatherType] = useState<'papers' | 'trials'>('papers');
  const [selectedSubject, setSelectedSubject] = useState<string>('Cálculo Diferencial e Integral');
  const [analysisHistory, setAnalysisHistory] = useState<AnalysisHistory[]>([]);
  const [librarySearchTerm, setLibrarySearchTerm] = useState<string>('');
  const [selectedHistoryItem, setSelectedHistoryItem] = useState<AnalysisHistory | null>(null);
  const [sidebarChatMessage, setSidebarChatMessage] = useState('');
  const [sidebarChatHistory, setSidebarChatHistory] = useState<Array<{role: 'user' | 'assistant', content: string}>>([]);
  const [isSidebarChatLoading, setIsSidebarChatLoading] = useState(false);
  
  // Estados para sistema de estudio
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [studyProgress, setStudyProgress] = useState<StudyProgress[]>([]);
  const [studyReminders, setStudyReminders] = useState<StudyReminder[]>([]);

  // Refs
  const recognitionRef = useRef<any>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const assistantImageInputRef = useRef<HTMLInputElement>(null);
  const notesOnRecordStartRef = useRef<string>('');

  // Función simplificada para manejar el historial
  const saveToHistory = useCallback((processedData: ProcessedData) => {
    const newHistoryItem: AnalysisHistory = {
      id: Date.now().toString(),
      title: notes.substring(0, 50) + (notes.length > 50 ? '...' : ''),
      subject: selectedSubject,
      notes: notes,
      processedData: processedData,
      timestamp: Date.now(),
      tags: [selectedSubject],
      topics: processedData.keyConcepts.map(c => c.concept.split(' ')[0]),
      confidence: 0.5,
      lastReviewed: Date.now(),
      reviewCount: 0
    };
    
    const updatedHistory = [newHistoryItem, ...analysisHistory];
    setAnalysisHistory(updatedHistory);
    localStorage.setItem('gaussmathmind_history', JSON.stringify(updatedHistory));
  }, [notes, selectedSubject, analysisHistory]);

  // Función simplificada para procesar notas
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
      saveToHistory(data);
    } catch (e: any) {
      console.error("Error processing notes:", e);
      setError(e.message || "Ocurrió un error al procesar los apuntes.");
      setProcessedData(null);
    } finally {
      setIsLoading(false);
    }
  }, [notes, selectedSubject, saveToHistory]);

  // Función simplificada para búsqueda
  const handleSearch = () => {
    if (!notes.trim()) {
      setError("Los apuntes no pueden estar vacíos.");
      return;
    }
    handleProcessNotes();
  };

  // Función simplificada para toggle de grabación
  const handleToggleRecording = () => {
    if (!isSpeechSupported || isLoading || isScanning || isExporting) return;
    
    if (isRecording) {
      recognitionRef.current?.stop();
      setIsRecording(false);
    } else {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (!recognitionRef.current && SpeechRecognition) {
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
          console.error('Speech recognition error:', event.error);
          setIsRecording(false);
        };
      }
      
      notesOnRecordStartRef.current = notes;
      recognitionRef.current?.start();
      setIsRecording(true);
    }
  };

  // Función simplificada para escanear
  const handleScanClick = () => imageInputRef.current?.click();

  const handleImageSelected = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsScanning(true);
    setError(null);

    try {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      
      reader.onload = async () => {
        try {
          const result = reader.result as string;
          const base64String = result.split(',')[1];
          
          if (!base64String) {
            throw new Error("Error al procesar la imagen.");
          }
          
          const text = await extractTextFromImage(base64String, file.type);
          setNotes(text);
        } catch (e: any) {
          console.error("Error extracting text:", e);
          setError(e.message || "Error al extraer texto de la imagen.");
        } finally {
          setIsScanning(false);
        }
      };
      
      reader.onerror = () => {
        setError("Error al leer el archivo de imagen.");
        setIsScanning(false);
      };
    } catch (e: any) {
      console.error("Error processing image:", e);
      setError(e.message || "Error al procesar la imagen.");
      setIsScanning(false);
    }
  };

  // Función simplificada para chat del sidebar
  const handleSidebarChat = async () => {
    if (!sidebarChatMessage.trim() || !processedData) return;
    
    setIsSidebarChatLoading(true);
    
    try {
      const response = await getAssistantResponseStream(sidebarChatMessage, selectedSubject);
      setSidebarChatHistory(prev => [...prev, 
        { role: 'user', content: sidebarChatMessage },
        { role: 'assistant', content: response }
      ]);
      setSidebarChatMessage('');
    } catch (e: any) {
      console.error("Error in sidebar chat:", e);
      setError(e.message || "Error en el chat.");
    } finally {
      setIsSidebarChatLoading(false);
    }
  };

  // Función simplificada para imagen del asistente
  const handleAssistantImageSelected = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      setAssistantImage(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  // useEffect simplificado
  useEffect(() => {
    const checkApiKey = () => {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        setIsApiKeyMissing(true);
        setError("API Key de Google Gemini no configurada. Por favor, configura tu API Key en el archivo .env.local");
      }
    };

    const checkSpeechSupport = () => {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      setIsSpeechSupported(!!SpeechRecognition);
    };

    checkApiKey();
    checkSpeechSupport();
  }, []);

  // Renderizado simplificado
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-gray-900">Gauss∑ AI</h1>
            </div>
            <nav className="flex space-x-8">
              <button
                onClick={() => setActiveView('search')}
                className={`text-sm font-medium ${activeView === 'search' ? 'text-teal-600' : 'text-gray-500 hover:text-gray-700'}`}
              >
                Buscar
              </button>
              <button
                onClick={() => setActiveView('library')}
                className={`text-sm font-medium ${activeView === 'library' ? 'text-teal-600' : 'text-gray-500 hover:text-gray-700'}`}
              >
                Biblioteca
              </button>
              <button
                onClick={() => setActiveView('recent')}
                className={`text-sm font-medium ${activeView === 'recent' ? 'text-teal-600' : 'text-gray-500 hover:text-gray-700'}`}
              >
                Recientes
              </button>
              <button
                onClick={() => setActiveView('study')}
                className={`text-sm font-medium ${activeView === 'study' ? 'text-teal-600' : 'text-gray-500 hover:text-gray-700'}`}
              >
                Estudio
              </button>
              <button
                onClick={() => setActiveView('help')}
                className={`text-sm font-medium ${activeView === 'help' ? 'text-teal-600' : 'text-gray-500 hover:text-gray-700'}`}
              >
                Ayuda
              </button>
            </nav>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeView === 'search' && (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Procesa tus apuntes matemáticos con IA
              </h2>
              <p className="text-lg text-gray-600">
                Sube tus notas, genera resúmenes, conceptos clave y preguntas de práctica
              </p>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Materia
                  </label>
                  <select
                    value={selectedSubject}
                    onChange={(e) => setSelectedSubject(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  >
                    <option value="Cálculo Diferencial e Integral">Cálculo Diferencial e Integral</option>
                    <option value="Álgebra Lineal">Álgebra Lineal</option>
                    <option value="Probabilidad y Estadística">Probabilidad y Estadística</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Apuntes
                  </label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Pega aquí tus apuntes de clase..."
                    className="w-full h-32 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent resize-none"
                  />
                </div>

                <div className="flex space-x-4">
                  <button
                    onClick={handleSearch}
                    disabled={isLoading}
                    className="flex-1 bg-teal-600 text-white px-4 py-2 rounded-md hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 disabled:opacity-50"
                  >
                    {isLoading ? 'Procesando...' : 'Procesar Apuntes'}
                  </button>
                  <button
                    onClick={handleToggleRecording}
                    disabled={!isSpeechSupported || isLoading}
                    className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 disabled:opacity-50"
                  >
                    <MicIcon className="w-5 h-5" />
                  </button>
                  <button
                    onClick={handleScanClick}
                    disabled={isScanning}
                    className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 disabled:opacity-50"
                  >
                    <CameraIcon className="w-5 h-5" />
                  </button>
                </div>

                <input
                  ref={imageInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageSelected}
                  className="hidden"
                />
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-md p-4">
                <p className="text-red-800">{error}</p>
              </div>
            )}
          </div>
        )}

        {activeView === 'results' && processedData && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Resultados del Análisis</h2>
              
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Resumen</h3>
                  <p className="text-gray-700">{processedData.summary}</p>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Conceptos Clave</h3>
                  <ul className="space-y-2">
                    {processedData.keyConcepts.map((concept, index) => (
                      <li key={index} className="bg-gray-50 p-3 rounded-md">
                        <strong className="text-gray-900">{concept.concept}:</strong>
                        <span className="text-gray-700 ml-2">{concept.definition}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Preguntas de Práctica</h3>
                  <ul className="space-y-2">
                    {processedData.quizQuestions.map((question, index) => (
                      <li key={index} className="bg-gray-50 p-3 rounded-md">
                        <strong className="text-gray-900">Pregunta {index + 1}:</strong>
                        <span className="text-gray-700 ml-2">{question.question}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Problemas Relacionados</h3>
                  <ul className="space-y-2">
                    {processedData.relatedProblems.map((problem, index) => (
                      <li key={index} className="bg-gray-50 p-3 rounded-md">
                        <strong className="text-gray-900">Problema {index + 1}:</strong>
                        <span className="text-gray-700 ml-2">{problem.problem}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="mt-6 flex space-x-4">
                <button
                  onClick={() => setActiveView('chat')}
                  className="bg-teal-600 text-white px-4 py-2 rounded-md hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2"
                >
                  Ir al Chat
                </button>
                <button
                  onClick={() => setActiveView('search')}
                  className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                >
                  Volver
                </button>
              </div>
            </div>
          </div>
        )}

        {activeView === 'chat' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Chat con IA</h2>
              
              <div className="space-y-4">
                <div className="h-64 bg-gray-50 rounded-md p-4 overflow-y-auto">
                  {assistantHistory.length === 0 ? (
                    <p className="text-gray-500 text-center">Pregúntame cualquier cosa sobre tus apuntes</p>
                  ) : (
                    assistantHistory.map((message, index) => (
                      <div key={index} className={`mb-4 ${message.role === 'user' ? 'text-right' : 'text-left'}`}>
                        <div className={`inline-block p-3 rounded-lg ${
                          message.role === 'user' 
                            ? 'bg-teal-600 text-white' 
                            : 'bg-gray-200 text-gray-900'
                        }`}>
                          {message.content}
                        </div>
                      </div>
                    ))
                  )}
                </div>

                <div className="flex space-x-4">
                  <input
                    type="text"
                    value={assistantInput}
                    onChange={(e) => setAssistantInput(e.target.value)}
                    placeholder="Escribe tu pregunta..."
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  />
                  <button
                    onClick={() => {/* Implementar chat */}}
                    className="bg-teal-600 text-white px-4 py-2 rounded-md hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2"
                  >
                    Enviar
                  </button>
                </div>
              </div>

              <div className="mt-4">
                <button
                  onClick={() => setActiveView('search')}
                  className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                >
                  Volver
                </button>
              </div>
            </div>
          </div>
        )}

        {activeView === 'library' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Biblioteca</h2>
              <p className="text-gray-600">Aquí puedes ver tu historial de análisis</p>
            </div>
          </div>
        )}

        {activeView === 'recent' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Recientes</h2>
              <p className="text-gray-600">Aquí puedes ver tus análisis recientes</p>
            </div>
          </div>
        )}

        {activeView === 'study' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Estudio</h2>
              <p className="text-gray-600">Aquí puedes gestionar tu estudio</p>
            </div>
          </div>
        )}

        {activeView === 'help' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Ayuda</h2>
              <p className="text-gray-600">Aquí puedes encontrar ayuda sobre cómo usar la aplicación</p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default App;