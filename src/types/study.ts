export interface StudyProgress {
  quizAverage: number
  flashcardMastery: number
  totalStudyTime: number
  subjectProgress: SubjectProgress[]
  quizSuccessRate: number
  averageScore: number
  totalStudyHours: number
  masteredTopics: number
  weakAreas: SubjectArea[]
  strongAreas: SubjectArea[]
}

export interface SubjectProgress {
  subject: string
  progress: number
  timeSpent: number
  lastStudied: string
}

export interface SubjectArea {
  subject: string
  score: number
  attempts: number
  timeSpent: number
  lastAttemptDate: string
} 