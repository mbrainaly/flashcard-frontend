// Frontend feature definitions (matching backend)
export interface FeatureDefinition {
  key: string;
  name: string;
  description: string;
  category: 'core' | 'ai' | 'content' | 'advanced' | 'collaboration';
  icon?: string;
}

export interface FeatureCategory {
  key: string;
  name: string;
  description: string;
}

// These will be fetched from the backend, but we define the types here
export const FEATURE_CATEGORIES: FeatureCategory[] = [
  { key: 'core', name: 'Core Features', description: 'Essential flashcard functionality' },
  { key: 'ai', name: 'AI Features', description: 'AI-powered content generation and assistance' },
  { key: 'content', name: 'Content Features', description: 'File uploads and content import' },
  { key: 'advanced', name: 'Advanced Features', description: 'Advanced tools and customization' },
  { key: 'collaboration', name: 'Collaboration', description: 'Team and sharing features' }
];

// Helper function to check if a feature is available in a plan
export const hasFeature = (planFeatures: string[], featureKey: string): boolean => {
  return planFeatures.includes(featureKey);
};

// Helper function to get feature by key
export const getFeatureByKey = (features: FeatureDefinition[], key: string): FeatureDefinition | undefined => {
  return features.find(feature => feature.key === key);
};

// Helper function to get features by category
export const getFeaturesByCategory = (features: FeatureDefinition[], category: string): FeatureDefinition[] => {
  return features.filter(feature => feature.category === category);
};
