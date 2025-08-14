import React, { useState } from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { CheckCircleIcon, XCloseIcon, RefreshCwIcon } from '../ui/Icons';

interface InteractiveQuizSectionProps {
  questions: Array<{
    question: string;
    answer: string;
    type: string;
    options?: string[];
    correctOption?: string;
  }>;
}

export const InteractiveQuizSection: React.FC<InteractiveQuizSectionProps> = React.memo(({ questions }) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<{[key: number]: string}>({});
  const [showResults, setShowResults] = useState(false);
  const [quizCompleted, setQuizCompleted] = useState(false);

  const handleAnswerSelect = (questionIndex: number, answer: string) => {
    if (!showResults) {
      setSelectedAnswers(prev => ({
        ...prev,
        [questionIndex]: answer
      }));
    }
  };

  const checkAnswer = (questionIndex: number) => {
    const question = questions[questionIndex];
    const userAnswer = selectedAnswers[questionIndex];
    
    if (question.correctOption) {
      return userAnswer === question.correctOption;
    }
    
    // Para preguntas sin opciones múltiples, consideramos correcto si hay respuesta
    return !!userAnswer;
  };

  const getScore = () => {
    let correct = 0;
    questions.forEach((_, index) => {
      if (checkAnswer(index)) correct++;
    });
    return { correct, total: questions.length };
  };

  const nextQuestion = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
    } else {
      setQuizCompleted(true);
      setShowResults(true);
    }
  };

  const resetQuiz = () => {
    setCurrentQuestion(0);
    setSelectedAnswers({});
    setShowResults(false);
    setQuizCompleted(false);
  };

  const currentQ = questions[currentQuestion];
  const score = getScore();

  if (quizCompleted && showResults) {
    return (
      <div className="space-y-6">
        <Card className="text-center p-8 bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl font-bold text-blue-600">{Math.round((score.correct / score.total) * 100)}%</span>
          </div>
          <h3 className="text-xl font-bold text-slate-700 mb-2">¡Quiz Completado!</h3>
          <p className="text-slate-600 mb-4">
            Respondiste {score.correct} de {score.total} preguntas correctamente
          </p>
          <div className="flex justify-center gap-3">
            <Button
              variant="primary"
              onClick={resetQuiz}
              icon={<RefreshCwIcon className="w-4 h-4" />}
            >
              Intentar de Nuevo
            </Button>
            <Button
              variant="secondary"
              onClick={() => setShowResults(false)}
            >
              Revisar Respuestas
            </Button>
          </div>
        </Card>

        {/* Resultados detallados */}
        <div className="space-y-4">
          <h4 className="text-lg font-semibold text-slate-700">Resultados Detallados</h4>
          {questions.map((question, index) => {
            const isCorrect = checkAnswer(index);
            const userAnswer = selectedAnswers[index];
            
            return (
              <Card key={index} className={`border-l-4 ${isCorrect ? 'border-l-green-500 bg-green-50' : 'border-l-red-500 bg-red-50'}`}>
                <div className="flex items-start gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${isCorrect ? 'bg-green-100' : 'bg-red-100'}`}>
                    {isCorrect ? (
                      <CheckCircleIcon className="w-5 h-5 text-green-600" />
                    ) : (
                      <XCloseIcon className="w-5 h-5 text-red-600" />
                    )}
                  </div>
                  <div className="flex-1">
                    <h5 className="font-medium text-slate-700 mb-2">{question.question}</h5>
                    <div className="space-y-1 text-sm">
                      <p className={`${isCorrect ? 'text-green-700' : 'text-red-700'}`}>
                        Tu respuesta: {userAnswer || 'Sin respuesta'}
                      </p>
                      <p className="text-slate-600">
                        Respuesta correcta: {question.correctOption || question.answer}
                      </p>
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Barra de progreso */}
      <div className="bg-white rounded-lg p-4 border border-slate-200">
        <div className="flex items-center justify-between text-sm text-slate-600 mb-2">
          <span>Progreso del Quiz</span>
          <span>{currentQuestion + 1} de {questions.length}</span>
        </div>
        <div className="w-full bg-slate-200 rounded-full h-2">
          <div 
            className="bg-blue-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Pregunta actual */}
      <Card className="p-6">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-lg font-bold flex-shrink-0">
            {currentQuestion + 1}
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-slate-700 mb-4">{currentQ.question}</h3>
            
            {/* Opciones de respuesta */}
            {currentQ.options && currentQ.options.length > 0 ? (
              <div className="space-y-2">
                {currentQ.options.map((option, optionIndex) => {
                  const optionLetter = String.fromCharCode(65 + optionIndex); // A, B, C, D
                  const isSelected = selectedAnswers[currentQuestion] === optionLetter;
                  
                  return (
                    <button
                      key={optionIndex}
                      onClick={() => handleAnswerSelect(currentQuestion, optionLetter)}
                      className={`w-full text-left p-3 rounded-lg border transition-colors ${
                        isSelected 
                          ? 'border-blue-500 bg-blue-50 text-blue-700' 
                          : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      <span className="font-medium">{optionLetter})</span> {option}
                    </button>
                  );
                })}
              </div>
            ) : (
              // Pregunta abierta
              <div className="space-y-3">
                <textarea
                  value={selectedAnswers[currentQuestion] || ''}
                  onChange={(e) => handleAnswerSelect(currentQuestion, e.target.value)}
                  placeholder="Escribe tu respuesta aquí..."
                  className="w-full h-24 p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                />
                <div className="bg-slate-50 p-3 rounded-lg">
                  <p className="text-sm text-slate-600">
                    <span className="font-medium">Pista:</span> {currentQ.answer}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </Card>

      {/* Navegación */}
      <div className="flex justify-between">
        <Button
          variant="secondary"
          onClick={() => setCurrentQuestion(Math.max(0, currentQuestion - 1))}
          disabled={currentQuestion === 0}
        >
          ← Anterior
        </Button>
        
        <Button
          variant="primary"
          onClick={nextQuestion}
          disabled={!selectedAnswers[currentQuestion]}
        >
          {currentQuestion === questions.length - 1 ? 'Finalizar Quiz' : 'Siguiente →'}
        </Button>
      </div>
    </div>
  );
});