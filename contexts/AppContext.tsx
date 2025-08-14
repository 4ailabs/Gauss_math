import React, { createContext, useContext, useReducer, useCallback, ReactNode } from 'react';
import { ProcessedData, ChatMessage, AnalysisHistory } from '../types';

// Types for app state
interface AppState {
  // Content and processing
  notes: string;
  processedData: ProcessedData | null;
  selectedSubject: string;
  
  // UI state
  activeView: 'search' | 'results' | 'chat' | 'library' | 'help' | 'recent' | 'study';
  searchType: 'research' | 'systematic' | 'papers';
  gatherType: 'papers' | 'trials';
  
  // Loading and error states
  isLoading: boolean;
  isScanning: boolean;
  isRecording: boolean;
  error: string | null;
  isApiKeyMissing: boolean;
  isSpeechSupported: boolean;
  processingProgress: number;
  processingStep: string;
  
  // Chat
  assistantHistory: ChatMessage[];
  assistantInput: string;
  
  // History
  analysisHistory: AnalysisHistory[];
}

// Action types
type AppAction =
  | { type: 'SET_NOTES'; payload: string }
  | { type: 'SET_PROCESSED_DATA'; payload: ProcessedData | null }
  | { type: 'SET_SELECTED_SUBJECT'; payload: string }
  | { type: 'SET_ACTIVE_VIEW'; payload: AppState['activeView'] }
  | { type: 'SET_SEARCH_TYPE'; payload: AppState['searchType'] }
  | { type: 'SET_GATHER_TYPE'; payload: AppState['gatherType'] }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_SCANNING'; payload: boolean }
  | { type: 'SET_RECORDING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_API_KEY_MISSING'; payload: boolean }
  | { type: 'SET_SPEECH_SUPPORTED'; payload: boolean }
  | { type: 'SET_PROCESSING_PROGRESS'; payload: number }
  | { type: 'SET_PROCESSING_STEP'; payload: string }
  | { type: 'SET_ASSISTANT_HISTORY'; payload: ChatMessage[] }
  | { type: 'ADD_ASSISTANT_MESSAGE'; payload: ChatMessage }
  | { type: 'UPDATE_LAST_ASSISTANT_MESSAGE'; payload: string }
  | { type: 'SET_ASSISTANT_INPUT'; payload: string }
  | { type: 'SET_ANALYSIS_HISTORY'; payload: AnalysisHistory[] }
  | { type: 'ADD_TO_HISTORY'; payload: AnalysisHistory }
  | { type: 'REMOVE_FROM_HISTORY'; payload: string }
  | { type: 'CLEAR_ANALYSIS_HISTORY' }
  | { type: 'CLEAR_ASSISTANT_HISTORY' };

// Initial state
const initialState: AppState = {
  notes: '',
  processedData: null,
  selectedSubject: 'Investigación en Matemáticas Aplicadas y Computación',
  activeView: 'search',
  searchType: 'research',
  gatherType: 'papers',
  isLoading: false,
  isScanning: false,
  isRecording: false,
  error: null,
  isApiKeyMissing: false,
  isSpeechSupported: false,
  processingProgress: 0,
  processingStep: '',
  assistantHistory: [],
  assistantInput: '',
  analysisHistory: [],
};

// Reducer
const appReducer = (state: AppState, action: AppAction): AppState => {
  switch (action.type) {
    case 'SET_NOTES':
      return { ...state, notes: action.payload };
    case 'SET_PROCESSED_DATA':
      return { ...state, processedData: action.payload };
    case 'SET_SELECTED_SUBJECT':
      return { ...state, selectedSubject: action.payload };
    case 'SET_ACTIVE_VIEW':
      return { ...state, activeView: action.payload };
    case 'SET_SEARCH_TYPE':
      return { ...state, searchType: action.payload };
    case 'SET_GATHER_TYPE':
      return { ...state, gatherType: action.payload };
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_SCANNING':
      return { ...state, isScanning: action.payload };
    case 'SET_RECORDING':
      return { ...state, isRecording: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    case 'SET_API_KEY_MISSING':
      return { ...state, isApiKeyMissing: action.payload };
    case 'SET_SPEECH_SUPPORTED':
      return { ...state, isSpeechSupported: action.payload };
    case 'SET_PROCESSING_PROGRESS':
      return { ...state, processingProgress: action.payload };
    case 'SET_PROCESSING_STEP':
      return { ...state, processingStep: action.payload };
    case 'SET_ASSISTANT_HISTORY':
      return { ...state, assistantHistory: action.payload };
    case 'ADD_ASSISTANT_MESSAGE':
      return { ...state, assistantHistory: [...state.assistantHistory, action.payload] };
    case 'UPDATE_LAST_ASSISTANT_MESSAGE':
      const updatedHistory = [...state.assistantHistory];
      if (updatedHistory.length > 0) {
        const lastMessage = updatedHistory[updatedHistory.length - 1];
        if (lastMessage && lastMessage.role === 'model') {
          // Actualizar el último mensaje si es del modelo
          updatedHistory[updatedHistory.length - 1] = {
            ...lastMessage,
            content: action.payload
          };
        } else {
          // Si el último mensaje no es del modelo, buscar el último mensaje del modelo
          for (let i = updatedHistory.length - 1; i >= 0; i--) {
            if (updatedHistory[i].role === 'model') {
              updatedHistory[i] = {
                ...updatedHistory[i],
                content: action.payload
              };
              break;
            }
          }
        }
      }
      return { ...state, assistantHistory: updatedHistory };
    case 'SET_ASSISTANT_INPUT':
      return { ...state, assistantInput: action.payload };
    case 'SET_ANALYSIS_HISTORY':
      return { ...state, analysisHistory: action.payload };
    case 'ADD_TO_HISTORY':
      const newHistory = [action.payload, ...state.analysisHistory];
      return { ...state, analysisHistory: newHistory };
    case 'REMOVE_FROM_HISTORY':
      const filteredHistory = state.analysisHistory.filter(item => item.id !== action.payload);
      return { ...state, analysisHistory: filteredHistory };
    case 'CLEAR_ANALYSIS_HISTORY':
      return { ...state, analysisHistory: [] };
    case 'CLEAR_ASSISTANT_HISTORY':
      return { ...state, assistantHistory: [] };
    default:
      return state;
  }
};

// Context types
interface AppContextType {
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
  // Action creators
  setNotes: (notes: string) => void;
  setProcessedData: (data: ProcessedData | null) => void;
  setSelectedSubject: (subject: string) => void;
  setActiveView: (view: AppState['activeView']) => void;
  setSearchType: (type: AppState['searchType']) => void;
  setGatherType: (type: AppState['gatherType']) => void;
  setLoading: (loading: boolean) => void;
  setScanning: (scanning: boolean) => void;
  setRecording: (recording: boolean) => void;
  setError: (error: string | null) => void;
  setApiKeyMissing: (missing: boolean) => void;
  setSpeechSupported: (supported: boolean) => void;
  setProcessingProgress: (progress: number) => void;
  setProcessingStep: (step: string) => void;
  setAssistantHistory: (history: ChatMessage[]) => void;
  addAssistantMessage: (message: ChatMessage) => void;
  updateLastAssistantMessage: (content: string) => void;
  setAssistantInput: (input: string) => void;
  setAnalysisHistory: (history: AnalysisHistory[]) => void;
  addToHistory: (item: AnalysisHistory) => void;
  loadFromHistory: (item: AnalysisHistory) => void;
  removeFromHistory: (id: string) => void;
  clearAnalysisHistory: () => void;
  clearAssistantHistory: () => void;
}

// Create context
const AppContext = createContext<AppContextType | undefined>(undefined);

// Provider component
interface AppProviderProps {
  children: ReactNode;
}

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // Action creators
  const setNotes = useCallback((notes: string) => {
    dispatch({ type: 'SET_NOTES', payload: notes });
  }, []);

  const setProcessedData = useCallback((data: ProcessedData | null) => {
    dispatch({ type: 'SET_PROCESSED_DATA', payload: data });
  }, []);

  const setSelectedSubject = useCallback((subject: string) => {
    dispatch({ type: 'SET_SELECTED_SUBJECT', payload: subject });
  }, []);

  const setActiveView = useCallback((view: AppState['activeView']) => {
    dispatch({ type: 'SET_ACTIVE_VIEW', payload: view });
  }, []);

  const setSearchType = useCallback((type: AppState['searchType']) => {
    dispatch({ type: 'SET_SEARCH_TYPE', payload: type });
  }, []);

  const setGatherType = useCallback((type: AppState['gatherType']) => {
    dispatch({ type: 'SET_GATHER_TYPE', payload: type });
  }, []);

  const setLoading = useCallback((loading: boolean) => {
    dispatch({ type: 'SET_LOADING', payload: loading });
  }, []);

  const setScanning = useCallback((scanning: boolean) => {
    dispatch({ type: 'SET_SCANNING', payload: scanning });
  }, []);

  const setRecording = useCallback((recording: boolean) => {
    dispatch({ type: 'SET_RECORDING', payload: recording });
  }, []);

  const setError = useCallback((error: string | null) => {
    dispatch({ type: 'SET_ERROR', payload: error });
  }, []);

  const setApiKeyMissing = useCallback((missing: boolean) => {
    dispatch({ type: 'SET_API_KEY_MISSING', payload: missing });
  }, []);

  const setSpeechSupported = useCallback((supported: boolean) => {
    dispatch({ type: 'SET_SPEECH_SUPPORTED', payload: supported });
  }, []);

  const setProcessingProgress = useCallback((progress: number) => {
    dispatch({ type: 'SET_PROCESSING_PROGRESS', payload: progress });
  }, []);

  const setProcessingStep = useCallback((step: string) => {
    dispatch({ type: 'SET_PROCESSING_STEP', payload: step });
  }, []);

  const setAssistantHistory = useCallback((history: ChatMessage[]) => {
    dispatch({ type: 'SET_ASSISTANT_HISTORY', payload: history });
  }, []);

  const addAssistantMessage = useCallback((message: ChatMessage) => {
    dispatch({ type: 'ADD_ASSISTANT_MESSAGE', payload: message });
  }, []);

  const updateLastAssistantMessage = useCallback((content: string) => {
    dispatch({ type: 'UPDATE_LAST_ASSISTANT_MESSAGE', payload: content });
  }, []);

  const setAssistantInput = useCallback((input: string) => {
    dispatch({ type: 'SET_ASSISTANT_INPUT', payload: input });
  }, []);

  const setAnalysisHistory = useCallback((history: AnalysisHistory[]) => {
    dispatch({ type: 'SET_ANALYSIS_HISTORY', payload: history });
  }, []);

  const addToHistory = useCallback((item: AnalysisHistory) => {
    dispatch({ type: 'ADD_TO_HISTORY', payload: item });
    // Persist to localStorage
    const newHistory = [item, ...state.analysisHistory];
    localStorage.setItem('gaussmathmind_history', JSON.stringify(newHistory));
  }, [state.analysisHistory]);

  const loadFromHistory = useCallback((item: AnalysisHistory) => {
    // Cargar los datos del historial al estado actual
    dispatch({ type: 'SET_NOTES', payload: item.notes });
    dispatch({ type: 'SET_PROCESSED_DATA', payload: item.processedData });
    dispatch({ type: 'SET_SELECTED_SUBJECT', payload: item.subject });
    dispatch({ type: 'SET_ACTIVE_VIEW', payload: 'results' });
  }, []);

  const clearAssistantHistory = useCallback(() => {
    dispatch({ type: 'CLEAR_ASSISTANT_HISTORY' });
  }, []);

  const removeFromHistory = useCallback((id: string) => {
    dispatch({ type: 'REMOVE_FROM_HISTORY', payload: id });
    // Persist to localStorage
    const newHistory = state.analysisHistory.filter(item => item.id !== id);
    localStorage.setItem('gaussmathmind_history', JSON.stringify(newHistory));
  }, [state.analysisHistory]);

  const clearAnalysisHistory = useCallback(() => {
    dispatch({ type: 'CLEAR_ANALYSIS_HISTORY' });
    // Clear localStorage
    localStorage.removeItem('gaussmathmind_history');
  }, []);

  const value: AppContextType = {
    state,
    dispatch,
    setNotes,
    setProcessedData,
    setSelectedSubject,
    setActiveView,
    setSearchType,
    setGatherType,
    setLoading,
    setScanning,
    setRecording,
    setError,
    setApiKeyMissing,
    setSpeechSupported,
    setProcessingProgress,
    setProcessingStep,
    setAssistantHistory,
    addAssistantMessage,
    updateLastAssistantMessage,
    setAssistantInput,
    setAnalysisHistory,
    addToHistory,
    loadFromHistory,
    removeFromHistory,
    clearAnalysisHistory,
    clearAssistantHistory,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

// Custom hook to use the context
export const useApp = (): AppContextType => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};