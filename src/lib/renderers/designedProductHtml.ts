// src/lib/renderers/designedProductHtml.ts

export interface ProductPageInput {
  pageNumber: number;
  title: string;
  bodyText: string;
}

export interface DesignedHtmlOptions {
  productTitle: string;
  subtitle?: string;
  authorName: string;
  showAuthor: boolean;
  subFormat: string;
  niche: string;
  pages: ProductPageInput[];
  includeWatermark?: boolean;
}

function escapeHtml(str: string): string {
  return (str || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

// Converts raw AI markdown/lines into structured printable checkboxes, prompts, and ruled lines
function formatBodyToPrintableBlocks(bodyText: string): string {
  const lines = (bodyText || "")
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);

  let html = "";
  let inChecklist = false;

  for (const rawLine of lines) {
    // Strip markdown heading hashes
    if (/^#{1,4}\s+/.test(rawLine)) {
      if (inChecklist) {
        html += `</div>`;
        inChecklist = false;
      }
      const heading = rawLine.replace(/^#{1,4}\s+/, "").replace(/\*\*/g, "");
      html += `<h3 class="pp-h3">${escapeHtml(heading)}</h3>`;
      continue;
    }

    // Convert checklist items (- [ ] or * [ ]) into printable 4mm square tick boxes with write-on lines
    if (/^[-*]\s*\[\s*\]/.test(rawLine) || /^[-*]\s+/.test(rawLine)) {
      if (!inChecklist) {
        html += `<div class="pp-checklist">`;
        inChecklist = true;
      }
      const itemText = rawLine
        .replace(/^[-*]\s*\[\s*\]\s*/, "")
        .replace(/^[-*]\s+/, "")
        .replace(/\*\*(.*?)\*\*/g, "$1");
      html += `<div class="pp-check"><span class="pp-box"></span><span class="pp-check-line"><span class="pp-hint">${escapeHtml(
        itemText
      )}</span></span></div>`;
      continue;
    }

    if (inChecklist) {
      html += `</div>`;
      inChecklist = false;
    }

    const cleanPara = rawLine.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
    html += `<p class="pp-body">${cleanPara}</p>`;
  }

  if (inChecklist) html += `</div>`;
  return html;
}

// Generates the 100-Step Challenge SVG Grid
function render100StepSvg(): string {
  let circles = "";
  for (let i = 0; i < 100; i++) {
    const col = i % 10;
    const row = Math.floor(i / 10);
    const cx = 9 + col * 16.4;
    const cy = 9 + row * 16.4;
    const num = i + 1;
    const isMilestone = num % 25 === 0;
    circles += `<circle cx="${cx.toFixed(1)}" cy="${cy.toFixed(1)}" r="${
      isMilestone ? "7.4" : "6.6"
    }" ${isMilestone ? 'fill="#FBEFF2" stroke="#D98C9F" stroke-width=".9"' : ""}/>
    <text x="${cx.toFixed(1)}" y="${(cy + 1.5).toFixed(
      1
    )}" text-anchor="middle" font-size="${isMilestone ? "4.2" : "3.6"}" font-weight="${
      isMilestone ? "700" : "500"
    }" fill="${isMilestone ? "#D98C9F" : "#766D82"}" stroke="none">${num}</text>`;
  }
  return `<svg class="ft-svg" viewBox="0 0 166 166" width="145mm" height="145mm">
    <g fill="none" stroke="#8FA89A" stroke-width=".55" font-family="Inter,Arial">${circles}</g>
  </svg>`;
}

// Generates the Hexagon Grid SVG Tracker
function renderHexagonTrackerSvg(): string {
  const hexes: string[] = [];
  const r = 7.2;
  const dx = 12.47;
  const dy = 10.8;
  for (let row = 0; row < 11; row++) {
    for (let col = 0; col < 13; col++) {
      const cx = 11.1 + col * dx + (row % 2 === 1 ? dx / 2 : 0);
      const cy = 8.0 + row * dy;
      const pts = Array.from({ length: 6 }, (_, k) => {
        const ang = (Math.PI / 3) * k - Math.PI / 6;
        return `${(cx + r * Math.cos(ang)).toFixed(1)},${(cy + r * Math.sin(ang)).toFixed(1)}`;
      }).join(" ");
      hexes.push(`<polygon points="${pts}"/>`);
    }
  }
  return `<svg class="ft-svg" viewBox="0 0 178 130" width="174mm" height="125mm">
    <g fill="none" stroke="#8FA89A" stroke-width=".55">${hexes.join("")}</g>
  </svg>`;
}

// Generates the Savings Jar Vector SVG
function renderSavingsJarSvg(): string {
  const coins: string[] = [];
  for (let row = 0; row < 10; row++) {
    const count = row % 2 === 0 ? 8 : 7;
    const startX = row % 2 === 0 ? 27.6 : 34.3;
    const cy = 57.6 + row * 11.6;
    for (let c = 0; c < count; c++) {
      coins.push(`<circle cx="${(startX + c * 13.4).toFixed(1)}" cy="${cy.toFixed(1)}" r="5.6"/>`);
    }
  }
  return `<svg class="ft-svg" viewBox="0 0 150 192" width="130mm" height="165mm">
    <g fill="none" stroke="#4B4458" stroke-width=".6">
      <rect x="30" y="4" width="90" height="16" rx="3" fill="#F6F2F8" stroke-width=".8"/>
      <path d="M34 20 h82 v10 c18 6 26 18 26 34 v104 c0 12 -9 20 -21 20 h-92 c-12 0 -21 -8 -21 -20 v-104 c0 -16 8 -28 26 -34 z" stroke-width="1.1"/>
      <g stroke="#8FA89A" stroke-width=".5">${coins.join("")}</g>
    </g>
    <text x="75" y="13.6" text-anchor="middle" font-family="Inter,Arial" font-size="4.6" font-weight="700" letter-spacing=".8" fill="#4B4458">GOAL  ____________</text>
  </svg>`;
}

export function generateDesignedProductHTML(opts: DesignedHtmlOptions): string {
  const {
    productTitle,
    subtitle = "A Step-by-Step Practical Blueprint, Execution Worksheets & Visual Trackers",
    authorName,
    showAuthor,
    subFormat,
    niche,
    pages,
    includeWatermark = false,
  } = opts;

  const ownerLine = showAuthor && authorName.trim() ? escapeHtml(authorName.trim()) : "____________________";
  const totalSheetCount = pages.length + 6; // Cover + Print Guide + TOC + Custom Pages + 3 Visual Trackers

  const navHeader = `
    <nav class="dz-tabs">
      <a href="#pp-contents">Contents</a>
      <a href="#page-1">Guide</a>
      <a href="#tracker-jar">Savings Jar</a>
      <a href="#tracker-100">100-Step</a>
      <a href="#tracker-hex">Milestones</a>
    </nav>
  `;

  // Table of Contents Rows
  const tocRows = [
    { id: "print-guide", title: "Before You Print — A4 Setup Guide", page: 2 },
    ...pages.map((p, idx) => ({
      id: `page-${p.pageNumber}`,
      title: p.title,
      page: idx + 4,
    })),
    { id: "tracker-jar", title: `${niche} Goal & Revenue Jar`, page: pages.length + 4 },
    { id: "tracker-100", title: "100-Day Execution & Consistency Grid", page: pages.length + 5 },
    { id: "tracker-hex", title: "Milestone & Debt/Cost Payoff Hexagon Tracker", page: pages.length + 6 },
  ];

  const tocHtml = tocRows
    .map(
      (r) =>
        `<li class="pp-toc-row"><a href="#${r.id}"><span class="pp-toc-t">${escapeHtml(
          r.title
        )}</span><span class="pp-toc-dots"></span><span class="pp-toc-p">${r.page}</span></a></li>`
    )
    .join("");

  // Dynamic AI Content Sheets
  const aiSheetsHtml = pages
    .map((p, idx) => {
      const sheetNum = idx + 4;
      const words = p.title.split(" ");
      const firstWord = escapeHtml(words[0] || "");
      const restWords = escapeHtml(words.slice(1).join(" "));
      const formattedBody = formatBodyToPrintableBlocks(p.bodyText);

      return `
      <section class="pp-page dz-page dz-fresh" id="page-${p.pageNumber}">
        ${navHeader}
        <header class="dz-head">
          <h2 class="pp-h2 dz-title dz-t-l"><b>${firstWord}</b> ${restWords}</h2>
        </header>
        <div class="pp-body-area">
          <div class="dz-flow">
            ${formattedBody}
          </div>
          <div class="dz-fill">
            <div class="dz-fill-boxes">
              <div class="dz-fb dz-fb-notes">
                <b>Action Notes &amp; Key Metrics</b>
                <div class="dz-fb-l"></div>
              </div>
              <div class="dz-fb-col">
                <div class="dz-fb">
                  <b>Priority Checklist</b>
                  <ul>
                    <li><span></span><i></i></li>
                    <li><span></span><i></i></li>
                    <li><span></span><i></i></li>
                    <li><span></span><i></i></li>
                    <li><span></span><i></i></li>
                  </ul>
                </div>
                <div class="dz-fb">
                  <b>Wins &amp; Progress</b>
                  <div class="dz-fb-l"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="pp-folio">
          <a class="pp-back" href="#pp-contents">Contents</a>
          <span class="pp-folio-n">${sheetNum}</span>
          <div class="pp-repeat">${escapeHtml(subFormat)}</div>
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
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700&family=Inter:wght@400;500;600;700;800&family=Allura&display=swap">
<style>
:root{
  --ink:#2F2A36;
  --accent:#8FA89A;
  --plum:#4B4458;
  --rose:#D98C9F;
  --lavender:#E6DDF1;
  --tint:#F6F2F8;
  --rule:#B9ADC9;
}
*{box-sizing:border-box}
html,body{margin:0;padding:0;background:#ececed;color:var(--ink);font-family:'Inter',Arial,sans-serif;font-size:10pt;line-height:1.45}
@page{size:A4 portrait;margin:0}

.pp-page{position:relative;width:210mm;height:297mm;padding:0;background:#fff;margin:6mm auto;overflow:hidden;page-break-after:always;break-after:page}
.pp-page:last-child{page-break-after:auto;break-after:auto}
.dz-page .pp-body-area{height:249.4mm;margin:0 14mm;display:flex;flex-direction:column;overflow:hidden}
.dz-flow{flex:0 1 auto;min-height:0;display:flex;flex-direction:column}

/* Top Navigation Tabs */
.dz-tabs{position:absolute;right:14mm;top:6mm;height:5.5mm;display:flex;gap:1.2mm;font-size:7pt;letter-spacing:.08em;text-transform:uppercase;z-index:10}
.dz-tabs a{display:block;line-height:5.1mm;padding:0 2.4mm;color:var(--plum);background:var(--tint);text-decoration:none;border:.25mm solid var(--rule);border-radius:1.6mm;font-weight:600}
.dz-tabs a:first-child{background:var(--plum);border-color:var(--plum);color:#fff}

/* Page Header */
.dz-head{position:relative;height:26mm;padding:0 14mm 3.2mm;display:flex;align-items:flex-end}
.dz-head::after{content:"";position:absolute;left:14mm;right:14mm;bottom:0;border-bottom:.6mm solid var(--lavender)}
.dz-title{font-family:'Allura',cursive;font-weight:400;margin:0;color:var(--plum);background:var(--lavender);border-radius:2.6mm;padding:.6mm 5mm .2mm;line-height:1.05}
.dz-title b{font-weight:400;color:var(--rose)}
.dz-t-s{font-size:32pt}
.dz-t-l{font-size:24pt}

/* Typography & Blocks */
.pp-h3{display:table;background:var(--lavender);color:var(--plum);border-radius:99px;padding:0 3.6mm;font-family:'Inter',Arial,sans-serif;font-size:7.6pt;font-weight:700;letter-spacing:.12em;text-transform:uppercase;line-height:5.6mm;margin:4.5mm 0 2.5mm}
.pp-cap{font-size:9pt;line-height:1.45;color:#575063;margin:0 0 3.5mm}
.pp-body{font-size:9.4pt;line-height:1.5;margin:0 0 3mm;color:var(--ink)}

/* Checklists */
.pp-checklist{margin:1mm 0 3mm}
.pp-check{display:flex;align-items:flex-end;min-height:8.5mm;margin-bottom:1.2mm}
.pp-box{display:inline-block;width:4mm;height:4mm;border:.35mm solid var(--plum);border-radius:.8mm;flex:0 0 4mm;margin-right:2.5mm;margin-bottom:1mm}
.pp-check-line{flex:1;border-bottom:.35mm solid var(--rule);padding-bottom:.8mm}
.pp-hint{font-size:8.6pt;color:var(--ink)}

/* Steps */
.pp-steps{list-style:none;margin:0 0 4mm;padding:0}
.pp-step{display:flex;align-items:flex-start;gap:2.5mm;margin:0 0 2.5mm;font-size:9.3pt;line-height:1.4}
.pp-step-n{flex:0 0 5mm;height:5mm;border-radius:50%;border:.35mm solid var(--plum);color:var(--plum);font-size:7.5pt;font-weight:700;display:flex;align-items:center;justify-content:center;margin-top:.2mm}

/* Auto-Fill Bottom Workspace Boxes */
.dz-fill{flex:1 1 0;min-height:24mm;margin-top:4mm;position:relative}
.dz-fill-boxes{display:grid;grid-template-columns:1.35fr 1fr;gap:4mm;height:100%}
.dz-fb-col{display:grid;grid-template-rows:1fr 1fr;gap:4mm;min-height:0}
.dz-fb{border:.4mm solid var(--rule);border-radius:2.5mm;padding:2.4mm 3mm 3mm;display:flex;flex-direction:column;min-height:0;overflow:hidden}
.dz-fb>b{align-self:flex-start;font-size:7pt;font-weight:700;letter-spacing:.1em;text-transform:uppercase;background:var(--lavender);color:var(--plum);border-radius:1.4mm;padding:.8mm 2.4mm;margin:0 0 2mm}
.dz-fb-l{flex:1;background-image:repeating-linear-gradient(to bottom,transparent 0,transparent 6.65mm,var(--rule) 6.65mm,var(--rule) 7mm)}
.dz-fb ul{list-style:none;margin:0;padding:0;flex:1;display:flex;flex-direction:column;justify-content:space-between}
.dz-fb li{display:flex;align-items:flex-end;gap:2mm;height:6mm}
.dz-fb li span{width:3.2mm;height:3.2mm;border:.4mm solid var(--accent);border-radius:50%;flex:none;margin-bottom:.6mm}
.dz-fb li i{flex:1;border-bottom:.35mm solid var(--rule)}

/* Gingham Decorated Cover */
.dz-front .ft-front-bg{position:absolute;left:0;top:0;width:100%;height:100%;z-index:0}
.dz-front .pp-body-area{position:relative;z-index:1;height:283mm;margin:0 20mm;justify-content:center}
.ft-front{display:flex;flex-direction:column;align-items:center;justify-content:center;height:100%;gap:8mm}
.ft-front-label{background:#fff;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;border:.8mm solid var(--accent);outline:.4mm solid var(--rose);outline-offset:1.8mm;padding:9mm 10mm;width:162mm;border-radius:4mm}
.ft-front-the{font-weight:600;font-size:9pt;letter-spacing:.32em;text-transform:uppercase;color:#766D82;margin-bottom:2mm}
.pp-cover-title{font-family:'Playfair Display',Georgia,serif;font-weight:700;font-size:32pt;line-height:1.1;color:var(--plum);margin:0;max-width:136mm}
.ft-front-script{font-family:'Allura',cursive;font-size:52pt;line-height:1;color:var(--rose);margin-top:1mm}
.pp-cover-spec{font-size:7.5pt;letter-spacing:.22em;text-transform:uppercase;color:#766D82;margin-top:4mm}
.ft-front-art{display:flex;gap:6mm;justify-content:center;align-items:flex-end;margin-top:5mm;height:28mm}
.ft-front-art svg{height:28mm;width:auto}
.ft-front-panel{background:#fff;border:.35mm solid var(--rule);border-radius:3mm;width:162mm;padding:6mm 9mm}
.pp-cover-sub{font-size:9.2pt;line-height:1.45;color:var(--ink);text-align:center;margin:0 0 4mm}
.pp-cover-field{display:grid;grid-template-columns:auto 1fr;gap:3mm;align-items:end}
.pp-cover-label{font-size:7.5pt;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:var(--plum)}
.pp-cover-owner{font-size:9.5pt;font-weight:600;color:var(--plum);border-bottom:.35mm solid var(--rule);padding-bottom:.6mm}

/* Visual Tracker Pages */
.ft-page{padding:12mm 14mm 0}
.ft-body{height:262mm;display:flex;flex-direction:column;overflow:hidden}
.ft-head{background:var(--lavender);border-radius:3mm;padding:2mm 5mm 1.2mm;margin:4mm 0 3.5mm}
.ft-kicker{font-size:7.8pt;font-weight:700;letter-spacing:.14em;text-transform:uppercase;color:var(--rose);margin-bottom:1mm}
.ft-title{font-family:'Allura',cursive;font-weight:400;font-size:34pt;line-height:1;margin:0;color:var(--plum)}
.ft-title b{font-weight:400;color:var(--rose)}
.ft-fields{display:grid;grid-template-columns:repeat(3,1fr);gap:5mm;margin:0 0 4mm}
.ft-field{display:flex;align-items:flex-end;gap:2mm;font-size:8.5pt;font-weight:600;color:var(--plum)}
.ft-field span{white-space:nowrap}
.ft-field i{flex:1;border-bottom:.35mm solid var(--rule);height:5mm}
.ft-art{display:flex;justify-content:center;align-items:center;margin:2mm 0}
.ft-miles{display:grid;grid-template-columns:repeat(4,1fr);gap:4mm;margin-top:3mm}
.ft-miles div{border:.35mm solid var(--rule);border-radius:2.2mm;padding:2.4mm 3mm;display:flex;flex-direction:column;gap:1.5mm;font-size:8pt;color:#766D82}
.ft-miles b{font-family:'Playfair Display',Georgia,serif;font-size:15pt;color:var(--rose)}
.ft-notes{flex:1 1 0;min-height:0;margin-top:4mm;position:relative;overflow:hidden;border:.35mm solid var(--rule);border-radius:2.2mm;padding:8mm 4mm 0}
.ft-notes span{position:absolute;left:3.4mm;top:2.2mm;background:var(--plum);color:#fff;font-size:6.8pt;font-weight:700;letter-spacing:.12em;text-transform:uppercase;padding:.6mm 2.6mm;border-radius:9mm}
.ft-notes i{display:block;height:7.5mm;border-bottom:.25mm solid var(--rule)}

/* Contents */
.pp-toc{list-style:none;margin:2mm 0 0;padding:0;columns:1}
.pp-toc-row{break-inside:avoid;margin:0 0 2.6mm}
.pp-toc-row a{display:flex;align-items:baseline;gap:2mm;text-decoration:none;color:var(--ink);font-size:9.5pt}
.pp-toc-dots{flex:1;border-bottom:.3mm dotted var(--rule);transform:translateY(-1mm)}
.pp-toc-p{font-weight:700;font-size:9pt;color:var(--accent)}

/* Folio Footer */
.pp-folio{position:absolute;left:14mm;right:14mm;bottom:10mm;height:7mm;display:flex;align-items:center;justify-content:center;gap:6mm;font-size:8pt;color:var(--ink)}
.pp-folio-n{font-weight:700;color:var(--accent)}
.pp-back{position:absolute;left:0;color:var(--rose);text-decoration:none;font-weight:600}
.pp-repeat{position:absolute;right:0;color:var(--rose);font-weight:600}

/* Watermark */
.obteno-wm{position:fixed;inset:0;z-index:9999;pointer-events:none;background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='420' height='250'%3E%3Ctext x='0' y='190' transform='rotate(-30 0 190)' font-family='system-ui,sans-serif' font-size='32' font-weight='800' fill='%23222222'%3ETrendCartel Preview%3C/text%3E%3C/svg%3E");background-repeat:repeat;opacity:.12}

@media print{
  html,body,*{-webkit-print-color-adjust:exact !important;print-color-adjust:exact !important}
  html,body{background:#fff}
  .pp-page{margin:0;box-shadow:none}
}
@media screen{
  .pp-page{box-shadow:0 4px 20px rgba(20,20,30,.14)}
}
</style>
</head>
<body>
${includeWatermark ? '<div class="obteno-wm"></div>' : ""}
<main class="pp-doc">

  <!-- PAGE 1: DECORATED COVER -->
  <section class="pp-page pp-page-cover dz-page dz-cover dz-front" id="cover">
    <svg class="ft-front-bg" viewBox="0 0 210 297" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <rect width="210" height="297" fill="#FFFBF7"/>
      ${Array.from({ length: 25 }, (_, i) => `<rect x="0" y="${i * 12}" width="210" height="6" fill="#EFC3D6" fill-opacity=".38"/>`).join("")}
      ${Array.from({ length: 18 }, (_, i) => `<rect x="${i * 12}" y="0" width="6" height="297" fill="#EFC3D6" fill-opacity=".38"/>`).join("")}
    </svg>
    <div class="pp-body-area">
      <div class="pp-cover ft-front">
        <div class="ft-front-label">
          <div class="ft-front-the">The</div>
          <h1 class="pp-cover-title">${escapeHtml(productTitle)}</h1>
          <div class="ft-front-script">${escapeHtml(subFormat)}</div>
          <div class="pp-cover-spec">A4 &middot; Undated &middot; ${totalSheetCount} Master Pages</div>
          <div class="ft-front-art">
            ${renderSavingsJarSvg()}
            ${render100StepSvg()}
          </div>
        </div>
        <div class="ft-front-panel">
          <p class="pp-cover-sub">${escapeHtml(subtitle)}</p>
          <div class="pp-cover-field">
            <span class="pp-cover-label">Created by / Belongs to</span>
            <span class="pp-cover-owner">${ownerLine}</span>
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- PAGE 2: BEFORE YOU PRINT -->
  <section class="pp-page dz-page dz-fresh" id="print-guide">
    ${navHeader}
    <header class="dz-head"><h2 class="pp-h2 dz-title dz-t-s"><b>Before</b> you print</h2></header>
    <div class="pp-body-area">
      <div class="dz-flow">
        <p class="pp-cap">Six settings. They are the difference between a sheet you can write on and a shrunken one you can't.</p>
        <ol class="pp-steps">
          <li class="pp-step"><span class="pp-step-n">1</span><span>Paper size <strong>A4</strong>, portrait (210mm × 297mm).</span></li>
          <li class="pp-step"><span class="pp-step-n">2</span><span>Scale <strong>Actual size</strong> (100%). Never <em>Fit to page</em> — it shrinks the ruled lines below a writable height.</span></li>
          <li class="pp-step"><span class="pp-step-n">3</span><span>Single-sided printing recommended for binder or clipboard use.</span></li>
          <li class="pp-step"><span class="pp-step-n">4</span><span><strong>Greyscale is fine.</strong> Every border and checkbox is engineered for crisp black-and-white laser or inkjet printing.</span></li>
          <li class="pp-step"><span class="pp-step-n">5</span><span>Using it on an iPad or Android tablet? Keep GoodNotes or Notability in <strong>Pointer/Read mode</strong> to tap navigation tabs.</span></li>
          <li class="pp-step"><span class="pp-step-n">6</span><span>Undated by design: reprint any tracking sheet whenever you start a new sprint or month.</span></li>
        </ol>
      </div>
      <div class="dz-fill">
        <div class="dz-fb" style="height:100%">
          <b>Quick Setup Notes</b>
          <div class="dz-fb-l"></div>
        </div>
      </div>
    </div>
    <div class="pp-folio"><span class="pp-folio-n">2</span></div>
  </section>

  <!-- PAGE 3: INTERACTIVE TABLE OF CONTENTS -->
  <section class="pp-page dz-page dz-fresh" id="pp-contents">
    ${navHeader}
    <header class="dz-head"><h2 class="pp-h2 dz-title dz-t-s"><b>Contents</b></h2></header>
    <div class="pp-body-area">
      <div class="dz-flow">
        <p class="pp-cap">Tap any line in a PDF reader, browser, or iPad app to jump straight to that sheet.</p>
        <ol class="pp-toc">${tocHtml}</ol>
      </div>
    </div>
    <div class="pp-folio"><span class="pp-folio-n">3</span></div>
  </section>

  <!-- DYNAMIC CONTENT PAGES -->
  ${aiSheetsHtml}

  <!-- VISUAL TRACKER 1: SAVINGS / REVENUE JAR -->
  <section class="pp-page mp-page ft-page" id="tracker-jar">
    ${navHeader}
    <div class="ft-body">
      <header class="ft-head">
        <div class="ft-kicker">Colour in a circle every time you hit a milestone</div>
        <h2 class="ft-title"><b>${escapeHtml(niche)}</b> Goal Jar</h2>
      </header>
      <div class="ft-fields">
        <div class="ft-field"><span>Target Goal</span><i></i></div>
        <div class="ft-field"><span>Each Circle =</span><i></i></div>
        <div class="ft-field"><span>Start Date</span><i></i></div>
      </div>
      <div class="ft-art">${renderSavingsJarSvg()}</div>
      <div class="ft-miles">
        <div><b>25%</b><span>Amount ______</span><span>Date ______</span></div>
        <div><b>50%</b><span>Amount ______</span><span>Date ______</span></div>
        <div><b>75%</b><span>Amount ______</span><span>Date ______</span></div>
        <div><b>100%</b><span>Amount ______</span><span>Date ______</span></div>
      </div>
    </div>
    <div class="pp-folio"><a class="pp-back" href="#pp-contents">Contents</a><span class="pp-folio-n">${pages.length + 4}</span></div>
  </section>

  <!-- VISUAL TRACKER 2: 100-STEP CHALLENGE -->
  <section class="pp-page mp-page ft-page" id="tracker-100">
    ${navHeader}
    <div class="ft-body">
      <header class="ft-head">
        <div class="ft-kicker">One step at a time: every 25th is a milestone</div>
        <h2 class="ft-title"><b>100-Day</b> Execution Grid</h2>
      </header>
      <div class="ft-fields">
        <div class="ft-field"><span>100-Day Goal</span><i></i></div>
        <div class="ft-field"><span>Daily Action</span><i></i></div>
        <div class="ft-field"><span>Reward at 100</span><i></i></div>
      </div>
      <div class="ft-art">${render100StepSvg()}</div>
      <div class="ft-notes"><span>Milestone Notes</span><i></i><i></i><i></i><i></i><i></i><i></i></div>
    </div>
    <div class="pp-folio"><a class="pp-back" href="#pp-contents">Contents</a><span class="pp-folio-n">${pages.length + 5}</span></div>
  </section>

  <!-- VISUAL TRACKER 3: HEXAGON TRACKER -->
  <section class="pp-page mp-page ft-page" id="tracker-hex">
    ${navHeader}
    <div class="ft-body">
      <header class="ft-head">
        <div class="ft-kicker">Colour a hexagon for every completed session or payout</div>
        <h2 class="ft-title"><b>Progress</b> Hexagon Map</h2>
      </header>
      <div class="ft-fields">
        <div class="ft-field"><span>Focus Area</span><i></i></div>
        <div class="ft-field"><span>Target Total</span><i></i></div>
        <div class="ft-field"><span>Each Hexagon =</span><i></i></div>
      </div>
      <div class="ft-art">${renderHexagonTrackerSvg()}</div>
      <div class="ft-notes"><span>Notes &amp; Reflections</span><i></i><i></i><i></i><i></i><i></i><i></i></div>
    </div>
    <div class="pp-folio"><a class="pp-back" href="#pp-contents">Contents</a><span class="pp-folio-n">${pages.length + 6}</span></div>
  </section>

</main>
</body>
</html>`;
}