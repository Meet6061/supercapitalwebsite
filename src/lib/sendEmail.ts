// Email notification via Supabase Edge Function
// The edge function calls Resend API server-side (keeps API key secret)

export async function notifyNewLead(lead: {
  full_name: string;
  email: string;
  mobile?: string;
  organisation?: string;
  investor_type?: string;
  allocation?: string;
  message?: string;
}) {
  const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
  const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

  try {
    await fetch(`${SUPABASE_URL}/functions/v1/notify-lead`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify(lead),
    });
  } catch (err) {
    // Non-blocking — lead is already saved to DB
    console.warn('Email notification failed:', err);
  }
}
