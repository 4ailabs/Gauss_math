import React from 'react';
import { useApp } from '../../contexts/AppContext';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { ChatMessages } from '../chat/ChatMessages';
import { ChatInput } from '../chat/ChatInput';

const ChatView: React.FC = React.memo(() => {
  const { setActiveView, clearAssistantHistory } = useApp();

  return (
    <div className="space-y-6">
      <Card padding="lg">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Chat con IA</h2>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={clearAssistantHistory}
            >
              Limpiar Chat
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setActiveView('search')}
            >
              Volver
            </Button>
          </div>
        </div>
        
        <div className="space-y-4">
          <ChatMessages />
          <ChatInput />
        </div>
      </Card>
    </div>
  );
});

export default ChatView;