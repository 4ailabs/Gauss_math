import React, { useState } from 'react';
import { Flashcard } from '../../types';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { RefreshCwIcon, CheckIcon, XIcon, TargetIcon } from '../ui/Icons';

interface FlashcardComponentProps {
  flashcard: Flashcard;
  onConfidenceUpdate: (id: string, confidence: number) => void;
  onNext: () => void;
  showStats?: boolean;
}

export const FlashcardComponent: React.FC<FlashcardComponentProps> = React.memo(({
  flashcard,
  onConfidenceUpdate,
  onNext,
  showStats = true
}) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const [hasAnswered, setHasAnswered] = useState(false);

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
    if (!isFlipped) {
      setHasAnswered(true);
    }
  };

  const handleConfidence = (confidence: number) => {
    onConfidenceUpdate(flashcard.id, confidence);
    setTimeout(() => {
      setIsFlipped(false);
      setHasAnswered(false);
      onNext();
    }, 500);
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'bg-green-500';
    if (confidence >= 0.6) return 'bg-yellow-500';
    if (confidence >= 0.4) return 'bg-orange-500';
    return 'bg-red-500';
  };

  const formatLastReviewed = (timestamp: number) => {
    const now = Date.now();
    const diff = now - timestamp;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days === 0) return 'Hoy';
    if (days === 1) return 'Ayer';
    if (days < 7) return `Hace ${days} días`;
    if (days < 30) return `Hace ${Math.floor(days / 7)} semanas`;
    return `Hace ${Math.floor(days / 30)} meses`;
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* Stats Bar */}
      {showStats && (
        <div className="mb-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1">
                <TargetIcon className="w-4 h-4" />
                Confianza: 
                <span className={`px-2 py-1 rounded text-white text-xs ${getConfidenceColor(flashcard.confidence)}`}>
                  {Math.round(flashcard.confidence * 100)}%
                </span>
              </span>
              <span>Revisiones: {flashcard.reviewCount}</span>
              <span>Último: {formatLastReviewed(flashcard.lastReviewed)}</span>
            </div>
            <span className="text-xs text-gray-500 bg-gray-200 px-2 py-1 rounded">
              {flashcard.subject}
            </span>
          </div>
        </div>
      )}

      {/* Flashcard */}
      <div 
        className={`relative w-full h-80 cursor-pointer transition-transform duration-500 preserve-3d ${
          isFlipped ? 'rotate-y-180' : ''
        }`}
        onClick={handleFlip}
      >
        {/* Front side */}
        <Card 
          className={`absolute inset-0 backface-hidden ${
            isFlipped ? 'opacity-0' : 'opacity-100'
          } transition-opacity duration-300 border-2 border-teal-200 hover:border-teal-300`}
          padding="lg"
        >
          <div className="h-full flex flex-col">
            <div className="text-center mb-4">
              <span className="text-sm text-teal-600 font-medium">CONCEPTO</span>
            </div>
            
            <div className="flex-1 flex items-center justify-center">
              <h2 className="text-2xl font-bold text-gray-900 text-center leading-relaxed">
                {flashcard.concept}
              </h2>
            </div>
            
            <div className="text-center text-sm text-gray-500 mt-4">
              Haz clic para ver la definición
            </div>
          </div>
        </Card>

        {/* Back side */}
        <Card 
          className={`absolute inset-0 backface-hidden rotate-y-180 ${
            isFlipped ? 'opacity-100' : 'opacity-0'
          } transition-opacity duration-300 border-2 border-blue-200 hover:border-blue-300`}
          padding="lg"
        >
          <div className="h-full flex flex-col">
            <div className="text-center mb-4">
              <span className="text-sm text-blue-600 font-medium">DEFINICIÓN</span>
            </div>
            
            <div className="flex-1 flex items-center justify-center">
              <p className="text-lg text-gray-800 text-center leading-relaxed">
                {flashcard.definition}
              </p>
            </div>
            
            <div className="text-center text-sm text-gray-500 mt-4">
              ¿Qué tan bien conoces este concepto?
            </div>
          </div>
        </Card>
      </div>

      {/* Action Buttons */}
      {hasAnswered && isFlipped && (
        <div className="mt-6 flex justify-center gap-3">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => handleConfidence(0.2)}
            icon={<XIcon className="w-4 h-4" />}
            className="bg-red-50 border-red-200 text-red-700 hover:bg-red-100"
          >
            Difícil
          </Button>
          
          <Button
            variant="secondary"
            size="sm"
            onClick={() => handleConfidence(0.5)}
            icon={<RefreshCwIcon className="w-4 h-4" />}
            className="bg-yellow-50 border-yellow-200 text-yellow-700 hover:bg-yellow-100"
          >
            Normal
          </Button>
          
          <Button
            variant="primary"
            size="sm"
            onClick={() => handleConfidence(0.8)}
            icon={<CheckIcon className="w-4 h-4" />}
            className="bg-green-600 hover:bg-green-700"
          >
            Fácil
          </Button>
        </div>
      )}

      {/* Flip Button */}
      {!hasAnswered && (
        <div className="mt-6 text-center">
          <Button
            variant="secondary"
            onClick={handleFlip}
            icon={<RefreshCwIcon className="w-4 h-4" />}
          >
            Voltear Tarjeta
          </Button>
        </div>
      )}
    </div>
  );
});

FlashcardComponent.displayName = 'FlashcardComponent';