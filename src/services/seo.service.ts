interface SeoSettings {
  metaTitle: string;
  metaDescription: string;
  metaKeywords: string;
  ogTitle: string;
  ogDescription: string;
  ogImage: string;
  twitterTitle: string;
  twitterDescription: string;
  twitterImage: string;
  favicon: string;
  logoUrl: string;
  siteName: string;
}

const getDefaultSeoSettings = (): SeoSettings => ({
  metaTitle: 'FlashCard App - Master Any Subject with AI-Powered Flashcards',
  metaDescription: 'Create, study, and master any subject with our AI-powered flashcard platform. Generate smart flashcards, take quizzes, and track your progress.',
  metaKeywords: 'flashcards, study, learning, AI, education, quiz, memory, spaced repetition',
  ogTitle: 'FlashCard App - AI-Powered Learning Platform',
  ogDescription: 'Transform your learning with AI-generated flashcards and intelligent study tools.',
  ogImage: '/images/og-image.jpg',
  twitterTitle: 'FlashCard App - Smart Learning Made Simple',
  twitterDescription: 'Create AI-powered flashcards and accelerate your learning journey.',
  twitterImage: '/images/twitter-image.jpg',
  favicon: '/favicon.ico',
  logoUrl: '/images/logo.png',
  siteName: 'FlashCard App'
});

export const getSeoSettings = async (): Promise<SeoSettings> => {
  // Determine the API URL based on environment
  let apiUrl = process.env.NEXT_PUBLIC_API_URL;
  
  // If no API URL is configured, try common defaults
  if (!apiUrl) {
    // Check if we're in development
    if (process.env.NODE_ENV === 'development') {
      apiUrl = 'http://localhost:5001';
    } else {
      // In production, we should have the API URL configured
      console.warn('NEXT_PUBLIC_API_URL not configured, using default SEO settings');
      return getDefaultSeoSettings();
    }
  }

  try {
    // Add timeout to prevent hanging
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000); // 3 second timeout

    const response = await fetch(`${apiUrl}/api/seo`, {
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
      },
      // Add cache control for better performance
      cache: 'no-store', // Always fetch fresh data for SEO settings
    });

    clearTimeout(timeoutId);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    
    if (data.success && data.data) {
      return data.data;
    } else {
      throw new Error(data.message || 'Invalid response format');
    }
  } catch (error) {
    // Log error but don't throw - always return fallback
    if (error instanceof Error) {
      console.warn('SEO settings fetch failed, using defaults:', error.message);
    } else {
      console.warn('SEO settings fetch failed, using defaults:', error);
    }
    
    return getDefaultSeoSettings();
  }
};

export type { SeoSettings };
