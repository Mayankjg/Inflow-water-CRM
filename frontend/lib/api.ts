const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';
export async function api<T>(path: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(`${API}${path}`, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
    cache: 'no-store',
  });
  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(body.message || `Request failed (${response.status})`);
  }
  if (response.status === 204) return undefined as T;
  return response.json();
}
export type Lead = {
  id: string; name: string; phone?: string | null; email?: string | null;
  company?: string | null; address?: string | null; requirement?: string | null;
  source: string; status: string; createdAt: string;
};
export type FollowUp = { id: string; title: string; dueAt: string; status: string; lead?: Lead | null };
