import { useCallback } from 'react';
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

  const handleChatMessage = useCallback(async (message: string) => {
    if (!message.trim()) return;
    
    const userMessage: ChatMessage = {
      role: 'user',
      content: message
    };
    
    addAssistantMessage(userMessage);
    setAssistantInput('');
    
    try {
      const stream = await getAssistantResponseStream(message, selectedSubject);
      let fullResponse = '';
      
      for await (const chunk of stream) {
        fullResponse += chunk;
        updateLastAssistantMessage(fullResponse);
      }
    } catch (error: any) {
      console.error('Error en chat:', error);
      addAssistantMessage({
        role: 'model',
        content: `Error: ${error.message || 'No se pudo procesar tu mensaje'}`
      });
    }
  }, [selectedSubject, addAssistantMessage, updateLastAssistantMessage, setAssistantInput]);

  const sendMessage = useCallback(() => {
    if (assistantInput.trim()) {
      handleChatMessage(assistantInput);
    }
  }, [assistantInput, handleChatMessage]);

  return {
    handleChatMessage,
    sendMessage,
  };
};