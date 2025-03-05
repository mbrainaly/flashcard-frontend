export interface DashboardStats {
  totalFlashcards: number
  totalNotes: number
  totalQuizzes: number
  studyStreak: number
}

export interface RecentActivity {
  type: 'flashcard' | 'quiz' | 'note'
  title: string
  date: string
  details?: string
} 