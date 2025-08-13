import { useCallback } from 'react';
import { useApp } from '../contexts/AppContext';
import { processNotes } from '../services/geminiService';
import { AnalysisHistory } from '../types';

export const useNoteProcessing = () => {
  const {
    state: { notes, selectedSubject },
    setLoading,
    setError,
    setProcessedData,
    setActiveView,
    addToHistory,
  } = useApp();

  const handleProcessNotes = useCallback(async () => {
    if (!notes.trim()) {
      setError("Los apuntes no pueden estar vacíos.");
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      // Procesar directamente sin simulación de progreso
      const data = await processNotes(notes, selectedSubject);
      
      setProcessedData(data);
      
      // Save to history
      const newHistoryItem: AnalysisHistory = {
        id: Date.now().toString(),
        title: notes.substring(0, 50) + (notes.length > 50 ? '...' : ''),
        subject: selectedSubject,
        notes: notes,
        processedData: data,
        timestamp: Date.now(),
        tags: [selectedSubject],
        topics: data.keyConcepts.map(c => c.concept.split(' ')[0]),
        confidence: 0.5,
        lastReviewed: Date.now(),
        reviewCount: 0
      };
      
      addToHistory(newHistoryItem);
      
      // Cambiar a la vista de resultados inmediatamente
      setActiveView('results');
      
      // Cerrar el modal después de un pequeño delay para una transición suave
      setTimeout(() => {
        setLoading(false);
        setProcessingProgress(0);
        setProcessingStep('');
      }, 300);
      
    } catch (e: any) {
      console.error("Error processing notes:", e);
      setError(e.message || "Ocurrió un error al procesar los apuntes.");
      setProcessedData(null);
      setLoading(false);
      setProcessingProgress(0);
      setProcessingStep('');
    }
  }, [notes, selectedSubject, setLoading, setError, setProcessedData, setActiveView, addToHistory, setProcessingProgress, setProcessingStep, simulateProgress]);

  const handleSearch = useCallback(() => {
    if (!notes.trim()) {
      setError("Los apuntes no pueden estar vacíos.");
      return;
    }
    handleProcessNotes();
  }, [notes, handleProcessNotes, setError]);

  return {
    handleProcessNotes,
    handleSearch,
  };
};