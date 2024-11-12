import { supabase } from './supabase';

export async function apiRequest(path: string, options: RequestInit = {}) {
  const session = await supabase.auth.getSession()
  const token = session.data.session?.access_token

  return fetch(`/api${path}`, {
    ...options,
    headers: {
      ...options.headers,
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    }
  })
} 