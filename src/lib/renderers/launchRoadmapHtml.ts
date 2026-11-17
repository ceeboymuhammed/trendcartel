// src/lib/renderers/launchRoadmapHtml.ts

export interface LaunchDayItem {
  dayNumber: number;
  phase: string;
  title: string;
  channel: string;
  actionChecklist: string[];
  copyScriptTitle: string;
  copyScriptBody: string;
}

export interface LaunchRoadmapRenderOptions {
  productName: string;
  productType: string;
  niche: string;
  priceRange: string;
  currency: string;
  buyLink: string;
  audienceSize: string;
  channels: string[];
  contentVibe: string;
  launchDateLabel: string;
  readinessLabel: string;
  strategySummary: string;
  days: LaunchDayItem[];
}

function escapeHtml(str: string): string {
  return (str || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function generateLaunchRoadmapHTML(opts: LaunchRoadmapRenderOptions): string {
  const {
    productName,
    productType,
    niche,
    priceRange,
    currency,
    buyLink,
    audienceSize,
    channels,
    contentVibe,
    launchDateLabel,
    readinessLabel,
    strategySummary,
    days,
  } = opts;

  const tocHtml = days
    .map(
      (d) =>
        `<li class="tc-toc-row"><a href="#day-${d.dayNumber}"><span><strong>Day ${String(
          d.dayNumber
        ).padStart(2, "0")}</strong> (${escapeHtml(d.phase)}) — ${escapeHtml(
          d.title
        )}</span><span class="tc-toc-dots"></span><span class="tc-toc-p">${escapeHtml(
          d.channel
        )}</span></a></li>`
    )
    .join("");

  const dayPagesHtml = days
    .map(
      (d) => `
    <section class="tc-page" id="day-${d.dayNumber}">
      <nav class="tc-tabs">
        <a href="#tc-contents">All Days</a>
        <a href="#day-1">Day 1</a>
        <a href="#day-${Math.max(1, Math.floor(days.length / 2))}">Launch</a>
        <a href="#tracker-grid">Tracker</a>
      </nav>
      <header class="tc-head">
        <div class="tc-kicker">${escapeHtml(d.phase)} · Channel: ${escapeHtml(d.channel)}</div>
        <h2 class="tc-title"><b>Day ${String(d.dayNumber).padStart(2, "0")}:</b> ${escapeHtml(
          d.title
        )}</h2>
      </header>
      <div class="tc-body-area">
        <div class="tc-h3">Today's Execution Checklist</div>
        <div class="tc-checklist">
          ${d.actionChecklist
            .map(
              (item) =>
                `<div class="tc-check"><span class="tc-box"></span><span class="tc-check-line">${escapeHtml(
                  item
                )}</span></div>`
            )
            .join("")}
        </div>

        <div class="tc-script-box">
          <div class="tc-script-head">
            <span>Ready-to-Paste Script: ${escapeHtml(d.copyScriptTitle)}</span>
            <span class="tc-pill">${escapeHtml(contentVibe)}</span>
          </div>
          <div class="tc-script-body">${escapeHtml(d.copyScriptBody).replace(/\n/g, "<br/>")}</div>
        </div>

        <div class="tc-fb">
          <b>Day ${d.dayNumber} Metrics, Replies &amp; Adjustments</b>
          <div class="tc-fb-l"></div>
        </div>
      </div>
      <div class="tc-folio">
        <a class="tc-back" href="#tc-contents">Index</a>
        <span class="tc-folio-n">Day ${d.dayNumber} of ${days.length}</span>
        <span class="tc-brand-foot">TrendCartel Launch Advisor</span>
      </div>
    </section>`
    )
    .join("\n");

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8" />
<title>${escapeHtml(productName)} — Launch Playbook</title>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;800&family=Inter:wght@400;500;600;700;800&display=swap">
<style>
:root{
  --primary:#064E3B;
  --secondary:#059669;
  --tint:#D1FAE5;
  --soft:#F0FDF4;
  --border:#6EE7B7;
  --ink:#0F172A;
}
*{box-sizing:border-box}
html,body{margin:0;padding:0;background:#e5e7eb;color:var(--ink);font-family:'Inter',system-ui,sans-serif;font-size:10pt;line-height:1.45}
@page{size:A4 portrait;margin:0}

.tc-page{position:relative;width:210mm;height:297mm;padding:0;background:#fff;margin:6mm auto;overflow:hidden;page-break-after:always;break-after:page}
.tc-page:last-child{page-break-after:auto;break-after:auto}
.tc-body-area{height:244mm;margin:0 15mm;display:flex;flex-direction:column;overflow:hidden}

.tc-tabs{position:absolute;right:15mm;top:7mm;display:flex;gap:1.5mm;font-size:7pt;letter-spacing:.08em;text-transform:uppercase}
.tc-tabs a{padding:1mm 2.6mm;color:var(--primary);background:var(--soft);text-decoration:none;border:.25mm solid var(--border);border-radius:1.5mm;font-weight:700}
.tc-tabs a:first-child{background:var(--primary);color:#fff;border-color:var(--primary)}

.tc-head{padding:14mm 15mm 3.5mm;margin-bottom:4mm;border-bottom:.7mm solid var(--primary)}
.tc-kicker{font-size:7.5pt;font-weight:700;letter-spacing:.14em;text-transform:uppercase;color:var(--secondary);margin-bottom:1.2mm}
.tc-title{font-family:'Playfair Display',Georgia,serif;font-weight:800;font-size:20pt;line-height:1.15;margin:0;color:var(--primary)}
.tc-title b{color:var(--secondary)}

.tc-h3{display:inline-block;background:var(--tint);color:var(--primary);border-radius:1.5mm;padding:1mm 3mm;font-size:8pt;font-weight:800;letter-spacing:.08em;text-transform:uppercase;margin:2mm 0 2.5mm;align-self:flex-start}
.tc-checklist{margin:0 0 4mm}
.tc-check{display:flex;align-items:flex-start;gap:2.5mm;margin-bottom:2.4mm;font-size:9.3pt}
.tc-box{display:inline-block;width:4mm;height:4mm;border:.4mm solid var(--primary);border-radius:.8mm;flex:0 0 4mm;margin-top:.6mm}
.tc-check-line{flex:1;border-bottom:.3mm solid #cbd5e1;padding-bottom:1.2mm}

.tc-script-box{border:.4mm solid var(--border);background:var(--soft);border-radius:2.5mm;padding:4mm;margin:2mm 0 4mm}
.tc-script-head{display:flex;justify-content:space-between;align-items:center;font-size:8pt;font-weight:800;text-transform:uppercase;letter-spacing:.06em;color:var(--primary);margin-bottom:2.5mm;border-bottom:.3mm solid var(--border);padding-bottom:1.5mm}
.tc-pill{background:#fff;border:.3mm solid var(--border);padding:.5mm 2mm;border-radius:99px;font-size:7pt;color:var(--secondary)}
.tc-script-body{font-size:9pt;line-height:1.55;color:#1e293b;background:#fff;padding:3.5mm;border-radius:1.8mm;border:.25mm solid #e2e8f0}

.tc-fb{flex:1;border:.35mm solid #cbd5e1;border-radius:2.5mm;padding:2.5mm 3.5mm;display:flex;flex-direction:column;min-height:28mm}
.tc-fb>b{align-self:flex-start;font-size:7pt;font-weight:700;letter-spacing:.1em;text-transform:uppercase;background:#f1f5f9;color:#334155;border-radius:1mm;padding:.8mm 2.2mm;margin-bottom:2mm}
.tc-fb-l{flex:1;background-image:repeating-linear-gradient(to bottom,transparent 0,transparent 6.7mm,#cbd5e1 6.7mm,#cbd5e1 7mm)}

/* Cover */
.tc-cover{background:var(--soft);display:flex;flex-direction:column;justify-content:space-between;padding:20mm}
.tc-cover-frame{border:1mm solid var(--primary);outline:.4mm solid var(--secondary);outline-offset:2mm;border-radius:4mm;padding:16mm 14mm;background:#fff;flex:1;display:flex;flex-direction:column;justify-content:space-between}
.tc-cover-badge{display:inline-block;padding:1.5mm 4.5mm;border-radius:99px;background:var(--tint);color:var(--primary);font-size:8pt;font-weight:800;letter-spacing:.16em;text-transform:uppercase;align-self:flex-start}
.tc-cover-h1{font-family:'Playfair Display',serif;font-weight:800;font-size:32pt;line-height:1.1;color:var(--primary);margin:4mm 0}
.tc-meta-grid{display:grid;grid-template-columns:1fr 1fr;gap:3mm;margin-top:4mm}
.tc-meta-card{background:#f8fafc;border:.3mm solid #e2e8f0;border-radius:2mm;padding:3mm}
.tc-meta-card span{display:block;font-size:7pt;text-transform:uppercase;letter-spacing:.1em;color:#64748b;font-weight:700}
.tc-meta-card strong{font-size:9.5pt;color:var(--ink)}

/* TOC */
.tc-toc{list-style:none;margin:2mm 0 0;padding:0}
.tc-toc-row{margin-bottom:2.8mm}
.tc-toc-row a{display:flex;align-items:baseline;gap:2.5mm;text-decoration:none;color:var(--ink);font-size:9.2pt}
.tc-toc-dots{flex:1;border-bottom:.35mm dotted #94a3b8}
.tc-toc-p{font-weight:700;font-size:8pt;color:var(--secondary)}

/* Tracker Grid */
.tc-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:3.5mm;margin-top:3mm}
.tc-day-tile{border:.35mm solid var(--border);border-radius:2mm;padding:3mm;background:var(--soft)}
.tc-day-tile b{display:block;font-size:9pt;color:var(--primary);margin-bottom:1.5mm}
.tc-day-tile span{display:block;font-size:7.5pt;color:#475569;margin-bottom:2mm}

.tc-folio{position:absolute;left:15mm;right:15mm;bottom:10mm;height:7mm;border-top:.25mm solid #cbd5e1;padding-top:2mm;display:flex;align-items:center;justify-content:center;font-size:8pt}
.tc-folio-n{font-weight:800;color:var(--primary)}
.tc-back{position:absolute;left:0;color:var(--secondary);text-decoration:none;font-weight:700}
.tc-brand-foot{position:absolute;right:0;color:#94a3b8;font-size:7.5pt}

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
<main>
  <!-- COVER PAGE -->
  <section class="tc-page tc-cover" id="cover">
    <div class="tc-cover-frame">
      <div class="tc-cover-badge">${days.length}-Day Go-To-Market Playbook · ${escapeHtml(readinessLabel)}</div>
      <div>
        <div style="font-size:9pt;font-weight:700;color:var(--secondary);text-transform:uppercase;letter-spacing:.12em;">Personalized Launch Roadmap For</div>
        <h1 class="tc-cover-h1">${escapeHtml(productName)}</h1>
        <p style="font-size:10pt;color:#475569;line-height:1.55;">${escapeHtml(strategySummary)}</p>
      </div>
      <div class="tc-meta-grid">
        <div class="tc-meta-card"><span>Product Format</span><strong>${escapeHtml(productType)} (${escapeHtml(niche)})</strong></div>
        <div class="tc-meta-card"><span>Price Tier</span><strong>${escapeHtml(priceRange)} (${escapeHtml(currency)})</strong></div>
        <div class="tc-meta-card"><span>Audience &amp; Channels</span><strong>${escapeHtml(audienceSize)} · ${escapeHtml(channels.join(", "))}</strong></div>
        <div class="tc-meta-card"><span>Target Launch &amp; Link</span><strong>${escapeHtml(launchDateLabel)} · ${escapeHtml(buyLink || "Storefront Setup in Day 1")}</strong></div>
      </div>
    </div>
  </section>

  <!-- TABLE OF CONTENTS -->
  <section class="tc-page" id="tc-contents">
    <header class="tc-head">
      <div class="tc-kicker">Step-by-Step Execution Schedule</div>
      <h2 class="tc-title"><b>Launch</b> Roadmap Index</h2>
    </header>
    <div class="tc-body-area">
      <ol class="tc-toc">${tocHtml}</ol>
    </div>
    <div class="tc-folio"><span class="tc-folio-n">Index</span></div>
  </section>

  <!-- DAILY EXECUTION SHEETS -->
  ${dayPagesHtml}

  <!-- VISUAL LAUNCH CHECKLIST TRACKER -->
  <section class="tc-page" id="tracker-grid">
    <nav class="tc-tabs"><a href="#tc-contents">All Days</a><a href="#day-1">Day 1</a><a href="#tracker-grid">Tracker</a></nav>
    <header class="tc-head">
      <div class="tc-kicker">Print &amp; Tick Off Every Milestone</div>
      <h2 class="tc-title"><b>Launch</b> Sprint Completion Board</h2>
    </header>
    <div class="tc-body-area">
      <div class="tc-grid">
        ${days
          .map(
            (d) => `
          <div class="tc-day-tile">
            <b>Day ${d.dayNumber} · ${escapeHtml(d.channel)}</b>
            <span>${escapeHtml(d.title)}</span>
            <div style="display:flex;align-items:center;gap:2mm;font-size:7.5pt;font-weight:700;color:var(--primary)">
              <span class="tc-box"></span> Done
            </div>
          </div>`
          )
          .join("")}
      </div>
      <div class="tc-fb" style="margin-top:5mm">
        <b>Post-Launch Revenue Tally &amp; Lessons Learned</b>
        <div class="tc-fb-l"></div>
      </div>
    </div>
    <div class="tc-folio"><a class="tc-back" href="#tc-contents">Index</a><span class="tc-folio-n">Completion Tracker</span></div>
  </section>
</main>
</body>
</html>`;
}