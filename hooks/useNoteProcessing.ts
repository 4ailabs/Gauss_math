import { useCallback } from 'react';
import { useApp } from '../contexts/AppContext';
import { processNotes } from '../services/geminiService';
import EnhancedMathService from '../services/enhancedMathService';
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
      console.log('Iniciando procesamiento mejorado de notas...');
      
      // Intentar usar el servicio mejorado primero
      let data;
      try {
        const enhancedService = EnhancedMathService.getInstance();
        data = await enhancedService.processNotesEnhanced(notes, selectedSubject);
        console.log('Procesamiento mejorado completado exitosamente');
      } catch (enhancedError) {
        console.log('Fallback a procesamiento básico:', enhancedError);
        // Fallback al servicio original si el mejorado falla
        data = await processNotes(notes, selectedSubject);
        console.log('Procesamiento básico completado');
      }
      console.log('Notas procesadas exitosamente:', data);
      
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
      setLoading(false);
      console.log('Navegando a vista de resultados...');
      setActiveView('results');
      
    } catch (e: any) {
      console.error("Error processing notes:", e);
      setError(e.message || "Ocurrió un error al procesar los apuntes.");
      setProcessedData(null);
      setLoading(false);
    }
  }, [notes, selectedSubject, setLoading, setError, setProcessedData, setActiveView, addToHistory]);

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