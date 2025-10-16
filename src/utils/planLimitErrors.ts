// Plan limit error handling utilities

export interface PlanLimitError {
  message: string;
  currentCount: number;
  maxAllowed: number | string;
  type: 'deck' | 'card' | 'ai' | 'daily_ai' | 'monthly_ai' | 'storage' | 'file_size' | 'session';
}

export const formatPlanLimitError = (error: any): string => {
  if (error?.message && error?.currentCount !== undefined && error?.maxAllowed !== undefined) {
    const { message, currentCount, maxAllowed } = error;
    const maxText = maxAllowed === 'unlimited' ? 'unlimited' : maxAllowed.toString();
    
    // Extract limit type from message
    if (message.includes('deck limit')) {
      return `Deck limit reached! You've created ${currentCount} out of ${maxText} decks allowed by your plan. Please upgrade to create more decks.`;
    }
    
    if (message.includes('card limit')) {
      return `Card limit reached! You've created ${currentCount} out of ${maxText} cards allowed in this deck. Please upgrade to add more cards.`;
    }
    
    if (message.includes('Daily AI generation limit')) {
      return `Daily AI limit reached! You've used ${currentCount} out of ${maxText} AI generations today. Your limit resets tomorrow.`;
    }
    
    if (message.includes('Monthly AI generation limit')) {
      return `Monthly AI limit reached! You've used ${currentCount} out of ${maxText} AI generations this month. Please upgrade for more AI generations.`;
    }
    
    if (message.includes('AI generation limit')) {
      return `AI generation limit reached! You've used ${currentCount} out of ${maxText} total AI generations. Please upgrade for more AI generations.`;
    }
    
    if (message.includes('storage limit')) {
      return `Storage limit reached! You've used ${currentCount}MB out of ${maxText}MB allowed by your plan. Please upgrade for more storage.`;
    }
    
    if (message.includes('file size')) {
      return `File too large! Your plan allows files up to ${maxText}MB. Please choose a smaller file or upgrade your plan.`;
    }
    
    if (message.includes('session limit')) {
      return `Session limit reached! You have ${currentCount} active sessions. Your plan allows up to ${maxText} concurrent sessions.`;
    }
  }
  
  // Fallback for generic errors
  if (error?.message) {
    return error.message;
  }
  
  return 'An error occurred. Please try again or upgrade your plan.';
};

export const getPlanLimitErrorType = (message: string): PlanLimitError['type'] => {
  if (message.includes('deck')) return 'deck';
  if (message.includes('card')) return 'card';
  if (message.includes('Daily AI')) return 'daily_ai';
  if (message.includes('Monthly AI')) return 'monthly_ai';
  if (message.includes('AI generation')) return 'ai';
  if (message.includes('storage')) return 'storage';
  if (message.includes('file size')) return 'file_size';
  if (message.includes('session')) return 'session';
  return 'ai';
};

export const getPlanUpgradeMessage = (errorType: PlanLimitError['type']): string => {
  const upgradeMessages = {
    deck: 'Upgrade to Pro or Team plan to create unlimited decks!',
    card: 'Upgrade to Pro or Team plan to add unlimited cards!',
    ai: 'Upgrade to Pro for 500 AI generations or Team for unlimited AI!',
    daily_ai: 'Upgrade to Pro for 50 daily AI generations or Team for unlimited!',
    monthly_ai: 'Upgrade to Pro for 500 monthly AI generations or Team for unlimited!',
    storage: 'Upgrade to Pro for 5GB storage or Team for 50GB storage!',
    file_size: 'Upgrade to Pro for 25MB files or Team for 100MB files!',
    session: 'Upgrade to Pro for 3 sessions or Team for 10 concurrent sessions!'
  };
  
  return upgradeMessages[errorType] || 'Upgrade your plan for more features!';
};
