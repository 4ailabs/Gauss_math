import { useCallback, useRef, useEffect } from 'react';
import { useApp } from '../contexts/AppContext';

export const useSpeechRecognition = () => {
  const {
    state: { notes, isRecording, isSpeechSupported, isLoading, isScanning },
    setRecording,
    setSpeechSupported,
    setNotes,
  } = useApp();

  const recognitionRef = useRef<any>(null);
  const notesOnRecordStartRef = useRef<string>('');

  useEffect(() => {
    const checkSpeechSupport = () => {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      setSpeechSupported(!!SpeechRecognition);
    };

    checkSpeechSupport();
  }, [setSpeechSupported]);

  const handleToggleRecording = useCallback(() => {
    if (!isSpeechSupported || isLoading || isScanning) return;
    
    if (isRecording) {
      recognitionRef.current?.stop();
      setRecording(false);
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
          setRecording(false);
        };

        recognition.onerror = (event: any) => {
          console.error('Speech recognition error:', event.error);
          setRecording(false);
        };
      }
      
      notesOnRecordStartRef.current = notes;
      recognitionRef.current?.start();
      setRecording(true);
    }
  }, [isSpeechSupported, isLoading, isScanning, isRecording, notes, setRecording, setNotes]);

  return {
    handleToggleRecording,
    isRecording,
    isSpeechSupported,
  };
};