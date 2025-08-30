import { getSession } from 'next-auth/react';
import { showToast } from '@/components/ui/Toast';

let cachedSession: any = null;
let cachedAt = 0;
let pendingSessionPromise: Promise<any> | null = null;
const SESSION_CACHE_MS = 3000; // cache for 3 seconds

export async function getSessionCoalesced() {
  const now = Date.now();
  if (cachedSession && now - cachedAt < SESSION_CACHE_MS) {
    return cachedSession;
  }
  if (pendingSessionPromise) {
    return pendingSessionPromise;
  }
  pendingSessionPromise = getSession().then((sess) => {
    cachedSession = sess;
    cachedAt = Date.now();
    return sess;
  }).finally(() => {
    pendingSessionPromise = null;
  });
  return pendingSessionPromise;
}

export const fetchWithAuth = async (endpoint: string, options: RequestInit = {}) => {
  const session = await getSessionCoalesced();
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';

  const normalizedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;

  const isFormData = typeof FormData !== 'undefined' && options.body instanceof FormData;
  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string>)
  };
  if (!isFormData && !('Content-Type' in headers)) {
    headers['Content-Type'] = 'application/json';
  }
  if (session?.user?.accessToken) {
    headers['Authorization'] = `Bearer ${session.user.accessToken}`;
  }

  const response = await fetch(`${baseUrl}${normalizedEndpoint}`, {
    ...options,
    headers,
    credentials: 'include'
  });

  if (!response.ok) {
    const status = response.status;
    const errorData = await response.json().catch(() => ({} as any));
    const message = errorData.message || `Request failed (${status})`;

    // Show user-friendly toasts for auth/plan/limit errors
    if (status === 400 || status === 401 || status === 403 || status === 429) {
      // Prefer specific messages that we return from backend validations
      let toastMessage = message;
      // Map some common backend messages to more user-friendly variants
      const goUpgrade = () => {
        if (typeof window !== 'undefined') window.location.href = '/billing'
      }

      if (/exceeds plan limit/i.test(message)) {
        toastMessage = message;
        showToast({ type: 'warning', title: 'Notice', message: toastMessage, actionText: 'Upgrade', onAction: goUpgrade });
        throw new Error(message);
      } else if (/does not allow youtube/i.test(message)) {
        toastMessage = 'Your current plan does not include YouTube URL analysis.';
        showToast({ type: 'warning', title: 'Plan Limit', message: toastMessage, actionText: 'Upgrade', onAction: goUpgrade });
        throw new Error(message);
      } else if (/monthly quiz generation limit/i.test(message)) {
        toastMessage = 'You’ve reached your monthly quiz generation limit.';
        showToast({ type: 'warning', title: 'Limit Reached', message: toastMessage, actionText: 'Upgrade', onAction: goUpgrade });
        throw new Error(message);
      } else if (/monthly notes generation limit/i.test(message)) {
        toastMessage = 'You’ve reached your monthly notes generation limit.';
        showToast({ type: 'warning', title: 'Limit Reached', message: toastMessage, actionText: 'Upgrade', onAction: goUpgrade });
        throw new Error(message);
      } else if (/insufficient credits/i.test(message)) {
        toastMessage = 'Insufficient credits. Please upgrade to continue.';
        showToast({ type: 'warning', title: 'Low Credits', message: toastMessage, actionText: 'Upgrade', onAction: goUpgrade });
        throw new Error(message);
      } else if (/not authenticated|unauthorized|jwt/i.test(message)) {
        toastMessage = 'Please sign in to continue.';
        showToast({ type: 'warning', title: 'Auth Required', message: toastMessage });
        throw new Error(message);
      }

      showToast({ type: 'warning', title: 'Notice', message: toastMessage });
    }

    throw new Error(message);
  }

  return response;
}; 