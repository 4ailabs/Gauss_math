import React from 'react';
import { LoaderCircleIcon, BrainCircuitIcon, CheckIcon } from './Icons';

interface ProcessingOverlayProps {
  isVisible: boolean;
  progress?: number;
  currentStep?: string;
  onCancel?: () => void;
}

export const ProcessingOverlay: React.FC<ProcessingOverlayProps> = ({
  isVisible,
  progress = 0,
  currentStep = 'Procesando...',
  onCancel,
}) => {
  if (!isVisible) return null;

  const steps = [
    'Analizando contenido...',
    'Extrayendo conceptos clave...',
    'Generando preguntas...',
    'Creando problemas relacionados...',
    'Finalizando análisis...'
  ];

  const currentStepIndex = Math.floor((progress / 100) * steps.length);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4 transform animate-in fade-in duration-300">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <BrainCircuitIcon className="w-8 h-8 text-teal-600 animate-pulse" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Procesando Apuntes</h2>
          <p className="text-gray-600">Nuestro AI está analizando tu contenido matemático</p>
        </div>

        {/* Progress Bar */}
        <div className="mb-6">
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>Progreso</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-teal-500 to-blue-500 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Steps */}
        <div className="space-y-3 mb-8">
          {steps.map((step, index) => {
            const isCompleted = index < currentStepIndex;
            const isCurrent = index === currentStepIndex;
            const isPending = index > currentStepIndex;

            return (
              <div key={index} className="flex items-center gap-3">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center transition-all duration-300 ${
                  isCompleted 
                    ? 'bg-green-500 text-white' 
                    : isCurrent 
                    ? 'bg-teal-500 text-white'
                    : 'bg-gray-200 text-gray-400'
                }`}>
                  {isCompleted ? (
                    <CheckIcon className="w-3 h-3" />
                  ) : isCurrent ? (
                    <LoaderCircleIcon className="w-3 h-3 animate-spin" />
                  ) : (
                    <span className="text-xs font-semibold">{index + 1}</span>
                  )}
                </div>
                <span className={`text-sm transition-colors duration-300 ${
                  isCompleted || isCurrent ? 'text-gray-900 font-medium' : 'text-gray-500'
                }`}>
                  {step}
                </span>
              </div>
            );
          })}
        </div>

        {/* Current Step Display */}
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <div className="flex items-center gap-2">
            <LoaderCircleIcon className="w-4 h-4 text-teal-600 animate-spin" />
            <span className="text-sm font-medium text-gray-900">{currentStep}</span>
          </div>
        </div>

        {/* Cancel Button */}
        {onCancel && (
          <div className="text-center">
            <button
              onClick={onCancel}
              className="text-gray-500 hover:text-gray-700 text-sm font-medium transition-colors"
            >
              Cancelar proceso
            </button>
          </div>
        )}
      </div>
    </div>
  );
};