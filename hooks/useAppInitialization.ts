import { useEffect } from 'react';
import { useApp } from '../contexts/AppContext';

export const useAppInitialization = () => {
  const {
    setApiKeyMissing,
    setError,
    setSpeechSupported,
    setAnalysisHistory,
  } = useApp();

  useEffect(() => {
    const checkApiKey = () => {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        setApiKeyMissing(true);
        setError("API Key de Google Gemini no configurada. Por favor, configura tu API Key en el archivo .env.local");
      }
    };

    const checkSpeechSupport = () => {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      setSpeechSupported(!!SpeechRecognition);
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
  }, [setApiKeyMissing, setError, setSpeechSupported, setAnalysisHistory]);
};