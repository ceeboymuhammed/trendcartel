// src/lib/renderers/trendCartelProductRenderer.ts

export interface ProductPageInput {
  pageNumber: number;
  title: string;
  bodyText: string;
}

export interface TrendCartelRenderOptions {
  productTitle: string;
  subtitle?: string;
  authorName: string;
  showAuthor: boolean;
  mainFormatId: string; // "template" | "ebook" | "challenge"
  subFormat: string;    // e.g., "Budget & Money Tracker", "Full Ebook", "Challenge Kit", "Notion System"
  niche: string;
  brandPalette: string; // "Emerald & Slate" | "Minimalist Black & White" | "Royal Purple & Gold" | "Warm Terracotta & Cream"
  pages: ProductPageInput[];
  includeWatermark?: boolean;
}

interface PaletteTokens {
  primary: string;
  secondary: string;
  accent: string;
  tint: string;
  softBg: string;
  border: string;
  ink: string;
}

function getPaletteTokens(palette: string): PaletteTokens {
  switch (palette) {
    case "Minimalist Black & White":
      return {
        primary: "#111827",
        secondary: "#374151",
        accent: "#000000",
        tint: "#F3F4F6",
        softBg: "#FAFAFA",
        border: "#9CA3AF",
        ink: "#111827",
      };
    case "Royal Purple & Gold":
      return {
        primary: "#3B0764",
        secondary: "#D97706",
        accent: "#7E22CE",
        tint: "#F3E8FF",
        softBg: "#FAF5FF",
        border: "#C084FC",
        ink: "#1E1B4B",
      };
    case "Warm Terracotta & Cream":
      return {
        primary: "#7C2D12",
        secondary: "#0D9488",
        accent: "#C2410C",
        tint: "#FFEDD5",
        softBg: "#FFFBF5",
        border: "#FDBA74",
        ink: "#292524",
      };
    case "Emerald & Slate":
    default:
      return {
        primary: "#064E3B",
        secondary: "#059669",
        accent: "#0D9488",
        tint: "#D1FAE5",
        softBg: "#F0FDF4",
        border: "#6EE7B7",
        ink: "#0F172A",
      };
  }
}

function escapeHtml(str: string): string {
  return (str || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

// Formats body text differently depending on whether it's an Ebook (editorial prose + callouts)
// vs. a Planner/Challenge/Workbook (interactive checkboxes + write-on lines)
function formatContentBlocks(bodyText: string, isEditorial: boolean): string {
  const lines = (bodyText || "")
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);

  let html = "";
  let inChecklist = false;

  for (const rawLine of lines) {
    if (/^#{1,4}\s+/.test(rawLine)) {
      if (inChecklist) {
        html += `</div>`;
        inChecklist = false;
      }
      const heading = rawLine.replace(/^#{1,4}\s+/, "").replace(/\*\*/g, "");
      html += `<h3 class="tc-h3">${escapeHtml(heading)}</h3>`;
      continue;
    }

    if (/^[-*]\s*\[\s*\]/.test(rawLine) || /^[-*]\s+/.test(rawLine)) {
      if (!inChecklist) {
        html += `<div class="${isEditorial ? "tc-bullets" : "tc-checklist"}">`;
        inChecklist = true;
      }
      const itemText = rawLine
        .replace(/^[-*]\s*\[\s*\]\s*/, "")
        .replace(/^[-*]\s+/, "")
        .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");

      if (isEditorial) {
        html += `<div class="tc-bullet-item"><span class="tc-dot"></span><span>${itemText}</span></div>`;
      } else {
        html += `<div class="tc-check"><span class="tc-box"></span><span class="tc-check-line"><span class="tc-hint">${itemText}</span></span></div>`;
      }
      continue;
    }

    if (inChecklist) {
      html += `</div>`;
      inChecklist = false;
    }

    const cleanPara = rawLine.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
    html += `<p class="tc-body">${cleanPara}</p>`;
  }

  if (inChecklist) html += `</div>`;
  return html;
}

// Purpose-built SVG Trackers tailored to the chosen subFormat
function renderPurposeBuiltTrackerSheet(
  subFormat: string,
  niche: string,
  pageNumber: number,
  t: PaletteTokens
): string {
  const lower = subFormat.toLowerCase();

  // 1. Budget & Money Tracker -> Savings Jar + Debt/Revenue Hexagon Grid
  if (lower.includes("budget") || lower.includes("money")) {
    const coins: string[] = [];
    for (let r = 0; r < 9; r++) {
      const cols = r % 2 === 0 ? 8 : 7;
      const sx = r % 2 === 0 ? 27.6 : 34.3;
      const cy = 58 + r * 11.6;
      for (let c = 0; c < cols; c++) {
        coins.push(`<circle cx="${(sx + c * 13.4).toFixed(1)}" cy="${cy.toFixed(1)}" r="5.5"/>`);
      }
    }
    return `
    <section class="tc-page" id="tracker-sheet">
      <nav class="tc-tabs"><a href="#tc-contents">Contents</a><a href="#page-1">Worksheets</a><a href="#tracker-sheet">Visual Tracker</a></nav>
      <header class="tc-head">
        <div class="tc-kicker">Colour in a coin every time you hit a savings or revenue deposit</div>
        <h2 class="tc-title"><b>${escapeHtml(niche)}</b> Cashflow &amp; Savings Jar</h2>
      </header>
      <div class="tc-body-area">
        <div class="tc-fields">
          <div class="tc-field"><span>Target Goal</span><i></i></div>
          <div class="tc-field"><span>1 Coin =</span><i></i></div>
          <div class="tc-field"><span>Target Date</span><i></i></div>
        </div>
        <div style="display:flex;justify-content:center;margin:3mm 0;">
          <svg viewBox="0 0 150 182" width="122mm" height="148mm">
            <g fill="none" stroke="${t.primary}" stroke-width=".7">
              <rect x="30" y="4" width="90" height="16" rx="3" fill="${t.tint}" stroke-width=".9"/>
              <path d="M34 20 h82 v10 c18 6 26 18 26 34 v96 c0 12 -9 20 -21 20 h-92 c-12 0 -21 -8 -21 -20 v-96 c0 -16 8 -28 26 -34 z" stroke-width="1.2"/>
              <g stroke="${t.secondary}" stroke-width=".55">${coins.join("")}</g>
            </g>
            <text x="75" y="13.8" text-anchor="middle" font-family="Inter,Arial" font-size="4.8" font-weight="700" letter-spacing=".8" fill="${t.primary}">GOAL  ____________</text>
          </svg>
        </div>
        <div class="tc-miles">
          <div><b>25%</b><span>Saved ______</span><span>Date ______</span></div>
          <div><b>50%</b><span>Saved ______</span><span>Date ______</span></div>
          <div><b>75%</b><span>Saved ______</span><span>Date ______</span></div>
          <div><b>100%</b><span>Saved ______</span><span>Date ______</span></div>
        </div>
      </div>
      <div class="tc-folio"><a class="tc-back" href="#tc-contents">Contents</a><span class="tc-folio-n">${pageNumber}</span></div>
    </section>`;
  }

  // 2. Habit & Fitness Tracker OR Challenge Kit -> 100-Day Streak Grid
  if (lower.includes("habit") || lower.includes("fitness") || lower.includes("challenge")) {
    let circles = "";
    for (let i = 0; i < 100; i++) {
      const col = i % 10;
      const row = Math.floor(i / 10);
      const cx = 9 + col * 16.4;
      const cy = 9 + row * 16.4;
      const num = i + 1;
      const isMilestone = num % 10 === 0;
      circles += `<circle cx="${cx.toFixed(1)}" cy="${cy.toFixed(1)}" r="${isMilestone ? "7.2" : "6.5"}" ${
        isMilestone ? `fill="${t.tint}" stroke="${t.secondary}" stroke-width=".9"` : ""
      }/>
      <text x="${cx.toFixed(1)}" y="${(cy + 1.4).toFixed(1)}" text-anchor="middle" font-size="${
        isMilestone ? "4" : "3.5"
      }" font-weight="${isMilestone ? "700" : "500"}" fill="${isMilestone ? t.primary : t.ink}" stroke="none">${num}</text>`;
    }
    return `
    <section class="tc-page" id="tracker-sheet">
      <nav class="tc-tabs"><a href="#tc-contents">Contents</a><a href="#page-1">Worksheets</a><a href="#tracker-sheet">Streak Grid</a></nav>
      <header class="tc-head">
        <div class="tc-kicker">Never break the chain — shade each day upon completion</div>
        <h2 class="tc-title"><b>100-Day</b> ${escapeHtml(niche)} Streak Matrix</h2>
      </header>
      <div class="tc-body-area">
        <div class="tc-fields">
          <div class="tc-field"><span>Core Habit / Sprint</span><i></i></div>
          <div class="tc-field"><span>Start Date</span><i></i></div>
          <div class="tc-field"><span>100-Day Reward</span><i></i></div>
        </div>
        <div style="display:flex;justify-content:center;margin:2mm 0;">
          <svg viewBox="0 0 166 166" width="144mm" height="144mm">
            <g fill="none" stroke="${t.border}" stroke-width=".6" font-family="Inter,Arial">${circles}</g>
          </svg>
        </div>
        <div class="tc-fb" style="flex:1;margin-top:3mm;">
          <b>Milestone Reflections (Days 25, 50, 75 &amp; 100)</b>
          <div class="tc-fb-l"></div>
        </div>
      </div>
      <div class="tc-folio"><a class="tc-back" href="#tc-contents">Contents</a><span class="tc-folio-n">${pageNumber}</span></div>
    </section>`;
  }

  // 3. Full Ebook -> Key Takeaways & Implementation Action Matrix
  if (lower.includes("ebook")) {
    return `
    <section class="tc-page" id="tracker-sheet">
      <nav class="tc-tabs"><a href="#tc-contents">Contents</a><a href="#page-1">Chapters</a><a href="#tracker-sheet">Action Matrix</a></nav>
      <header class="tc-head">
        <div class="tc-kicker">Executive Summary &amp; Reader Implementation Plan</div>
        <h2 class="tc-title"><b>30-Day</b> Execution Blueprint</h2>
      </header>
      <div class="tc-body-area">
        <p class="tc-cap">Turn what you just read into measurable results. Complete this one-page execution matrix before moving on.</p>
        <div class="tc-table">
          <div class="tc-tr tc-th">
            <div class="tc-td" style="width:18%">Phase</div>
            <div class="tc-td" style="width:47%">Core Deliverable / Action</div>
            <div class="tc-td" style="width:20%">Target Metric</div>
            <div class="tc-td" style="width:15%">Done</div>
          </div>
          ${["Week 1: Foundation", "Week 2: Setup", "Week 3: Execution", "Week 4: Optimization", "Day 30: Review"]
            .map(
              (phase) => `
            <div class="tc-tr" style="height:18mm">
              <div class="tc-td" style="width:18%;font-weight:700;color:${t.primary}">${phase}</div>
              <div class="tc-td" style="width:47%"></div>
              <div class="tc-td" style="width:20%"></div>
              <div class="tc-td" style="width:15%;display:flex;align-items:center;justify-content:center"><span class="tc-box"></span></div>
            </div>`
            )
            .join("")}
        </div>
        <div class="tc-fb" style="flex:1;margin-top:5mm;">
          <b>Top 3 Insights From This Book &amp; Immediate Next Moves</b>
          <div class="tc-fb-l"></div>
        </div>
      </div>
      <div class="tc-folio"><a class="tc-back" href="#tc-contents">Contents</a><span class="tc-folio-n">${pageNumber}</span></div>
    </section>`;
  }

  // 4. Default (Digital Planner, Meal Planner, Event Planner, Interview Workbook, Notion Guide)
  // -> Undated Weekly Execution & Milestone Schedule Grid
  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
  return `
  <section class="tc-page" id="tracker-sheet">
    <nav class="tc-tabs"><a href="#tc-contents">Contents</a><a href="#page-1">Pages</a><a href="#tracker-sheet">Weekly Spread</a></nav>
    <header class="tc-head">
      <div class="tc-kicker">Undated Reusable Master Sheet — Reprint Anytime</div>
      <h2 class="tc-title"><b>Weekly</b> ${escapeHtml(subFormat)} Spread</h2>
    </header>
    <div class="tc-body-area">
      <div class="tc-fields">
        <div class="tc-field"><span>Week Of</span><i></i></div>
        <div class="tc-field"><span>Main Objective</span><i></i></div>
        <div class="tc-field"><span>Reward</span><i></i></div>
      </div>
      <div class="tc-table">
        <div class="tc-tr tc-th">
          <div class="tc-td" style="width:18%">Day</div>
          <div class="tc-td" style="width:52%">Primary Focus / Schedule</div>
          <div class="tc-td" style="width:30%">Notes &amp; Check-In</div>
        </div>
        ${days
          .map(
            (d) => `
          <div class="tc-tr" style="height:19mm">
            <div class="tc-td" style="width:18%;font-weight:700;color:${t.primary}">${d}</div>
            <div class="tc-td" style="width:52%"></div>
            <div class="tc-td" style="width:30%"></div>
          </div>`
          )
          .join("")}
      </div>
      <div class="tc-fb" style="flex:1;margin-top:4mm;">
        <b>Weekly Wins &amp; Adjustments for Next Week</b>
        <div class="tc-fb-l"></div>
      </div>
    </div>
    <div class="tc-folio"><a class="tc-back" href="#tc-contents">Contents</a><span class="tc-folio-n">${pageNumber}</span></div>
  </section>`;
}

// Generates 3 Distinct Cover Variations (HTML) for Storefront Upload (Selar, Gumroad, Etsy)
export function generateThreeCoverVariationsHTML(opts: {
  productTitle: string;
  subFormat: string;
  authorLabel: string;
  pageCount: number;
  brandPalette: string;
}): string {
  const t = getPaletteTokens(opts.brandPalette);
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8" />
<title>${escapeHtml(opts.productTitle)} — 3 Storefront Cover Variations</title>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;800&family=Inter:wght@400;600;700;800&display=swap">
<style>
  body{font-family:'Inter',sans-serif;background:#f1f5f9;padding:40px 20px;display:flex;flex-wrap:wrap;gap:32px;justify-content:center}
  .cover{width:420px;height:560px;border-radius:16px;overflow:hidden;box-shadow:0 20px 40px rgba(0,0,0,.12);display:flex;flex-direction:column;justify-content:space-between;padding:42px;box-sizing:border-box;position:relative}
  /* Style 1: Editorial Framed */
  .c1{background:${t.softBg};border:10px solid ${t.primary};color:${t.ink};text-align:center}
  .c1 .tag{font-size:11px;font-weight:800;letter-spacing:.2em;text-transform:uppercase;color:${t.secondary}}
  .c1 h1{font-family:'Playfair Display',serif;font-size:34px;line-height:1.12;color:${t.primary};margin:16px 0}
  .c1 .pill{display:inline-block;padding:8px 18px;border-radius:99px;background:${t.tint};color:${t.primary};font-size:12px;font-weight:700}
  /* Style 2: Executive Dark Split */
  .c2{background:${t.primary};color:#fff;text-align:left}
  .c2 .tag{font-size:11px;font-weight:700;letter-spacing:.2em;text-transform:uppercase;color:${t.border}}
  .c2 h1{font-size:34px;font-weight:800;line-height:1.1;margin:18px 0}
  .c2 .card{background:rgba(255,255,255,.1);border:1px solid rgba(255,255,255,.2);border-radius:12px;padding:16px;font-size:13px;line-height:1.5}
  /* Style 3: Clean Grid Minimalist */
  .c3{background:#ffffff;color:${t.ink};border:2px solid ${t.border};background-image:radial-gradient(${t.border} 1px, transparent 1px);background-size:18px 18px}
  .c3 .inner{background:#fff;border:2px solid ${t.primary};border-radius:12px;padding:32px;height:100%;display:flex;flex-direction:column;justify-content:space-between;box-sizing:border-box}
  .c3 h1{font-family:'Playfair Display',serif;font-size:30px;line-height:1.15;color:${t.primary};margin:12px 0}
</style>
</head>
<body>
  <div class="cover c1">
    <div class="tag">${escapeHtml(opts.subFormat)} · Instant Download</div>
    <div>
      <h1>${escapeHtml(opts.productTitle)}</h1>
      <span class="pill">A4 Printable &amp; Tablet Ready</span>
    </div>
    <div style="font-size:12px;font-weight:600;color:${t.secondary}">Created by ${escapeHtml(opts.authorLabel)} · ${opts.pageCount} Master Pages</div>
  </div>

  <div class="cover c2">
    <div class="tag">Complete Action System</div>
    <div>
      <h1>${escapeHtml(opts.productTitle)}</h1>
      <div class="card">Zero-fluff step-by-step templates, checklists, and execution trackers built for fast results.</div>
    </div>
    <div style="font-size:12px;color:${t.border};font-weight:600">${escapeHtml(opts.subFormat)} · By ${escapeHtml(opts.authorLabel)}</div>
  </div>

  <div class="cover c3">
    <div class="inner">
      <div style="font-size:11px;font-weight:800;letter-spacing:.18em;text-transform:uppercase;color:${t.secondary}">${escapeHtml(opts.subFormat)}</div>
      <div>
        <h1>${escapeHtml(opts.productTitle)}</h1>
        <p style="font-size:13px;color:#475569;line-height:1.5">Practical worksheets, structured prompts, and ready-to-use templates.</p>
      </div>
      <div style="border-top:1px solid ${t.border};padding-top:12px;font-size:12px;font-weight:700;color:${t.primary}">
        ${escapeHtml(opts.authorLabel)} · ${opts.pageCount} Pages
      </div>
    </div>
  </div>
</body>
</html>`;
}

// Main Product HTML Generator (A4 Print-Ready + Interactive Links + Custom Styling per Content Type)
export function generateTrendCartelProductHTML(opts: TrendCartelRenderOptions): string {
  const {
    productTitle,
    subtitle = "A Practical, Zero-Fluff Execution System & Action Toolkit",
    authorName,
    showAuthor,
    mainFormatId,
    subFormat,
    niche,
    brandPalette,
    pages,
    includeWatermark = false,
  } = opts;

  const t = getPaletteTokens(brandPalette);
  const isEditorial = mainFormatId === "ebook";
  const isNotion = subFormat.toLowerCase().includes("notion");
  const ownerLine = showAuthor && authorName.trim() ? escapeHtml(authorName.trim()) : "____________________";
  const totalPages = pages.length + 4; // Cover + Setup Guide + TOC + AI Pages + Purpose-Built Tracker Sheet

  const topTabs = `
    <nav class="tc-tabs">
      <a href="#tc-contents">Contents</a>
      <a href="#page-1">${isEditorial ? "Chapters" : isNotion ? "Databases" : "Worksheets"}</a>
      <a href="#tracker-sheet">${isEditorial ? "Action Matrix" : "Tracker"}</a>
    </nav>
  `;

  const tocItems = [
    { id: "setup-guide", title: isNotion ? "How to Duplicate & Setup Your Notion System" : "Before You Print — A4 & iPad Setup Guide", page: 2 },
    ...pages.map((p, i) => ({
      id: `page-${p.pageNumber}`,
      title: p.title,
      page: i + 4,
    })),
    {
      id: "tracker-sheet",
      title: isEditorial ? "30-Day Reader Execution Blueprint" : `${subFormat} Visual Master Sheet`,
      page: pages.length + 4,
    },
  ];

  const tocHtml = tocItems
    .map(
      (item) =>
        `<li class="tc-toc-row"><a href="#${item.id}"><span>${escapeHtml(item.title)}</span><span class="tc-toc-dots"></span><span class="tc-toc-p">${item.page}</span></a></li>`
    )
    .join("");

  const dynamicPagesHtml = pages
    .map((p, idx) => {
      const sheetNum = idx + 4;
      const words = p.title.split(" ");
      const lead = escapeHtml(words[0] || "");
      const rest = escapeHtml(words.slice(1).join(" "));
      const bodyHtml = formatContentBlocks(p.bodyText, isEditorial);

      return `
      <section class="tc-page" id="page-${p.pageNumber}">
        ${topTabs}
        <header class="tc-head">
          <div class="tc-kicker">${isEditorial ? `Chapter ${p.pageNumber}` : isNotion ? `Workspace Module ${p.pageNumber}` : `Worksheet ${p.pageNumber}`} · ${escapeHtml(subFormat)}</div>
          <h2 class="tc-title"><b>${lead}</b> ${rest}</h2>
        </header>
        <div class="tc-body-area">
          <div class="tc-flow">${bodyHtml}</div>
          ${
            isEditorial
              ? `<div class="tc-callout">
                  <b>Chapter Key Takeaway &amp; Action Note</b>
                  <div class="tc-fb-l" style="height:26mm;margin-top:2mm;"></div>
                </div>`
              : `<div class="tc-fill">
                  <div class="tc-fill-boxes">
                    <div class="tc-fb">
                      <b>${isNotion ? "Database Properties &amp; Formulas" : "Personal Notes &amp; Numbers"}</b>
                      <div class="tc-fb-l"></div>
                    </div>
                    <div class="tc-fb">
                      <b>${isNotion ? "Setup Verification Checklist" : "Action Items"}</b>
                      <ul>
                        <li><span></span><i></i></li>
                        <li><span></span><i></i></li>
                        <li><span></span><i></i></li>
                        <li><span></span><i></i></li>
                      </ul>
                    </div>
                  </div>
                </div>`
          }
        </div>
        <div class="tc-folio">
          <a class="tc-back" href="#tc-contents">Contents</a>
          <span class="tc-folio-n">${sheetNum}</span>
          <span class="tc-brand-foot">TrendCartel Studio</span>
        </div>
      </section>`;
    })
    .join("\n");

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>${escapeHtml(productTitle)}</title>
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;800&family=Inter:wght@400;500;600;700;800&display=swap">
<style>
:root{
  --primary:${t.primary};
  --secondary:${t.secondary};
  --accent:${t.accent};
  --tint:${t.tint};
  --soft:${t.softBg};
  --border:${t.border};
  --ink:${t.ink};
}
*{box-sizing:border-box}
html,body{margin:0;padding:0;background:#e5e7eb;color:var(--ink);font-family:'Inter',system-ui,sans-serif;font-size:10pt;line-height:1.48}
@page{size:A4 portrait;margin:0}

.tc-page{position:relative;width:210mm;height:297mm;padding:0;background:#fff;margin:6mm auto;overflow:hidden;page-break-after:always;break-after:page}
.tc-page:last-child{page-break-after:auto;break-after:auto}
.tc-body-area{height:244mm;margin:0 15mm;display:flex;flex-direction:column;overflow:hidden}
.tc-flow{flex:0 1 auto;min-height:0}

/* Top Tabs */
.tc-tabs{position:absolute;right:15mm;top:7mm;display:flex;gap:1.5mm;font-size:7pt;letter-spacing:.08em;text-transform:uppercase;z-index:10}
.tc-tabs a{padding:1mm 2.6mm;color:var(--primary);background:var(--soft);text-decoration:none;border:.25mm solid var(--border);border-radius:1.5mm;font-weight:700}
.tc-tabs a:first-child{background:var(--primary);color:#fff;border-color:var(--primary)}

/* Sheet Header */
.tc-head{padding:14mm 15mm 3.5mm;margin-bottom:4mm;border-bottom:.7mm solid var(--primary)}
.tc-kicker{font-size:7.5pt;font-weight:700;letter-spacing:.14em;text-transform:uppercase;color:var(--secondary);margin-bottom:1.2mm}
.tc-title{font-family:'Playfair Display',Georgia,serif;font-weight:800;font-size:21pt;line-height:1.12;margin:0;color:var(--primary)}
.tc-title b{color:var(--secondary)}

/* Content Typography */
.tc-h3{display:inline-block;background:var(--tint);color:var(--primary);border-radius:1.5mm;padding:1mm 3mm;font-size:8pt;font-weight:800;letter-spacing:.08em;text-transform:uppercase;margin:4mm 0 2mm}
.tc-cap{font-size:9pt;color:#475569;margin:0 0 4mm}
.tc-body{font-size:9.5pt;line-height:1.55;margin:0 0 3mm;color:var(--ink)}

/* Editorial Bullets (Ebook) */
.tc-bullets{margin:2mm 0 4mm;space-y:2mm}
.tc-bullet-item{display:flex;align-items:flex-start;gap:2.5mm;margin-bottom:2.2mm;font-size:9.3pt}
.tc-dot{width:2mm;height:2mm;border-radius:50%;background:var(--secondary);margin-top:2mm;flex-shrink:0}
.tc-callout{margin-top:auto;border:.4mm solid var(--border);background:var(--soft);border-radius:2.5mm;padding:3.5mm 4mm}
.tc-callout b{font-size:7.5pt;text-transform:uppercase;letter-spacing:.1em;color:var(--primary)}

/* Interactive Checklists (Planners / Workbooks / Challenges) */
.tc-checklist{margin:1.5mm 0 3mm}
.tc-check{display:flex;align-items:flex-end;min-height:8.5mm;margin-bottom:1.2mm}
.tc-box{display:inline-block;width:4mm;height:4mm;border:.4mm solid var(--primary);border-radius:.8mm;flex:0 0 4mm;margin-right:2.5mm;margin-bottom:1mm}
.tc-check-line{flex:1;border-bottom:.3mm solid var(--border);padding-bottom:.8mm}
.tc-hint{font-size:8.8pt;color:var(--ink)}

/* Write-on Fields & Tables */
.tc-fields{display:grid;grid-template-columns:repeat(3,1fr);gap:5mm;margin:0 0 4mm}
.tc-field{display:flex;align-items:flex-end;gap:2mm;font-size:8.5pt;font-weight:700;color:var(--primary)}
.tc-field span{white-space:nowrap}
.tc-field i{flex:1;border-bottom:.35mm solid var(--border);height:5mm}
.tc-table{width:100%;border:.35mm solid var(--border);border-radius:2mm;overflow:hidden}
.tc-tr{display:flex;width:100%;border-bottom:.3mm solid var(--border)}
.tc-tr:last-child{border-bottom:0}
.tc-th{background:var(--tint);font-weight:700;font-size:8pt;text-transform:uppercase;letter-spacing:.06em;color:var(--primary)}
.tc-td{padding:2mm 2.5mm;border-right:.3mm solid var(--border);font-size:8.8pt}
.tc-td:last-child{border-right:0}

/* Bottom Auto-Fill Workspace */
.tc-fill{flex:1 1 0;min-height:28mm;margin-top:4mm}
.tc-fill-boxes{display:grid;grid-template-columns:1.3fr 1fr;gap:4mm;height:100%}
.tc-fb{border:.35mm solid var(--border);border-radius:2.5mm;padding:2.5mm 3.5mm;display:flex;flex-direction:column}
.tc-fb>b{align-self:flex-start;font-size:7pt;font-weight:700;letter-spacing:.1em;text-transform:uppercase;background:var(--tint);color:var(--primary);border-radius:1mm;padding:.8mm 2.2mm;margin-bottom:2mm}
.tc-fb-l{flex:1;background-image:repeating-linear-gradient(to bottom,transparent 0,transparent 6.7mm,var(--border) 6.7mm,var(--border) 7mm)}
.tc-fb ul{list-style:none;margin:0;padding:0;flex:1;display:flex;flex-direction:column;justify-content:space-around}
.tc-fb li{display:flex;align-items:flex-end;gap:2mm;height:6.5mm}
.tc-fb li span{width:3.4mm;height:3.4mm;border:.4mm solid var(--secondary);border-radius:50%;flex:none;margin-bottom:.6mm}
.tc-fb li i{flex:1;border-bottom:.3mm solid var(--border)}

/* Milestones Row */
.tc-miles{display:grid;grid-template-columns:repeat(4,1fr);gap:4mm;margin-top:3mm}
.tc-miles div{border:.35mm solid var(--border);border-radius:2mm;padding:2.5mm 3mm;display:flex;flex-direction:column;gap:1.5mm;font-size:8pt;color:#64748b}
.tc-miles b{font-family:'Playfair Display',serif;font-size:15pt;color:var(--secondary)}

/* Cover Page (Tailored to Content Type) */
.tc-cover{background:var(--soft);display:flex;flex-direction:column;justify-content:space-between;padding:22mm 20mm}
.tc-cover-frame{border:1mm solid var(--primary);outline:.4mm solid var(--secondary);outline-offset:2mm;border-radius:4mm;padding:18mm 14mm;background:#fff;text-align:center;flex:1;display:flex;flex-direction:column;justify-content:space-between}
.tc-cover-badge{display:inline-block;margin:0 auto;padding:1.5mm 4.5mm;border-radius:99px;background:var(--tint);color:var(--primary);font-size:8pt;font-weight:800;letter-spacing:.18em;text-transform:uppercase}
.tc-cover-h1{font-family:'Playfair Display',serif;font-weight:800;font-size:32pt;line-height:1.1;color:var(--primary);margin:6mm 0 4mm}
.tc-cover-sub{font-size:10.5pt;color:#475569;max-width:130mm;margin:0 auto;line-height:1.5}
.tc-cover-meta{border-top:.35mm solid var(--border);padding-top:5mm;display:flex;justify-content:space-between;font-size:8.5pt;font-weight:700;color:var(--primary)}

/* Contents */
.tc-toc{list-style:none;margin:3mm 0 0;padding:0}
.tc-toc-row{margin-bottom:3mm}
.tc-toc-row a{display:flex;align-items:baseline;gap:2.5mm;text-decoration:none;color:var(--ink);font-size:9.8pt;font-weight:500}
.tc-toc-dots{flex:1;border-bottom:.35mm dotted var(--border)}
.tc-toc-p{font-weight:800;color:var(--secondary)}

/* Steps */
.tc-steps{list-style:none;margin:0 0 5mm;padding:0}
.tc-step{display:flex;align-items:flex-start;gap:3mm;margin-bottom:3mm;font-size:9.5pt}
.tc-step-n{flex:0 0 5.5mm;height:5.5mm;border-radius:50%;background:var(--primary);color:#fff;font-size:8pt;font-weight:700;display:flex;align-items:center;justify-content:center}

/* Footer */
.tc-folio{position:absolute;left:15mm;right:15mm;bottom:10mm;height:7mm;border-top:.25mm solid var(--border);padding-top:2mm;display:flex;align-items:center;justify-content:center;font-size:8pt}
.tc-folio-n{font-weight:800;color:var(--primary)}
.tc-back{position:absolute;left:0;color:var(--secondary);text-decoration:none;font-weight:700}
.tc-brand-foot{position:absolute;right:0;color:#94a3b8;font-size:7.5pt}

.tc-wm{position:fixed;inset:0;z-index:9999;pointer-events:none;background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='420' height='250'%3E%3Ctext x='0' y='190' transform='rotate(-30 0 190)' font-family='system-ui,sans-serif' font-size='30' font-weight='800' fill='%23111827'%3ETrendCartel Preview%3C/text%3E%3C/svg%3E");background-repeat:repeat;opacity:.10}

@media print{
  html,body,*{-webkit-print-color-adjust:exact !important;print-color-adjust:exact !important}
  html,body{background:#fff}
  .tc-page{margin:0;box-shadow:none}
}
@media screen{
  .tc-page{box-shadow:0 4px 20px rgba(15,23,42,.12)}
}
</style>
</head>
<body>
${includeWatermark ? '<div class="tc-wm"></div>' : ""}
<main>
  <!-- PAGE 1: CUSTOMIZED COVER -->
  <section class="tc-page tc-cover" id="cover">
    <div class="tc-cover-frame">
      <div class="tc-cover-badge">${escapeHtml(subFormat)} · ${totalPages} Master Pages</div>
      <div>
        <h1 class="tc-cover-h1">${escapeHtml(productTitle)}</h1>
        <p class="tc-cover-sub">${escapeHtml(subtitle)}</p>
      </div>
      <div class="tc-cover-meta">
        <span>Prepared for: ${ownerLine}</span>
        <span>A4 Print &amp; Tablet Edition</span>
      </div>
    </div>
  </section>

  <!-- PAGE 2: USAGE / PRINT SETUP GUIDE -->
  <section class="tc-page" id="setup-guide">
    ${topTabs}
    <header class="tc-head">
      <div class="tc-kicker">Quick-Start &amp; Formatting Instructions</div>
      <h2 class="tc-title"><b>${isNotion ? "Workspace" : "Before"}</b> ${isNotion ? "Setup Guide" : "You Print"}</h2>
    </header>
    <div class="tc-body-area">
      <p class="tc-cap">${
        isNotion
          ? "Follow these steps to configure your Notion workspace databases, relations, and views in under 10 minutes."
          : "Use these exact print and tablet settings so every checklist box and ruled line stays sharp and easy to write on."
      }</p>
      <ol class="tc-steps">
        ${
          isNotion
            ? `
          <li class="tc-step"><span class="tc-step-n">1</span><span>Create a new top-level Notion page titled <strong>${escapeHtml(productTitle)}</strong>.</span></li>
          <li class="tc-step"><span class="tc-step-n">2</span><span>Set up the inline databases outlined in the modules below using the exact property types listed.</span></li>
          <li class="tc-step"><span class="tc-step-n">3</span><span>Turn on <strong>Share → Publish to Web → Allow duplicate as template</strong> to generate your buyer link.</span></li>
          <li class="tc-step"><span class="tc-step-n">4</span><span>Paste your Notion template link into Selar, Gumroad, or Etsy automatic delivery.</span></li>`
            : `
          <li class="tc-step"><span class="tc-step-n">1</span><span>Set Paper Size to <strong>A4 Portrait</strong> (210mm × 297mm) and Scale to <strong>100% (Actual Size)</strong>.</span></li>
          <li class="tc-step"><span class="tc-step-n">2</span><span>Enable <strong>Background Graphics</strong> in your print dialog to preserve soft header tints.</span></li>
          <li class="tc-step"><span class="tc-step-n">3</span><span><strong>Greyscale / Black &amp; White Friendly:</strong> Every border and checkbox prints cleanly on home laser or inkjet printers.</span></li>
          <li class="tc-step"><span class="tc-step-n">4</span><span><strong>iPad / Tablet Users:</strong> Switch GoodNotes or Notability to <em>Pointer / Read Mode</em> to tap top navigation tabs and Contents links.</span></li>`
        }
      </ol>
      <div class="tc-fb" style="flex:1">
        <b>${isNotion ? "Template Link &amp; Version Notes" : "Personal Goals &amp; Setup Notes"}</b>
        <div class="tc-fb-l"></div>
      </div>
    </div>
    <div class="tc-folio"><span class="tc-folio-n">2</span></div>
  </section>

  <!-- PAGE 3: INTERACTIVE TABLE OF CONTENTS -->
  <section class="tc-page" id="tc-contents">
    ${topTabs}
    <header class="tc-head">
      <div class="tc-kicker">Interactive Hyperlinked Index</div>
      <h2 class="tc-title"><b>Table</b> of Contents</h2>
    </header>
    <div class="tc-body-area">
      <p class="tc-cap">Tap any section title in your PDF reader, browser, or tablet app to jump directly to that sheet.</p>
      <ol class="tc-toc">${tocHtml}</ol>
    </div>
    <div class="tc-folio"><span class="tc-folio-n">3</span></div>
  </section>

  <!-- DYNAMIC AI-GENERATED PAGES -->
  ${dynamicPagesHtml}

  <!-- PURPOSE-BUILT VISUAL TRACKER / ACTION MATRIX -->
  ${renderPurposeBuiltTrackerSheet(subFormat, niche, pages.length + 4, t)}
</main>
</body>
</html>`;
}