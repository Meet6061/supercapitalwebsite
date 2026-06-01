// Supabase Edge Function — admin user management
// Deploy: supabase functions deploy admin-users
// Set secret: supabase secrets set SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SERVICE_KEY  = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, content-type',
  'Content-Type': 'application/json',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors });

  try {
    // Verify caller is authenticated admin
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: cors });

    const anonClient = createClient(SUPABASE_URL, Deno.env.get('SUPABASE_ANON_KEY')!);
    const { data: { user }, error: authErr } = await anonClient.auth.getUser(authHeader.replace('Bearer ', ''));
    if (authErr || !user) return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: cors });

    // Check admin
    const isAdmin = user.user_metadata?.is_admin === true;
    // Also check investors table role
    const adminClient = createClient(SUPABASE_URL, SERVICE_KEY);
    const { data: inv } = await adminClient.from('investors').select('role').eq('user_id', user.id).single();
    if (!isAdmin && inv?.role !== 'admin') {
      return new Response(JSON.stringify({ error: 'Forbidden — admin only' }), { status: 403, headers: cors });
    }

    const body = await req.json();
    const { action } = body;

    // ── CREATE USER ──────────────────────────────────────────────────────
    if (action === 'create_user') {
      const { email, password, full_name, role } = body;
      const { data, error } = await adminClient.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: { full_name, is_admin: role === 'admin' },
      });
      if (error) throw error;
      return new Response(JSON.stringify({ ok: true, user: data.user }), { headers: cors });
    }

    // ── CHANGE PASSWORD ──────────────────────────────────────────────────
    if (action === 'change_password') {
      const { user_id, password } = body;
      const { error } = await adminClient.auth.admin.updateUserById(user_id, { password });
      if (error) throw error;
      return new Response(JSON.stringify({ ok: true }), { headers: cors });
    }

    // ── DELETE USER ──────────────────────────────────────────────────────
    if (action === 'delete_user') {
      const { user_id } = body;
      const { error } = await adminClient.auth.admin.deleteUser(user_id);
      if (error) throw error;
      return new Response(JSON.stringify({ ok: true }), { headers: cors });
    }

    return new Response(JSON.stringify({ error: 'Unknown action' }), { status: 400, headers: cors });

  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: cors });
  }
});
