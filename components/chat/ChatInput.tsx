import React, { useState } from 'react';
import { useApp } from '../../contexts/AppContext';
import { useChat } from '../../hooks/useChat';
import { Button } from '../ui/Button';
import { SendIcon } from '../ui/Icons';

export const ChatInput: React.FC = React.memo(() => {
  const { state: { assistantInput }, setAssistantInput } = useApp();
  const { handleChatMessage } = useChat();
  const [isTyping, setIsTyping] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!assistantInput.trim()) return;

    setIsTyping(true);
    try {
      await handleChatMessage(assistantInput);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-3">
      <div className="flex-1">
        <textarea
          value={assistantInput}
          onChange={(e) => setAssistantInput(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Escribe tu pregunta... (Shift+Enter para nueva línea)"
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent resize-none"
          rows={2}
          disabled={isTyping}
        />
      </div>
      <Button
        type="submit"
        disabled={!assistantInput.trim() || isTyping}
        loading={isTyping}
        icon={!isTyping && <SendIcon className="w-4 h-4" />}
        className="self-end"
      >
        {isTyping ? 'Enviando...' : 'Enviar'}
      </Button>
    </form>
  );
});