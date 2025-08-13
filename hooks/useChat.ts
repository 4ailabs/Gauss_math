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
        
        // Extraer el texto del chunk correctamente
        let textChunk = '';
        if (typeof chunk === 'string') {
          textChunk = chunk;
        } else if (chunk && typeof chunk === 'object') {
          // Si es un objeto, buscar la propiedad text
          if (chunk.text) {
            textChunk = chunk.text;
          } else if (chunk.content) {
            textChunk = chunk.content;
          } else if (chunk.response) {
            textChunk = chunk.response;
          } else {
            // Si no hay propiedades conocidas, convertir a string
            textChunk = JSON.stringify(chunk);
          }
        } else {
          textChunk = String(chunk);
        }
        
        console.log('Texto extraído del chunk:', textChunk);
        fullResponse += textChunk;
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