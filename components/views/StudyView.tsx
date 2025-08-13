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
  BarChart3Icon,
  RefreshCwIcon,
  PlayIcon,
  PauseIcon,
  ArrowRightIcon
} from '../ui/Icons';

const StudyView: React.FC = React.memo(() => {
  const { 
    state: { selectedSubject, analysisHistory }, 
    setActiveView 
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
        {/* Flashcard Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Flashcards - {selectedSubject}</h2>
            <p className="text-gray-600 mt-1">Memoriza conceptos clave</p>
          </div>
          
          <div className="flex gap-3">
            <Button
              variant="secondary"
              onClick={() => setShowFlashcards(false)}
            >
              Ver Progreso
            </Button>
            
            <Button
              variant="secondary"
              onClick={shuffleFlashcards}
              icon={<RefreshCwIcon className="w-4 h-4" />}
              disabled={isStudying}
            >
              Mezclar
            </Button>
            
            {!isStudying ? (
              <Button
                variant="primary"
                onClick={startStudySession}
                icon={<PlayIcon className="w-4 h-4" />}
              >
                Iniciar
              </Button>
            ) : (
              <Button
                variant="secondary"
                onClick={stopStudySession}
                icon={<PauseIcon className="w-4 h-4" />}
              >
                Pausar
              </Button>
            )}
          </div>
        </div>

        {/* Study Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card padding="md" className="text-center">
            <BarChart3Icon className="w-6 h-6 text-teal-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-900">{getAverageConfidence()}%</div>
            <div className="text-sm text-gray-600">Confianza</div>
          </Card>
          
          <Card padding="md" className="text-center">
            <BookOpenIcon className="w-6 h-6 text-blue-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-900">{flashcards.length}</div>
            <div className="text-sm text-gray-600">Tarjetas</div>
          </Card>
          
          <Card padding="md" className="text-center">
            <TrophyIcon className="w-6 h-6 text-green-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-900">{sessionStats.reviewed}</div>
            <div className="text-sm text-gray-600">Revisadas</div>
          </Card>
          
          <Card padding="md" className="text-center">
            <ClockIcon className="w-6 h-6 text-purple-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-900">{getStudyTime()}</div>
            <div className="text-sm text-gray-600">Minutos</div>
          </Card>
        </div>

        {/* Progress Bar */}
        <div>
          <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
            <span>Progreso</span>
            <span>{currentIndex + 1} de {flashcards.length}</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-teal-600 h-2 rounded-full transition-all duration-300"
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
            showStats={true}
          />
        )}

        {/* Navigation */}
        <div className="flex justify-between">
          <Button
            variant="secondary"
            onClick={handlePrevious}
            disabled={currentIndex === 0}
          >
            ← Anterior
          </Button>
          
          <div className="text-center">
            <span className="text-sm text-gray-500">
              {currentIndex === flashcards.length - 1 
                ? 'Última tarjeta' 
                : `${flashcards.length - currentIndex - 1} restantes`
              }
            </span>
          </div>
          
          <Button
            variant="secondary"
            onClick={handleNext}
            disabled={currentIndex === flashcards.length - 1}
          >
            Siguiente →
          </Button>
        </div>

        {/* Session Complete */}
        {isStudying && currentIndex === flashcards.length - 1 && (
          <Card padding="lg" className="text-center border-green-200 bg-green-50">
            <TrophyIcon className="w-12 h-12 text-green-600 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-green-900 mb-2">¡Sesión Completada!</h3>
            <p className="text-green-700 mb-4">
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
          <h2 className="text-2xl font-bold text-gray-900">Progreso de Estudio</h2>
          
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
            <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-teal-600 text-2xl font-bold">{analysisHistory.length}</span>
            </div>
            <h3 className="font-semibold text-gray-900">Análisis Realizados</h3>
            <p className="text-sm text-gray-600">Total de sesiones de estudio</p>
          </div>
          
          <div className="text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-blue-600 text-2xl font-bold">{totalConcepts}</span>
            </div>
            <h3 className="font-semibold text-gray-900">Conceptos Estudiados</h3>
            <p className="text-sm text-gray-600">Conceptos identificados y revisados</p>
          </div>
          
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-green-600 text-2xl font-bold">{totalQuestions}</span>
            </div>
            <h3 className="font-semibold text-gray-900">Preguntas Generadas</h3>
            <p className="text-sm text-gray-600">Preguntas de práctica creadas</p>
          </div>
        </div>

        {subjectStats.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Materias Estudiadas</h3>
            <div className="grid gap-4">
              {subjectStats.map(({ subject, count }) => {
                const subjectFlashcards = generateFlashcards.filter(card => card.subject === subject);
                return (
                  <div key={subject} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <span className="font-medium text-gray-900">{subject}</span>
                      <div className="text-sm text-gray-600 mt-1">
                        {count} análisis • {subjectFlashcards.length} flashcards disponibles
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-16 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-teal-600 h-2 rounded-full" 
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