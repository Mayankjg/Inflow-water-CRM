const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';
export async function api<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = typeof window !== 'undefined' ? window.localStorage.getItem('inflow_admin_token') : null;
  const response = await fetch(`${API}${path}`, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}), ...(options.headers || {}) },
    cache: 'no-store',
  });
  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    if (response.status === 401 && token && typeof window !== 'undefined' && !path.startsWith('/auth/')) {
      window.localStorage.removeItem('inflow_admin_token');
      window.location.assign('/login');
    }
    throw new Error(body.message || `Request failed (${response.status})`);
  }
  if (response.status === 204) return undefined as T;
  return response.json();
}
export type Lead = {
  id: string; name: string; phone?: string | null; email?: string | null;
  company?: string | null; address?: string | null; city?: string | null; state?: string | null; requirement?: string | null;
  source: string; status: string; createdAt: string; notes?: string | null;
};
export type FollowUp = { id: string; title: string; dueAt: string; status: string; notes?: string | null; result?: string | null; leadId?: string | null; lead?: Lead | null; createdAt: string };
export type Reminder = { id: string; title: string; dueAt: string; status: string; description?: string | null; leadId?: string | null; lead?: Lead | null };
export type Activity = { id: string; type: string; title: string; details?: string | null; createdAt: string };
export type LeadDetails = Lead & { followUps: FollowUp[]; reminders: Reminder[]; activities: Activity[] };
export type Notification = { id: string; source: 'FOLLOW_UP' | 'REMINDER'; sourceId: string; title: string; dueAt: string; readAt: string | null; leadId?: string | null; leadName?: string | null };
