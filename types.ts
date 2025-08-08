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
}