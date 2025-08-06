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
  FileTextIcon
} from './components/ui/Icons';

declare global {
    interface Window {
        renderMathInElement: (element: HTMLElement, options?: any) => void;
        jsPDF: any;
        html2canvas: any;
        SpeechRecognition: any;
        webkitSpeechRecognition: any;
    }
}

// Helper component for styled textareas
const StyledTextarea: React.FC<React.TextareaHTMLAttributes<HTMLTextAreaElement>> = (props) => (
  <textarea
    {...props}
    className="w-full h-full p-3 sm:p-4 bg-slate-900/50 border border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none resize-none transition-colors text-sm sm:text-base"
  />
);

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
      setError(e.message || "Ocurrió un error desconocido.");
      setProcessedData(null);
    } finally {
      setIsLoading(false);
    }
  }, [notes, selectedSubject]);
  
    const handleExportToPdf = useCallback(async () => {
        if (!processedData) return;
    
        const { jsPDF } = window.jsPDF;
        const input = document.getElementById('processed-output-content');
    
        if (!input) {
            setError("No se pudo encontrar el contenido para exportar.");
            return;
        }
    
        setIsExporting(true);
        setError(null);
    
        try {
            const canvas = await window.html2canvas(input, {
                scale: 2, 
                useCORS: true,
                backgroundColor: '#1e293b'
            });
    
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF({
                orientation: 'p',
                unit: 'mm',
                format: 'a4'
            });
    
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = pdf.internal.pageSize.getHeight();
            const canvasWidth = canvas.width;
            const canvasHeight = canvas.height;
            const ratio = canvasWidth / pdfWidth;
            const imgHeight = canvasHeight / ratio;
    
            let heightLeft = imgHeight;
            let position = 0;
    
            pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, imgHeight, undefined, 'FAST');
            heightLeft -= pdfHeight;
    
            while (heightLeft > 0) {
                position = heightLeft - imgHeight;
                pdf.addPage();
                pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, imgHeight, undefined, 'FAST');
                heightLeft -= pdfHeight;
            }
    
            pdf.save(`Gauss_MathMind_Apuntes_${selectedSubject.replace(/\s/g, '_')}.pdf`);
        } catch (e) {
            console.error("Error al exportar a PDF:", e);
            setError("Ocurrió un error al generar el PDF.");
        } finally {
            setIsExporting(false);
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

      for await (const chunk of stream) {
          fullResponse += chunk.text;
          setAssistantHistory(prev => prev.map((msg, index) => 
            index === prev.length - 1 ? { ...msg, content: fullResponse } : msg
          ));
      }
    } catch (e: any) {
      const errorResponse: ChatMessage = { role: 'model', content: "Lo siento, no pude obtener una respuesta. Por favor, inténtalo de nuevo." };
      setAssistantHistory(prev => [...prev, errorResponse]);
    } finally {
      setIsAssistantLoading(false);
    }
  }, [assistantInput, isAssistantLoading, selectedSubject]);
  
  const handleResetAssistantChat = () => {
      resetAssistantChat(selectedSubject);
      setAssistantHistory([]);
  };

  if (isApiKeyMissing) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-200 flex items-center justify-center p-4">
        <div className="max-w-md text-center bg-slate-900 p-8 rounded-lg shadow-lg">
          <h1 className="text-3xl font-bold text-red-500 mb-4">Error de Configuración</h1>
          <p className="text-slate-300">
            La variable de entorno <code>API_KEY</code> no está configurada. Por favor, asegúrate de que tu API Key de Google AI está disponible para que la aplicación funcione.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 p-2 sm:p-4 lg:p-8">
      <div className="max-w-screen-2xl mx-auto flex flex-col min-h-[calc(100vh-1rem)] sm:min-h-[calc(100vh-2rem)]">
        <header className="text-center mb-4 sm:mb-6">
          <div className="flex items-center justify-center gap-2 mb-2">
            <SparklesIcon className="w-6 h-6 sm:w-8 sm:h-8 text-blue-400 animate-pulse" />
            <h1 className="text-2xl sm:text-4xl lg:text-5xl font-bold text-white tracking-tight">
              Gauss MathMind <span className="text-blue-400">IA</span>
            </h1>
            <ZapIcon className="w-6 h-6 sm:w-8 sm:h-8 text-blue-400 animate-pulse" />
          </div>
          <p className="mt-1 sm:mt-2 text-sm sm:text-lg text-slate-400 px-2 flex items-center justify-center gap-2">
            <CalculatorIcon className="w-4 h-4 text-slate-500" />
            Captura, procesa y domina tus apuntes de matemáticas avanzadas.
            <LightbulbIcon className="w-4 h-4 text-slate-500" />
          </p>
        </header>

        {/* Mobile Navigation - Improved */}
        <div className="lg:hidden mb-4 border-b border-slate-700 sticky top-0 bg-slate-950/95 backdrop-blur-sm z-10">
            <div className="flex justify-around">
                <TabButton onClick={() => setActiveView('editor')} active={activeView === 'editor'} icon={<BookOpenIcon className="w-4 h-4 sm:w-5 sm:h-5"/>}>Editor</TabButton>
                <TabButton onClick={() => setActiveView('assistant')} active={activeView === 'assistant'} icon={<MessageCircleIcon className="w-4 h-4 sm:w-5 sm:h-5"/>}>IA</TabButton>
                <TabButton onClick={() => setActiveView('summary')} active={activeView === 'summary'} icon={<BrainCircuitIcon className="w-4 h-4 sm:w-5 sm:h-5"/>}>Resultados</TabButton>
            </div>
        </div>

        <main className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 flex-grow">
          {/* Column 1: Editor */}
          <div className={`flex-col gap-3 sm:gap-4 lg:col-span-1 ${activeView === 'editor' ? 'flex' : 'hidden'} lg:flex`}>
            <h2 className="text-xl sm:text-2xl font-semibold text-white flex items-center gap-2">
                <BookOpenIcon className="w-5 h-5 sm:w-6 sm:h-6 text-blue-400"/>
                Editor de Apuntes
            </h2>
             <div className="relative">
                <label htmlFor="subject-select" className="sr-only">Seleccionar Materia</label>
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                     <HashIcon className="w-4 h-4 sm:w-5 sm:h-5 text-blue-400" />
                </div>
                <select
                    id="subject-select"
                    value={selectedSubject}
                    onChange={(e) => setSelectedSubject(e.target.value)}
                    className="w-full bg-slate-900/50 border border-slate-700 rounded-lg p-2 sm:p-3 pl-8 sm:pl-10 text-sm sm:text-base text-white focus:ring-2 focus:ring-blue-500 focus:outline-none appearance-none"
                >
                    {subjects.map(subject => ( <option key={subject} value={subject}>{subject}</option>))}
                </select>
             </div>

            <div className="bg-slate-900 rounded-lg p-1 shadow-lg flex-grow flex flex-col min-h-[400px] sm:min-h-[500px] lg:min-h-[550px]">
                <StyledTextarea
                placeholder="Escribe, pega o escanea tus apuntes de matemáticas aquí. Usa LaTeX para las fórmulas, ej., \\( \\int_a^b x^2 dx \\)..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                />
            </div>
            {error && (
                <div className="flex items-center gap-2 text-red-400 text-xs sm:text-sm animate-fade-in px-2 bg-red-900/20 rounded-lg py-2">
                    <AlertCircleIcon className="w-4 h-4 flex-shrink-0" />
                    {error}
                </div>
            )}
            <div className="flex flex-col gap-2 sm:gap-4">
                 <button onClick={handleProcessNotes} disabled={isLoading || isScanning || isExporting || isRecording} className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:from-slate-700 disabled:to-slate-800 text-white font-bold py-2 sm:py-3 px-3 sm:px-4 rounded-lg transition-all transform hover:scale-105 text-sm sm:text-base shadow-lg">
                    {isLoading ? (
                        <>
                            <LoaderCircleIcon className="animate-spin w-4 h-4 sm:w-5 sm:h-5"/> 
                            Procesando...
                        </>
                    ) : (
                        <>
                            <BrainCircuitIcon className="w-4 h-4 sm:w-5 sm:h-5"/> 
                            Procesar Apuntes
                        </>
                    )}
                </button>
                <div className="grid grid-cols-2 gap-2 sm:flex sm:gap-4">
                    <button
                        onClick={handleToggleRecording}
                        disabled={isLoading || isScanning || isExporting || !isSpeechSupported}
                        className={`flex items-center justify-center gap-1 sm:gap-2 font-bold py-2 sm:py-3 px-2 sm:px-4 rounded-lg transition-all text-xs sm:text-sm ${
                            !isSpeechSupported
                            ? 'bg-slate-800 text-slate-500 cursor-not-allowed opacity-50'
                            : isRecording
                            ? 'bg-red-600 hover:bg-red-700 text-white'
                            : 'bg-slate-800 hover:bg-slate-700 text-white'
                        }`}
                        title={!isSpeechSupported ? "El reconocimiento de voz no es compatible con este navegador." : isRecording ? "Detener grabación" : "Grabar audio"}
                    >
                        {isRecording ? (
                            <>
                                <MicIcon className="w-4 h-4 sm:w-5 sm:h-5 animate-pulse" /> 
                                <span className="hidden sm:inline">Detener</span>
                            </>
                        ) : (
                            <>
                                <MicIcon className="w-4 h-4 sm:w-5 sm:h-5" /> 
                                <span className="hidden sm:inline">Grabar</span>
                            </>
                        )}
                    </button>
                    <button 
                        onClick={handleScanClick} 
                        disabled={isLoading || isScanning || isExporting || isRecording} 
                        className="flex items-center justify-center gap-1 sm:gap-2 bg-slate-800 hover:bg-slate-700 disabled:bg-slate-700 disabled:opacity-50 text-white font-bold py-2 sm:py-3 px-2 sm:px-4 rounded-lg transition-all text-xs sm:text-sm"
                        title="Escanea imágenes de apuntes (JPG, PNG, WebP, máx. 10MB)"
                    >
                        {isScanning ? (
                            <>
                                <LoaderCircleIcon className="animate-spin w-4 h-4 sm:w-5 sm:h-5"/> 
                                <span className="hidden sm:inline">Escaneando...</span>
                            </>
                        ) : (
                            <>
                                <CameraIcon className="w-4 h-4 sm:w-5 sm:h-5"/> 
                                <span className="hidden sm:inline">Escanear</span>
                            </>
                        )}
                    </button>
                </div>
                <input type="file" ref={imageInputRef} onChange={handleImageSelected} accept="image/*" className="hidden"/>
            </div>
          </div>

          {/* Column 2: AI Assistant */}
          <div className={`flex-col gap-3 sm:gap-4 lg:col-span-1 ${activeView === 'assistant' ? 'flex' : 'hidden'} lg:flex`}>
            <div className="flex justify-between items-center">
                <h2 className="text-xl sm:text-2xl font-semibold text-white flex items-center gap-2">
                    <MessageCircleIcon className="w-5 h-5 sm:w-6 sm:h-6 text-blue-400"/>
                    IA
                </h2>
                <button 
                    onClick={handleResetAssistantChat} 
                    title="Reiniciar conversación"
                    className="text-slate-400 hover:text-blue-400 transition-colors disabled:opacity-50 p-1"
                    disabled={isAssistantLoading}
                >
                    <RefreshCwIcon className="w-4 h-4 sm:w-5 sm:h-5"/>
                </button>
            </div>
             <div className="bg-slate-900/70 rounded-lg shadow-lg flex-grow flex flex-col p-3 sm:p-4 min-h-[400px] sm:min-h-[500px] lg:min-h-[660px]">
                <AssistantView 
                    history={assistantHistory} 
                    inputValue={assistantInput} 
                    onInputChange={(e) => setAssistantInput(e.target.value)} 
                    onSubmit={handleAssistantSubmit} 
                    isLoading={isAssistantLoading} 
                    subject={selectedSubject} 
                />
            </div>
          </div>

          {/* Column 3: Processed Notes */}
          <div className={`flex-col gap-3 sm:gap-4 lg:col-span-1 ${activeView === 'summary' ? 'flex' : 'hidden'} lg:flex`}>
            <h2 className="text-xl sm:text-2xl font-semibold text-white flex items-center gap-2">
                <BrainCircuitIcon className="w-5 h-5 sm:w-6 sm:h-6 text-blue-400"/>
                Apuntes Procesados
            </h2>
            <div id="processed-output" className="bg-slate-900/70 rounded-lg shadow-lg flex-grow p-3 sm:p-6 min-h-[400px] sm:min-h-[500px] lg:min-h-[660px]">
              <SummaryView data={processedData} isLoading={isLoading} onExport={handleExportToPdf} isExporting={isExporting} />
            </div>
          </div>
        </main>

        <footer className="text-center mt-6 sm:mt-8 py-3 sm:py-4 border-t border-slate-800">
            <p className="text-slate-500 text-xs sm:text-sm">Desarrollado por 4ailabs</p>
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

const SummaryView: React.FC<{data: ProcessedData | null, isLoading: boolean, onExport: () => void, isExporting: boolean}> = ({ data, isLoading, onExport, isExporting }) => {
    if (isLoading) return <div className="flex items-center justify-center h-full"><LoaderCircleIcon className="w-8 h-8 sm:w-10 sm:h-10 animate-spin text-blue-400" /></div>;
    if (!data) return <div className="flex items-center justify-center h-full text-slate-400 text-center p-4"><p className="text-sm sm:text-base">Procesa tus apuntes para ver el análisis de la IA aquí.</p></div>;

    return (
        <div className="animate-fade-in h-full flex flex-col">
            <div className="flex-shrink-0 mb-3 sm:mb-4 flex justify-end">
                <button 
                    onClick={onExport} 
                    disabled={isExporting}
                    className="flex items-center justify-center gap-1 sm:gap-2 bg-slate-800 hover:bg-slate-700 disabled:bg-slate-700 disabled:opacity-50 text-white font-bold py-1.5 sm:py-2 px-2 sm:px-3 rounded-lg transition-all text-xs sm:text-sm"
                >
                    {isExporting ? 
                        <><LoaderCircleIcon className="animate-spin w-4 h-4 sm:w-5 sm:h-5"/> <span className="hidden sm:inline">Exportando...</span></> : 
                        <><DownloadIcon className="w-4 h-4 sm:w-5 sm:h-5"/> <span className="hidden sm:inline">Exportar PDF</span></>
                    }
                </button>
            </div>
            <div id="processed-output-content" className="space-y-6 sm:space-y-8 overflow-y-auto flex-grow pr-1 sm:pr-2">
                <div>
                    <h3 className="text-lg sm:text-xl font-bold text-blue-400 mb-2 flex items-center gap-2">
                        <FileTextIcon className="w-5 h-5" />
                        Resumen
                    </h3>
                    <p className="text-slate-300 whitespace-pre-wrap text-sm sm:text-base">{data.summary}</p>
                </div>
                <div>
                    <h3 className="text-lg sm:text-xl font-bold text-blue-400 mb-3 sm:mb-4 flex items-center gap-2">
                        <TargetIcon className="w-5 h-5" />
                        Conceptos Clave (Flashcards)
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                        {data.keyConcepts.map((item, index) => (
                            <Flashcard key={index} concept={item.concept} definition={item.definition} />
                        ))}
                    </div>
                </div>
                 {data.relatedProblems?.length > 0 && (
                     <div>
                        <h3 className="text-lg sm:text-xl font-bold text-blue-400 mb-2 sm:mb-3 flex items-center gap-2">
                            <CalculatorIcon className="w-5 h-5" />
                            Problemas para Practicar
                        </h3>
                        <ul className="space-y-2 sm:space-y-3">
                            {data.relatedProblems.map((item, index) => (
                               <details key={index} className="p-2 sm:p-3 bg-slate-900/50 rounded-md cursor-pointer group">
                                   <summary className="font-semibold text-white list-none flex justify-between items-center gap-2 text-sm sm:text-base">
                                       <span className="flex-1">{item.problem}</span>
                                       <svg className="w-3 h-3 sm:w-4 sm:h-4 transition-transform transform group-open:rotate-90" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
                                   </summary>
                                   <div className="text-slate-300 mt-2 pt-2 border-t border-slate-700 whitespace-pre-wrap text-xs sm:text-sm">
                                       <div className="flex items-center gap-2 mb-1">
                                           <CheckCircleIcon className="w-4 h-4 text-green-400" />
                                           <strong>Solución:</strong>
                                       </div>
                                       {item.solution}
                                   </div>
                               </details>
                            ))}
                        </ul>
                    </div>
                )}
                 <div>
                    <h3 className="text-lg sm:text-xl font-bold text-blue-400 mb-2 sm:mb-3 flex items-center gap-2">
                        <BrainCircuitIcon className="w-5 h-5" />
                        Ponte a Prueba
                    </h3>
                    <ul className="space-y-2 sm:space-y-3">
                        {data.quizQuestions.map((item, index) => (
                           <details key={index} className="p-2 sm:p-3 bg-slate-900/50 rounded-md cursor-pointer group">
                               <summary className="font-semibold text-white list-none flex justify-between items-center gap-2 text-sm sm:text-base">
                                   <span className="flex-1">{item.question}</span>
                                   <span className="text-blue-400 text-xs uppercase font-bold mr-1 sm:mr-2 bg-blue-900/50 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full">{item.type}</span>
                                   <svg className="w-3 h-3 sm:w-4 sm:h-4 transition-transform transform group-open:rotate-90" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
                               </summary>
                               <div className="text-slate-300 mt-2 pt-2 border-t border-slate-700 whitespace-pre-wrap text-xs sm:text-sm">
                                   <div className="flex items-center gap-2 mb-1">
                                       <LightbulbIcon className="w-4 h-4 text-yellow-400" />
                                       <strong>Respuesta:</strong>
                                   </div>
                                   {item.answer}
                               </div>
                           </details>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );
};

const AssistantView: React.FC<{history: ChatMessage[], inputValue: string, onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void, onSubmit: (e: React.FormEvent) => void, isLoading: boolean, subject: string}> = ({ history, inputValue, onInputChange, onSubmit, isLoading, subject }) => {
     const chatEndRef = useRef<HTMLDivElement>(null);
     useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
     }, [history]);

    return (
        <div className="flex flex-col h-full">
            <div className="flex-grow overflow-y-auto pr-1 sm:pr-2 space-y-3 sm:space-y-4">
                {history.length === 0 ? (
                    <div className="flex items-center justify-center h-full text-slate-400 text-center">
                        <div>
                            <p className="mb-2 text-sm sm:text-base">Soy tu IA para</p>
                            <strong className="text-blue-400 block text-sm sm:text-base">{subject}</strong>
                            <p className="mt-2 text-xs sm:text-sm">¡Pregúntame cualquier cosa!</p>
                        </div>
                    </div>
                ) : (
                    history.map((msg, index) => (
                        <div key={index} className={`flex items-start gap-2 sm:gap-3 ${msg.role === 'user' ? 'justify-end' : ''}`}>
                             {msg.role === 'model' && <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-blue-500 flex items-center justify-center flex-shrink-0 mt-1"><BrainCircuitIcon className="w-3 h-3 sm:w-5 sm:h-5 text-white"/></div>}
                            <div className={`max-w-[85%] sm:max-w-xl p-2 sm:p-3 rounded-lg text-xs sm:text-sm ${msg.role === 'user' ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-200'}`}>
                                <p className="whitespace-pre-wrap">{msg.content}</p>
                            </div>
                        </div>
                    ))
                )}
                {isLoading && history[history.length-1]?.role === 'user' && (
                    <div className="flex items-start gap-2 sm:gap-3">
                        <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-blue-500 flex items-center justify-center flex-shrink-0 mt-1"><BrainCircuitIcon className="w-3 h-3 sm:w-5 sm:h-5 text-white"/></div>
                        <div className="max-w-[85%] sm:max-w-md p-2 sm:p-3 rounded-lg bg-slate-800 text-slate-200">
                           <LoaderCircleIcon className="w-4 h-4 sm:w-5 sm:h-5 animate-spin"/>
                        </div>
                    </div>
                )}
                 <div ref={chatEndRef} />
            </div>
            <form onSubmit={onSubmit} className="mt-3 sm:mt-4 flex gap-2">
                <input
                    type="text"
                    value={inputValue}
                    onChange={onInputChange}
                    placeholder="Pregúntale algo a la IA..."
                    className="flex-grow bg-slate-800 border border-slate-700 rounded-lg px-3 sm:px-4 py-2 text-sm sm:text-base focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    disabled={isLoading}
                />
                <button type="submit" disabled={isLoading || !inputValue.trim()} className="bg-blue-600 hover:bg-blue-700 disabled:bg-slate-700 disabled:cursor-not-allowed text-white font-bold p-2 rounded-lg transition-colors">
                    <SendIcon className="w-4 h-4 sm:w-5 sm:h-5"/>
                </button>
            </form>
        </div>
    );
};

export default App;