// ============================================================
// SUPER CAPITAL — MOCK DATA
// All sample data lives here. When real Supabase data is ready,
// replace imports of this file with live Supabase queries.
// Shape of every object matches the database table structure exactly.
// ============================================================

export const FUND_META = {
  name:         'Super Capital AIF – Series I',
  trust:        'Super Capital Trust',
  sebi_reg:     'IN/AIF3/26-27/2212',
  category:     'Category III AIF',
  fund_manager: 'Meet Patel, CFA',
  bd_partner:   'Naishadh Patel',
  entity:       'Super Fund Managers LLP',
  email:        'sfm@supercapital.co.in',
  phone:        '+91 63533 73149',
  address:      'GIDC Plot 1/12, Kalol Industrial Estate, Gandhinagar, Gujarat – 382725',
  min_invest:   '₹1,00,00,000',
  benchmark:    'Nifty 500 TRI',
};

// ── NAV Data (Jul 2024 – Jun 2025) ──────────────────────────────────────────
export const NAV_SERIES = [
  { date: '2024-07-31', month: 'Jul 24', nav: 1000.00, aum_cr: 2.50 },
  { date: '2024-08-31', month: 'Aug 24', nav: 1028.40, aum_cr: 2.57 },
  { date: '2024-09-30', month: 'Sep 24', nav: 1052.10, aum_cr: 2.63 },
  { date: '2024-10-31', month: 'Oct 24', nav: 1038.70, aum_cr: 2.60 },
  { date: '2024-11-30', month: 'Nov 24', nav: 1071.20, aum_cr: 2.68 },
  { date: '2024-12-31', month: 'Dec 24', nav: 1098.50, aum_cr: 2.75 },
  { date: '2025-01-31', month: 'Jan 25', nav: 1089.30, aum_cr: 2.72 },
  { date: '2025-02-28', month: 'Feb 25', nav: 1118.60, aum_cr: 2.80 },
  { date: '2025-03-31', month: 'Mar 25', nav: 1143.90, aum_cr: 2.86 },
  { date: '2025-04-30', month: 'Apr 25', nav: 1162.40, aum_cr: 2.91 },
  { date: '2025-05-31', month: 'May 25', nav: 1188.70, aum_cr: 2.97 },
  { date: '2025-06-30', month: 'Jun 25', nav: 1214.20, aum_cr: 3.04 },
];

export const LATEST_NAV = NAV_SERIES[NAV_SERIES.length - 1];

// ── Holdings (as of Jun 30 2025) ────────────────────────────────────────────
export const HOLDINGS = [
  { stock_name: 'HDFC Bank',         sector: 'Financial Services', weight_pct: 12.50, avg_cost: 1480.00, cmp: 1742.00, pnl_pct: 17.70 },
  { stock_name: 'Bajaj Finance',      sector: 'Financial Services', weight_pct:  9.80, avg_cost: 6240.00, cmp: 7820.00, pnl_pct: 25.32 },
  { stock_name: 'Cholamandalam Inv.', sector: 'Financial Services', weight_pct:  7.20, avg_cost: 1020.00, cmp: 1348.00, pnl_pct: 32.16 },
  { stock_name: 'Coforge',            sector: 'Technology',         weight_pct:  8.40, avg_cost: 4820.00, cmp: 6140.00, pnl_pct: 27.39 },
  { stock_name: 'PB Fintech',         sector: 'Technology',         weight_pct:  6.10, avg_cost: 1240.00, cmp: 1680.00, pnl_pct: 35.48 },
  { stock_name: 'Tata Consultancy',   sector: 'Technology',         weight_pct:  5.80, avg_cost: 3680.00, cmp: 4120.00, pnl_pct: 11.96 },
  { stock_name: 'Titan Company',      sector: 'Consumer',           weight_pct:  8.90, avg_cost: 3240.00, cmp: 3840.00, pnl_pct: 18.52 },
  { stock_name: 'Jyothy Labs',        sector: 'Consumer',           weight_pct:  5.40, avg_cost:  312.00, cmp:  418.00, pnl_pct: 33.97 },
  { stock_name: 'Zomato',             sector: 'Consumer',           weight_pct:  6.20, avg_cost:  142.00, cmp:  224.00, pnl_pct: 57.75 },
  { stock_name: 'Deepak Nitrite',     sector: 'Chemicals',          weight_pct:  7.60, avg_cost: 2140.00, cmp: 2680.00, pnl_pct: 25.23 },
  { stock_name: 'APL Apollo Tubes',   sector: 'Industrials',        weight_pct:  6.80, avg_cost: 1480.00, cmp: 1840.00, pnl_pct: 24.32 },
  { stock_name: 'NCC Limited',        sector: 'Industrials',        weight_pct:  5.30, avg_cost:  184.00, cmp:  248.00, pnl_pct: 34.78 },
  { stock_name: 'Tata Motors',        sector: 'Automobiles',        weight_pct:  7.40, avg_cost:  682.00, cmp:  924.00, pnl_pct: 35.48 },
  { stock_name: 'Delhivery',          sector: 'Logistics',          weight_pct:  6.60, avg_cost:  384.00, cmp:  482.00, pnl_pct: 25.52 },
];

export const SECTOR_ALLOCATION = [
  { sector: 'Financial Services', weight_pct: 29.50 },
  { sector: 'Technology',         weight_pct: 20.30 },
  { sector: 'Consumer',           weight_pct: 20.50 },
  { sector: 'Industrials',        weight_pct: 12.10 },
  { sector: 'Chemicals',          weight_pct:  7.60 },
  { sector: 'Automobiles',        weight_pct:  7.40 },
  { sector: 'Logistics',          weight_pct:  6.60 },  // remaining
];

// ── Client Profiles ──────────────────────────────────────────────────────────
// These will come from Supabase `clients` table in production.
// client_id is used as the link key everywhere.

export const CLIENTS = {
  kahan: {
    client_id:    'mock-kahan-001',
    user_id:      'will-be-supabase-uuid',
    full_name:    'Kahan Jayminkumar Shah',
    email:        'kahanshah.work@gmail.com',
    pan:          'ABCPS1234K',      // sample masked below
    pan_display:  'ABCPS****K',
    folio_number: 'SC-001',
    phone:        '+91 98765 43210',
    category:     'HNI',
    kyc_status:   'verified',
    status:       'active',
    joined_date:  '2024-06-01',
  },
  jaymin: {
    client_id:    'mock-jaymin-001',
    user_id:      'will-be-supabase-uuid',
    full_name:    'Jaymin Shah',
    email:        'jcshah193@gmail.com',
    pan:          'BCDPJ5678J',
    pan_display:  'BCDPJ****J',
    folio_number: 'SC-002',
    phone:        '+91 98765 43211',
    category:     'HNI',
    kyc_status:   'verified',
    status:       'active',
    joined_date:  '2024-06-01',
  },
};

// ── Investment Tranches ──────────────────────────────────────────────────────
// NAV at entry was 1000 (June 1 2024, pre-fund-launch price)
// Units = invested_cr * 100 / nav_at_entry (in lakhs → units)
// Kahan: 1 Cr → 10,000 units at NAV 1000
// Jaymin: 1.5 Cr → 15,000 units at NAV 1000

export const INVESTMENTS = {
  kahan: [
    {
      id:              'inv-kahan-001',
      client_id:       'mock-kahan-001',
      invested_cr:     1.00,
      investment_date: '2024-06-01',
      units_allotted:  10000.000000,
      nav_at_entry:    1000.00,
      status:          'active',
    },
  ],
  jaymin: [
    {
      id:              'inv-jaymin-001',
      client_id:       'mock-jaymin-001',
      invested_cr:     1.50,
      investment_date: '2024-06-01',
      units_allotted:  15000.000000,
      nav_at_entry:    1000.00,
      status:          'active',
    },
  ],
};

// ── Monthly Statements ───────────────────────────────────────────────────────
// Formula: current_value_cr = units * nav / 100 (units in 10k, nav in ₹, result in Cr)
// pnl_cr = current_value_cr - invested_cr
// pnl_pct = (pnl_cr / invested_cr) * 100

function buildStatements(units: number, invested_cr: number, client_id: string) {
  return NAV_SERIES.map(n => {
    const current_value_cr = parseFloat(((units * n.nav) / 1e7).toFixed(4));
    // units * nav gives ₹ value; divide by 1cr (1e7) to get Cr
    // e.g. 10000 units * 1214.20 = ₹1,21,42,000 = 1.2142 Cr
    const pnl_cr  = parseFloat((current_value_cr - invested_cr).toFixed(4));
    const pnl_pct = parseFloat(((pnl_cr / invested_cr) * 100).toFixed(2));
    return {
      client_id,
      as_of_date:       n.date,
      month:            n.month,
      units,
      nav:              n.nav,
      current_value_cr,
      invested_cr,
      pnl_cr,
      pnl_pct,
      xirr:             parseFloat((pnl_pct * 1.05).toFixed(2)), // approx — real XIRR calc in production
    };
  });
}

export const STATEMENTS = {
  kahan:  buildStatements(10000, 1.00, 'mock-kahan-001'),
  jaymin: buildStatements(15000, 1.50, 'mock-jaymin-001'),
};

// ── Helper: get client data by user email ───────────────────────────────────
// In production this is replaced by: supabase.from('clients').select('*').eq('user_id', session.user.id)
export function getMockClientByEmail(email: string) {
  return Object.values(CLIENTS).find(c => c.email === email) ?? null;
}

export function getMockStatements(client_id: string) {
  if (client_id === 'mock-kahan-001')  return STATEMENTS.kahan;
  if (client_id === 'mock-jaymin-001') return STATEMENTS.jaymin;
  return [];
}

export function getMockInvestments(client_id: string) {
  if (client_id === 'mock-kahan-001')  return INVESTMENTS.kahan;
  if (client_id === 'mock-jaymin-001') return INVESTMENTS.jaymin;
  return [];
}
