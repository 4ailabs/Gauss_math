export interface ProcessedData {
  summary: string;
  keyConcepts: {
    concept: string;
    definition: string;
  }[];
  quizQuestions: {
    question: string;
    answer: string;
    type: 'definition' | 'problem' | 'theorem';
  }[];
  relatedProblems: {
    problem: string;
    solution: string;
  }[];
}

export interface ChatMessage {
  role: 'user' | 'model';
  content: string;
}