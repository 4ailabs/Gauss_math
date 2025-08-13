import React from 'react';

interface ProgressIndicatorProps {
  steps: string[];
  currentStep: number;
  className?: string;
}

export const ProgressIndicator: React.FC<ProgressIndicatorProps> = ({
  steps,
  currentStep,
  className = '',
}) => {
  return (
    <div className={`space-y-4 ${className}`}>
      {steps.map((step, index) => {
        const isCompleted = index < currentStep;
        const isCurrent = index === currentStep;
        const isPending = index > currentStep;

        return (
          <div key={index} className="flex items-center gap-3">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-colors ${
                isCompleted
                  ? 'bg-green-500 text-white'
                  : isCurrent
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 text-gray-500'
              }`}
            >
              {isCompleted ? '✓' : index + 1}
            </div>
            <div className="flex-1">
              <p
                className={`text-sm font-medium ${
                  isCompleted || isCurrent ? 'text-gray-900' : 'text-gray-500'
                }`}
              >
                {step}
              </p>
              {isCurrent && (
                <div className="mt-1">
                  <div className="w-32 h-1 bg-gray-200 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500 animate-pulse"></div>
                  </div>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

interface StepProgressProps {
  totalSteps: number;
  currentStep: number;
  labels?: string[];
}

export const StepProgress: React.FC<StepProgressProps> = ({
  totalSteps,
  currentStep,
  labels,
}) => {
  return (
    <div className="flex items-center justify-between">
      {Array.from({ length: totalSteps }, (_, index) => {
        const isCompleted = index < currentStep;
        const isCurrent = index === currentStep;

        return (
          <div key={index} className="flex items-center">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-colors ${
                isCompleted
                  ? 'bg-green-500 text-white'
                  : isCurrent
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 text-gray-500'
              }`}
            >
              {isCompleted ? '✓' : index + 1}
            </div>
            {labels && labels[index] && (
              <span className="ml-2 text-sm text-gray-600">{labels[index]}</span>
            )}
            {index < totalSteps - 1 && (
              <div className="w-8 h-0.5 bg-gray-200 mx-2">
                <div
                  className={`h-full transition-all duration-300 ${
                    isCompleted ? 'bg-green-500 w-full' : 'bg-transparent w-0'
                  }`}
                ></div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};