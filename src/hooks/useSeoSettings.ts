import { useState, useEffect } from 'react';
import { getSeoSettings, type SeoSettings } from '@/services/seo.service';

export function useSeoSettings() {
  const [seoSettings, setSeoSettings] = useState<SeoSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSeoSettings = async () => {
      try {
        setLoading(true);
        setError(null);
        const settings = await getSeoSettings();
        setSeoSettings(settings);
      } catch (err) {
        console.error('Error fetching SEO settings:', err);
        setError('Failed to load SEO settings');
      } finally {
        setLoading(false);
      }
    };

    fetchSeoSettings();
  }, []);

  return { seoSettings, loading, error };
}
