import { supabase } from './supabase';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string;

async function call(action: string, payload: object) {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error('Not authenticated');

  const res = await fetch(`${SUPABASE_URL}/functions/v1/admin-users`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${session.access_token}`,
    },
    body: JSON.stringify({ action, ...payload }),
  });

  const data = await res.json();
  if (!res.ok || data.error) throw new Error(data.error || 'Request failed');
  return data;
}

export async function createUser(email: string, password: string, full_name: string, role: string) {
  return call('create_user', { email, password, full_name, role });
}

export async function changePassword(user_id: string, password: string) {
  return call('change_password', { user_id, password });
}

export async function deleteAuthUser(user_id: string) {
  return call('delete_user', { user_id });
}
