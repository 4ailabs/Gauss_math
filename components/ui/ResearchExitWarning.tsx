import React, { useEffect, useState } from 'react';
import { Card } from './Card';
import { Button } from './Button';
import { AlertTriangleIcon, BookOpenIcon, ClockIcon } from './Icons';

interface ResearchExitWarningProps {
  isVisible: boolean;
  onContinue: () => void;
  onExit: () => void;
  researchTopic?: string;
  progress?: number;
}

export const ResearchExitWarning: React.FC<ResearchExitWarningProps> = ({
  isVisible,
  onContinue,
  onExit,
  researchTopic,
  progress = 0
}) => {
  const [showWarning, setShowWarning] = useState(false);

  useEffect(() => {
    if (isVisible) {
      setShowWarning(true);
    }
  }, [isVisible]);

  if (!showWarning) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="max-w-md w-full p-6">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertTriangleIcon className="w-8 h-8 text-yellow-600" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Investigación en Progreso
          </h2>
          <p className="text-gray-600">
            Tienes una investigación activa que se perderá si sales de esta página.
          </p>
        </div>

        {/* Información de la investigación */}
        {researchTopic && (
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <div className="flex items-center gap-2 mb-2">
              <BookOpenIcon className="w-4 h-4 text-blue-600" />
              <span className="font-medium text-gray-900">Tema:</span>
            </div>
            <p className="text-sm text-gray-700 mb-3">{researchTopic}</p>
            
            <div className="flex items-center gap-2">
              <ClockIcon className="w-4 h-4 text-green-600" />
              <span className="text-sm text-gray-600">Progreso: {progress}%</span>
            </div>
          </div>
        )}

        {/* Botones de acción */}
        <div className="flex flex-col gap-3">
          <Button
            variant="primary"
            onClick={onContinue}
            className="w-full"
          >
            Continuar Investigación
          </Button>
          
          <Button
            variant="danger"
            onClick={onExit}
            className="w-full"
          >
            Salir y Perder Progreso
          </Button>
        </div>

        {/* Información adicional */}
        <div className="mt-4 text-center">
          <p className="text-xs text-gray-500">
            💡 Consejo: Puedes guardar tu progreso actual antes de salir
          </p>
        </div>
      </Card>
    </div>
  );
};
