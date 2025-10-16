import { getSeoSettings } from '@/services/seo.service';

export async function GET() {
  try {
    const seoSettings = await getSeoSettings();
    
    return new Response(seoSettings.robotsTxt || 'User-agent: *\nAllow: /', {
      headers: {
        'Content-Type': 'text/plain',
      },
    });
  } catch (error) {
    console.error('Error generating robots.txt:', error);
    
    // Fallback robots.txt
    return new Response('User-agent: *\nAllow: /', {
      headers: {
        'Content-Type': 'text/plain',
      },
    });
  }
}
