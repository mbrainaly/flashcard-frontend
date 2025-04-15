import { getSession } from 'next-auth/react';

export const fetchWithAuth = async (endpoint: string, options: RequestInit = {}) => {
  const session = await getSession();
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';
  
  // Log session data for debugging
  console.log('fetchWithAuth - Session:', session);
  console.log('fetchWithAuth - Access token:', session?.user?.accessToken);
  
  // Ensure endpoint starts with a slash
  const normalizedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  
  const headers = {
    'Content-Type': 'application/json',
    ...(session?.user?.accessToken && {
      'Authorization': `Bearer ${session.user.accessToken}`
    }),
    ...options.headers
  };
  
  // Log request details for debugging
  console.log('fetchWithAuth - Endpoint:', `${baseUrl}${normalizedEndpoint}`);
  console.log('fetchWithAuth - Headers:', headers);

  try {
    const response = await fetch(`${baseUrl}${normalizedEndpoint}`, {
      ...options,
      headers,
      credentials: 'include'
    });

    if (!response.ok) {
      console.error('fetchWithAuth - Response error:', response.status, response.statusText);
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `API request failed: ${response.statusText}`);
    }

    return response;
  } catch (error) {
    console.error('fetchWithAuth - Fetch error:', error);
    throw error;
  }
}; 