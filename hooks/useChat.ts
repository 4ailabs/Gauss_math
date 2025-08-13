import { useCallback, useEffect } from 'react';
import { useApp } from '../contexts/AppContext';
import { getAssistantResponseStream } from '../services/geminiService';
import { ChatMessage } from '../types';

export const useChat = () => {
  const {
    state: { selectedSubject, assistantInput },
    addAssistantMessage,
    updateLastAssistantMessage,
    setAssistantInput,
  } = useApp();

  const scrollChatToBottom = useCallback(() => {
    setTimeout(() => {
      const chatContainer = document.getElementById('chat-container');
      if (chatContainer) {
        chatContainer.scrollTop = chatContainer.scrollHeight;
      }
    }, 100);
  }, []);

  const handleChatMessage = useCallback(async (message: string) => {
    console.log('=== INICIO handleChatMessage ===');
    console.log('Mensaje recibido:', message);
    console.log('Subject:', selectedSubject);
    
    if (!message.trim()) {
      console.log('Mensaje vacío, retornando');
      return;
    }
    
    const userMessage: ChatMessage = {
      role: 'user',
      content: message.trim()
    };
    
    console.log('Agregando mensaje de usuario:', userMessage);
    addAssistantMessage(userMessage);
    setAssistantInput('');
    scrollChatToBottom();
    
    // Add loading message
    const loadingMessage: ChatMessage = {
      role: 'model',
      content: 'Pensando...'
    };
    console.log('Agregando mensaje de carga:', loadingMessage);
    addAssistantMessage(loadingMessage);
    scrollChatToBottom();
    
    try {
      console.log('Enviando mensaje al chat:', message);
      console.log('Llamando a getAssistantResponseStream...');
      const stream = await getAssistantResponseStream(message, selectedSubject);
      console.log('Stream recibido:', stream);
      let fullResponse = '';
      
      console.log('Procesando stream...');
      for await (const chunk of stream) {
        console.log('Chunk recibido:', chunk);
        console.log('Tipo de chunk:', typeof chunk);
        console.log('Contenido del chunk:', chunk);
        
        // Extraer el texto del chunk correctamente para Gemini
        let textChunk = '';
        if (typeof chunk === 'string') {
          textChunk = chunk;
        } else if (chunk && typeof chunk === 'object') {
          // Para la estructura real de Gemini que vemos en los logs
          if (chunk.candidates && Array.isArray(chunk.candidates) && chunk.candidates[0]) {
            const candidate = chunk.candidates[0];
            if (candidate.content && candidate.content.parts && candidate.content.parts[0]) {
              textChunk = candidate.content.parts[0].text || '';
            }
          } else if (chunk.text) {
            textChunk = chunk.text;
          } else if (chunk.content) {
            textChunk = chunk.content;
          } else if (chunk.response) {
            textChunk = chunk.response;
          } else if (chunk.parts && Array.isArray(chunk.parts)) {
            // Gemini puede devolver chunks con parts
            textChunk = chunk.parts
              .map(part => part.text || '')
              .join('');
          } else {
            // Debug: mostrar la estructura completa del chunk
            console.log('Estructura del chunk no reconocida:', Object.keys(chunk));
            console.log('Chunk completo:', JSON.stringify(chunk, null, 2));
            // Intentar extraer texto de cualquier propiedad que pueda contenerlo
            const possibleTextProps = ['text', 'content', 'response', 'message', 'value'];
            for (const prop of possibleTextProps) {
              if (chunk[prop] && typeof chunk[prop] === 'string') {
                textChunk = chunk[prop];
                console.log(`Texto encontrado en propiedad '${prop}':`, textChunk);
                break;
              }
            }
            // Si no se encontró texto, intentar con candidates
            if (!textChunk && chunk.candidates) {
              console.log('Intentando extraer de candidates...');
              try {
                const candidate = chunk.candidates[0];
                if (candidate && candidate.content && candidate.content.parts) {
                  textChunk = candidate.content.parts.map(p => p.text || '').join('');
                }
              } catch (e) {
                console.log('Error extrayendo de candidates:', e);
              }
            }
          }
        } else {
          textChunk = String(chunk);
        }
        
        console.log('Texto extraído del chunk:', textChunk);
        fullResponse += textChunk;
        console.log('Actualizando mensaje con respuesta parcial:', fullResponse.substring(0, 100) + '...');
        updateLastAssistantMessage(fullResponse);
        scrollChatToBottom();
      }
      
      console.log('Respuesta completa recibida:', fullResponse);
    } catch (error: any) {
      console.error('Error en chat:', error);
      console.error('Error completo:', {
        message: error.message,
        name: error.name,
        stack: error.stack
      });
      updateLastAssistantMessage(`Error: ${error.message || 'No se pudo procesar tu mensaje. Intenta de nuevo.'}`);
      scrollChatToBottom();
    }
  }, [selectedSubject, addAssistantMessage, updateLastAssistantMessage, setAssistantInput, scrollChatToBottom]);

  const sendMessage = useCallback(() => {
    if (assistantInput.trim()) {
      handleChatMessage(assistantInput);
    }
  }, [assistantInput, handleChatMessage]);

  // Auto-scroll on new messages
  useEffect(() => {
    scrollChatToBottom();
  }, [scrollChatToBottom]);

  return {
    handleChatMessage,
    sendMessage,
    scrollChatToBottom,
  };
};