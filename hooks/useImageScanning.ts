import { useCallback, useRef } from 'react';
import { useApp } from '../contexts/AppContext';
import { extractTextFromImage } from '../services/geminiService';

export const useImageScanning = () => {
  const {
    setScanning,
    setError,
    setNotes,
  } = useApp();

  const imageInputRef = useRef<HTMLInputElement>(null);

  const handleScanClick = useCallback(() => {
    imageInputRef.current?.click();
  }, []);

  const handleImageSelected = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setScanning(true);
    setError(null);

    try {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      
      reader.onload = async () => {
        try {
          const result = reader.result as string;
          const base64String = result.split(',')[1];
          
          if (!base64String) {
            throw new Error("Error al procesar la imagen.");
          }
          
          const text = await extractTextFromImage(base64String, file.type);
          setNotes(text);
        } catch (e: any) {
          console.error("Error extracting text:", e);
          setError(e.message || "Error al extraer texto de la imagen.");
        } finally {
          setScanning(false);
        }
      };
      
      reader.onerror = () => {
        setError("Error al leer el archivo de imagen.");
        setScanning(false);
      };
    } catch (e: any) {
      console.error("Error processing image:", e);
      setError(e.message || "Error al procesar la imagen.");
      setScanning(false);
    }
  }, [setScanning, setError, setNotes]);

  return {
    handleScanClick,
    handleImageSelected,
    imageInputRef,
  };
};