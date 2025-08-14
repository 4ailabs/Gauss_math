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
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

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

  // Touch gesture handlers
  const minSwipeDistance = 50;

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    // Swipe left/right to flip card
    if (isLeftSwipe || isRightSwipe) {
      handleFlip();
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto px-4 sm:px-0">
      {/* Stats Bar */}
      {showStats && (
        <div className="mb-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between text-sm text-gray-600 gap-2 sm:gap-0">
            <div className="flex flex-wrap items-center gap-2 sm:gap-4">
              <span className="flex items-center gap-1">
                <TargetIcon className="w-4 h-4" />
                <span className="hidden sm:inline">Confianza:</span>
                <span className="sm:hidden">Conf:</span>
                <span className={`px-2 py-1 rounded text-white text-xs ${getConfidenceColor(flashcard.confidence)}`}>
                  {Math.round(flashcard.confidence * 100)}%
                </span>
              </span>
              <span className="text-xs sm:text-sm">Rev: {flashcard.reviewCount}</span>
              <span className="text-xs sm:text-sm hidden sm:inline">Último: {formatLastReviewed(flashcard.lastReviewed)}</span>
            </div>
            <span className="text-xs text-gray-500 bg-gray-200 px-2 py-1 rounded self-start sm:self-auto">
              {flashcard.subject}
            </span>
          </div>
        </div>
      )}

      {/* Flashcard */}
      <div 
        className={`relative w-full h-64 sm:h-80 cursor-pointer transition-transform duration-500 preserve-3d ${
          isFlipped ? 'rotate-y-180' : ''
        }`}
        onClick={handleFlip}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
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
            
            <div className="flex-1 flex items-center justify-center px-2">
              <h2 className="text-lg sm:text-2xl font-bold text-gray-900 text-center leading-relaxed">
                {flashcard.concept}
              </h2>
            </div>
            
            <div className="text-center text-xs sm:text-sm text-gray-500 mt-4">
              <span className="hidden sm:inline">Haz clic para ver la definición</span>
              <span className="sm:hidden">Toca o desliza para ver definición</span>
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
            
            <div className="flex-1 flex items-center justify-center px-2">
              <p className="text-sm sm:text-lg text-gray-800 text-center leading-relaxed">
                {flashcard.definition}
              </p>
            </div>
            
            <div className="text-center text-xs sm:text-sm text-gray-500 mt-4">
              ¿Qué tan bien conoces este concepto?
            </div>
          </div>
        </Card>
      </div>

      {/* Action Buttons */}
      {hasAnswered && isFlipped && (
        <div className="mt-6 flex flex-col sm:flex-row justify-center gap-3">
          <Button
            variant="secondary"
            size="md"
            onClick={() => handleConfidence(0.2)}
            icon={<XIcon className="w-5 h-5 sm:w-4 sm:h-4" />}
            className="bg-red-50 border-red-200 text-red-700 hover:bg-red-100 w-full sm:w-auto py-3 sm:py-2"
          >
            Difícil
          </Button>
          
          <Button
            variant="secondary"
            size="md"
            onClick={() => handleConfidence(0.5)}
            icon={<RefreshCwIcon className="w-5 h-5 sm:w-4 sm:h-4" />}
            className="bg-yellow-50 border-yellow-200 text-yellow-700 hover:bg-yellow-100 w-full sm:w-auto py-3 sm:py-2"
          >
            Normal
          </Button>
          
          <Button
            variant="primary"
            size="md"
            onClick={() => handleConfidence(0.8)}
            icon={<CheckIcon className="w-5 h-5 sm:w-4 sm:h-4" />}
            className="bg-green-600 hover:bg-green-700 w-full sm:w-auto py-3 sm:py-2"
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
            size="md"
            onClick={handleFlip}
            icon={<RefreshCwIcon className="w-5 h-5 sm:w-4 sm:h-4" />}
            className="w-full sm:w-auto py-3 sm:py-2"
          >
            Voltear Tarjeta
          </Button>
        </div>
      )}
    </div>
  );
});

FlashcardComponent.displayName = 'FlashcardComponent';