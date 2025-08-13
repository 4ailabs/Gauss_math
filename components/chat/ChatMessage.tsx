import React from 'react';
import { ChatMessage as ChatMessageType } from '../../types';

interface ChatMessageProps {
  message: ChatMessageType;
}

export const ChatMessage: React.FC<ChatMessageProps> = React.memo(({ message }) => {
  const isUser = message.role === 'user';

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}>
      <div className={`max-w-[80%] ${isUser ? 'order-2' : 'order-1'}`}>
        <div
          className={`inline-block p-4 rounded-lg shadow-sm ${
            isUser
              ? 'bg-teal-600 text-white rounded-br-sm'
              : 'bg-white text-gray-900 border border-gray-200 rounded-bl-sm'
          }`}
        >
          <div className={`text-sm leading-relaxed ${isUser ? 'text-white' : 'text-gray-800'}`}>
            {message.content.split('\n').map((line, index) => (
              <React.Fragment key={index}>
                {line}
                {index < message.content.split('\n').length - 1 && <br />}
              </React.Fragment>
            ))}
          </div>
        </div>
        <div className={`text-xs text-gray-500 mt-1 ${isUser ? 'text-right' : 'text-left'}`}>
          {isUser ? 'Tú' : 'IA'}
        </div>
      </div>
    </div>
  );
});