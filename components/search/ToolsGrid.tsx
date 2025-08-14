import React from 'react';
import { useApp } from '../../contexts/AppContext';
import { useSpeechRecognition } from '../../hooks/useSpeechRecognition';
import { Card } from '../ui/Card';
import { UploadIcon, MicIcon, MessageCircleIcon } from '../ui/Icons';

interface ToolsGridProps {
  onScanClick: () => void;
}

export const ToolsGrid: React.FC<ToolsGridProps> = React.memo(({ onScanClick }) => {
  const { setActiveView } = useApp();
  const { handleToggleRecording, isRecording } = useSpeechRecognition();

  const tools = [
    {
      icon: UploadIcon,
      title: 'Escanear Notas',
      description: 'Sube imágenes de tus apuntes',
      onClick: onScanClick,
      color: 'text-slate-600',
    },
    {
      icon: MicIcon,
      title: isRecording ? 'Grabando...' : 'Grabar Voz',
      description: isRecording ? 'Toca para detener' : 'Dicta tus notas por voz',
      onClick: handleToggleRecording,
      color: isRecording ? 'text-red-600' : 'text-slate-600',
      className: isRecording ? 'bg-red-50 border-red-200' : '',
    },
    {
      icon: MessageCircleIcon,
      title: 'Hacer Preguntas',
      description: 'Chat con IA sobre matemáticas',
      onClick: () => setActiveView('chat'),
      color: 'text-slate-600',
    },
  ];

  return (
    <div className="mt-8">
      <h3 className="text-base font-medium text-slate-700 mb-4">Herramientas Adicionales</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {tools.map((tool, index) => (
          <Card
            key={index}
            hover
            onClick={tool.onClick}
            className={`cursor-pointer transition-all duration-200 hover:scale-105 ${tool.className || ''}`}
          >
            <div className="flex items-center gap-4">
              <tool.icon className={`w-6 h-6 ${tool.color} flex-shrink-0`} />
              <div className="text-left">
                <h4 className="font-medium text-slate-700">{tool.title}</h4>
                <p className="text-sm text-slate-600">{tool.description}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
});