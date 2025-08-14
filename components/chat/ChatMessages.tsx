import React, { useEffect, useRef } from 'react';
import { useApp } from '../../contexts/AppContext';
import { ChatMessage } from './ChatMessage';
import { MessageCircleIcon } from '../ui/Icons';

export const ChatMessages: React.FC = React.memo(() => {
  const { state: { assistantHistory } } = useApp();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [assistantHistory]);

  return (
    <div className="h-64 sm:h-80 md:h-96 bg-gray-50 rounded-lg p-3 sm:p-4 overflow-y-auto border border-gray-200">
      {assistantHistory.length === 0 ? (
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <div className="w-12 h-12 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <MessageCircleIcon className="w-5 h-5 text-slate-500" />
            </div>
            <p className="text-gray-500 text-base sm:text-lg font-medium mb-2">¡Hola! Soy tu asistente de matemáticas</p>
            <p className="text-gray-400 text-xs sm:text-sm px-2 sm:px-0">Pregúntame cualquier cosa sobre tus apuntes o conceptos matemáticos</p>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {assistantHistory.map((message, index) => (
            <ChatMessage key={index} message={message} />
          ))}
          <div ref={messagesEndRef} />
        </div>
      )}
    </div>
  );
});