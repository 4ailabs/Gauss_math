import React, { useState, useRef, useEffect, useCallback } from 'react';
import { ProcessedData, ChatMessage, AnalysisHistory } from './types';
import { processNotes, getAssistantResponseStream, extractTextFromImage } from './services/geminiService';
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
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [isSpeechSupported, setIsSpeechSupported] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isApiKeyMissing, setIsApiKeyMissing] = useState<boolean>(false);
  const [activeView, setActiveView] = useState<'search' | 'results' | 'chat' | 'library' | 'help' | 'recent' | 'study'>('search');
  const [searchType, setSearchType] = useState<'research' | 'systematic' | 'papers'>('research');
  const [gatherType, setGatherType] = useState<'papers' | 'trials'>('papers');
  const [selectedSubject, setSelectedSubject] = useState<string>('Cálculo Diferencial e Integral');
  const [analysisHistory, setAnalysisHistory] = useState<AnalysisHistory[]>([]);

  // Refs
  const recognitionRef = useRef<any>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
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
    if (!isSpeechSupported || isLoading || isScanning) return;
    
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
                  <option value="Cálculo Diferencial e Integral">Cálculo Diferencial e Integral</option>
                  <option value="Álgebra Lineal">Álgebra Lineal</option>
                  <option value="Probabilidad y Estadística">Probabilidad y Estadística</option>
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
                  placeholder={
                    searchType === 'research' 
                      ? "Pega tus apuntes de matemáticas aquí o describe lo que quieres estudiar..."
                      : searchType === 'systematic'
                      ? "Describe el tema o concepto para generar un quiz de evaluación..."
                      : "Describe el tipo de problemas que quieres encontrar o generar..."
                  }
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
                    className={`p-3 rounded-full transition-colors ${
                      isLoading 
                        ? 'bg-gray-400 cursor-not-allowed' 
                        : 'bg-teal-600 hover:bg-teal-700'
                    } text-white`}
                    title={
                      isLoading 
                        ? 'Procesando...' 
                        : searchType === 'research'
                        ? 'Procesar apuntes'
                        : searchType === 'systematic'
                        ? 'Generar quiz'
                        : 'Encontrar problemas'
                    }
                  >
                    {isLoading ? (
                      <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <ChevronRightIcon className="w-6 h-6" />
                    )}
                  </button>
                </div>
              </div>

              {/* Loading State */}
              {isLoading && (
                <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                    <div>
                      <p className="text-sm font-medium text-blue-900">
                        {searchType === 'research' 
                          ? 'Procesando apuntes...'
                          : searchType === 'systematic'
                          ? 'Generando quiz...'
                          : 'Buscando problemas...'
                        }
                      </p>
                      <p className="text-xs text-blue-700">Esto puede tomar unos segundos</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Error State */}
              {error && (
                <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs">!</span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-red-900">Error</p>
                      <p className="text-xs text-red-700">{error}</p>
                    </div>
                  </div>
                </div>
              )}

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

              {/* Inputs ocultos para imágenes */}
              <input type="file" ref={imageInputRef} onChange={handleImageSelected} accept="image/*" className="hidden"/>
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