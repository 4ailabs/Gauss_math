import { useCallback } from 'react';
import { useApp } from '../contexts/AppContext';
import { processNotes, generateQuiz, findProblems } from '../services/geminiService';
import EnhancedMathService from '../services/enhancedMathService';
import { AnalysisHistory } from '../types';

export const useNoteProcessing = () => {
  const {
    state: { notes, selectedSubject, searchType },
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
      console.log('Iniciando procesamiento según tipo:', searchType);
      
      let data;
      switch (searchType) {
        case 'research':
          console.log('Procesando apuntes...');
          data = await processNotes(notes, selectedSubject);
          console.log('Procesamiento de apuntes completado');
          break;
        
        case 'systematic':
          console.log('Generando quiz...');
          data = await generateQuiz(notes, selectedSubject);
          console.log('Generación de quiz completada');
          break;
        
        case 'papers':
          console.log('Encontrando problemas...');
          data = await findProblems(notes, selectedSubject);
          console.log('Búsqueda de problemas completada');
          break;
        
        default:
          console.log('Tipo de búsqueda no reconocido, usando procesamiento básico...');
          data = await processNotes(notes, selectedSubject);
      }
      
      console.log('Datos procesados exitosamente:', data);
      
      setProcessedData(data);
      
      // Save to history
      const getHistoryTitle = () => {
        const baseTitle = notes.substring(0, 50) + (notes.length > 50 ? '...' : '');
        switch (searchType) {
          case 'systematic':
            return `Quiz: ${baseTitle}`;
          case 'papers':
            return `Problemas: ${baseTitle}`;
          default:
            return baseTitle;
        }
      };

      const newHistoryItem: AnalysisHistory = {
        id: Date.now().toString(),
        title: getHistoryTitle(),
        subject: selectedSubject,
        notes: notes,
        processedData: data,
        timestamp: Date.now(),
        tags: [selectedSubject, searchType],
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
  }, [notes, selectedSubject, searchType, setLoading, setError, setProcessedData, setActiveView, addToHistory]);

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