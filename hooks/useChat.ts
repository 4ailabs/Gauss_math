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
    if (!message.trim()) return;
    
    const userMessage: ChatMessage = {
      role: 'user',
      content: message.trim()
    };
    
    addAssistantMessage(userMessage);
    setAssistantInput('');
    scrollChatToBottom();
    
    // Add loading message
    const loadingMessage: ChatMessage = {
      role: 'model',
      content: 'Pensando...'
    };
    addAssistantMessage(loadingMessage);
    scrollChatToBottom();
    
    try {
      console.log('Enviando mensaje al chat:', message);
      const stream = await getAssistantResponseStream(message, selectedSubject);
      let fullResponse = '';
      
      for await (const chunk of stream) {
        fullResponse += chunk;
        updateLastAssistantMessage(fullResponse);
        scrollChatToBottom();
      }
      
      console.log('Respuesta completa recibida:', fullResponse);
    } catch (error: any) {
      console.error('Error en chat:', error);
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