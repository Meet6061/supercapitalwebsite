// Supabase Edge Function — runs on Deno
// Deploy with: supabase functions deploy notify-lead
// Set secret: supabase secrets set RESEND_API_KEY=re_xxxx

import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')!;
const TO_EMAIL = 'sfm@supercapital.co.in';
const FROM_EMAIL = 'noreply@supercapital.co.in'; // must be verified in Resend

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'authorization, content-type',
      },
    });
  }

  try {
    const lead = await req.json();

    const html = `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #012956; padding: 24px 32px; border-radius: 8px 8px 0 0;">
          <h2 style="color: #fff; margin: 0; font-size: 18px; font-weight: 500;">
            New Investor Inquiry — Super Capital
          </h2>
        </div>
        <div style="border: 1px solid #e5e5e5; border-top: none; padding: 32px; border-radius: 0 0 8px 8px;">
          <table style="width: 100%; border-collapse: collapse;">
            <tr><td style="padding: 10px 0; color: #888; font-size: 13px; width: 140px;">Name</td>
                <td style="padding: 10px 0; font-size: 14px; font-weight: 500;">${lead.full_name}</td></tr>
            <tr style="border-top: 1px solid #f0f0f0;">
                <td style="padding: 10px 0; color: #888; font-size: 13px;">Email</td>
                <td style="padding: 10px 0; font-size: 14px;">${lead.email}</td></tr>
            <tr style="border-top: 1px solid #f0f0f0;">
                <td style="padding: 10px 0; color: #888; font-size: 13px;">Mobile</td>
                <td style="padding: 10px 0; font-size: 14px;">${lead.mobile || '—'}</td></tr>
            <tr style="border-top: 1px solid #f0f0f0;">
                <td style="padding: 10px 0; color: #888; font-size: 13px;">Organisation</td>
                <td style="padding: 10px 0; font-size: 14px;">${lead.organisation || '—'}</td></tr>
            <tr style="border-top: 1px solid #f0f0f0;">
                <td style="padding: 10px 0; color: #888; font-size: 13px;">Investor Type</td>
                <td style="padding: 10px 0; font-size: 14px;">${lead.investor_type || '—'}</td></tr>
            <tr style="border-top: 1px solid #f0f0f0;">
                <td style="padding: 10px 0; color: #888; font-size: 13px;">Allocation</td>
                <td style="padding: 10px 0; font-size: 14px;">${lead.allocation || '—'}</td></tr>
            <tr style="border-top: 1px solid #f0f0f0;">
                <td style="padding: 10px 0; color: #888; font-size: 13px; vertical-align: top;">Message</td>
                <td style="padding: 10px 0; font-size: 14px;">${lead.message || '—'}</td></tr>
          </table>
          <div style="margin-top: 24px; padding: 16px; background: #f8f8f8; border-radius: 6px; font-size: 12px; color: #888;">
            Submitted at ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })} IST
          </div>
        </div>
      </div>
    `;

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: FROM_EMAIL,
        to: [TO_EMAIL],
        subject: `New Inquiry: ${lead.full_name} — Super Capital`,
        html,
      }),
    });

    const data = await res.json();
    return new Response(JSON.stringify({ ok: true, data }), {
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
    });

  } catch (err) {
    return new Response(JSON.stringify({ ok: false, error: String(err) }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
    });
  }
});
