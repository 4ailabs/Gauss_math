import { useState, useEffect, useCallback } from 'react';

// Definir ResearchState localmente para evitar dependencias circulares
enum ResearchState {
  IDLE = 'idle',
  PLANNING = 'planning',
  PLAN_REVIEW = 'plan_review',
  REFINING_PLAN = 'refining_plan',
  RESEARCHING = 'researching',
  SYNTHESIZING = 'synthesizing',
  DONE = 'done',
  ERROR = 'error'
}

export interface ResearchSession {
  id: string;
  topic: string;
  subtopics: Array<{
    title: string;
    status: 'pending' | 'loading' | 'complete';
    content?: string;
    sources?: Array<{
      uri: string;
      title: string;
    }>;
  }>;
  researchState: ResearchState;
  chatHistory: Array<{
    role: 'user' | 'model';
    content: string;
  }>;
  startTime: number;
  lastActivity: number;
  isActive: boolean;
}

const RESEARCH_SESSION_KEY = 'gauss_research_session';
const SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutos

export const useResearchPersistence = () => {
  const [currentSession, setCurrentSession] = useState<ResearchSession | null>(null);

  // Cargar sesión existente al inicializar
  useEffect(() => {
    const savedSession = localStorage.getItem(RESEARCH_SESSION_KEY);
    if (savedSession) {
      try {
        const session = JSON.parse(savedSession);
        const now = Date.now();
        
        // Verificar si la sesión no ha expirado
        if (session.lastActivity && (now - session.lastActivity) < SESSION_TIMEOUT) {
          setCurrentSession(session);
        } else {
          // Sesión expirada, limpiar
          localStorage.removeItem(RESEARCH_SESSION_KEY);
        }
      } catch (error) {
        console.error('Error al cargar sesión de investigación:', error);
        localStorage.removeItem(RESEARCH_SESSION_KEY);
      }
    }
  }, []);

  // Guardar sesión en LocalStorage
  const saveSession = useCallback((session: ResearchSession) => {
    try {
      const sessionToSave = {
        ...session,
        lastActivity: Date.now(),
        isActive: true
      };
      localStorage.setItem(RESEARCH_SESSION_KEY, JSON.stringify(sessionToSave));
      setCurrentSession(sessionToSave);
    } catch (error) {
      console.error('Error al guardar sesión de investigación:', error);
    }
  }, []);

  // Crear nueva sesión
  const createSession = useCallback((topic: string, subtopics: string[]) => {
    const newSession: ResearchSession = {
      id: `research_${Date.now()}`,
      topic,
      subtopics: subtopics.map(title => ({
        title,
        status: 'pending' as const
      })),
      researchState: ResearchState.PLAN_REVIEW,
      chatHistory: [],
      startTime: Date.now(),
      lastActivity: Date.now(),
      isActive: true
    };
    
    saveSession(newSession);
    return newSession;
  }, [saveSession]);

  // Actualizar estado de investigación
  const updateResearchState = useCallback((newState: ResearchState) => {
    if (currentSession) {
      const updatedSession = {
        ...currentSession,
        researchState: newState,
        lastActivity: Date.now()
      };
      saveSession(updatedSession);
    }
  }, [currentSession, saveSession]);

  // Actualizar estado de un subtópico
  const updateSubtopicStatus = useCallback((index: number, status: 'pending' | 'loading' | 'complete', content?: string, sources?: Array<{ uri: string; title: string }>) => {
    if (currentSession && currentSession.subtopics[index]) {
      const updatedSubtopics = [...currentSession.subtopics];
      updatedSubtopics[index] = {
        ...updatedSubtopics[index],
        status,
        ...(content && { content }),
        ...(sources && { sources })
      };
      
      const updatedSession = {
        ...currentSession,
        subtopics: updatedSubtopics,
        lastActivity: Date.now()
      };
      saveSession(updatedSession);
    }
  }, [currentSession, saveSession]);

  // Agregar mensaje al chat
  const addChatMessage = useCallback((role: 'user' | 'model', content: string) => {
    if (currentSession) {
      const updatedSession = {
        ...currentSession,
        chatHistory: [...currentSession.chatHistory, { role, content }],
        lastActivity: Date.now()
      };
      saveSession(updatedSession);
    }
  }, [currentSession, saveSession]);

  // Limpiar sesión
  const clearSession = useCallback(() => {
    localStorage.removeItem(RESEARCH_SESSION_KEY);
    setCurrentSession(null);
  }, []);

  // Verificar si hay investigación activa
  const hasActiveResearch = useCallback(() => {
    return currentSession?.isActive && 
           currentSession.researchState !== ResearchState.DONE &&
           currentSession.researchState !== ResearchState.ERROR;
  }, [currentSession]);

  // Obtener progreso de la investigación
  const getResearchProgress = useCallback(() => {
    if (!currentSession) return 0;
    
    const completed = currentSession.subtopics.filter(s => s.status === 'complete').length;
    return Math.round((completed / currentSession.subtopics.length) * 100);
  }, [currentSession]);

  // Verificar si la sesión ha expirado
  const isSessionExpired = useCallback(() => {
    if (!currentSession?.lastActivity) return true;
    return (Date.now() - currentSession.lastActivity) > SESSION_TIMEOUT;
  }, [currentSession]);

  return {
    currentSession,
    createSession,
    updateResearchState,
    updateSubtopicStatus,
    addChatMessage,
    clearSession,
    hasActiveResearch,
    getResearchProgress,
    isSessionExpired,
    saveSession
  };
};
