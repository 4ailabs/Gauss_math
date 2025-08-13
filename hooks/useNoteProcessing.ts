import { useCallback } from 'react';
import { useApp } from '../contexts/AppContext';
import { processNotes } from '../services/geminiService';
import { AnalysisHistory } from '../types';

export const useNoteProcessing = () => {
  const {
    state: { notes, selectedSubject, analysisHistory },
    setLoading,
    setError,
    setProcessedData,
    setActiveView,
    addToHistory,
    setProcessingProgress,
    setProcessingStep,
  } = useApp();

  const simulateProgress = useCallback(async () => {
    const steps = [
      { progress: 10, step: 'Analizando contenido...' },
      { progress: 30, step: 'Extrayendo conceptos clave...' },
      { progress: 60, step: 'Generando preguntas...' },
      { progress: 85, step: 'Creando problemas relacionados...' },
      { progress: 95, step: 'Finalizando análisis...' },
      { progress: 100, step: 'Completado' }
    ];

    for (const { progress, step } of steps) {
      setProcessingProgress(progress);
      setProcessingStep(step);
      await new Promise(resolve => setTimeout(resolve, 800 + Math.random() * 400));
    }
  }, [setProcessingProgress, setProcessingStep]);

  const handleProcessNotes = useCallback(async () => {
    if (!notes.trim()) {
      setError("Los apuntes no pueden estar vacíos.");
      return;
    }
    
    setLoading(true);
    setError(null);
    setProcessingProgress(0);
    setProcessingStep('Iniciando análisis...');
    
    try {
      // Simular progreso mientras se procesa
      const progressPromise = simulateProgress();
      const processPromise = processNotes(notes, selectedSubject);
      
      const [data] = await Promise.all([processPromise, progressPromise]);
      
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
      
      // Small delay before showing results
      setTimeout(() => {
        setActiveView('results');
      }, 500);
      
    } catch (e: any) {
      console.error("Error processing notes:", e);
      setError(e.message || "Ocurrió un error al procesar los apuntes.");
      setProcessedData(null);
    } finally {
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