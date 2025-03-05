import { fetchWithAuth } from '@/utils/fetchWithAuth';

export interface DashboardStats {
  totalFlashcards: number;
  totalNotes: number;
  totalQuizzes: number;
  studyStreak: number;
}

export interface RecentActivity {
  type: 'flashcard' | 'quiz' | 'note';
  title: string;
  date: string;
  details?: string;
}

export interface DailyActivity {
  date: string;
  decks: number;
  notes: number;
  quizzes: number;
}

export interface StudyProgress {
  quizAverage: number;
  flashcardMastery: number;
  totalStudyTime: number;
  subjectProgress: {
    subject: string;
    progress: number;
  }[];
}

export interface LearningStats {
  quizSuccessRate: number;
  averageScore: number;
  totalStudyHours: number;
  masteredTopics: number;
  weakAreas: {
    subject: string;
    score: number;
  }[];
  strongAreas: {
    subject: string;
    score: number;
  }[];
}

export const getDashboardStats = async (): Promise<DashboardStats> => {
  try {
    // Fetch data in parallel
    const [decksResponse, notesResponse, quizzesResponse] = await Promise.all([
      fetchWithAuth('/api/decks'),
      fetchWithAuth('/api/notes'),
      fetchWithAuth('/api/quizzes')
    ]);

    const decks = await decksResponse.json();
    const notes = await notesResponse.json();
    const quizzes = await quizzesResponse.json();

    // Get total number of decks
    const totalFlashcards = Array.isArray(decks) ? decks.length : 0;

    return {
      totalFlashcards,
      totalNotes: notes.notes.length,
      totalQuizzes: quizzes.data.length,
      studyStreak: 5 // TODO: Implement study streak calculation
    };
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    throw error;
  }
};

export const getRecentActivities = async (): Promise<RecentActivity[]> => {
  try {
    // Fetch recent activities from all sources in parallel
    const [decksResponse, notesResponse, quizzesResponse] = await Promise.all([
      fetchWithAuth('/api/decks?limit=5&sort=-updatedAt'),
      fetchWithAuth('/api/notes?limit=5&sort=-updatedAt'),
      fetchWithAuth('/api/quizzes?limit=5&sort=-updatedAt')
    ]);

    const decks = await decksResponse.json();
    const notes = await notesResponse.json();
    const quizzes = await quizzesResponse.json();

    // Combine and format activities
    const activities: RecentActivity[] = [
      // Add flashcard deck activities
      ...decks.map((deck: any) => ({
        type: 'flashcard' as const,
        title: deck.title,
        date: deck.updatedAt,
        details: `${deck.totalCards || 0} cards`
      })),

      // Add notes activities
      ...notes.notes.map((note: any) => ({
        type: 'note' as const,
        title: note.title,
        date: note.updatedAt
      })),

      // Add quiz activities
      ...quizzes.data.map((quiz: any) => ({
        type: 'quiz' as const,
        title: quiz.title,
        date: quiz.updatedAt,
        details: quiz.attempts?.length > 0 
          ? `Last score: ${quiz.attempts[quiz.attempts.length - 1].score}%` 
          : undefined
      }))
    ];

    // Sort by date (most recent first) and limit to 10 items
    return activities
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 10);
  } catch (error) {
    console.error('Error fetching recent activities:', error);
    throw error;
  }
};

export const getDailyActivityStats = async (days: number = 7): Promise<DailyActivity[]> => {
  try {
    // Fetch all activities
    const [decksResponse, notesResponse, quizzesResponse] = await Promise.all([
      fetchWithAuth('/api/decks'),
      fetchWithAuth('/api/notes'),
      fetchWithAuth('/api/quizzes')
    ]);

    const decks = await decksResponse.json();
    const notes = await notesResponse.json();
    const quizzes = await quizzesResponse.json();

    // Create a map of dates for the last 'days' days
    const dailyMap = new Map<string, DailyActivity>();
    for (let i = 0; i < days; i++) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      dailyMap.set(dateStr, {
        date: dateStr,
        decks: 0,
        notes: 0,
        quizzes: 0
      });
    }

    // Count activities by date
    decks.forEach((deck: any) => {
      const date = new Date(deck.createdAt).toISOString().split('T')[0];
      if (dailyMap.has(date)) {
        const activity = dailyMap.get(date)!;
        activity.decks++;
      }
    });

    notes.notes.forEach((note: any) => {
      const date = new Date(note.createdAt).toISOString().split('T')[0];
      if (dailyMap.has(date)) {
        const activity = dailyMap.get(date)!;
        activity.notes++;
      }
    });

    quizzes.data.forEach((quiz: any) => {
      const date = new Date(quiz.createdAt).toISOString().split('T')[0];
      if (dailyMap.has(date)) {
        const activity = dailyMap.get(date)!;
        activity.quizzes++;
      }
    });

    // Convert map to array and sort by date
    return Array.from(dailyMap.values())
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  } catch (error) {
    console.error('Error fetching daily activity stats:', error);
    throw error;
  }
};

export const getStudyProgress = async (): Promise<StudyProgress> => {
  try {
    // Fetch quiz and deck data in parallel
    const [quizzesResponse, decksResponse] = await Promise.all([
      fetchWithAuth('/api/quizzes'),
      fetchWithAuth('/api/decks')
    ]);

    const quizzes = await quizzesResponse.json();
    const decks = await decksResponse.json();

    // Calculate quiz average from all quiz attempts
    let totalQuizScore = 0;
    let totalAttempts = 0;
    quizzes.data.forEach((quiz: any) => {
      quiz.attempts?.forEach((attempt: any) => {
        totalQuizScore += attempt.score;
        totalAttempts++;
      });
    });
    const quizAverage = totalAttempts > 0 ? totalQuizScore / totalAttempts : 0;

    // Calculate flashcard mastery percentage
    let totalMastered = 0;
    let totalCards = 0;
    decks.forEach((deck: any) => {
      totalMastered += deck.studyProgress?.mastered || 0;
      totalCards += deck.totalCards || 0;
    });
    const flashcardMastery = totalCards > 0 ? (totalMastered / totalCards) * 100 : 0;

    // Calculate total study time (from quiz attempts)
    let totalStudyTime = 0;
    quizzes.data.forEach((quiz: any) => {
      quiz.attempts?.forEach((attempt: any) => {
        totalStudyTime += attempt.timeSpent || 0;
      });
    });

    // Calculate subject progress based on tags
    const subjectProgress = new Map<string, { total: number; mastered: number }>();
    
    // Add progress from decks
    decks.forEach((deck: any) => {
      deck.tags?.forEach((tag: string) => {
        const subject = tag.charAt(0).toUpperCase() + tag.slice(1);
        if (!subjectProgress.has(subject)) {
          subjectProgress.set(subject, { total: 0, mastered: 0 });
        }
        const progress = subjectProgress.get(subject)!;
        progress.total += deck.totalCards || 0;
        progress.mastered += deck.studyProgress?.mastered || 0;
      });
    });

    // Add progress from quizzes
    quizzes.data.forEach((quiz: any) => {
      quiz.tags?.forEach((tag: string) => {
        const subject = tag.charAt(0).toUpperCase() + tag.slice(1);
        if (!subjectProgress.has(subject)) {
          subjectProgress.set(subject, { total: 0, mastered: 0 });
        }
        const progress = subjectProgress.get(subject)!;
        progress.total += quiz.questions?.length || 0;
        if (quiz.analytics?.averageScore) {
          progress.mastered += (quiz.questions?.length || 0) * (quiz.analytics.averageScore / 100);
        }
      });
    });

    // Convert subject progress to array and calculate percentages
    const subjectProgressArray = Array.from(subjectProgress.entries())
      .map(([subject, data]) => ({
        subject,
        progress: data.total > 0 ? Math.round((data.mastered / data.total) * 100) : 0
      }))
      .sort((a, b) => b.progress - a.progress); // Sort by progress descending

    return {
      quizAverage: Math.round(quizAverage),
      flashcardMastery: Math.round(flashcardMastery),
      totalStudyTime: Math.round(totalStudyTime / 60), // Convert seconds to minutes
      subjectProgress: subjectProgressArray
    };
  } catch (error) {
    console.error('Error fetching study progress:', error);
    throw error;
  }
};

export const getLearningStats = async (): Promise<LearningStats> => {
  try {
    // Fetch quiz data and deck data in parallel
    const [quizzesResponse, decksResponse] = await Promise.all([
      fetchWithAuth('/api/quizzes'),
      fetchWithAuth('/api/decks')
    ]);

    const quizzes = await quizzesResponse.json();
    const decks = await decksResponse.json();

    // Calculate quiz success rate and average score
    let totalAttempts = 0;
    let successfulAttempts = 0;
    let totalScore = 0;
    let totalStudyTime = 0;

    quizzes.data.forEach((quiz: any) => {
      quiz.attempts?.forEach((attempt: any) => {
        totalAttempts++;
        if (attempt.score >= quiz.passingScore) {
          successfulAttempts++;
        }
        totalScore += attempt.score;
        totalStudyTime += attempt.timeSpent || 0;
      });
    });

    const quizSuccessRate = totalAttempts > 0 ? Math.round((successfulAttempts / totalAttempts) * 100) : 0;
    const averageScore = totalAttempts > 0 ? Math.round(totalScore / totalAttempts) : 0;
    const totalStudyHours = Math.round(totalStudyTime / 3600); // Convert seconds to hours

    // Calculate mastered topics
    const masteredTopics = decks.reduce((count: number, deck: any) => {
      return count + (deck.studyProgress?.mastery >= 90 ? 1 : 0);
    }, 0);

    // Calculate subject performance
    const subjectPerformance = new Map<string, { 
      total: number; 
      score: number; 
      attempts: number;
      timeSpent: number;
      lastAttemptDate?: Date;
    }>();

    // Add performance from decks
    decks.forEach((deck: any) => {
      deck.tags?.forEach((tag: string) => {
        const subject = tag.charAt(0).toUpperCase() + tag.slice(1);
        if (!subjectPerformance.has(subject)) {
          subjectPerformance.set(subject, { 
            total: 0, 
            score: 0, 
            attempts: 0,
            timeSpent: 0
          });
        }
        const perf = subjectPerformance.get(subject)!;
        perf.total++;
        perf.score += deck.studyProgress?.mastery || 0;
        perf.attempts += deck.studyProgress?.attempts || 0;
        perf.timeSpent += deck.studyProgress?.timeSpent || 0;
        
        // Update last attempt date if more recent
        const deckLastAttempt = deck.studyProgress?.lastAttemptDate;
        if (deckLastAttempt) {
          const lastAttemptDate = new Date(deckLastAttempt);
          if (!perf.lastAttemptDate || lastAttemptDate > perf.lastAttemptDate) {
            perf.lastAttemptDate = lastAttemptDate;
          }
        }
      });
    });

    // Add performance from quizzes
    quizzes.data.forEach((quiz: any) => {
      quiz.tags?.forEach((tag: string) => {
        const subject = tag.charAt(0).toUpperCase() + tag.slice(1);
        if (!subjectPerformance.has(subject)) {
          subjectPerformance.set(subject, { 
            total: 0, 
            score: 0, 
            attempts: 0,
            timeSpent: 0
          });
        }
        const perf = subjectPerformance.get(subject)!;
        perf.total++;
        
        if (quiz.attempts && quiz.attempts.length > 0) {
          // Calculate average score from all attempts
          const quizScore = quiz.attempts.reduce((sum: number, attempt: any) => sum + attempt.score, 0) / quiz.attempts.length;
          perf.score += quizScore;
          perf.attempts += quiz.attempts.length;
          perf.timeSpent += quiz.attempts.reduce((sum: number, attempt: any) => sum + (attempt.timeSpent || 0), 0);
          
          // Update last attempt date if more recent
          const lastQuizAttempt = quiz.attempts[quiz.attempts.length - 1].completedAt;
          if (lastQuizAttempt) {
            const lastAttemptDate = new Date(lastQuizAttempt);
            if (!perf.lastAttemptDate || lastAttemptDate > perf.lastAttemptDate) {
              perf.lastAttemptDate = lastAttemptDate;
            }
          }
        }
      });
    });

    // Calculate average scores per subject with weighted scoring
    const subjectScores = Array.from(subjectPerformance.entries())
      .map(([subject, data]) => {
        // Base score from performance
        let score = data.total > 0 ? Math.round(data.score / data.total) : 0;
        
        // Adjust score based on activity level
        const daysSinceLastAttempt = data.lastAttemptDate 
          ? Math.floor((new Date().getTime() - data.lastAttemptDate.getTime()) / (1000 * 60 * 60 * 24))
          : 30; // Default to 30 days if no attempts
        
        // Reduce score for subjects not practiced recently
        if (daysSinceLastAttempt > 7) {
          score = Math.max(0, score - Math.floor(daysSinceLastAttempt / 7) * 5);
        }
        
        // Adjust score based on number of attempts (more attempts = more reliable score)
        const attemptWeight = Math.min(1, data.attempts / 5); // Max weight at 5 attempts
        score = Math.round(score * attemptWeight);

        return {
          subject,
          score,
          attempts: data.attempts,
          timeSpent: Math.round(data.timeSpent / 3600), // Convert to hours
          daysSinceLastAttempt
        };
      })
      .sort((a, b) => b.score - a.score);

    // Split into strong and weak areas
    const strongAreas = subjectScores
      .filter(s => s.score >= 70 && s.attempts >= 3) // Only consider subjects with enough attempts
      .slice(0, 3);
      
    const weakAreas = subjectScores
      .filter(s => (s.score < 70 || s.daysSinceLastAttempt > 14) && s.attempts > 0) // Include recently neglected subjects
      .sort((a, b) => {
        // Prioritize subjects with more attempts and lower scores
        const aWeight = (a.attempts * 0.3) + ((100 - a.score) * 0.7);
        const bWeight = (b.attempts * 0.3) + ((100 - b.score) * 0.7);
        return bWeight - aWeight;
      })
      .slice(0, 3);

    return {
      quizSuccessRate,
      averageScore,
      totalStudyHours,
      masteredTopics,
      weakAreas: weakAreas.map(({ subject, score }) => ({ subject, score })),
      strongAreas: strongAreas.map(({ subject, score }) => ({ subject, score }))
    };
  } catch (error) {
    console.error('Error fetching learning stats:', error);
    throw error;
  }
}; 