import React, { useState, useEffect, useMemo } from 'react';
import { useApp } from '../../contexts/AppContext';
import { Flashcard } from '../../types';
import { FlashcardComponent } from '../flashcards/FlashcardComponent';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { 
  BookOpenIcon, 
  TrophyIcon, 
  ClockIcon, 
  TargetIcon,
  RefreshCwIcon,
  PlayIcon,
  PauseIcon,
  ChevronRightIcon,
  BarChart3Icon,
  ArrowRightIcon
} from '../ui/Icons';

const StudyView: React.FC = React.memo(() => {
  const { 
    state: { selectedSubject, analysisHistory }, 
    setActiveView,
    removeFlashcard
  } = useApp();

  const [showFlashcards, setShowFlashcards] = useState(false);
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isStudying, setIsStudying] = useState(false);
  const [studyStartTime, setStudyStartTime] = useState<number | null>(null);
  const [sessionStats, setSessionStats] = useState({
    reviewed: 0,
    correct: 0,
    total: 0
  });

  // Generate flashcards from analysis history
  const generateFlashcards = useMemo(() => {
    const cards: Flashcard[] = [];
    
    analysisHistory.forEach((analysis) => {
      if (analysis.subject === selectedSubject) {
        analysis.processedData.keyConcepts.forEach((concept, index) => {
          const existingCard = cards.find(c => 
            c.concept.toLowerCase() === concept.concept.toLowerCase() && 
            c.subject === analysis.subject
          );
          
          if (!existingCard) {
            cards.push({
              id: `${analysis.id}-${index}`,
              concept: concept.concept,
              definition: concept.definition,
              topic: analysis.title,
              subject: analysis.subject,
              confidence: analysis.confidence || 0.5,
              lastReviewed: analysis.lastReviewed || analysis.timestamp,
              reviewCount: analysis.reviewCount || 0,
              nextReview: Date.now()
            });
          }
        });
      }
    });
    
    return cards;
  }, [analysisHistory, selectedSubject]);

  useEffect(() => {
    setFlashcards(generateFlashcards);
    setCurrentIndex(0);
    setSessionStats({ reviewed: 0, correct: 0, total: generateFlashcards.length });
  }, [generateFlashcards]);

  const getSubjectStats = () => {
    const subjects = analysisHistory.reduce((acc, item) => {
      acc[item.subject] = (acc[item.subject] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    return Object.entries(subjects).map(([subject, count]) => ({ subject, count }));
  };

  const subjectStats = getSubjectStats();
  const totalConcepts = analysisHistory.reduce((acc, item) => acc + item.processedData.keyConcepts.length, 0);
  const totalQuestions = analysisHistory.reduce((acc, item) => acc + item.processedData.quizQuestions.length, 0);

  const handleConfidenceUpdate = (id: string, confidence: number) => {
    setFlashcards(prev => prev.map(card => 
      card.id === id 
        ? {
            ...card,
            confidence: Math.min(1, Math.max(0, confidence)),
            lastReviewed: Date.now(),
            reviewCount: card.reviewCount + 1,
            nextReview: Date.now() + (confidence > 0.6 ? 7 * 24 * 60 * 60 * 1000 : 1 * 24 * 60 * 60 * 1000)
          }
        : card
    ));
    
    setSessionStats(prev => ({
      ...prev,
      reviewed: prev.reviewed + 1,
      correct: confidence > 0.6 ? prev.correct + 1 : prev.correct
    }));
  };

  const handleDeleteFlashcard = (id: string) => {
    // Remover de las flashcards locales
    setFlashcards(prev => prev.filter(card => card.id !== id));
    
    // Remover del contexto global
    removeFlashcard(id);
    
    // Ajustar el índice actual si es necesario
    if (currentIndex >= flashcards.length - 1) {
      setCurrentIndex(Math.max(0, flashcards.length - 2));
    }
    
    // Actualizar estadísticas
    setSessionStats(prev => ({ ...prev, total: prev.total - 1 }));
  };

  const handleNext = () => {
    if (currentIndex < flashcards.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      setIsStudying(false);
      setStudyStartTime(null);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    }
  };

  const startStudySession = () => {
    setIsStudying(true);
    setStudyStartTime(Date.now());
    setCurrentIndex(0);
    setSessionStats({ reviewed: 0, correct: 0, total: flashcards.length });
  };

  const stopStudySession = () => {
    setIsStudying(false);
    setStudyStartTime(null);
  };

  const shuffleFlashcards = () => {
    const shuffled = [...flashcards].sort(() => Math.random() - 0.5);
    setFlashcards(shuffled);
    setCurrentIndex(0);
  };

  const getStudyTime = () => {
    if (!studyStartTime) return 0;
    return Math.floor((Date.now() - studyStartTime) / 1000 / 60);
  };

  const getAverageConfidence = () => {
    if (flashcards.length === 0) return 0;
    const total = flashcards.reduce((sum, card) => sum + card.confidence, 0);
    return Math.round((total / flashcards.length) * 100);
  };

  if (showFlashcards) {
    const currentCard = flashcards[currentIndex];

    return (
      <div className="space-y-6">
        {/* Flashcard Header - móvil optimizado */}
        <div className="space-y-4 sm:space-y-0 sm:flex sm:items-center sm:justify-between">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-600">Flashcards - {selectedSubject}</h2>
            <p className="text-slate-500 mt-1 text-sm sm:text-base">Memoriza conceptos clave</p>
          </div>
          
          {/* Botones en grid móvil para evitar overflow */}
          <div className="grid grid-cols-3 gap-2 sm:flex sm:gap-3">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setShowFlashcards(false)}
              className="text-xs sm:text-sm px-2 sm:px-3 py-2"
            >
              <span className="hidden sm:inline">Ver Progreso</span>
              <span className="sm:hidden">Progreso</span>
            </Button>
            
            <Button
              variant="secondary"
              size="sm"
              onClick={shuffleFlashcards}
              icon={<RefreshCwIcon className="w-4 h-4" />}
              disabled={isStudying}
              className="text-xs sm:text-sm px-2 sm:px-3 py-2"
            >
              <span className="hidden sm:inline">Mezclar</span>
              <span className="sm:hidden">Mezclar</span>
            </Button>
            
            {!isStudying ? (
              <Button
                variant="primary"
                size="sm"
                onClick={startStudySession}
                icon={<PlayIcon className="w-4 h-4" />}
                className="text-xs sm:text-sm px-2 sm:px-3 py-2"
              >
                <span className="hidden sm:inline">Iniciar</span>
                <span className="sm:hidden">Play</span>
              </Button>
            ) : (
              <Button
                variant="secondary"
                size="sm"
                onClick={stopStudySession}
                icon={<PauseIcon className="w-4 h-4" />}
                className="text-xs sm:text-sm px-2 sm:px-3 py-2"
              >
                <span className="hidden sm:inline">Pausar</span>
                <span className="sm:hidden">Pausa</span>
              </Button>
            )}
          </div>
        </div>

        {/* Study Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
          <Card padding="sm" className="text-center">
            <BarChart3Icon className="w-5 h-5 md:w-6 md:h-6 text-slate-500 mx-auto mb-1 md:mb-2" />
            <div className="text-lg md:text-2xl font-bold text-slate-600">{getAverageConfidence()}%</div>
            <div className="text-xs md:text-sm text-slate-500">Confianza</div>
          </Card>
          
          <Card padding="sm" className="text-center">
            <BookOpenIcon className="w-5 h-5 md:w-6 md:h-6 text-slate-500 mx-auto mb-1 md:mb-2" />
            <div className="text-lg md:text-2xl font-bold text-slate-600">{flashcards.length}</div>
            <div className="text-xs md:text-sm text-slate-500">Tarjetas</div>
          </Card>
          
          <Card padding="sm" className="text-center">
            <TrophyIcon className="w-5 h-5 md:w-6 md:h-6 text-slate-500 mx-auto mb-1 md:mb-2" />
            <div className="text-lg md:text-2xl font-bold text-slate-600">{sessionStats.reviewed}</div>
            <div className="text-xs md:text-sm text-slate-500">Revisadas</div>
          </Card>
          
          <Card padding="sm" className="text-center">
            <ClockIcon className="w-5 h-5 md:w-6 md:h-6 text-slate-500 mx-auto mb-1 md:mb-2" />
            <div className="text-lg md:text-2xl font-bold text-slate-600">{getStudyTime()}</div>
            <div className="text-xs md:text-sm text-slate-500">Minutos</div>
          </Card>
        </div>

        {/* Progress Bar */}
        <div>
          <div className="flex items-center justify-between text-sm text-slate-500 mb-2">
            <span>Progreso</span>
            <span>{currentIndex + 1} de {flashcards.length}</span>
          </div>
          <div className="w-full bg-slate-200 rounded-full h-2">
            <div 
              className="bg-slate-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${((currentIndex + 1) / flashcards.length) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Flashcard */}
        {currentCard && flashcards.length > 0 && (
          <FlashcardComponent
            flashcard={currentCard}
            onConfidenceUpdate={handleConfidenceUpdate}
            onNext={handleNext}
            onDelete={handleDeleteFlashcard}
            showStats={true}
          />
        )}

        {/* Navigation */}
        <div className="flex flex-col sm:flex-row justify-between gap-3 sm:gap-0">
          <Button
            variant="secondary"
            size="md"
            onClick={handlePrevious}
            disabled={currentIndex === 0}
            className="w-full sm:w-auto py-3 sm:py-2"
          >
            ← Anterior
          </Button>
          
          <div className="text-center order-first sm:order-none">
            <span className="text-xs sm:text-sm text-slate-500">
              {currentIndex === flashcards.length - 1 
                ? 'Última tarjeta' 
                : `${flashcards.length - currentIndex - 1} restantes`
              }
            </span>
          </div>
          
          <Button
            variant="secondary"
            size="md"
            onClick={handleNext}
            disabled={currentIndex === flashcards.length - 1}
            className="w-full sm:w-auto py-3 sm:py-2"
          >
            Siguiente →
          </Button>
        </div>

        {/* Session Complete */}
        {isStudying && currentIndex === flashcards.length - 1 && (
          <Card padding="lg" className="text-center border-slate-200 bg-slate-50">
            <TrophyIcon className="w-12 h-12 text-slate-500 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-slate-600 mb-2">¡Sesión Completada!</h3>
            <p className="text-slate-600 mb-4">
              Revisaste {sessionStats.reviewed} flashcards en {getStudyTime()} minutos
            </p>
            <div className="flex justify-center gap-3">
              <Button
                variant="primary"
                onClick={() => {
                  shuffleFlashcards();
                  startStudySession();
                }}
              >
                Nueva Sesión
              </Button>
              <Button
                variant="secondary"
                onClick={() => setShowFlashcards(false)}
              >
                Ver Progreso
              </Button>
            </div>
          </Card>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card padding="lg">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-slate-600">Progreso de Estudio</h2>
          
          {flashcards.length > 0 && (
            <Button
              variant="primary"
              onClick={() => setShowFlashcards(true)}
              icon={<ArrowRightIcon className="w-4 h-4" />}
            >
              Practicar con Flashcards ({flashcards.length})
            </Button>
          )}
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="text-center">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-slate-600 text-2xl font-bold">{analysisHistory.length}</span>
            </div>
            <h3 className="font-semibold text-slate-600">Análisis Realizados</h3>
            <p className="text-sm text-slate-500">Total de sesiones de estudio</p>
          </div>
          
          <div className="text-center">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-slate-600 text-2xl font-bold">{totalConcepts}</span>
            </div>
            <h3 className="font-semibold text-slate-600">Conceptos Estudiados</h3>
            <p className="text-sm text-slate-500">Conceptos identificados y revisados</p>
          </div>
          
          <div className="text-center">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-slate-600 text-2xl font-bold">{totalQuestions}</span>
            </div>
            <h3 className="font-semibold text-slate-600">Preguntas Generadas</h3>
            <p className="text-sm text-slate-500">Preguntas de práctica creadas</p>
          </div>
        </div>

        {subjectStats.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold text-slate-600 mb-4">Materias Estudiadas</h3>
            <div className="grid gap-4">
              {subjectStats.map(({ subject, count }) => {
                const subjectFlashcards = generateFlashcards.filter(card => card.subject === subject);
                return (
                  <div key={subject} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                    <div>
                      <span className="font-medium text-slate-600">{subject}</span>
                      <div className="text-sm text-slate-500 mt-1">
                        {count} análisis • {subjectFlashcards.length} flashcards disponibles
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-16 bg-slate-200 rounded-full h-2">
                        <div 
                          className="bg-slate-500 h-2 rounded-full" 
                          style={{ width: `${(count / Math.max(...subjectStats.map(s => s.count))) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </Card>
    </div>
  );
});

export default StudyView;