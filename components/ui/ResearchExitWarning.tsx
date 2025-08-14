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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-3 sm:p-4">
      <Card className="max-w-sm sm:max-w-md w-full p-4 sm:p-6">
        <div className="text-center mb-4 sm:mb-6">
          <div className="w-12 h-12 sm:w-16 sm:h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
            <AlertTriangleIcon className="w-6 h-6 sm:w-8 sm:h-8 text-yellow-600" />
          </div>
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">
            Investigación en Progreso
          </h2>
          <p className="text-sm sm:text-base text-gray-600">
            Tienes una investigación activa que se perderá si sales de esta página.
          </p>
        </div>

        {/* Información de la investigación */}
        {researchTopic && (
          <div className="bg-gray-50 rounded-lg p-3 sm:p-4 mb-4 sm:mb-6">
            <div className="flex items-center gap-2 mb-2">
              <BookOpenIcon className="w-3 h-3 sm:w-4 sm:h-4 text-blue-600" />
              <span className="font-medium text-gray-900 text-sm sm:text-base">Tema:</span>
            </div>
            <p className="text-xs sm:text-sm text-gray-700 mb-2 sm:mb-3">{researchTopic}</p>
            
            <div className="flex items-center gap-2">
              <ClockIcon className="w-3 h-3 sm:w-4 sm:h-4 text-green-600" />
              <span className="text-xs sm:text-sm text-gray-600">Progreso: {progress}%</span>
            </div>
          </div>
        )}

        {/* Botones de acción */}
        <div className="flex flex-col gap-2 sm:gap-3">
          <Button
            variant="primary"
            onClick={onContinue}
            className="w-full min-h-[44px] sm:min-h-[40px]"
          >
            Continuar Investigación
          </Button>
          
          <Button
            variant="danger"
            onClick={onExit}
            className="w-full min-h-[44px] sm:min-h-[40px]"
          >
            Salir y Perder Progreso
          </Button>
        </div>

        {/* Información adicional */}
        <div className="mt-3 sm:mt-4 text-center">
          <p className="text-xs text-gray-500">
            Consejo: Puedes guardar tu progreso actual antes de salir
          </p>
        </div>
      </Card>
    </div>
  );
};
