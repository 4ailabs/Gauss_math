import React, { useState, useEffect } from 'react';
import { Flashcard } from '../../types';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { RefreshCwIcon, CheckIcon, XIcon, TargetIcon, Trash2Icon } from '../ui/Icons';

// Estilos CSS personalizados para evitar el temblor
const flashcardStyles = `
  .flashcard-container {
    transform-style: preserve-3d;
    perspective: 1000px;
  }
  
  .flashcard-face {
    backface-visibility: hidden;
    transform-style: preserve-3d;
    will-change: transform, opacity;
  }
  
  .flashcard-front {
    transform: rotateY(0deg);
  }
  
  .flashcard-back {
    transform: rotateY(180deg);
  }
  
  .flashcard-flipped .flashcard-front {
    transform: rotateY(180deg);
  }
  
  .flashcard-flipped .flashcard-back {
    transform: rotateY(0deg);
  }
`;

interface FlashcardComponentProps {
  flashcard: Flashcard;
  onConfidenceUpdate: (id: string, confidence: number) => void;
  onNext: () => void;
  onDelete?: (id: string) => void;
  showStats?: boolean;
}

export const FlashcardComponent: React.FC<FlashcardComponentProps> = React.memo(({
  flashcard,
  onConfidenceUpdate,
  onNext,
  onDelete,
  showStats = true
}) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const [hasAnswered, setHasAnswered] = useState(false);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  // Inyectar estilos CSS personalizados para evitar el temblor
  useEffect(() => {
    const styleElement = document.createElement('style');
    styleElement.textContent = flashcardStyles;
    document.head.appendChild(styleElement);

    return () => {
      document.head.removeChild(styleElement);
    };
  }, []);

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
    <div className="w-full max-w-2xl mx-auto px-4 xs:px-6 sm:px-8 safe-area-bottom">
      {/* Stats Bar */}
      {showStats && (
        <div className="mb-4 p-3 bg-slate-50 rounded-lg border border-slate-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between text-sm text-slate-600 gap-2 sm:gap-0">
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
            <div className="flex items-center gap-2">
                              <span className="text-xs text-slate-500 bg-slate-200 px-2 py-1 rounded self-start sm:self-auto">
                {flashcard.subject}
              </span>
              {onDelete && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (confirm('¿Estás seguro de que quieres eliminar esta flashcard?')) {
                      onDelete(flashcard.id);
                    }
                  }}
                  className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-full transition-colors"
                  title="Eliminar flashcard"
                >
                  <Trash2Icon className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Flashcard */}
      <div 
        className={`flashcard-container relative w-full h-72 xs:h-80 sm:h-96 cursor-pointer ${
          isFlipped ? 'flashcard-flipped' : ''
        }`}
        onClick={handleFlip}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        {/* Front side */}
        <Card 
          className={`flashcard-face flashcard-front absolute inset-0 ${
            isFlipped ? 'opacity-0' : 'opacity-100'
          } border-2 border-slate-200 overflow-hidden transition-opacity duration-300 ease-in-out`}
          padding="md"
        >
          <div className="h-full flex flex-col">
            <div className="text-center mb-2 sm:mb-4 flex-shrink-0">
              <span className="text-xs sm:text-sm text-slate-600 font-medium">CONCEPTO</span>
            </div>
            
            <div className="flex-1 flex items-center justify-center px-1 sm:px-2 overflow-hidden">
              <h2 className="text-base xs:text-lg sm:text-xl font-semibold text-slate-700 text-center leading-snug sm:leading-relaxed break-words hyphens-auto overflow-hidden flashcard-text max-w-full">
                {flashcard.concept}
              </h2>
            </div>
            
            <div className="text-center text-xs sm:text-sm text-slate-500 mt-2 sm:mt-4 flex-shrink-0">
              <span className="hidden sm:inline">Haz clic para ver la definición</span>
              <span className="sm:hidden">Toca para ver definición</span>
            </div>
          </div>
        </Card>

        {/* Back side */}
        <Card 
          className={`flashcard-face flashcard-back absolute inset-0 ${
            isFlipped ? 'opacity-100' : 'opacity-0'
          } transition-opacity duration-300 ease-in-out border-2 border-slate-200 overflow-hidden`}
          padding="md"
        >
          <div className="h-full flex flex-col">
            <div className="text-center mb-2 sm:mb-4 flex-shrink-0">
              <span className="text-xs sm:text-sm text-slate-600 font-medium">DEFINICIÓN</span>
            </div>
            
            <div className="flex-1 flex items-center justify-center px-1 sm:px-2 overflow-y-auto max-h-full">
              <div className="w-full max-h-full overflow-y-auto scrollbar-thin">
                <p className="text-xs xs:text-sm sm:text-lg text-slate-800 text-center leading-relaxed break-words hyphens-auto flashcard-text max-w-full">
                  {flashcard.definition}
                </p>
              </div>
            </div>
            
            <div className="text-center text-xs sm:text-sm text-slate-500 mt-2 sm:mt-4 flex-shrink-0">
              ¿Qué tan bien conoces este concepto?
            </div>
          </div>
        </Card>
      </div>

      {/* Action Buttons */}
      {hasAnswered && isFlipped && (
        <div className="mt-4 sm:mt-6 flex flex-col sm:flex-row justify-center gap-3 sm:gap-4 px-2">
          <Button
            variant="secondary"
            size="md"
            onClick={() => handleConfidence(0.2)}
            icon={<XIcon className="w-4 h-4" />}
            className="bg-red-50 border-red-200 text-red-700 hover:bg-red-100 w-full sm:w-auto py-3 sm:py-2 min-h-[44px] touch-manipulation"
          >
            <span className="text-sm sm:text-base">Difícil</span>
          </Button>
          
          <Button
            variant="secondary"
            size="md"
            onClick={() => handleConfidence(0.5)}
            icon={<RefreshCwIcon className="w-4 h-4" />}
            className="bg-yellow-50 border-yellow-200 text-yellow-700 hover:bg-yellow-100 w-full sm:w-auto py-3 sm:py-2 min-h-[44px] touch-manipulation"
          >
            <span className="text-sm sm:text-base">Normal</span>
          </Button>
          
          <Button
            variant="primary"
            size="md"
            onClick={() => handleConfidence(0.8)}
            icon={<CheckIcon className="w-4 h-4" />}
            className="bg-green-600 hover:bg-green-700 w-full sm:w-auto py-3 sm:py-2 min-h-[44px] touch-manipulation"
          >
            <span className="text-sm sm:text-base">Fácil</span>
          </Button>
        </div>
      )}

      {/* Flip Button */}
      {!hasAnswered && (
        <div className="mt-4 sm:mt-6 text-center px-2">
          <Button
            variant="secondary"
            size="md"
            onClick={handleFlip}
            icon={<RefreshCwIcon className="w-4 h-4" />}
            className="w-full sm:w-auto py-3 sm:py-2 min-h-[44px] touch-manipulation"
          >
            <span className="text-sm sm:text-base">Voltear Tarjeta</span>
          </Button>
        </div>
      )}
    </div>
  );
});

FlashcardComponent.displayName = 'FlashcardComponent';