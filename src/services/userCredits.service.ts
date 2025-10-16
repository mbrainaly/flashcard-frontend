import { fetchWithAuth } from '@/utils/fetchWithAuth';

export interface FeatureCredits {
  used: number;
  limit: number;
  remaining: number;
  unlimited: boolean;
}

export interface UserCredits {
  aiFlashcards: FeatureCredits;
  aiQuizzes: FeatureCredits;
  aiNotes: FeatureCredits;
  aiAssistant: FeatureCredits;
  decks: FeatureCredits;
}

export interface UserCreditsResponse {
  success: boolean;
  data: UserCredits;
}

export const getUserCredits = async (): Promise<UserCreditsResponse> => {
  const response = await fetchWithAuth('/api/user/credits');
  return response.json();
};

export const getFeatureDisplayName = (feature: keyof UserCredits): string => {
  const displayNames = {
    aiFlashcards: 'AI Flashcards',
    aiQuizzes: 'AI Quizzes',
    aiNotes: 'AI Notes',
    aiAssistant: 'AI Assistant',
    decks: 'Decks'
  };
  return displayNames[feature];
};

export const getFeatureDescription = (feature: keyof UserCredits): string => {
  const descriptions = {
    aiFlashcards: 'Generate flashcards using AI',
    aiQuizzes: 'Create quizzes with AI assistance',
    aiNotes: 'Generate study notes from content',
    aiAssistant: 'Get help from AI study assistant',
    decks: 'Create and manage flashcard decks'
  };
  return descriptions[feature];
};
