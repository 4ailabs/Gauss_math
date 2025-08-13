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
        fullResponse += chunk;
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