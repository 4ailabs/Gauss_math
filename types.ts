export interface ProcessedData {
  summary: string;
  keyConcepts: Array<{
    concept: string;
    definition: string;
  }>;
  quizQuestions: Array<{
    question: string;
    answer: string;
    type: string;
  }>;
  relatedProblems: Array<{
    problem: string;
    solution: string;
  }>;
}

export interface ChatMessage {
  role: 'user' | 'model';
  content: string;
}

export interface AnalysisHistory {
  id: string;
  title: string;
  subject: string;
  notes: string;
  processedData: ProcessedData;
  timestamp: number;
  tags?: string[];
  topics?: string[];
  confidence?: number;
  lastReviewed?: number;
  reviewCount?: number;
}

export interface Flashcard {
  id: string;
  concept: string;
  definition: string;
  topic: string;
  subject: string;
  confidence: number; // 0-1
  lastReviewed: number;
  reviewCount: number;
  nextReview: number; // timestamp para próxima revisión
}

export interface StudyProgress {
  topic: string;
  subject: string;
  confidence: number; // 0-1
  practiceQuestions: number;
  lastReviewed: number;
  reviewCount: number;
  flashcards: number;
  problemsSolved: number;
}

export interface StudyReminder {
  id: string;
  topic: string;
  subject: string;
  dueDate: number; // timestamp
  priority: 'low' | 'medium' | 'high';
  completed: boolean;
  description: string;
}