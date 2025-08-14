import React, { useState } from 'react';
import { ChatMessage as ChatMessageType } from '../../types';
import { parseMarkdown, ParsedContent } from '../../utils/markdownParser';
import { CopyIcon, CheckIcon } from '../ui/Icons';

interface ChatMessageProps {
  message: ChatMessageType;
}

const ContentRenderer: React.FC<{ content: ParsedContent; isUser: boolean }> = ({ content, isUser }) => {
  const baseTextColor = isUser ? 'text-white' : 'text-gray-800';
  
  switch (content.type) {
    case 'heading':
      const HeadingTag = `h${Math.min(content.level || 1, 6)}` as keyof JSX.IntrinsicElements;
      const headingSize = content.level === 1 ? 'text-lg' : content.level === 2 ? 'text-base' : 'text-sm';
      return (
        <HeadingTag className={`font-semibold ${headingSize} ${baseTextColor} mb-2 mt-3 first:mt-0`}>
          {content.content}
        </HeadingTag>
      );
      
    case 'list':
      return (
        <ul className={`space-y-1 my-2 ${isUser ? 'text-white' : 'text-gray-700'}`}>
          {content.items?.map((item, index) => (
            <li key={index} className="flex items-start gap-2">
              <span className={`mt-1.5 w-1.5 h-1.5 rounded-full flex-shrink-0 ${
                isUser ? 'bg-white' : 'bg-teal-500'
              }`} />
              <span className="text-sm leading-relaxed">{item}</span>
            </li>
          ))}
        </ul>
      );
      
    case 'code':
      return (
        <div className={`my-3 p-3 rounded-md font-mono text-xs ${
          isUser 
            ? 'bg-teal-700 text-teal-100 border border-teal-500' 
            : 'bg-gray-100 text-gray-800 border border-gray-300'
        }`}>
          <pre className="whitespace-pre-wrap">{content.content}</pre>
        </div>
      );
      
    case 'formula':
      return (
        <div className={`my-2 p-2 text-center italic ${
          isUser ? 'text-teal-100' : 'text-teal-700'
        }`}>
          {content.content}
        </div>
      );
      
    default:
      return (
        <p className={`text-sm leading-relaxed ${baseTextColor} mb-2 last:mb-0`}>
          {content.content}
        </p>
      );
  }
};

export const ChatMessage: React.FC<ChatMessageProps> = React.memo(({ message }) => {
  const isUser = message.role === 'user';
  const parsedContent = parseMarkdown(message.content);
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Error al copiar:', err);
    }
  };

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4 group`}>
      <div className={`max-w-[80%] ${isUser ? 'order-2' : 'order-1'}`}>
        <div
          className={`relative inline-block p-4 rounded-lg shadow-sm ${
            isUser
              ? 'bg-teal-600 text-white rounded-br-sm'
              : 'bg-white text-gray-900 border border-gray-200 rounded-bl-sm'
          }`}
        >
          {/* Botón de copiar - solo para mensajes de la IA */}
          {!isUser && (
            <button
              onClick={handleCopy}
              className={`absolute top-2 right-2 p-1.5 rounded-md transition-all duration-200 opacity-0 group-hover:opacity-100 ${
                copied 
                  ? 'bg-green-100 text-green-600' 
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-600 hover:text-gray-800'
              }`}
              title={copied ? 'Copiado!' : 'Copiar mensaje'}
            >
              {copied ? (
                <CheckIcon className="w-3 h-3" />
              ) : (
                <CopyIcon className="w-3 h-3" />
              )}
            </button>
          )}
          
          <div className="space-y-1 pr-8">
            {parsedContent.map((content, index) => (
              <ContentRenderer key={index} content={content} isUser={isUser} />
            ))}
          </div>
        </div>
        <div className={`text-xs text-gray-500 mt-1 flex items-center gap-2 ${isUser ? 'justify-end' : 'justify-start'}`}>
          <span>{isUser ? 'Tú' : 'IA'}</span>
          {copied && !isUser && (
            <span className="text-green-600 text-xs">✓ Copiado</span>
          )}
        </div>
      </div>
    </div>
  );
});