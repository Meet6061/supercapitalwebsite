import { jsPDF } from 'jspdf';
import { FUND_META, HOLDINGS, SECTOR_ALLOCATION } from './mockData';

// ─────────────────────────────────────────────────────────────────────────────
// COLOURS
// ─────────────────────────────────────────────────────────────────────────────
const NAVY   : [number,number,number] = [1,  41,  86];
const NAVY_LT: [number,number,number] = [228,233,243];
const INK    : [number,number,number] = [20,  20,  20];
const INK2   : [number,number,number] = [70,  70,  70];
const INK3   : [number,number,number] = [140, 140, 140];
const BG     : [number,number,number] = [246, 245, 242];
const WHITE  : [number,number,number] = [255, 255, 255];
const BORDER : [number,number,number] = [208, 206, 200];
const GREEN  : [number,number,number] = [18,  108,  62];
const GREEN_B: [number,number,number] = [228, 245, 236];
const RED    : [number,number,number] = [172,  42,  32];
const RED_B  : [number,number,number] = [250, 233, 231];
const ROW_ALT: [number,number,number] = [243, 242, 239];

// ─────────────────────────────────────────────────────────────────────────────
// A4 LAYOUT CONSTANTS
// ─────────────────────────────────────────────────────────────────────────────
const PW = 210;
const PH = 297;
const ML = 15;
const MR = 15;
const CW = PW - ML - MR;   // 180 mm

// ─────────────────────────────────────────────────────────────────────────────
// KEY: use Rs. instead of ₹ to avoid jsPDF rupee glyph issue
// ─────────────────────────────────────────────────────────────────────────────
const RS = 'Rs.';

function fCr(v: number)  { return `${RS} ${v.toFixed(2)} Cr`; }
function fLakh(v: number){ const l = v * 100; return `${l >= 0 ? '+' : '-'}${RS} ${Math.abs(l).toFixed(2)} L`; }
function fPct(v: number, sign = true) { return `${sign && v >= 0 ? '+' : ''}${v.toFixed(2)}%`; }
function fNav(v: number) { return `${RS} ${v.toFixed(2)}`; }
function fAmt(v: number) { return `${RS} ${v.toLocaleString('en-IN')}`; }
function fUnits(v: number){ return v.toLocaleString('en-IN', { maximumFractionDigits: 0 }); }

// ─────────────────────────────────────────────────────────────────────────────
// PRIMITIVES
// ─────────────────────────────────────────────────────────────────────────────
type Doc = jsPDF;

function fill(doc: Doc, x: number, y: number, w: number, h: number, c: [number,number,number]) {
  doc.setFillColor(...c);
  doc.rect(x, y, w, h, 'F');
}

function box(doc: Doc, x: number, y: number, w: number, h: number, bg: [number,number,number] | null, border: [number,number,number], lw = 0.18) {
  if (bg) { doc.setFillColor(...bg); doc.rect(x, y, w, h, 'F'); }
  doc.setDrawColor(...border);
  doc.setLineWidth(lw);
  doc.rect(x, y, w, h, 'S');
}

function hline(doc: Doc, x1: number, y: number, x2: number, c: [number,number,number], lw = 0.2) {
  doc.setDrawColor(...c);
  doc.setLineWidth(lw);
  doc.line(x1, y, x2, y);
}

function sf(doc: Doc, size: number, bold: boolean, color: [number,number,number]) {
  doc.setFontSize(size);
  doc.setFont('helvetica', bold ? 'bold' : 'normal');
  doc.setTextColor(...color);
}

function t(doc: Doc, text: string, x: number, y: number, align: 'left'|'center'|'right' = 'left', maxW?: number) {
  const opts: any = { align };
  if (maxW) opts.maxWidth = maxW;
  doc.text(text, x, y, opts);
}

// ─────────────────────────────────────────────────────────────────────────────
// TABLE ROW helper — bordered cell row
// ─────────────────────────────────────────────────────────────────────────────
function tableRow(
  doc: Doc,
  x: number, y: number, w: number, h: number,
  bg: [number,number,number]
) {
  fill(doc, x, y, w, h, bg);
  doc.setDrawColor(...BORDER);
  doc.setLineWidth(0.15);
  doc.rect(x, y, w, h, 'S');
}

// ─────────────────────────────────────────────────────────────────────────────
// PIE CHART (pure jsPDF wedges)
// ─────────────────────────────────────────────────────────────────────────────
const PIE_COLORS: [number,number,number][] = [
  [1, 41, 86],
  [28, 78, 140],
  [60, 120, 185],
  [100, 155, 210],
  [150, 190, 230],
  [190, 215, 240],
  [210, 228, 245],
];

function drawPie(
  doc: Doc,
  cx: number, cy: number, r: number,
  data: { sector: string; weight_pct: number }[]
) {
  let startAngle = -Math.PI / 2;

  data.forEach((d, i) => {
    const slice     = (d.weight_pct / 100) * 2 * Math.PI;
    const endAngle  = startAngle + slice;
    const color     = PIE_COLORS[i % PIE_COLORS.length];

    // Draw wedge using triangle fan (jsPDF doesn't have native arc fill)
    doc.setFillColor(...color);
    doc.setDrawColor(255, 255, 255);
    doc.setLineWidth(0.4);

    const steps = Math.max(8, Math.round(slice * 20));
    const angleStep = slice / steps;

    for (let s = 0; s < steps; s++) {
      const a1 = startAngle + s * angleStep;
      const a2 = startAngle + (s + 1) * angleStep;
      doc.triangle(
        cx, cy,
        cx + r * Math.cos(a1), cy + r * Math.sin(a1),
        cx + r * Math.cos(a2), cy + r * Math.sin(a2),
        'FD'
      );
    }

    startAngle = endAngle;
  });

  // White center circle (donut)
  fill(doc, cx - r * 0.45, cy - r * 0.45, r * 0.9, r * 0.9, WHITE);
  doc.setFillColor(...WHITE);
  doc.circle(cx, cy, r * 0.42, 'F');

  // Center label
  sf(doc, 7, true, NAVY);
  t(doc, 'Portfolio', cx, cy - 1.5, 'center');
  sf(doc, 6, false, INK3);
  t(doc, 'Allocation', cx, cy + 3, 'center');
}

// ─────────────────────────────────────────────────────────────────────────────
// NAV LINE CHART
// ─────────────────────────────────────────────────────────────────────────────
function drawLineChart(
  doc: Doc,
  data: StatRow[],
  cx: number, cy: number, cw: number, ch: number,
  invested: number
) {
  const vals   = data.map(d => d.current_value_cr ?? 0);
  const labels = data.map(d => (d as any).month || d.as_of_date?.slice(2, 7) || '');
  const n      = vals.length;
  if (n < 2) return;

  const minV = Math.min(...vals) * 0.992;
  const maxV = Math.max(...vals) * 1.008;
  const rng  = maxV - minV || 1;

  const toX = (i: number) => cx + (i / (n - 1)) * cw;
  const toY = (v: number) => cy + ch - ((v - minV) / rng) * ch;

  // Background
  fill(doc, cx, cy, cw, ch, WHITE);
  box(doc, cx, cy, cw, ch, null, BORDER, 0.15);

  // Grid lines
  [0, 0.25, 0.5, 0.75, 1].forEach(t2 => {
    const gy = cy + ch * (1 - t2);
    const gv = minV + t2 * rng;
    doc.setDrawColor(...BORDER);
    doc.setLineWidth(0.1);
    doc.setLineDashPattern([1.5, 1.5], 0);
    doc.line(cx, gy, cx + cw, gy);
    doc.setLineDashPattern([], 0);
    sf(doc, 5.5, false, INK3);
    doc.text(fCr(gv), cx - 1.5, gy + 1.5, { align: 'right' });
  });

  // Invested baseline dashed
  if (invested > minV && invested < maxV) {
    const iy = toY(invested);
    doc.setDrawColor(...INK3);
    doc.setLineWidth(0.25);
    doc.setLineDashPattern([1.5, 1], 0);
    doc.line(cx, iy, cx + cw, iy);
    doc.setLineDashPattern([], 0);
    sf(doc, 5, false, INK3);
    doc.text('Invested', cx + 1.5, iy - 1.5);
  }

  // Area fill
  for (let i = 0; i < n - 1; i++) {
    const x1 = toX(i), y1 = toY(vals[i]);
    const x2 = toX(i + 1), y2 = toY(vals[i + 1]);
    const yb = cy + ch;
    doc.setFillColor(...NAVY_LT);
    doc.triangle(x1, y1, x2, y2, x1, yb, 'F');
    doc.triangle(x2, y2, x2, yb, x1, yb, 'F');
  }

  // Line
  doc.setDrawColor(...NAVY);
  doc.setLineWidth(0.75);
  for (let i = 0; i < n - 1; i++) {
    doc.line(toX(i), toY(vals[i]), toX(i + 1), toY(vals[i + 1]));
  }

  // Dots
  vals.forEach((v, i) => {
    const px = toX(i), py = toY(v);
    doc.setFillColor(...WHITE);
    doc.setDrawColor(...NAVY);
    doc.setLineWidth(0.35);
    doc.circle(px, py, 0.9, 'FD');
    if (i === 0 || i === n - 1 || i % 2 === 0) {
      sf(doc, 5.5, false, INK3);
      doc.text(labels[i], px, cy + ch + 5, { align: 'center' });
    }
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// SHARED PAGE ELEMENTS
// ─────────────────────────────────────────────────────────────────────────────
function pageHeader(doc: Doc, title: string, client: ClientData) {
  fill(doc, 0, 0, PW, 16, NAVY);
  sf(doc, 9, true, WHITE);
  t(doc, title, ML, 10.5);
  sf(doc, 7, false, [175, 198, 225]);
  t(doc, `${client.full_name}  |  Folio: ${client.folio_number || '-'}  |  Super Capital AIF`, PW - MR, 10.5, 'right');
}

function pageFooter(doc: Doc, pageNum: number, total: number) {
  // Clear footer zone first
  fill(doc, 0, PH - 14, PW, 14, WHITE);
  hline(doc, ML, PH - 13, PW - MR, BORDER, 0.2);
  sf(doc, 6.5, false, INK3);
  t(doc, `Super Capital AIF  |  ${FUND_META.sebi_reg}  |  Confidential`, ML, PH - 8.5);
  t(doc, `Page ${pageNum} of ${total}`, PW - MR, PH - 8.5, 'right');
}

function secTitle(doc: Doc, title: string, y: number): number {
  sf(doc, 10, true, NAVY);
  t(doc, title, ML, y);
  hline(doc, ML, y + 2.5, PW - MR, NAVY, 0.35);
  return y + 9;
}

// ─────────────────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────────────────
export interface ClientData {
  full_name: string; folio_number: string | null; pan: string | null;
  category: string; joined_date: string | null; email: string;
}
export interface StatRow {
  as_of_date: string; month?: string;
  nav: number | null; units: number | null;
  current_value_cr: number | null; invested_cr: number | null;
  pnl_cr: number | null; pnl_pct: number | null; xirr?: number | null;
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN
// ─────────────────────────────────────────────────────────────────────────────
export async function generateStatementPDF(
  client: ClientData,
  statements: StatRow[],
  logoBase64: string
) {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

  const reportDate = new Date().toLocaleDateString('en-IN', { day:'2-digit', month:'long', year:'numeric' });
  const asOf       = statements.length > 0 ? statements[statements.length - 1].as_of_date : '2025-06-30';
  const latest     = statements[statements.length - 1];
  const invested   = statements[0]?.invested_cr ?? 1.00;
  const current    = latest?.current_value_cr   ?? invested;
  const pnlCr      = parseFloat((current - invested).toFixed(4));
  const pnlPct     = parseFloat(((pnlCr / invested) * 100).toFixed(2));
  const xirr       = latest?.xirr ?? parseFloat((pnlPct * 1.05).toFixed(2));

  // ══════════════════════════════════════════════════════════════════════════
  // PAGE 1 — COVER
  // ══════════════════════════════════════════════════════════════════════════
  {
    // ── Header band ─────────────────────────────────────────────────────────
    fill(doc, 0, 0, PW, 42, NAVY);

    // Logo box
    fill(doc, ML, 6, 54, 30, WHITE);
    try {
      doc.addImage(logoBase64, 'PNG', ML + 1, 7, 52, 28, undefined, 'FAST');
    } catch (_) {
      sf(doc, 14, true, NAVY);
      t(doc, 'SUPER CAPITAL', ML + 4, 24);
    }

    // Center: fund name
    sf(doc, 11, true, WHITE);
    t(doc, 'Super Capital AIF - Series I', PW / 2, 17, 'center');
    sf(doc, 7.5, false, [175, 198, 225]);
    t(doc, FUND_META.category + '   |   SEBI Reg: ' + FUND_META.sebi_reg, PW / 2, 24, 'center');

    // Right: date
    sf(doc, 7, false, [175, 198, 225]);
    t(doc, 'PORTFOLIO STATEMENT', PW - MR, 17, 'right');
    t(doc, reportDate, PW - MR, 24, 'right');

    // ── Report title ─────────────────────────────────────────────────────────
    let y = 52;
    sf(doc, 16, true, NAVY);
    t(doc, 'Portfolio Statement', PW / 2, y, 'center');
    sf(doc, 9.5, false, INK3);
    t(doc, `For ${client.full_name}`, PW / 2, y + 7, 'center');
    hline(doc, ML, y + 12, PW - MR, BORDER, 0.25);
    y += 20;

    // ── Investor Details + Fund Details ──────────────────────────────────────
    const halfW  = CW / 2 - 3;
    const col2X  = ML + halfW + 6;
    const lblW   = 36;
    const rh     = 8.5;

    // Headers
    fill(doc, ML, y, halfW, 8, NAVY);
    sf(doc, 8, true, WHITE);
    t(doc, 'INVESTOR DETAILS', ML + 3, y + 5.5);

    fill(doc, col2X, y, halfW, 8, NAVY);
    t(doc, 'FUND DETAILS', col2X + 3, y + 5.5);
    y += 8;

    const iRows: [string,string][] = [
      ['Investor Name',   client.full_name],
      ['Folio Number',    client.folio_number || '-'],
      ['PAN',             client.pan ? client.pan.slice(0,5) + '****' + client.pan.slice(-1) : '-'],
      ['Category',        client.category],
      ['Investment Date', client.joined_date || '-'],
      ['Email',           client.email],
    ];
    const fRows: [string,string][] = [
      ['Fund Name',     FUND_META.name],
      ['Entity',        FUND_META.entity],
      ['SEBI Reg.',     FUND_META.sebi_reg],
      ['Category',      FUND_META.category],
      ['Fund Manager',  FUND_META.fund_manager],
      ['Contact Email', FUND_META.email],
    ];

    iRows.forEach(([k, v], i) => {
      const bg = i % 2 === 0 ? WHITE : ROW_ALT;
      tableRow(doc, ML, y + i * rh, halfW, rh, bg);
      sf(doc, 8, false, INK3);
      t(doc, k, ML + 3, y + i * rh + rh / 2 + 2.5);
      sf(doc, 8.5, i === 0 ? true : false, INK);
      t(doc, v, ML + lblW, y + i * rh + rh / 2 + 2.5);
    });

    fRows.forEach(([k, v], i) => {
      const bg = i % 2 === 0 ? WHITE : ROW_ALT;
      tableRow(doc, col2X, y + i * rh, halfW, rh, bg);
      sf(doc, 8, false, INK3);
      t(doc, k, col2X + 3, y + i * rh + rh / 2 + 2.5);
      sf(doc, 8, false, INK);
      // Truncate long values to 1 line
      const vv = doc.splitTextToSize(v, halfW - lblW - 4)[0];
      t(doc, vv, col2X + lblW, y + i * rh + rh / 2 + 2.5);
    });

    y += iRows.length * rh + 10;

    // ── Investment Summary ───────────────────────────────────────────────────
    y = secTitle(doc, 'Investment Summary', y);

    const summaryItems = [
      { label: 'Amount Invested',  val: fCr(invested),                         color: NAVY,   bg: WHITE,   bold: false },
      { label: 'Current Value',    val: fCr(current),                           color: NAVY,   bg: WHITE,   bold: true  },
      { label: 'Absolute Return',  val: fLakh(pnlCr),                           color: pnlCr  >= 0 ? GREEN : RED, bg: pnlCr  >= 0 ? GREEN_B : RED_B, bold: true },
      { label: 'Return %',         val: fPct(pnlPct),                           color: pnlPct >= 0 ? GREEN : RED, bg: pnlPct >= 0 ? GREEN_B : RED_B, bold: true },
      { label: 'XIRR (Approx.)',   val: fPct(xirr, false) + ' p.a.',            color: INK2,   bg: WHITE,   bold: false },
      { label: 'Period End Date',  val: asOf,                                   color: INK2,   bg: WHITE,   bold: false },
    ];

    const sw  = (CW - 10) / 3;  // 3 columns
    const sh  = 22;               // card height

    summaryItems.forEach((item, i) => {
      const col = i % 3;
      const row = Math.floor(i / 3);
      const sx  = ML + col * (sw + 5);
      const sy  = y + row * (sh + 5);

      // Card box
      fill(doc, sx, sy, sw, sh, item.bg);
      doc.setDrawColor(...BORDER);
      doc.setLineWidth(0.2);
      doc.rect(sx, sy, sw, sh, 'S');
      // Left accent bar
      fill(doc, sx, sy, 2, sh, item.color);

      sf(doc, 7, false, INK3);
      t(doc, item.label.toUpperCase(), sx + 5, sy + 7);
      sf(doc, 13, true, item.color);
      t(doc, item.val, sx + 5, sy + 16);
    });

    y += 2 * (sh + 5) + 10;

    // ── Address block ─────────────────────────────────────────────────────────
    hline(doc, ML, y, PW - MR, BORDER, 0.2);
    y += 5;
    sf(doc, 8, true, INK2);
    t(doc, FUND_META.entity, ML, y);
    sf(doc, 7, false, INK3);
    t(doc, FUND_META.address, ML, y + 5);
    t(doc, `${FUND_META.phone}  |  ${FUND_META.email}`, ML, y + 10);
    y += 18;

    // ── Disclaimer box ────────────────────────────────────────────────────────
    box(doc, ML, y, CW, 16, BG, BORDER, 0.15);
    sf(doc, 6.5, false, INK3);
    const disc = doc.splitTextToSize(
      'This document is strictly confidential and prepared solely for the named investor. Past performance is not indicative of future results. Investments in Category III AIFs are subject to market risks. Please read the Private Placement Memorandum before investing.',
      CW - 8
    );
    doc.text(disc, ML + 4, y + 5.5);

    pageFooter(doc, 1, 4);
  }

  // ══════════════════════════════════════════════════════════════════════════
  // PAGE 2 — PERFORMANCE & MONTHLY TABLE
  // ══════════════════════════════════════════════════════════════════════════
  doc.addPage();
  {
    pageHeader(doc, 'Performance Summary', client);
    let y = 22;

    // ── KPI tiles ─────────────────────────────────────────────────────────────
    const tiles = [
      { label: 'Amount Invested', val: fCr(invested),   sub: `Since ${client.joined_date || '-'}`, color: NAVY,  bg: WHITE   },
      { label: 'Current Value',   val: fCr(current),    sub: `As of ${asOf}`,                      color: NAVY,  bg: WHITE   },
      { label: 'Absolute Return', val: fLakh(pnlCr),    sub: pnlCr >= 0 ? 'Gain' : 'Loss',         color: pnlCr  >= 0 ? GREEN : RED, bg: pnlCr  >= 0 ? GREEN_B : RED_B },
      { label: 'Return %',        val: fPct(pnlPct),    sub: `XIRR ~${fPct(xirr, false)} p.a.`,   color: pnlPct >= 0 ? GREEN : RED, bg: pnlPct >= 0 ? GREEN_B : RED_B },
    ];

    const tw = (CW - 12) / 4;
    const th = 26;
    tiles.forEach((tile, i) => {
      const tx = ML + i * (tw + 4);
      fill(doc, tx, y, tw, th, tile.bg);
      doc.setDrawColor(...BORDER);
      doc.setLineWidth(0.2);
      doc.rect(tx, y, tw, th, 'S');
      fill(doc, tx, y, 2.5, th, tile.color);

      sf(doc, 6.5, false, INK3);
      t(doc, tile.label.toUpperCase(), tx + 5, y + 7.5);
      sf(doc, 12.5, true, tile.color);
      t(doc, tile.val, tx + 5, y + 18);
      sf(doc, 6, false, INK3);
      t(doc, tile.sub, tx + 5, y + 23.5);
    });
    y += th + 10;

    // ── NAV Chart ─────────────────────────────────────────────────────────────
    y = secTitle(doc, 'Portfolio Value  —  Monthly (Jul 2024 to Jun 2025)', y);
    drawLineChart(doc, statements, ML + 18, y, CW - 18, 46, invested);
    y += 60;

    // ── Monthly Statement Table ───────────────────────────────────────────────
    y = secTitle(doc, 'Month-by-Month Statement', y);

    type Align = 'left' | 'center' | 'right';
    const cols: { label: string; x: number; w: number; align: Align }[] = [
      { label: 'Month',     x: ML,       w: 22, align: 'left'  },
      { label: 'NAV (Rs.)', x: ML + 22,  w: 26, align: 'right' },
      { label: 'Units',     x: ML + 48,  w: 22, align: 'right' },
      { label: 'Invested',  x: ML + 70,  w: 28, align: 'right' },
      { label: 'Value',     x: ML + 98,  w: 30, align: 'right' },
      { label: 'Gain/Loss', x: ML + 128, w: 28, align: 'right' },
      { label: 'Return %',  x: ML + 156, w: 24, align: 'right' },
    ];
    const rh = 6.8;

    // Header row
    fill(doc, ML, y, CW, 7.5, NAVY);
    cols.forEach(c => {
      sf(doc, 6.5, true, WHITE);
      const tx = c.align === 'right' ? c.x + c.w - 2 : c.x + 2;
      doc.text(c.label, tx, y + 5.2, { align: c.align });
    });
    y += 7.5;

    // Data rows
    statements.forEach((st, i) => {
      const rowBg  = i % 2 === 0 ? WHITE : ROW_ALT;
      const pnl    = st.pnl_pct ?? 0;
      const pnlV   = st.pnl_cr  ?? 0;
      const pcolor = pnl >= 0 ? GREEN : RED;
      const month  = (st as any).month || st.as_of_date?.slice(2, 7) || '';
      const cy2    = y + rh / 2 + 2.2;

      tableRow(doc, ML, y, CW, rh, rowBg);

      sf(doc, 7.5, true,  INK);   doc.text(month,                       cols[0].x + 2,              cy2);
      sf(doc, 7.5, false, INK2);  doc.text(fNav(st.nav ?? 0),           cols[1].x + cols[1].w - 2,  cy2, { align: 'right' });
      sf(doc, 7.5, false, INK2);  doc.text(fUnits(st.units ?? 0),       cols[2].x + cols[2].w - 2,  cy2, { align: 'right' });
      sf(doc, 7.5, false, INK2);  doc.text(fCr(st.invested_cr ?? invested), cols[3].x + cols[3].w - 2, cy2, { align: 'right' });
      sf(doc, 7.5, true,  INK);   doc.text(fCr(st.current_value_cr ?? 0), cols[4].x + cols[4].w - 2, cy2, { align: 'right' });
      sf(doc, 7.5, true,  pcolor); doc.text(fLakh(pnlV),                cols[5].x + cols[5].w - 2, cy2, { align: 'right' });
      sf(doc, 7.5, true,  pcolor); doc.text(fPct(pnl),                  cols[6].x + cols[6].w - 2, cy2, { align: 'right' });

      y += rh;
    });

    // Total row
    fill(doc, ML, y, CW, 8.5, NAVY);
    sf(doc, 8, true, WHITE);
    doc.text('TOTAL', cols[0].x + 2, y + 5.8);
    doc.text(fCr(invested), cols[3].x + cols[3].w - 2, y + 5.8, { align: 'right' });
    doc.text(fCr(current),  cols[4].x + cols[4].w - 2, y + 5.8, { align: 'right' });
    const tColor: [number,number,number] = pnlCr >= 0 ? [90, 220, 150] : [255, 110, 100];
    sf(doc, 8, true, tColor);
    doc.text(fLakh(pnlCr), cols[5].x + cols[5].w - 2, y + 5.8, { align: 'right' });
    doc.text(fPct(pnlPct), cols[6].x + cols[6].w - 2, y + 5.8, { align: 'right' });

    pageFooter(doc, 2, 4);
  }

  // ══════════════════════════════════════════════════════════════════════════
  // PAGE 3 — PORTFOLIO HOLDINGS
  // ══════════════════════════════════════════════════════════════════════════
  doc.addPage();
  {
    pageHeader(doc, 'Portfolio Holdings', client);
    let y = 22;

    // ── PIE CHART + LEGEND ────────────────────────────────────────────────────
    y = secTitle(doc, 'Sector Allocation', y);

    const pieR  = 28;
    const pieX  = ML + pieR + 2;
    const pieY  = y + pieR + 2;
    drawPie(doc, pieX, pieY, pieR, SECTOR_ALLOCATION);

    // Legend — single clean column to the right of pie
    const legX  = ML + pieR * 2 + 12;
    const legW  = CW - (pieR * 2 + 16);
    const legRH = 7.5;

    SECTOR_ALLOCATION.forEach((sa, i) => {
      const ly = y + i * legRH;
      const lc = PIE_COLORS[i % PIE_COLORS.length];

      fill(doc, legX, ly + 1, 6, 5, lc);
      sf(doc, 8, false, INK2);
      doc.text(sa.sector, legX + 8, ly + 5.5);

      // Bar
      const barX   = legX + 55;
      const barMaxW = legW - 80;
      const barW   = (sa.weight_pct / 30) * barMaxW;
      fill(doc, barX, ly + 2, barMaxW, 4, NAVY_LT);
      fill(doc, barX, ly + 2, barW, 4, lc);

      sf(doc, 8, true, NAVY);
      doc.text(`${sa.weight_pct}%`, barX + barMaxW + 3, ly + 5.5);
    });

    y += Math.max(pieR * 2 + 8, SECTOR_ALLOCATION.length * legRH + 6);
    hline(doc, ML, y, PW - MR, BORDER, 0.2);
    y += 7;

    // ── Holdings Table ────────────────────────────────────────────────────────
    y = secTitle(doc, `Portfolio Composition  —  ${HOLDINGS.length} Stocks  |  As of 30 Jun 2025`, y);

    type Align2 = 'left' | 'right';
    const hc: { label: string; x: number; w: number; align: Align2 }[] = [
      { label: 'Company',  x: ML,       w: 44, align: 'left'  },
      { label: 'Sector',   x: ML + 44,  w: 40, align: 'left'  },
      { label: 'Weight',   x: ML + 84,  w: 18, align: 'right' },
      { label: 'Avg Cost', x: ML + 102, w: 30, align: 'right' },
      { label: 'CMP',      x: ML + 132, w: 24, align: 'right' },
      { label: 'P&L %',   x: ML + 156, w: 24, align: 'right' },
    ];
    const hrh = 6.5;

    fill(doc, ML, y, CW, 7.5, NAVY);
    hc.forEach(c => {
      sf(doc, 6.5, true, WHITE);
      const tx = c.align === 'right' ? c.x + c.w - 2 : c.x + 2;
      doc.text(c.label, tx, y + 5.2, { align: c.align });
    });
    y += 7.5;

    HOLDINGS.forEach((h, i) => {
      const rowBg  = i % 2 === 0 ? WHITE : ROW_ALT;
      const pcolor = h.pnl_pct >= 0 ? GREEN : RED;
      const ry     = y + hrh / 2 + 2.2;

      tableRow(doc, ML, y, CW, hrh, rowBg);

      sf(doc, 7.5, true,  INK);  doc.text(h.stock_name,         hc[0].x + 2,              ry);
      sf(doc, 7,   false, INK3); doc.text(h.sector,             hc[1].x + 2,              ry);
      sf(doc, 7.5, false, INK2); doc.text(`${h.weight_pct}%`,   hc[2].x + hc[2].w - 2,  ry, { align: 'right' });
      sf(doc, 7.5, false, INK2); doc.text(fAmt(h.avg_cost),     hc[3].x + hc[3].w - 2,  ry, { align: 'right' });
      sf(doc, 7.5, false, INK2); doc.text(fAmt(h.cmp),          hc[4].x + hc[4].w - 2,  ry, { align: 'right' });
      sf(doc, 7.5, true,  pcolor); doc.text(`+${h.pnl_pct}%`,  hc[5].x + hc[5].w - 2,  ry, { align: 'right' });

      y += hrh;
    });

    fill(doc, ML, y, CW, 8, NAVY);
    sf(doc, 8, true, WHITE);
    doc.text('TOTAL PORTFOLIO', hc[0].x + 2, y + 5.5);
    doc.text('100.00%', hc[2].x + hc[2].w - 2, y + 5.5, { align: 'right' });

    pageFooter(doc, 3, 4);
  }

  // ══════════════════════════════════════════════════════════════════════════
  // PAGE 4 — DISCLAIMER
  // ══════════════════════════════════════════════════════════════════════════
  doc.addPage();
  {
    pageHeader(doc, 'Important Disclosures & Risk Factors', client);
    let y = 22;

    const sections: [string, string][] = [
      ['Nature of Investment',
        `Super Capital AIF - Series I is a Category III Alternative Investment Fund registered with SEBI under Registration No. ${FUND_META.sebi_reg}. Category III AIFs employ complex trading strategies including leverage and derivatives. Investments are not suitable for all investors.`],
      ['Risk Factors',
        'Investments in equity and equity-related instruments are subject to market risks. The NAV may rise or fall based on market conditions, interest rates, economic developments, and regulatory changes. Past performance is not indicative of future results. The fund may employ leverage which can amplify losses.'],
      ['NAV & Valuation Policy',
        "The Net Asset Value is calculated on a monthly basis. Valuation of portfolio securities is carried out in accordance with SEBI guidelines and the fund's valuation policy. NAV figures are based on closing prices as of the last business day of the respective month."],
      ['Performance Figures',
        'Returns shown are based on the invested amount and current NAV as of the reporting date. XIRR figures are approximate and computed on a best-efforts basis. These figures do not account for applicable taxes, exit loads, or management fees, which may reduce actual investor returns.'],
      ['Confidentiality',
        'This statement is prepared exclusively for the named investor. Any reproduction, distribution, or disclosure of its contents to any third party without prior written consent of Super Fund Managers LLP is strictly prohibited.'],
      ['Regulatory & Contact',
        `Super Fund Managers LLP  |  SEBI Reg: ${FUND_META.sebi_reg}  |  ${FUND_META.email}  |  ${FUND_META.phone}  |  ${FUND_META.address}`],
    ];

    sections.forEach(([title, body]) => {
      // Title bar
      fill(doc, ML, y, CW, 8, NAVY_LT);
      doc.setDrawColor(...BORDER);
      doc.setLineWidth(0.15);
      doc.rect(ML, y, CW, 8, 'S');
      fill(doc, ML, y, 2.5, 8, NAVY);
      sf(doc, 8.5, true, NAVY);
      t(doc, title, ML + 5, y + 5.5);
      y += 8;

      // Body box
      sf(doc, 7.5, false, INK2);
      const lines = doc.splitTextToSize(body, CW - 8);
      const bodyH = lines.length * 4 + 6;
      fill(doc, ML, y, CW, bodyH, WHITE);
      doc.setDrawColor(...BORDER);
      doc.setLineWidth(0.12);
      doc.rect(ML, y, CW, bodyH, 'S');
      doc.text(lines, ML + 4, y + 5);
      y += bodyH + 6;

      if (y > PH - 35) return;
    });

    // ── Navy footer band ──────────────────────────────────────────────────────
    fill(doc, 0, PH - 24, PW, 24, NAVY);
    sf(doc, 8.5, true, WHITE);
    t(doc, FUND_META.entity, ML, PH - 17);
    sf(doc, 6.5, false, [175, 198, 225]);
    t(doc, FUND_META.address, ML, PH - 12);
    t(doc, `${FUND_META.email}  |  ${FUND_META.phone}`, ML, PH - 7.5);
    sf(doc, 6.5, false, [150, 175, 210]);
    t(doc, FUND_META.sebi_reg, PW - MR, PH - 12, 'right');
    t(doc, `Prepared on ${reportDate}`, PW - MR, PH - 7.5, 'right');

    // Override the standard pageFooter on this page — navy band IS the footer
    // Just add page number inside the band
    sf(doc, 6.5, false, [150, 175, 210]);
    t(doc, 'Page 4 of 4', PW / 2, PH - 4, 'center');
  }

  // ── Save ──────────────────────────────────────────────────────────────────
  const safe = client.full_name.replace(/\s+/g, '_');
  doc.save(`SuperCapital_Statement_${client.folio_number || safe}_${asOf}.pdf`);
}
