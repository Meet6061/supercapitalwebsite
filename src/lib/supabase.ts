import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.warn('Supabase env vars missing — add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to .env');
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Types
export interface Lead {
  id?: string;
  created_at?: string;
  full_name: string;
  organisation?: string;
  email: string;
  mobile?: string;
  investor_type?: string;
  allocation?: string;
  message?: string;
  status?: string;
}

export interface Investor {
  id: string;
  user_id: string;
  full_name: string;
  email: string;
  pan?: string;
  folio_number?: string;
  commitment_cr?: number;
  drawdown_cr?: number;
  status: string;
  category: string;
  joined_date?: string;
}

export interface NavData {
  id: string;
  date: string;
  nav: number;
  aum_cr?: number;
}

export interface Holding {
  id: string;
  as_of_date: string;
  stock_name: string;
  isin?: string;
  sector?: string;
  weight_pct?: number;
  avg_cost?: number;
  cmp?: number;
  pnl_pct?: number;
}

export interface InvestorStatement {
  id: string;
  investor_id: string;
  as_of_date: string;
  units?: number;
  nav?: number;
  value_cr?: number;
  invested_cr?: number;
  pnl_cr?: number;
  pnl_pct?: number;
}
