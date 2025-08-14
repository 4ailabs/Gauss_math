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
    <div className="w-full max-w-2xl mx-auto px-3 sm:px-4 md:px-8 safe-area-bottom">
      {/* Stats Bar - móvil optimizado */}
      {showStats && (
        <div className="mb-3 sm:mb-4 p-3 bg-slate-50 rounded-lg border border-slate-200">
          <div className="space-y-2 sm:space-y-0 sm:flex sm:items-center sm:justify-between text-slate-600">
            {/* Primera fila móvil */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TargetIcon className="w-4 h-4" />
                <span className="text-xs sm:text-sm">Confianza:</span>
                <span className={`px-2 py-1 rounded text-white text-xs font-medium ${getConfidenceColor(flashcard.confidence)}`}>
                  {Math.round(flashcard.confidence * 100)}%
                </span>
              </div>
              {onDelete && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (confirm('¿Estás seguro de que quieres eliminar esta flashcard?')) {
                      onDelete(flashcard.id);
                    }
                  }}
                  className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-full transition-colors ios-touch-optimize"
                  title="Eliminar flashcard"
                >
                  <Trash2Icon className="w-4 h-4" />
                </button>
              )}
            </div>
            
            {/* Segunda fila móvil */}
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-3">
                <span>Revisiones: {flashcard.reviewCount}</span>
                <span className="hidden sm:inline">Último: {formatLastReviewed(flashcard.lastReviewed)}</span>
              </div>
              <span className="bg-slate-200 text-slate-600 px-2 py-1 rounded-full text-xs">
                {flashcard.subject}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Flashcard - altura optimizada para móvil */}
      <div 
        className={`flashcard-container relative w-full h-64 sm:h-80 md:h-96 cursor-pointer ios-touch-optimize ${
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
          } border-2 border-slate-300 shadow-lg overflow-hidden transition-opacity duration-300 ease-in-out`}
          padding="sm"
        >
          <div className="h-full flex flex-col p-2 sm:p-4">
            <div className="text-center mb-2 sm:mb-3 flex-shrink-0">
              <span className="text-xs sm:text-sm text-slate-600 font-medium bg-slate-100 px-3 py-1 rounded-full">
                CONCEPTO
              </span>
            </div>
            
            <div className="flex-1 flex items-center justify-center px-2 overflow-hidden">
              <h2 className="text-sm sm:text-lg md:text-xl font-semibold text-slate-800 text-center leading-tight sm:leading-relaxed break-words hyphens-auto line-clamp-3 sm:line-clamp-none">
                {flashcard.concept}
              </h2>
            </div>
            
            <div className="text-center text-xs text-slate-500 mt-2 flex-shrink-0 bg-slate-50 py-2 rounded-lg">
              <span className="hidden sm:inline">🔄 Haz clic para ver la definición</span>
              <span className="sm:hidden">🔄 Toca para definición</span>
            </div>
          </div>
        </Card>

        {/* Back side */}
        <Card 
          className={`flashcard-face flashcard-back absolute inset-0 ${
            isFlipped ? 'opacity-100' : 'opacity-0'
          } transition-opacity duration-300 ease-in-out border-2 border-slate-300 shadow-lg overflow-hidden`}
          padding="sm"
        >
          <div className="h-full flex flex-col p-2 sm:p-4">
            <div className="text-center mb-2 sm:mb-3 flex-shrink-0">
              <span className="text-xs sm:text-sm text-slate-600 font-medium bg-blue-100 px-3 py-1 rounded-full">
                DEFINICIÓN
              </span>
            </div>
            
            <div className="flex-1 flex items-center justify-center px-2 overflow-y-auto">
              <div className="w-full max-h-full overflow-y-auto">
                <p className="text-xs sm:text-base text-slate-800 text-center leading-relaxed break-words hyphens-auto">
                  {flashcard.definition}
                </p>
              </div>
            </div>
            
            <div className="text-center text-xs text-slate-500 mt-2 flex-shrink-0 bg-slate-50 py-2 rounded-lg">
              💭 ¿Qué tan bien conoces este concepto?
            </div>
          </div>
        </Card>
      </div>

      {/* Action Buttons - optimizados para móvil */}
      {hasAnswered && isFlipped && (
        <div className="mt-3 sm:mt-6 space-y-2 sm:space-y-0 sm:flex sm:justify-center sm:gap-4 px-1">
          <Button
            variant="secondary"
            size="lg"
            onClick={() => handleConfidence(0.2)}
            icon={<XIcon className="w-5 h-5" />}
            className="bg-red-50 border-red-300 text-red-800 hover:bg-red-100 active:bg-red-200 w-full sm:w-auto py-4 min-h-[48px] ios-touch-optimize font-medium"
          >
            <span className="text-sm sm:text-base">😰 Difícil</span>
          </Button>
          
          <Button
            variant="secondary"
            size="lg"
            onClick={() => handleConfidence(0.5)}
            icon={<RefreshCwIcon className="w-5 h-5" />}
            className="bg-yellow-50 border-yellow-300 text-yellow-800 hover:bg-yellow-100 active:bg-yellow-200 w-full sm:w-auto py-4 min-h-[48px] ios-touch-optimize font-medium"
          >
            <span className="text-sm sm:text-base">🤔 Normal</span>
          </Button>
          
          <Button
            variant="secondary"
            size="lg"
            onClick={() => handleConfidence(0.8)}
            icon={<CheckIcon className="w-5 h-5" />}
            className="bg-green-50 border-green-300 text-green-800 hover:bg-green-100 active:bg-green-200 w-full sm:w-auto py-4 min-h-[48px] ios-touch-optimize font-medium"
          >
            <span className="text-sm sm:text-base">😊 Fácil</span>
          </Button>
        </div>
      )}

      {/* Flip Button - optimizado para móvil */}
      {!hasAnswered && (
        <div className="mt-3 sm:mt-6 text-center px-1">
          <Button
            variant="primary"
            size="lg"
            onClick={handleFlip}
            icon={<RefreshCwIcon className="w-5 h-5" />}
            className="w-full sm:w-auto py-4 min-h-[48px] ios-touch-optimize font-medium bg-teal-700 hover:bg-teal-800"
          >
            <span className="text-sm sm:text-base">🔄 Voltear Tarjeta</span>
          </Button>
        </div>
      )}
    </div>
  );
});

FlashcardComponent.displayName = 'FlashcardComponent';