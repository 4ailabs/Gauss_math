import React, { createContext, useContext, useReducer, useCallback, ReactNode } from 'react';
import { ProcessedData, ChatMessage, AnalysisHistory } from '../types';

// Export ResearchSession type for use in other components
export type { ResearchSession };

// Types for research session data
interface ResearchSession {
  id: string;
  query: string;
  searchType: 'research' | 'systematic' | 'papers';
  gatherType: 'papers' | 'trials';
  results: any[];
  progress: number;
  step: string;
  timestamp: number;
  assistantHistory: ChatMessage[];
}

// Types for app state
interface AppState {
  // Content and processing
  notes: string;
  processedData: ProcessedData | null;
  selectedSubject: string;
  
  // UI state
  activeView: 'search' | 'results' | 'chat' | 'library' | 'help' | 'recent' | 'study' | 'research';
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
  
  // Research session management
  currentResearchSession: ResearchSession | null;
  researchSessions: ResearchSession[];
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
  | { type: 'CLEAR_ASSISTANT_HISTORY' }
  | { type: 'START_RESEARCH_SESSION'; payload: ResearchSession }
  | { type: 'UPDATE_RESEARCH_SESSION'; payload: Partial<ResearchSession> }
  | { type: 'SAVE_RESEARCH_SESSION'; payload: ResearchSession }
  | { type: 'RESUME_RESEARCH_SESSION'; payload: ResearchSession }
  | { type: 'CLEAR_CURRENT_RESEARCH_SESSION' }
  | { type: 'SET_RESEARCH_SESSIONS'; payload: ResearchSession[] };

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
  currentResearchSession: null,
  researchSessions: [],
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
    case 'START_RESEARCH_SESSION':
      return { ...state, currentResearchSession: action.payload };
    case 'UPDATE_RESEARCH_SESSION':
      return { 
        ...state, 
        currentResearchSession: state.currentResearchSession 
          ? { ...state.currentResearchSession, ...action.payload }
          : null
      };
    case 'SAVE_RESEARCH_SESSION':
      const updatedSessions = [action.payload, ...state.researchSessions.filter(s => s.id !== action.payload.id)];
      return { 
        ...state, 
        researchSessions: updatedSessions,
        currentResearchSession: action.payload
      };
    case 'RESUME_RESEARCH_SESSION':
      return {
        ...state,
        currentResearchSession: action.payload,
        assistantHistory: action.payload.assistantHistory,
        searchType: action.payload.searchType,
        gatherType: action.payload.gatherType,
        processingProgress: action.payload.progress,
        processingStep: action.payload.step
      };
    case 'CLEAR_CURRENT_RESEARCH_SESSION':
      return { ...state, currentResearchSession: null };
    case 'SET_RESEARCH_SESSIONS':
      return { ...state, researchSessions: action.payload };
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
  // Research session management
  startResearchSession: (query: string) => void;
  updateResearchSession: (updates: Partial<ResearchSession>) => void;
  saveResearchSession: () => void;
  resumeResearchSession: (session: ResearchSession) => void;
  clearCurrentResearchSession: () => void;
  getAvailableResearchSessions: () => ResearchSession[];
}

// Create context
const AppContext = createContext<AppContextType | undefined>(undefined);

// Provider component
interface AppProviderProps {
  children: ReactNode;
}

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // Load persisted research sessions on mount
  React.useEffect(() => {
    const savedSessions = localStorage.getItem('gaussmathmind_research_sessions');
    if (savedSessions) {
      try {
        const sessions = JSON.parse(savedSessions);
        dispatch({ type: 'SET_RESEARCH_SESSIONS', payload: sessions });
      } catch (error) {
        console.error('Error loading research sessions:', error);
      }
    }

    // Check for active session
    const activeSession = localStorage.getItem('gaussmathmind_active_research');
    if (activeSession) {
      try {
        const session = JSON.parse(activeSession);
        dispatch({ type: 'RESUME_RESEARCH_SESSION', payload: session });
      } catch (error) {
        console.error('Error loading active research session:', error);
      }
    }
  }, []);

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

  // Research session management functions
  const startResearchSession = useCallback((query: string) => {
    const newSession: ResearchSession = {
      id: `research_${Date.now()}`,
      query,
      searchType: state.searchType,
      gatherType: state.gatherType,
      results: [],
      progress: 0,
      step: 'Starting research...',
      timestamp: Date.now(),
      assistantHistory: [...state.assistantHistory]
    };
    
    dispatch({ type: 'START_RESEARCH_SESSION', payload: newSession });
    localStorage.setItem('gaussmathmind_active_research', JSON.stringify(newSession));
  }, [state.searchType, state.gatherType, state.assistantHistory]);

  const updateResearchSession = useCallback((updates: Partial<ResearchSession>) => {
    if (state.currentResearchSession) {
      const updatedSession = { ...state.currentResearchSession, ...updates, timestamp: Date.now() };
      dispatch({ type: 'UPDATE_RESEARCH_SESSION', payload: updates });
      localStorage.setItem('gaussmathmind_active_research', JSON.stringify(updatedSession));
    }
  }, [state.currentResearchSession]);

  const saveResearchSession = useCallback(() => {
    if (state.currentResearchSession) {
      const sessionToSave = {
        ...state.currentResearchSession,
        assistantHistory: state.assistantHistory,
        progress: state.processingProgress,
        step: state.processingStep,
        timestamp: Date.now()
      };
      
      dispatch({ type: 'SAVE_RESEARCH_SESSION', payload: sessionToSave });
      
      // Persist to localStorage
      const updatedSessions = [sessionToSave, ...state.researchSessions.filter(s => s.id !== sessionToSave.id)];
      localStorage.setItem('gaussmathmind_research_sessions', JSON.stringify(updatedSessions));
      localStorage.setItem('gaussmathmind_active_research', JSON.stringify(sessionToSave));
    }
  }, [state.currentResearchSession, state.assistantHistory, state.processingProgress, state.processingStep, state.researchSessions]);

  const resumeResearchSession = useCallback((session: ResearchSession) => {
    dispatch({ type: 'RESUME_RESEARCH_SESSION', payload: session });
    localStorage.setItem('gaussmathmind_active_research', JSON.stringify(session));
  }, []);

  const clearCurrentResearchSession = useCallback(() => {
    dispatch({ type: 'CLEAR_CURRENT_RESEARCH_SESSION' });
    localStorage.removeItem('gaussmathmind_active_research');
  }, []);

  const getAvailableResearchSessions = useCallback(() => {
    return state.researchSessions.slice(0, 10); // Limit to last 10 sessions
  }, [state.researchSessions]);

  // Auto-save research session when important updates happen
  React.useEffect(() => {
    if (state.currentResearchSession && (state.assistantHistory.length > 0 || state.processingProgress > 0)) {
      const timeoutId = setTimeout(() => {
        saveResearchSession();
      }, 2000); // Auto-save after 2 seconds of inactivity

      return () => clearTimeout(timeoutId);
    }
  }, [state.assistantHistory, state.processingProgress, state.currentResearchSession, saveResearchSession]);

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
    // Research session management
    startResearchSession,
    updateResearchSession,
    saveResearchSession,
    resumeResearchSession,
    clearCurrentResearchSession,
    getAvailableResearchSessions,
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