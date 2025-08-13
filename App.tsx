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
import './App.css';

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

  // Función para manejar el chat
  const handleChatMessage = useCallback(async (message: string) => {
    if (!message.trim()) return;
    
    const userMessage: ChatMessage = {
      role: 'user',
      content: message
    };
    
    setAssistantHistory(prev => [...prev, userMessage]);
    setAssistantInput('');
    
    try {
      const stream = await getAssistantResponseStream(message, selectedSubject);
      let fullResponse = '';
      
      for await (const chunk of stream) {
        fullResponse += chunk;
        // Actualizar la respuesta en tiempo real
        setAssistantHistory(prev => {
          const newHistory = [...prev];
          const lastMessage = newHistory[newHistory.length - 1];
          if (lastMessage && lastMessage.role === 'model') {
            lastMessage.content = fullResponse;
          } else {
            newHistory.push({
              role: 'model',
              content: fullResponse
            });
          }
          return newHistory;
        });
      }
    } catch (error: any) {
      console.error('Error en chat:', error);
      setAssistantHistory(prev => [...prev, {
        role: 'model',
        content: `Error: ${error.message || 'No se pudo procesar tu mensaje'}`
      }]);
    }
  }, [selectedSubject]);

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

    const loadHistory = () => {
      try {
        const savedHistory = localStorage.getItem('gaussmathmind_history');
        if (savedHistory) {
          setAnalysisHistory(JSON.parse(savedHistory));
        }
      } catch (error) {
        console.error('Error loading history:', error);
      }
    };

    checkApiKey();
    checkSpeechSupport();
    loadHistory();
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
                className={`text-sm font-medium ${activeView === 'search' ? 'active' : 'text-gray-500 hover:text-gray-700'}`}
              >
                Buscar
              </button>
              <button
                onClick={() => setActiveView('library')}
                className={`text-sm font-medium ${activeView === 'library' ? 'active' : 'text-gray-500 hover:text-gray-700'}`}
              >
                Biblioteca
              </button>
              <button
                onClick={() => setActiveView('recent')}
                className={`text-sm font-medium ${activeView === 'recent' ? 'active' : 'text-gray-700'}`}
              >
                Recientes
              </button>
              <button
                onClick={() => setActiveView('study')}
                className={`text-sm font-medium ${activeView === 'study' ? 'active' : 'text-gray-500 hover:text-gray-700'}`}
              >
                Estudio
              </button>
              <button
                onClick={() => setActiveView('help')}
                className={`text-sm font-medium ${activeView === 'help' ? 'active' : 'text-gray-500 hover:text-gray-700'}`}
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
            <div className="search-type-selector">
              <button
                onClick={() => setSearchType('research')}
                className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-md text-sm font-medium transition-colors ${
                  searchType === 'research'
                    ? 'active'
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
                    ? 'active'
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
                    ? 'active'
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
              <div className="notes-input-area">
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
                  <div className="recording-indicator">
                    <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                    Grabando...
                  </div>
                )}
                <div className="action-buttons">
                  <button
                    onClick={handleToggleRecording}
                    disabled={isLoading}
                    className={`action-button ${
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
                    className={`action-button ${
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
                      <div className="loading-spinner"></div>
                    ) : (
                      <ChevronRightIcon className="w-6 h-6" />
                    )}
                  </button>
                </div>
              </div>

              {/* Loading State */}
              {isLoading && (
                <div className="loading-state">
                  <div className="flex items-center gap-3">
                    <div className="loading-spinner"></div>
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
                <div className="error-state">
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
              <div className="query-suggestions">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                  <p className="text-sm text-gray-700">Las preguntas más precisas funcionan mejor. Intenta agregar elementos como estos:</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button className="suggestion-tag">
                    Conceptos matemáticos
                  </button>
                  <button className="suggestion-tag">
                    Fórmulas y ecuaciones
                  </button>
                  <button className="suggestion-tag">
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
              <div className="tools-grid">
                <button 
                  onClick={handleScanClick}
                  className="tool-card hover-lift"
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
                  className={`tool-card hover-lift ${isRecording ? 'recording' : ''}`}
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
                  className="tool-card hover-lift"
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
          <div className="results-container">
            {/* Main Content Area */}
            <div className="results-main">
              {/* Header with Report Info */}
              <div className="report-header">
                {/* Document Title */}
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <p className="text-sm text-gray-500 mb-2">{new Date().toLocaleDateString('es-ES', { 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    }).toUpperCase()}</p>
                    <h1 className="report-title">{selectedSubject}</h1>
                  </div>
                  <div className="flex items-center gap-4">
                    <button 
                      onClick={() => {
                        if (navigator.share) {
                          navigator.share({
                            title: `Análisis de ${selectedSubject}`,
                            text: processedData.summary,
                            url: window.location.href
                          });
                        } else {
                          navigator.clipboard.writeText(processedData.summary);
                          alert('Análisis copiado al portapapeles');
                        }
                      }}
                      className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
                      title="Compartir análisis"
                    >
                      <span className="text-sm font-medium">Compartir</span>
                    </button>
                    <button 
                      onClick={() => {
                        const content = `
                          Análisis de ${selectedSubject}
                          ${new Date().toLocaleDateString('es-ES')}
                          
                          RESUMEN:
                          ${processedData.summary}
                          
                          CONCEPTOS CLAVE:
                          ${processedData.keyConcepts.map((c, i) => `${i+1}. ${c.concept}: ${c.definition}`).join('\n')}
                          
                          PREGUNTAS DE PRÁCTICA:
                          ${processedData.quizQuestions.map((q, i) => `${i+1}. ${q.question}`).join('\n')}
                          
                          PROBLEMAS RELACIONADOS:
                          ${processedData.relatedProblems.map((p, i) => `${i+1}. ${p.problem}`).join('\n')}
                        `;
                        const blob = new Blob([content], { type: 'text/plain' });
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = `analisis-${selectedSubject}-${new Date().toISOString().split('T')[0]}.txt`;
                        a.click();
                        URL.revokeObjectURL(url);
                      }}
                      className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
                      title="Descargar análisis"
                    >
                      <DownloadIcon className="w-4 h-4" />
                      <span className="text-sm font-medium">Descargar</span>
                    </button>
                  </div>
                </div>
                
                {/* Progress Indicator */}
                <div className="progress-indicator">
                  <div className="progress-dots">
                    <div className="progress-dot"></div>
                    <div className="progress-dot"></div>
                    <div className="progress-dot"></div>
                    <div className="progress-dot"></div>
                    <div className="progress-dot"></div>
                  </div>
                  <span className="text-sm font-medium text-gray-700">Análisis Completado</span>
                </div>
              </div>

              {/* Report Content */}
              <div className="report-content">
                {/* ABSTRACT Section */}
                <div className="report-section">
                  <h2>RESUMEN</h2>
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
                    <p className="text-gray-800 leading-relaxed text-sm">{processedData.summary}</p>
                  </div>
                </div>

                {/* METHODS Section */}
                <div className="report-section">
                  <h2>
                    METODOLOGÍA
                    <ChevronRightIcon className="w-4 h-4" />
                  </h2>
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
                    <p className="text-gray-800 leading-relaxed text-sm">
                      Analizamos los apuntes proporcionados usando inteligencia artificial avanzada. 
                      Se identificaron {processedData.keyConcepts.length} conceptos clave, 
                      se generaron {processedData.quizQuestions.length} preguntas de práctica, 
                      y se crearon {processedData.relatedProblems.length} problemas relacionados. 
                      Cada elemento fue revisado para asegurar precisión matemática y relevancia educativa.
                    </p>
                  </div>
                </div>

                {/* RESULTS Section */}
                <div className="report-section">
                  <h2>RESULTADOS</h2>
                  
                  {/* Summary Statistics */}
                  <div className="mb-8">
                    <h3>Resumen del Análisis</h3>
                    <div className="summary-stats">
                      <div className="stat-card">
                        <div className="stat-icon teal">{processedData.keyConcepts.length}</div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">Conceptos Clave</p>
                          <p className="text-xs text-gray-600">Identificados</p>
                        </div>
                      </div>
                      <div className="stat-card">
                        <div className="stat-icon blue">{processedData.quizQuestions.length}</div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">Preguntas</p>
                          <p className="text-xs text-gray-600">De práctica</p>
                        </div>
                      </div>
                      <div className="stat-card">
                        <div className="stat-icon green">{processedData.relatedProblems.length}</div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">Problemas</p>
                          <p className="text-xs text-gray-600">Relacionados</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Key Concepts */}
                  <div className="mb-8">
                    <h3>Conceptos Clave Identificados</h3>
                    <div className="grid gap-4">
                      {processedData.keyConcepts.map((concept, index) => (
                        <div key={index} className="concept-card">
                          <div className="flex items-start gap-4">
                            <div className="concept-number">
                              {index + 1}
                            </div>
                            <div className="flex-1">
                              <h4 className="text-lg font-semibold text-gray-900 mb-3">{concept.concept}</h4>
                              <p className="text-gray-700 leading-relaxed">{concept.definition}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Practice Questions */}
                  <div className="mb-8">
                    <h3>Preguntas de Práctica Generadas</h3>
                    <div className="grid gap-4">
                      {processedData.quizQuestions.map((question, index) => (
                        <div key={index} className="question-card">
                          <div className="flex items-start gap-4">
                            <div className="question-number">
                              {index + 1}
                            </div>
                            <div className="flex-1">
                              <h4 className="text-lg font-semibold text-gray-900 mb-3">{question.question}</h4>
                              <div className="flex items-center gap-2 mb-3">
                                <span className="question-type">
                                  {question.type}
                                </span>
                              </div>
                              <p className="text-gray-700 leading-relaxed">{question.answer}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Related Problems */}
                  <div>
                    <h3>Problemas Relacionados</h3>
                    <div className="grid gap-4">
                      {processedData.relatedProblems.map((problem, index) => (
                        <div key={index} className="problem-card">
                          <div className="flex items-start gap-4">
                            <div className="problem-number">
                              {index + 1}
                            </div>
                            <div className="flex-1">
                              <h4 className="text-lg font-semibold text-gray-900 mb-3">{problem.problem}</h4>
                              <p className="text-gray-700 leading-relaxed">{problem.solution}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Sidebar */}
            <div className="results-sidebar">
              {/* Report Status */}
              <div className="report-status">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Reporte</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-900">Estado</span>
                    <button className="text-gray-500 hover:text-gray-700">
                      <div className="flex">
                        <div className="w-3 h-3 border-t border-l border-gray-400 transform rotate-45"></div>
                        <div className="w-3 h-3 border-b border-r border-gray-400 transform -rotate-45"></div>
                      </div>
                    </button>
                  </div>
                  <div className="space-y-3">
                    <div className="status-item">
                      <div className="status-icon">
                        <CheckIcon className="w-3 h-3 text-white" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">Procesar contenido</p>
                        <p className="text-xs text-gray-600">Análisis completado</p>
                      </div>
                    </div>
                    <div className="status-item">
                      <div className="status-icon">
                        <CheckIcon className="w-3 h-3 text-white" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">Extraer conceptos</p>
                        <p className="text-xs text-gray-600">{processedData.keyConcepts.length} conceptos</p>
                      </div>
                    </div>
                    <div className="status-item">
                      <div className="status-icon">
                        <CheckIcon className="w-3 h-3 text-white" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">Generar preguntas</p>
                        <p className="text-xs text-gray-600">{processedData.quizQuestions.length} preguntas</p>
                      </div>
                    </div>
                    <div className="status-item">
                      <div className="status-icon">
                        <CheckIcon className="w-3 h-3 text-white" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">Crear problemas</p>
                        <p className="text-xs text-gray-600">{processedData.relatedProblems.length} problemas</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Chat Section */}
              <div className="chat-section">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Chat</h3>
                  <button 
                    onClick={() => setAssistantHistory([])}
                    className="text-gray-500 hover:text-gray-700"
                    title="Limpiar chat"
                  >
                    <RefreshCwIcon className="w-4 h-4" />
                  </button>
                </div>
                
                {/* Chat Messages */}
                <div className="chat-messages">
                  <div className="text-center text-gray-500 text-sm">
                    <p>Haz preguntas sobre el análisis</p>
                  </div>
                </div>
                
                {/* Chat Input */}
                <div className="chat-input">
                  <input
                    type="text"
                    placeholder="Pregunta sobre el análisis..."
                    className="flex-1 bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500 focus:outline-none"
                    onKeyPress={(e) => e.key === 'Enter' && handleChatMessage(e.currentTarget.value)}
                  />
                  <button 
                    onClick={() => {
                      const input = document.querySelector('.chat-input input') as HTMLInputElement;
                      if (input) handleChatMessage(input.value);
                    }}
                    className="px-3 py-2 rounded-lg text-sm font-medium bg-teal-600 hover:bg-teal-700 text-white transition-colors"
                  >
                    <ChevronRightIcon className="w-4 h-4" />
                  </button>
                </div>
                
                <button 
                  onClick={() => setActiveView('chat')}
                  className="w-full mt-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2 px-4 rounded-lg transition-colors"
                >
                  Chat Completo
                </button>
              </div>
            </div>
            
            {/* Back to Search Button */}
            <div className="mt-8 text-center">
              <button
                onClick={() => setActiveView('search')}
                className="back-button"
              >
                ← Volver a Búsqueda
              </button>
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
                    onKeyPress={(e) => e.key === 'Enter' && handleChatMessage(assistantInput)}
                  />
                  <button
                    onClick={() => handleChatMessage(assistantInput)}
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
              <div className="space-y-4">
                {analysisHistory.length === 0 ? (
                  <p className="text-gray-600">No hay análisis guardados en tu biblioteca</p>
                ) : (
                  analysisHistory.map((item) => (
                    <div key={item.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow">
                      <h3 className="font-semibold text-gray-900 mb-2">{item.title}</h3>
                      <p className="text-sm text-gray-600 mb-2">{item.subject}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(item.timestamp).toLocaleDateString('es-ES')}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {activeView === 'recent' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Recientes</h2>
              <div className="space-y-4">
                {analysisHistory.slice(0, 5).map((item) => (
                  <div key={item.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow">
                    <h3 className="font-semibold text-gray-900 mb-2">{item.title}</h3>
                    <p className="text-sm text-gray-600 mb-2">{item.subject}</p>
                    <p className="text-xs text-gray-500">
                      {new Date(item.timestamp).toLocaleDateString('es-ES')}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeView === 'study' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Estudio</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="border border-gray-200 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-2">Progreso General</h3>
                  <p className="text-sm text-gray-600">Materias estudiadas: {analysisHistory.length}</p>
                </div>
                <div className="border border-gray-200 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-2">Próxima Revisión</h3>
                  <p className="text-sm text-gray-600">No hay revisiones programadas</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeView === 'help' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Ayuda</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">¿Cómo usar la aplicación?</h3>
                  <ol className="list-decimal list-inside space-y-2 text-sm text-gray-600">
                    <li>Selecciona la materia que quieres estudiar</li>
                    <li>Pega tus apuntes o describe lo que quieres aprender</li>
                    <li>Haz clic en "Procesar apuntes"</li>
                    <li>Revisa el análisis generado</li>
                    <li>Usa el chat para hacer preguntas adicionales</li>
                  </ol>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Funciones disponibles</h3>
                  <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
                    <li>Procesamiento de apuntes con IA</li>
                    <li>Generación de quizzes</li>
                    <li>Búsqueda de problemas relacionados</li>
                    <li>Chat con IA para dudas</li>
                    <li>Escaneo de imágenes</li>
                    <li>Grabación de voz</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default App;