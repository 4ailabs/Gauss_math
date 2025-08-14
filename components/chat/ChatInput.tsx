import React, { useState } from 'react';
import { useApp } from '../../contexts/AppContext';
import { useChat } from '../../hooks/useChat';
import { Button } from '../ui/Button';
import { SendIcon } from '../ui/Icons';

export const ChatInput: React.FC = React.memo(() => {
  const { state: { assistantInput }, setAssistantInput } = useApp();
  const { handleChatMessage } = useChat();
  const [isTyping, setIsTyping] = useState(false);
  
  console.log('ChatInput render - assistantInput:', assistantInput, 'isTyping:', isTyping);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('ChatInput handleSubmit called with:', assistantInput);
    if (!assistantInput.trim()) {
      console.log('Empty input, returning');
      return;
    }

    setIsTyping(true);
    try {
      console.log('Calling handleChatMessage with:', assistantInput);
      console.log('handleChatMessage function:', handleChatMessage);
      await handleChatMessage(assistantInput);
      console.log('handleChatMessage completed');
    } catch (error) {
      console.error('Error in handleSubmit:', error);
      console.error('Error details:', {
        message: error.message,
        name: error.name,
        stack: error.stack
      });
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    console.log('Key pressed:', e.key, 'shiftKey:', e.shiftKey);
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      console.log('Enter pressed, calling handleSubmit');
      handleSubmit(e);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
      <div className="flex-1">
        <textarea
          value={assistantInput}
          onChange={(e) => setAssistantInput(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Escribe tu pregunta..."
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent resize-none bg-white text-gray-900 placeholder-gray-500 text-base"
          rows={2}
          disabled={isTyping}
          style={{ 
            color: '#111827 !important', 
            backgroundColor: '#ffffff !important',
            textShadow: 'none'
          }}
        />
      </div>
      <Button
        type="submit"
        disabled={!assistantInput.trim() || isTyping}
        loading={isTyping}
        icon={!isTyping && <SendIcon className="w-5 h-5 sm:w-4 sm:h-4" />}
        className="self-end sm:self-end w-full sm:w-auto py-3 sm:py-2"
        size="md"
        onClick={(e) => {
          console.log('Button clicked');
          if (!isTyping && assistantInput.trim()) {
            handleSubmit(e);
          }
        }}
      >
        {isTyping ? 'Enviando...' : 'Enviar'}
      </Button>
    </form>
  );
});