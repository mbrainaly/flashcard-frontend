import { fetchWithAuth } from '@/utils/fetchWithAuth';

export interface Subscription {
  plan: string;
  status: string;
  currentPeriodEnd?: string;
  customerId?: string;
  credits: number;
  planDetails?: {
    id: string;
    name: string;
    price: number;
    features: string[];
  };
}

export interface CheckoutSession {
  sessionId?: string;
  url?: string;
  message?: string;
  isFree?: boolean;
  subscription?: any;
}

export interface Plan {
  id: string;
  name: string;
  price: number;
  monthlyCredits: number;
  allowDocuments: boolean;
  allowYoutubeAnalyze: boolean;
  allowAIFlashcards: boolean;
  allowAIStudyAssistant: boolean;
  monthlyQuizLimit: number | null;
  monthlyNotesLimit: number | null;
  features: string[];
}

/**
 * Get the current user's subscription details
 */
export const getSubscription = async (): Promise<Subscription> => {
  try {
    const response = await fetchWithAuth('/api/subscription');
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to get subscription details');
    }
    
    const data = await response.json();
    return data.subscription;
  } catch (error) {
    console.error('Error getting subscription:', error);
    throw error;
  }
};

/**
 * Create a checkout session for upgrading to a paid plan
 */
export const createCheckoutSession = async (planId: string): Promise<CheckoutSession> => {
  try {
    console.log('Creating checkout session for plan:', planId);
    
    const response = await fetchWithAuth(
      '/api/subscription/create-checkout-session',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ planId }),
      }
    );
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to create checkout session');
    }
    
    const data = await response.json();
    console.log('Checkout session created:', data);
    
    // Return the full response to handle both paid and free plans
    return {
      sessionId: data.sessionId,
      url: data.url,
      message: data.message,
      isFree: data.isFree,
      subscription: data.subscription
    };
  } catch (error) {
    console.error('Error creating checkout session:', error);
    throw error;
  }
};

/**
 * Update the user's subscription after successful payment
 */
export const updateSubscription = async (planId: string): Promise<Subscription> => {
  try {
    const response = await fetchWithAuth(
      '/api/subscription/update-subscription',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ planId }),
      }
    );
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to update subscription');
    }
    
    const data = await response.json();
    return data.subscription;
  } catch (error) {
    console.error('Error updating subscription:', error);
    throw error;
  }
}; 

export const getPlans = async (): Promise<Plan[]> => {
  const response = await fetchWithAuth('/api/subscription/plans');
  const data = await response.json();
  if (!data.success) throw new Error('Failed to load plans');
  return data.plans as Plan[];
}