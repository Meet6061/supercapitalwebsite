import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import type { Session } from '@supabase/supabase-js';
import LoginPage from './LoginPage';
import InvestorDashboard from './InvestorDashboard';
import AdminDashboard from './AdminDashboard';

interface Props { onBack: () => void; }

export default function InvestorPortal({ onBack }: Props) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setIsAdmin(data.session?.user?.user_metadata?.is_admin === true);
      setLoading(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_e, session) => {
      setSession(session);
      setIsAdmin(session?.user?.user_metadata?.is_admin === true);
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  if (loading) {
    return (
      <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:'#F2F0EB' }}>
        <span style={{ fontFamily:"'DM Mono',monospace", fontSize:'0.7rem', letterSpacing:'0.2em', color:'rgba(1,41,86,0.4)', textTransform:'uppercase' }}>Loading…</span>
      </div>
    );
  }

  if (!session) return <LoginPage onBack={onBack} />;
  if (isAdmin) return <AdminDashboard session={session} onBack={onBack} />;
  return <InvestorDashboard session={session} onBack={onBack} />;
}
