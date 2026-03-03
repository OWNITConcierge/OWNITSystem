import fs from "fs";
import path from "path";

const GOLD = "#bd9a60";
const DEBUG = process.env.OI_DEBUG === "0";

const TUNE = {
  // Page padding
  PAGE_PAD_TOP: 20,
  PAGE_PAD_RIGHT: 28,
  PAGE_PAD_BOTTOM: 20,
  PAGE_PAD_LEFT: 28,

  // Header / divider
  HEADER_GAP: 6,
  DIVIDER_H: 2,
  DIVIDER_MARGIN_TOP: 6,
  DIVIDER_MARGIN_BOTTOM: 12,

  LOGO_H: 34,

  // Title row
  TITLE_MARGIN_BOTTOM: 12,
  TITLE_SIZE: 15.5,
  TITLE_WEIGHT: 600,

  PILL_FONT: 9.5,
  PILL_PAD_Y: 4,
  PILL_PAD_X: 12,

  // Page 1 section header bars
  SECTION_HEAD_H: 34,
  SECTION_BODY_PAD: 12,

  // Page 1 spacing
  P1_GAP: 14, // gap between rows

  // CNA layout
  CNA_DONUT: 132, // px-ish
};

function esc(s) {
  return String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function readAsDataUrl(relOrAbsPath) {
  if (!relOrAbsPath) return null;
  if (typeof relOrAbsPath === "string" && relOrAbsPath.startsWith("data:")) return relOrAbsPath;

  const abs = path.isAbsolute(relOrAbsPath) ? relOrAbsPath : path.resolve(relOrAbsPath);
  const ext = path.extname(abs).toLowerCase().replace(".", "");
  const mime =
    ext === "png"
      ? "image/png"
      : ext === "jpg" || ext === "jpeg"
      ? "image/jpeg"
      : ext === "webp"
      ? "image/webp"
      : "application/octet-stream";

  const b64 = fs.readFileSync(abs).toString("base64");
  return `data:${mime};base64,${b64}`;
}

function list(items) {
  if (!items?.length) return `<div class="empty">Not assessed yet</div>`;
  return `<ul>${items.map((i) => `<li>${esc(i)}</li>`).join("")}</ul>`;
}

function ingredientCard(title, content, bg) {
  const often = content?.often || [];
  const limit = content?.limit || [];
  const why = content?.why || "";

  return `
    <div class="section ing-panel" style="${bg ? `background-image:url('${bg}')` : ""}">
      <div class="section-head">${esc(title)}</div>

      <div class="section-body ing-body">
        <div class="ig-block">
          <div class="ig-title">Choose Often</div>
          ${
            often.length
              ? `<ul class="ig-ul">${often.map((i) => `<li>${esc(i)}</li>`).join("")}</ul>`
              : `<div class="empty">Not assessed yet</div>`
          }

          <div class="ig-title ig-title--spaced">Be Intentional With</div>
          ${
            limit.length
              ? `<ul class="ig-ul">${limit.map((i) => `<li>${esc(i)}</li>`).join("")}</ul>`
              : `<div class="empty">Not assessed yet</div>`
          }

          ${why ? `<div class="ig-why"><span class="ig-why-label">Why:</span> ${esc(why)}</div>` : ``}
        </div>
      </div>
    </div>
  `;
}

/* --------------------------
   Page 1 Sections (wireframe)
--------------------------- */
function sectionBlock(title, bodyHtml, bodyClass = "") {
  return `
    <div class="p1-section">
      <div class="p1-section-head">${esc(title)}</div>
      <div class="p1-section-body ${esc(bodyClass)}">
        ${bodyHtml}
      </div>
    </div>
  `;
}

/* --------------------------
   DNA section (NO FALLBACKS)
   Data shape:
   p1.dna_rows = [{ title, description, ... }, ...]
--------------------------- */
function dnaTierRows(rows = []) {
  const stairs = readAsDataUrl("reference/dna_stairs.png") || "";
  const items = (rows?.length ? rows : []).slice(0, 3);

  if (!items.length) {
    return `
      <div class="dna-stairs-row">
        <div class="dna-stairs-wrap">
          ${stairs ? `<img class="dna-stairs-img" src="${stairs}" alt="" />` : ""}
        </div>
        <div class="dna-copy">
          <div class="empty">Not assessed yet</div>
        </div>
      </div>
    `;
  }

  return `
    <div class="dna-stairs-row">
      <div class="dna-stairs-wrap">
        ${stairs ? `<img class="dna-stairs-img" src="${stairs}" alt="" />` : ""}
      </div>

      <div class="dna-copy">
        ${items
          .map(
            (r) => `
              <div class="dna-copy-item">
                <div class="dna-copy-title">${esc(r?.title || "")}</div>
                <div class="dna-copy-desc">${esc(r?.description || "")}</div>
              </div>
            `
          )
          .join("")}
      </div>
    </div>
  `;
}

/* --------------------------
   CNA list parsing
--------------------------- */
function parseCnaItem(item) {
  if (!item) return { name: "", percent: null, display: "" };
  if (typeof item === "string") {
    const m = item.match(/^\s*([^:]+)\s*:\s*([<>]?\s*\d+)\s*%/i);
    const name = m ? m[1].trim() : item.trim();
    const percent = m ? Number(String(m[2]).replace(/[^\d]/g, "")) : null;
    return { name, percent, display: percent != null ? `${percent}%` : "" };
  }
  const name = item?.name ?? "";
  const percent = item?.percent != null ? Number(item.percent) : null;
  const display = item?.display ?? (percent != null && !Number.isNaN(percent) ? `${percent}%` : "");
  return { name, percent: Number.isNaN(percent) ? null : percent, display };
}

function cnaBlock(cna) {
  const bg = readAsDataUrl("reference/cna_bg.png") || "";

  // If CNA missing entirely, show not assessed
  if (!cna || typeof cna !== "object") {
    return `
      <div class="cna-hero" style="${bg ? `--cna-bg:url('${bg}')` : ""}">
        <div class="cna-left">
          <div class="cna-big">—</div>
          <div class="cna-left-label">Not assessed yet</div>
        </div>

        <div class="cna-cols">
          <div class="cna-col">
            <div class="cna-col-head">Functional</div>
            <div class="cna-rows"><div class="empty">Not assessed yet</div></div>
          </div>
          <div class="cna-col">
            <div class="cna-col-head">Borderline</div>
            <div class="cna-rows"><div class="empty">Not assessed yet</div></div>
          </div>
        </div>
      </div>
    `;
  }

  const bigNumber =
    cna?.insufficiencies_count ??
    cna?.insufficient_count ??
    cna?.score ??
    null;

  const leftLabel = cna?.left_label || "Nutritional<br/>Insufficiencies";

  const functional = (Array.isArray(cna?.functional) ? cna.functional : []).map(parseCnaItem);
  const borderline = (Array.isArray(cna?.borderline) ? cna.borderline : []).map(parseCnaItem);

  const MAX_ROWS = 7;
  const L = functional.filter((x) => x.name).slice(0, MAX_ROWS);
  const R = borderline.filter((x) => x.name).slice(0, MAX_ROWS);

  return `
    <div class="cna-hero" style="${bg ? `--cna-bg:url('${bg}')` : ""}">
      <div class="cna-left">
        <div class="cna-big">${bigNumber == null ? "—" : esc(bigNumber)}</div>
        <div class="cna-left-label">${leftLabel}</div>
      </div>

      <div class="cna-cols">
        <div class="cna-col">
          <div class="cna-col-head">Functional</div>
          <div class="cna-rows">
            ${
              L.length
                ? L.map(
                    (it) => `
                      <div class="cna-row">
                        <div class="cna-name">${esc(it.name)}</div>
                        <div class="cna-val">${esc(it.display || (it.percent != null ? `${it.percent}%` : ""))}</div>
                      </div>
                    `
                  ).join("")
                : `<div class="empty">Not assessed yet</div>`
            }
          </div>
        </div>

        <div class="cna-col">
          <div class="cna-col-head">Borderline</div>
          <div class="cna-rows">
            ${
              R.length
                ? R.map(
                    (it) => `
                      <div class="cna-row">
                        <div class="cna-name">${esc(it.name)}</div>
                        <div class="cna-val">${esc(it.display || (it.percent != null ? `${it.percent}%` : ""))}</div>
                      </div>
                    `
                  ).join("")
                : `<div class="empty">Not assessed yet</div>`
            }
          </div>
        </div>
      </div>
    </div>
  `;
}

function bulletTree(items) {
  if (!items?.length) return `<div class="empty">Not assessed yet</div>`;

  const normalized = items
    .map((it) => {
      if (typeof it === "string") return { title: it, bullets: [] };
      return { title: it?.title ?? "", bullets: it?.bullets ?? [] };
    })
    .filter((x) => x.title);

  if (!normalized.length) return `<div class="empty">Not assessed yet</div>`;

  return `
    <ul class="bt">
      ${normalized
        .map(
          (x) => `
        <li class="bt-li">
          <div class="bt-title">${esc(x.title)}</div>
          ${
            x.bullets?.length
              ? `<ul class="bt-sub">
                  ${x.bullets.map((b) => `<li class="bt-sub-li">${esc(b)}</li>`).join("")}
                </ul>`
              : ``
          }
        </li>
      `
        )
        .join("")}
    </ul>
  `;
}

/* --------------------------
   PH Panel (NO FALLBACKS)
--------------------------- */
function phPanel(ph = []) {
  const rows = (ph?.length ? ph : []).slice(0, 6);

  if (!rows.length) return `<div class="empty">Not assessed yet</div>`;

  return `
    <div class="ph-wrap">
      <div class="ph-head-row">
        <div class="ph-h">Markers</div>
        <div class="ph-h">Result</div>
      </div>

      <div class="ph-rows">
        ${rows
          .map((r) => {
            const lvl = (r?.level || "normal").toLowerCase();
            const cls = lvl === "high" ? "ph-dot-high" : lvl === "optimal" ? "ph-dot-opt" : "ph-dot-norm";
            return `
              <div class="ph-row">
                <div class="ph-marker">${esc(r?.marker ?? "")}</div>
                <div class="ph-result">
                  <span class="ph-val">${esc(r?.result ?? "")}</span>
                  <span class="ph-dot ${cls}"></span>
                </div>
              </div>
            `;
          })
          .join("")}
      </div>

      <div class="ph-legend">
        <div><span class="ph-dot ph-dot-norm"></span> Normal</div>
        <div><span class="ph-dot ph-dot-opt"></span> Optimal</div>
        <div><span class="ph-dot ph-dot-high"></span> High</div>
      </div>
    </div>
  `;
}

/* --------------------------
   Adrenal panel (NO FALLBACKS)
   Data:
   p1.adrenal = { rows: [{label,value,unit,range:[min,max],rangeLabel}, ...] }
--------------------------- */
function clamp01(n, a, b) {
  return Math.max(a, Math.min(b, n));
}

function adrenalPanel(adrenal = {}) {
  const rows = (adrenal?.rows?.length ? adrenal.rows : []).slice(0, 6);

  if (!rows.length) return `<div class="empty">Not assessed yet</div>`;

  function markerPct(value, min, max) {
    const span = Math.max(1e-6, max - min);
    const pad = span * 0.35;
    const lo = min - pad;
    const hi = max + pad;
    return clamp01((value - lo) / (hi - lo), 0, 1);
  }

  const fmt = (n) =>
    Number.isFinite(n)
      ? String(n).replace(/(\.\d*?[1-9])0+$/, "$1").replace(/\.0$/, "")
      : "";

  return `
    <div class="adr">
      ${rows
        .map((r) => {
          const label = r?.label ?? "";
          const val = Number(r?.value);
          const min = Number(r?.range?.[0]);
          const max = Number(r?.range?.[1]);

          // If any critical values missing, show row as not assessed
          if (!label || !Number.isFinite(val) || !Number.isFinite(min) || !Number.isFinite(max)) {
            return `
              <div class="adr-row">
                <div class="adr-left">${esc(label || "—")}</div>
                <div class="adr-mid"><div class="empty">Not assessed yet</div></div>
                <div class="adr-right">${esc(r?.rangeLabel ?? "")}</div>
              </div>
            `;
          }

          const rangeLabel = r?.rangeLabel ?? `${fmt(min)}-${fmt(max)} ${r?.unit ?? ""}`;
          const pct = markerPct(val, min, max);
          const leftPct = (pct * 100).toFixed(2);

          return `
            <div class="adr-row">
              <div class="adr-left">${esc(label)}</div>

              <div class="adr-mid">
                <div class="adr-barwrap">
                  <div class="adr-bar"></div>

                  <div class="adr-marker" style="left:${leftPct}%">
                    <div class="adr-pointer"></div>
                    <div class="adr-pill">${esc(fmt(val))}</div>
                  </div>
                </div>
              </div>

              <div class="adr-right">${esc(rangeLabel)}</div>
            </div>
          `;
        })
        .join("")}
    </div>
  `;
}

function dayKeyNormalize(k) {
  return String(k || "").trim().toLowerCase();
}

function weekRow7(itemsByDay = {}) {
  const order = ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY", "SUNDAY"];
  const hasAny =
    itemsByDay &&
    typeof itemsByDay === "object" &&
    Object.values(itemsByDay).some((v) => String(v || "").trim().length > 0);

  if (!hasAny) return `<div class="empty">Not assessed yet</div>`;

  return `
    <div class="p4-weekrow">
      ${order
        .map((d) => {
          const v = itemsByDay?.[d] || itemsByDay?.[d.toLowerCase()] || itemsByDay?.[dayKeyNormalize(d)] || "";
          const body = v ? esc(v).replace(/\n/g, "<br/>") : `<div class="empty"></div>`;
          return `
            <div class="p4-daycell">
              <div class="p4-dayhead">${d}</div>
              <div class="p4-daybody">${body}</div>
            </div>
          `;
        })
        .join("")}
    </div>
  `;
}

function timelineRows3Col(rows = []) {
  if (!rows?.length) return `<div class="empty">Not assessed yet</div>`;

  return `
    <div class="p5-timeline">
      ${rows
        .map((r) => {
          const t = r?.time ?? "";
          const am = r?.am ?? "";
          const pm = r?.pm ?? "";
          return `
            <div class="p5-row">
              <div class="p5-am">${am ? esc(am).replace(/\n/g, "<br/>") : `<span class="p5-blank"></span>`}</div>

              <div class="p5-mid">
                <div class="p5-dot"></div>
                <div class="p5-time">${esc(t)}</div>
              </div>

              <div class="p5-pm">${pm ? esc(pm).replace(/\n/g, "<br/>") : `<span class="p5-blank"></span>`}</div>
            </div>
          `;
        })
        .join("")}
    </div>
  `;
}

function bestPracticesHero(bp = {}) {
  const bg = readAsDataUrl(bp?.bg_image || "reference/p5_best.png") || "";
  const bullets = Array.isArray(bp?.bullets) ? bp.bullets : [];

  return `
    <div class="p5-bp-hero" style="${bg ? `--p5-bp-bg:url('${bg}')` : ""}">
      <div class="p5-bp-copy">
        ${
          bullets.length
            ? `<ul class="p5-bp-ul">${bullets.map((x) => `<li>${esc(x)}</li>`).join("")}</ul>`
            : `<div class="p5-bp-empty">Not assessed yet</div>`
        }
      </div>
    </div>
  `;
}

/* =========================================================
   buildHtml (NO SAMPLE DATA)
========================================================= */
export function buildHtml(data, resolvedImages) {

  const logo = readAsDataUrl("reference/logo.png");

  const client = data?.client || {};
  const team = data?.team || {};

  const today = new Date();
  const reportGeneratedOn = today.toLocaleDateString("en-US", {
    month: "2-digit",
    day: "2-digit",
    year: "numeric",
  });

  // If missing, show "Not assessed yet" (no placeholders)
  const clientName = client?.name || client?.full_name || "Not assessed yet";
  const healthCoach = team?.healthCoach || client?.coach_name || "Not assessed yet";
  const medicalAdvisor = team?.medicalAdvisor || client?.provider_name || "Not assessed yet";

  const p1 = data?.page_1 || {};
  const p2 = data?.page_2 || {};
  const p3 = data?.page_3 || {};
  const p4 = data?.page_4 || {};
  const p5 = data?.page_5 || {};

  const css = `
    @import url('https://fonts.googleapis.com/css2?family=Prompt:wght@300;400;500;600;700&display=swap');
    @page { size: A4; margin: 0; }
    html, body { margin: 0; padding: 0; }
    body { font-family: "Prompt", system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif; color: #000; }

    .page{
      width: 595.5pt;
      height: 842.25pt;
      box-sizing: border-box;
      padding: ${TUNE.PAGE_PAD_TOP}pt ${TUNE.PAGE_PAD_RIGHT}pt ${TUNE.PAGE_PAD_BOTTOM}pt ${TUNE.PAGE_PAD_LEFT}pt;
      position: relative;
      page-break-after: always;
      overflow: hidden;
      background: #fff;
    }

    /* Header */
    .header{
      display: grid;
      grid-template-columns: 1fr 1fr;
      grid-template-rows: auto auto;
      column-gap: 22pt;
      row-gap: 10pt;
      align-items: start;
      margin-bottom: ${TUNE.HEADER_GAP}pt;
    }
    .brand{
      grid-column: 1 / -1;
      grid-row: 1;
      margin-bottom: 6pt;
    }
    .logo{
      height: ${TUNE.LOGO_H}pt;
      width: auto;
      display: block;
    }
    .meta{
      grid-row: 2;
      font-size: 9.5pt;
      line-height: 1.3;
    }
    .meta-left{ grid-column: 1; }
    .meta-right{ grid-column: 2; justify-self: end; text-align: right; }

    .divider{
      height: ${TUNE.DIVIDER_H}pt;
      background: ${GOLD};
      margin: ${TUNE.DIVIDER_MARGIN_TOP}pt 0 ${TUNE.DIVIDER_MARGIN_BOTTOM}pt;
    }

    /* Titlebar */
    .titlebar{
      display: grid;
      grid-template-columns: 1fr auto 1fr;
      align-items: center;
      margin-bottom: ${TUNE.TITLE_MARGIN_BOTTOM}pt;
    }
    .titlebar .title{
      grid-column: 2;
      text-align: center;
      font-size: ${TUNE.TITLE_SIZE}pt;
      font-weight: ${TUNE.TITLE_WEIGHT};
      letter-spacing: 0.2px;
    }
    .pill{
      grid-column: 3;
      justify-self: end;
      background: ${GOLD};
      color: #fff;
      border: 0;
      padding: ${TUNE.PILL_PAD_Y}pt ${TUNE.PILL_PAD_X}pt;
      border-radius: 999pt;
      font-weight: 700;
      font-size: ${TUNE.PILL_FONT}pt;
    }

    /* Shared */
    .empty{ font-size: 9.5pt; color: #666; }
    ul{ margin: 0; padding-left: 14pt; }
    li{ font-size: 9.5pt; line-height: 1.22; margin: 1.5pt 0; }

    /* =========================
       Page 1 layout
       ========================= */
    .page1{ display: flex; flex-direction: column; }
    .page1 .p1-content{
      flex: 1;
      min-height: 0;
      display: grid;
      grid-template-rows: 1fr 1fr 1fr;
      gap: ${TUNE.P1_GAP}pt;
    }
    .p1-section{
      border: 2pt solid ${GOLD};
      overflow: hidden;
      background: #fff;
      display: flex;
      flex-direction: column;
      min-height: 0;
    }
    .p1-section-head{
      height: ${TUNE.SECTION_HEAD_H}pt;
      background: ${GOLD};
      color: #fff;
      font-weight: 700;
      font-size: 12pt;
      display: flex;
      align-items: center;
      padding: 0 12pt;
      letter-spacing: 0.2px;
      flex: 0 0 auto;
    }
    .p1-section-body{
      padding: ${TUNE.SECTION_BODY_PAD}pt;
      flex: 1 1 auto;
      min-height: 0;
      overflow: hidden;
    }
    .p1-section-body.cna-body{ padding: 0 !important; }

    .p1-bottom{
      display: grid;
      grid-template-columns: 1fr 2fr;
      gap: ${TUNE.P1_GAP}pt;
      height: 100%;
      min-height: 0;
    }
    .p1-bottom .p1-section{ height: 100%; min-height: 0; }

    /* =========================
       ADRENAL — range bars
       ========================= */
    .adr{ width:100%; display:flex; flex-direction:column; gap: 12pt; }
    .adr-row{
      display: grid;
      grid-template-columns: 72pt 1fr 130pt;
      column-gap: 10pt;
      align-items: center;
      margin-bottom: 2pt;
    }
    .adr-left{ font-weight: 900; font-size: 10pt; line-height: 1; }
    .adr-mid{ position: relative; }
    .adr-right{ font-weight: 800; font-size: 9.2pt; line-height: 1.05; }
    .adr-barwrap{
      position: relative;
      height: 18pt;
      display: flex;
      align-items: center;
    }
    .adr-bar{
      width: 100%;
      height: 18pt;
      border-radius: 3pt;
      border: 2pt solid rgba(0,0,0,0.35);
      overflow: hidden;
      background: linear-gradient(90deg,#111 0%,#bd9a60 18%,#f1e2c8 50%,#bd9a60 82%,#111 100%);
      box-shadow: inset 0 0 0 1pt rgba(255,255,255,0.12);
    }
    .adr-marker{
      position:absolute;
      top: -1pt;
      transform: translateX(-50%);
      display:flex;
      flex-direction:column;
      align-items:center;
      z-index: 2;
      pointer-events:none;
    }
    .adr-pointer{
      width: 0;
      height: 0;
      border-left: 5pt solid transparent;
      border-right: 5pt solid transparent;
      border-top: 7pt solid #fff;
      margin-bottom: 2pt;
      filter: drop-shadow(0 1pt 1pt rgba(0,0,0,0.45));
    }
    .adr-pill{
      background: #fff;
      color: #111;
      border: 1pt solid rgba(0,0,0,0.20);
      border-radius: 4pt;
      padding: 2pt 6pt;
      font-weight: 900;
      font-size: 8.8pt;
      line-height: 1;
      box-shadow: 0 2pt 6pt rgba(0,0,0,0.14);
    }

    /* =========================
       CNA hero
       ========================= */
    .cna-hero{
      position: relative;
      height: 100%;
      width: 100%;
      display: grid;
      grid-template-columns: 170pt 1fr;
      align-items: center;
      padding: 14pt 16pt;
      box-sizing: border-box;
      background: #111;
      overflow: hidden;
    }
    .cna-hero::before{
      content:"";
      position:absolute;
      inset:0;
      background-image: var(--cna-bg);
      background-size: cover;
      background-position: center;
      opacity: 1;
      z-index: 0;
    }
    .cna-hero::after{
      content:"";
      position:absolute;
      inset:0;
      background: linear-gradient(90deg, rgba(0,0,0,0.55), rgba(0,0,0,0.35) 55%, rgba(0,0,0,0.25));
      z-index: 0;
    }
    .cna-hero > *{ position: relative; z-index: 1; }

    .cna-left{
      padding-left: 6pt;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      text-align: center;
    }
    .cna-big{
      font-weight: 800;
      font-size: 64pt;
      line-height: 0.9;
      margin: 0;
      color: #fff;
      letter-spacing: -1px;
      text-shadow: 0 2pt 10pt rgba(0,0,0,0.45);
    }
    .cna-left-label{
      margin-top: 2pt;
      font-weight: 800;
      font-size: 11pt;
      line-height: 1.1;
      max-width: 110pt;
      color: #fff;
      text-shadow: 0 2pt 10pt rgba(0,0,0,0.45);
    }
    .cna-cols{
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 26pt;
      padding-left: 10pt;
    }
    .cna-col-head{
      text-align: center;
      font-weight: 800;
      font-size: 12pt;
      color: #fff;
      margin-bottom: 6pt;
      text-shadow: 0 2pt 10pt rgba(0,0,0,0.45);
    }
    .cna-rows{ display: grid; gap: 4pt; }
    .cna-row{
      display: grid;
      grid-template-columns: 1fr auto;
      gap: 12pt;
      align-items: baseline;
    }
    .cna-name{
      font-weight: 800;
      font-size: 13pt;
      line-height: 1.05;
      color: #fff;
      text-shadow: 0 2pt 10pt rgba(0,0,0,0.45);
    }
    .cna-val{
      font-weight: 700;
      font-size: 12pt;
      line-height: 1.05;
      color: #fff;
      text-shadow: 0 2pt 10pt rgba(0,0,0,0.45);
    }

    /* =========================
       DNA layout
       ========================= */
    .dna-stairs-row{
      display: grid;
      grid-template-columns: 280pt 1.2fr;
      gap: 12pt;
      align-items: start;
    }
    .dna-stairs-img{
      width: 100%;
      height: auto;
      display: block;
      object-fit: contain;
      max-height: 150pt;
      max-width: 100%;
      filter: saturate(0.95) contrast(1.05);
    }
    .dna-copy{
      padding-top: 0pt;
      padding-left: 2pt;
      display: flex;
      flex-direction: column;
      gap: 10pt;
    }
    .dna-copy-title{
      font-weight: 800;
      font-size: 11pt;
      margin: 0 0 2pt 0;
      letter-spacing: 0.1px;
    }
    .dna-copy-desc{
      font-weight: 400;
      font-size: 9.3pt;
      line-height: 1.25;
      margin: 0;
      color: #222;
      max-width: 260pt;
    }

    /* =========================
       PH table block
       ========================= */
    .ph-wrap{ height: 100%; display:flex; flex-direction:column; }
    .ph-head-row{
      display:grid;
      grid-template-columns: 1fr auto;
      gap: 12pt;
      margin-bottom: 10pt;
    }
    .ph-h{ font-weight: 800; font-size: 9.5pt; color: #222; }
    .ph-rows{ display:grid; gap: 7pt; flex: 1; }
    .ph-row{
      display:grid;
      grid-template-columns: 1fr auto;
      gap: 12pt;
      align-items:center;
      font-size: 9.5pt;
      line-height:1.1;
    }
    .ph-marker{ font-weight: 700; color:#111; }
    .ph-result{ display:flex; align-items:center; gap: 6pt; justify-content:flex-end; }
    .ph-val{ font-weight: 600; color:#222; }
    .ph-dot{ width: 12pt; height: 4pt; border-radius: 999pt; display:inline-block; background: #cfcfcf; }
    .ph-dot-norm{ background:#bdbdbd; }
    .ph-dot-opt{ background:${GOLD}; }
    .ph-dot-high{ background:#111; }
    .ph-legend{
      display:flex;
      gap: 10pt;
      font-size: 8.5pt;
      color:#444;
      margin-top: 10pt;
      justify-content: flex-start;
    }
    .ph-legend > div{ display:flex; align-items:center; gap:6pt; }

    /* =========================
       PAGE 2 — two tall panels
       ========================= */
    .panel{
      border: 2pt solid ${GOLD};
      background: #fff;
      overflow: hidden;
      display: flex;
      flex-direction: column;
      min-height: 0;
    }
    .panel-head{
      height: 34pt;
      background: ${GOLD};
      color: #fff;
      font-weight: 800;
      font-size: 12pt;
      letter-spacing: 0.2px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .page2{ display: flex; flex-direction: column; }
    .page2 .p2-grid{
      margin-top: 6pt;
      flex: 1 1 auto;
      min-height: 0;
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 18pt;
      align-items: stretch;
    }
    .page2 .panel-body{
      padding: 0 !important;
      flex: 1 1 auto;
      min-height: 0;
      display: flex;
      flex-direction: column;
    }
    .page2 .p2-copy{ padding: 14pt; min-height: 0; }
    .p2-copy--light{ color:#111; }

    .bt{ margin: 0; padding-left: 16pt; }
    .bt-li{ margin: 0 0 10pt 0; }
    .bt-title{ font-weight: 800; font-size: 11.5pt; line-height: 1.1; }
    .bt-sub{ margin: 4pt 0 0 0; padding-left: 18pt; list-style-type: circle; }
    .bt-sub-li{ font-size: 10.5pt; line-height: 1.25; margin: 2pt 0; }

    .p2-photo{ position: relative; overflow: hidden; border: 0; margin-top: auto; padding: 0; line-height: 0; }
    .p2-photo--left{ height: 225pt; }
    .p2-photo--right{ height: 255pt; position: relative; overflow: hidden; line-height: 0; }
    .p2-photo-img--contain{ width: 100%; height: 100%; display: block; object-fit: cover; object-position: 50% 78%; }
    .p2-photo-img--plate{
      position: absolute;
      right: 0pt;
      bottom: -30pt;
      width: 330pt;
      height: 330pt;
      object-fit: cover;
    }

    /* =========================
       PAGE 3 — Ingredients Grid
       ========================= */
    .page3{ display: flex; flex-direction: column; }
    .p3-title{
      text-align: center;
      font-weight: 800;
      font-size: 14pt;
      letter-spacing: 0.2px;
      margin: 2pt 0 10pt;
    }
    .p3-grid{
      flex: 1 1 auto;
      min-height: 0;
      display: grid;
      grid-template-columns: 1fr 1fr;
      grid-auto-rows: 1fr;
      gap: 14pt;
    }

    .section{
      border: 2pt solid ${GOLD};
      background: #fff;
      display: flex;
      flex-direction: column;
    }
    .section-head{
      height: ${TUNE.SECTION_HEAD_H}pt;
      background: ${GOLD};
      color: #fff;
      font-weight: 700;
      font-size: 12pt;
      display: flex;
      align-items: center;
      padding: 0 12pt;
      letter-spacing: 0.2px;
    }
    .section-body{ padding: 12pt; flex: 1; }

    .ing-panel{
      position: relative;
      overflow: hidden;
      background: #111;
      background-size: cover;
      background-position: center;
      background-repeat: no-repeat;
    }
    .ing-panel::after{
      content:"";
      position:absolute;
      inset:0;
      background: rgba(0,0,0,0.55);
      z-index: 0;
    }
    .ing-panel > *{ position: relative; z-index: 1; }
    .ing-body{ color: #fff; }
    .ing-body li, .ing-body .ig-title, .ing-body .ig-why{ color: #fff; }
    .ing-body .empty{ color: rgba(255,255,255,0.85); }

    .ig-block{ font-size: 9.8pt; line-height: 1.25; }
    .ig-title{ font-weight: 800; font-size: 10.5pt; margin: 0 0 6pt 0; }
    .ig-title--spaced{ margin-top: 10pt; }
    .ig-ul{ margin: 0; padding-left: 16pt; }
    .ig-ul li{ font-size: 9.5pt; line-height: 1.22; margin: 1.5pt 0; }
    .ig-why{ margin-top: 8pt; font-size: 9pt; color: #fff; font-style: italic; }
    .ig-why-label{ font-weight: 700; font-style: italic; }

    /* =========================
       PAGE 4 — Movement + Mindset
       ========================= */
    .page4{ display:flex; flex-direction:column; }
    .p4-title{
      text-align:center;
      font-weight:800;
      font-size:14pt;
      letter-spacing:0.2px;
      margin: 2pt 0 10pt;
    }
    .p4-stack{
      flex: 1 1 auto;
      min-height: 0;
      display: grid;
      grid-template-rows: auto auto 1fr;
      gap: 14pt;
    }
    .p4-section{
      border: 2pt solid ${GOLD};
      background:#fff;
      overflow:hidden;
      display:flex;
      flex-direction:column;
      min-height:0;
    }
    .p4-section-head{
      height: 34pt;
      background:${GOLD};
      color:#fff;
      font-weight:800;
      font-size:12pt;
      display:flex;
      align-items:center;
      justify-content:center;
    }
    .p4-section-body{
      padding: 12pt;
      flex: 1 1 auto;
      min-height:0;
    }
    .p4-weekrow{
      display:grid;
      grid-template-columns: repeat(7, 1fr);
      gap: 8pt;
    }
    .p4-daycell{
      border: 2pt solid ${GOLD};
      background:#fff;
      overflow:hidden;
      display:flex;
      flex-direction:column;
      min-height: 72pt;
    }
    .p4-dayhead{
      height: 16pt;
      background:${GOLD};
      color:#fff;
      font-weight:800;
      font-size:8.5pt;
      display:flex;
      align-items:center;
      justify-content:center;
      letter-spacing:0.2px;
    }
    .p4-daybody{
      flex: 1 1 auto;
      padding: 8pt;
      font-size: 9pt;
      line-height: 1.15;
      color:#111;
    }
    .p4-journal{ margin-bottom: 10pt; }
    .p4-journal-title{ font-weight: 900; font-size: 11pt; margin: 0 0 6pt 0; }
    .p4-journal ul{ margin: 0; padding-left: 16pt; }
    .p4-journal li{ font-size: 9.8pt; line-height: 1.2; margin: 2pt 0; }

    .p4-bottom{
      display:grid;
      grid-template-columns: 1fr 1fr;
      gap: 14pt;
      min-height: 0;
    }
    .p4-refuel-hero{ margin-bottom: 10pt; }
    .p4-refuel-hero img{ width: 100%; height: auto; display:block; object-fit: contain; }
    .p4-refuel-block{ margin-top: 8pt; }
    .p4-refuel-sub{ font-weight: 900; font-size: 10pt; margin: 0 0 4pt 0; }
    .p4-refuel-block ul{ margin: 0; padding-left: 16pt; }
    .p4-refuel-block li{ font-size: 9.5pt; line-height: 1.18; margin: 2pt 0; }
    .p4-rest-hero img{ width: 100%; height: auto; display:block; object-fit: contain; }

    /* =========================
       PAGE 5 — Timeline + Best Practices
       ========================= */
    .page5{ display:flex; flex-direction:column; }
    .p5-title{
      text-align:center;
      font-weight:800;
      font-size:14pt;
      letter-spacing:0.2px;
      margin: 2pt 0 10pt;
    }
    .p5-stack{
      flex: 1 1 auto;
      min-height: 0;
      display: grid;
      grid-template-rows: 1fr 0.72fr;
      gap: 14pt;
    }
    .p5-main{
      border: 2pt solid ${GOLD};
      background:#fff;
      overflow:hidden;
      display:flex;
      flex-direction:column;
      min-height:0;
    }
    .p5-main-head{
      height: 34pt;
      background:${GOLD};
      color:#fff;
      font-weight:800;
      font-size:12pt;
      display:flex;
      align-items:center;
      justify-content:center;
    }
    .p5-main-body{
      position: relative;
      padding: 14pt;
      flex: 1 1 auto;
      min-height:0;
    }
    .p5-main-body::before{
      content:"";
      position:absolute;
      top: 14pt;
      bottom: 14pt;
      left: 50%;
      width: 0;
      border-left: 2pt dashed rgba(189,154,96,0.85);
      transform: translateX(-50%);
    }
    .p5-timeline{
      height: 100%;
      display:flex;
      flex-direction:column;
      justify-content: space-between;
      gap: 10pt;
    }
    .p5-row{
      display:grid;
      grid-template-columns: 1fr 90pt 1fr;
      column-gap: 10pt;
      align-items: start;
    }
    .p5-am,.p5-pm{ font-size: 10.5pt; line-height: 1.2; color:#111; }
    .p5-am{ padding-right: 8pt; }
    .p5-pm{ padding-left: 8pt; }
    .p5-mid{
      display:flex;
      flex-direction:column;
      align-items:center;
      gap: 4pt;
      z-index:1;
    }
    .p5-dot{
      width: 9pt;
      height: 9pt;
      border-radius:999pt;
      background:${GOLD};
      box-shadow: 0 0 0 3pt #fff;
    }
    .p5-time{
      font-weight:900;
      font-size:10pt;
      background:#fff;
      padding: 2pt 6pt;
      border-radius:999pt;
      border: 1pt solid rgba(189,154,96,0.45);
    }
    .p5-best{
      border: 2pt solid ${GOLD};
      background:#fff;
      overflow:hidden;
      display:flex;
      flex-direction:column;
      min-height:0;
    }
    .p5-best-head{
      height: 34pt;
      background:${GOLD};
      color:#fff;
      font-weight:800;
      font-size:12pt;
      display:flex;
      align-items:center;
      justify-content:center;
    }
    .p5-best-body{ padding: 0; flex: 1 1 auto; min-height:0; }
    .p5-bp-hero{ position:relative; height:100%; width:100%; background:#111; overflow:hidden; }
    .p5-bp-hero::before{
      content:"";
      position:absolute;
      inset:0;
      background-image: var(--p5-bp-bg);
      background-size: cover;
      background-position: center;
      z-index:0;
    }
    .p5-bp-hero::after{
      content:"";
      position:absolute;
      inset:0;
      background: linear-gradient(90deg, rgba(0,0,0,0.20), rgba(0,0,0,0.55) 60%, rgba(0,0,0,0.65));
      z-index:0;
    }
    .p5-bp-copy{
      position:absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: 56%;
      max-width: 300pt;
      z-index:1;
      color:#fff;
      text-align: left;
      text-shadow: 0 2pt 10pt rgba(0,0,0,0.45);
    }
    .p5-bp-ul{ margin:0; padding-left: 16pt; }
    .p5-bp-ul li{ font-size: 10.2pt; line-height: 1.22; margin: 3pt 0; color:#fff; }
    .p5-bp-empty{ color: rgba(255,255,255,0.85); }

    /* DEBUG overlay */
    .debug .page::before{
      content:"";
      position:absolute;
      inset:0;
      background-size: 100% 100%;
      background-repeat: no-repeat;
      opacity: 0.35;
      pointer-events:none;
      z-index: 0;
    }
  `;

  const headerHtml = `
    <div class="header">
      <div class="brand">
        ${logo ? `<img src="${logo}" class="logo" />` : ""}
      </div>

      <div class="meta meta-left">
        <div><b>Client:</b> ${esc(clientName)}</div>
        <div><b>Report Generation On:</b> ${esc(reportGeneratedOn)}</div>
      </div>

      <div class="meta meta-right">
        <div><b>Health Coach:</b> ${esc(healthCoach)}</div>
        <div><b>Medical Advisor:</b> ${esc(medicalAdvisor)}</div>
      </div>
    </div>
    <div class="divider"></div>
  `;

  /* --------------------------
     PAGE 1
  --------------------------- */
  const page1 = `
    <div class="page page1">
      ${headerHtml}

      <div class="titlebar">
        <div class="title">Playbook #1: NUTRITION + HYDRATION</div>
        <div class="pill">FUEL</div>
      </div>

      <div class="p1-content">
        ${sectionBlock("DNA | GENETIC LIFESTYLE TEST", dnaTierRows(p1?.dna_rows || []), "dna-body")}
        ${sectionBlock("CNA | CELLULAR NUTRITION TEST", cnaBlock(p1?.cna), "cna-body")}
        <div class="p1-bottom">
          ${sectionBlock("PH | HEALTH PANEL", phPanel(p1?.ph_panel || []))}
          ${sectionBlock("ADRENAL | STRESS PANEL", adrenalPanel(p1?.adrenal || {}))}
        </div>
      </div>
    </div>
  `;

  /* --------------------------
     PAGE 2 (NO FALLBACKS)
  --------------------------- */
  const p2LeftImg = readAsDataUrl("reference/p2_left.png");
  const p2RightImg = readAsDataUrl("reference/p2_right.png");

  const nutritionGoalsTree = Array.isArray(p2?.nutrition_goals)
    ? p2.nutrition_goals.map((g) => ({
        title: g?.title ?? "",
        bullets: String(g?.description || "")
          .split("\n")
          .map((s) => s.trim())
          .filter(Boolean),
      }))
    : [];

  const nutrientSourcingTree = Array.isArray(p2?.nutrient_sourcing) ? p2.nutrient_sourcing : [];

  const page2 = `
    <div class="page page2">
      ${headerHtml}

      <div class="titlebar">
        <div class="title">Playbook #2: NUTRITION STRATEGY</div>
        <div class="pill">FUEL</div>
      </div>

      <div class="p2-grid">
        <div class="panel">
          <div class="panel-head">NUTRITION GOALS</div>
          <div class="panel-body">
            <div class="p2-copy">
              ${bulletTree(nutritionGoalsTree)}
            </div>

            <div class="p2-photo p2-photo--left">
              ${p2LeftImg ? `<img class="p2-photo-img p2-photo-img--contain" src="${p2LeftImg}" alt="" />` : ""}
            </div>
          </div>
        </div>

        <div class="panel">
          <div class="panel-head">NUTRIENT SOURCING</div>
          <div class="panel-body">
            <div class="p2-copy p2-copy--light">
              ${bulletTree(nutrientSourcingTree)}
            </div>

            <div class="p2-photo p2-photo--right">
              ${
                p2RightImg
                  ? `<img class="p2-photo-img p2-photo-img--plate" src="${p2RightImg}" alt="" />`
                  : ""
              }
            </div>
          </div>
        </div>
      </div>
    </div>
  `;

  /* --------------------------
     PAGE 3 (NO FALLBACKS)
  --------------------------- */
  const ingredients = p3?.ingredients || {};

  const ingProteinBg = readAsDataUrl("reference/ing_protein.png");
  const ingSeafoodBg = readAsDataUrl("reference/ing_seafood.png");
  const ingVegBg = readAsDataUrl("reference/ing_vegetables.png");
  const ingFruitBg = readAsDataUrl("reference/ing_fruit.png");
  const ingFatsBg = readAsDataUrl("reference/ing_fats.png");
  const ingDairyBg = readAsDataUrl("reference/ing_dairy.png");

  const page3 = `
    <div class="page page3">
      ${headerHtml}

      <div class="p3-title">INGREDIENTS FOR OWNERSHIP</div>

      <div class="p3-grid">
        ${ingredientCard("PROTEIN", ingredients?.protein, ingProteinBg)}
        ${ingredientCard("SEAFOOD", ingredients?.seafood, ingSeafoodBg)}
        ${ingredientCard("VEGETABLES", ingredients?.vegetables, ingVegBg)}
        ${ingredientCard("FRUIT", ingredients?.fruit, ingFruitBg)}
        ${ingredientCard("FATS & OILS", ingredients?.fats, ingFatsBg)}
        ${ingredientCard("DAIRY & ALTERNATIVES", ingredients?.dairy, ingDairyBg)}
      </div>
    </div>
  `;

  /* --------------------------
     PAGE 4 (already mostly “not assessed yet”)
  --------------------------- */
  const p4RefuelImg = readAsDataUrl("reference/p4_refuel.png");
  const p4RestImg = readAsDataUrl("reference/p4_rest.png");

  const p4ExerciseWeek = p4?.exercise?.week || p4?.exercise?.weekly || {};
  const p4Mindset = p4?.mindset || {};
  const p4Refuel = p4?.refuel || {};

  const page4 = `
    <div class="page page4">
      ${headerHtml}

      <div class="p4-title">MOVEMENT + MINDSET</div>

      <div class="p4-stack">
        <div class="p4-section">
          <div class="p4-section-head">EXERCISE</div>
          <div class="p4-section-body">
            ${weekRow7(p4ExerciseWeek)}
          </div>
        </div>

        <div class="p4-section">
          <div class="p4-section-head">MINDSET</div>
          <div class="p4-section-body">
            <div class="p4-journal">
              <div class="p4-journal-title">Journal Notes</div>
              ${
                Array.isArray(p4Mindset?.journal_notes) && p4Mindset.journal_notes.length
                  ? `<ul>${p4Mindset.journal_notes.map((x) => `<li>${esc(x)}</li>`).join("")}</ul>`
                  : `<div class="empty">Not assessed yet</div>`
              }
            </div>

            ${weekRow7(p4Mindset?.breathing_week || {})}
          </div>
        </div>

        <div class="p4-bottom">
          <div class="p4-section">
            <div class="p4-section-head">REFUEL</div>
            <div class="p4-section-body">
              <div class="p4-refuel-hero">
                ${p4RefuelImg ? `<img src="${p4RefuelImg}" alt="" />` : ""}
              </div>

              <div class="p4-refuel-block">
                <div class="p4-refuel-sub">PRE</div>
                ${
                  Array.isArray(p4Refuel?.pre) && p4Refuel.pre.length
                    ? `<ul>${p4Refuel.pre.map((x) => `<li>${esc(x)}</li>`).join("")}</ul>`
                    : `<div class="empty">Not assessed yet</div>`
                }
              </div>

              <div class="p4-refuel-block">
                <div class="p4-refuel-sub">POST</div>
                ${
                  Array.isArray(p4Refuel?.post) && p4Refuel.post.length
                    ? `<ul>${p4Refuel.post.map((x) => `<li>${esc(x)}</li>`).join("")}</ul>`
                    : `<div class="empty">Not assessed yet</div>`
                }
              </div>
            </div>
          </div>

          <div class="p4-section">
            <div class="p4-section-head">REST</div>
            <div class="p4-section-body">
              <div class="p4-rest-hero">
                ${p4RestImg ? `<img src="${p4RestImg}" alt="" />` : ""}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;

  /* --------------------------
     PAGE 5 (NO FALLBACKS)
  --------------------------- */
  const p5Timeline = Array.isArray(p5?.timeline) ? p5.timeline : [];
  const p5BP = typeof p5?.best_practices === "object" && p5.best_practices ? p5.best_practices : {};

  const page5 = `
    <div class="page page5">
      ${headerHtml}

      <div class="p5-title">${esc(p5?.title || "Playbook #4: ROUTINES")}</div>

      <div class="p5-stack">
        <div class="p5-main">
          <div class="p5-main-head">TIMELINE</div>
          <div class="p5-main-body has-timeline">
            ${timelineRows3Col(p5Timeline)}
          </div>
        </div>

        <div class="p5-best">
          <div class="p5-best-head">BEST PRACTICES</div>
          <div class="p5-best-body">
            ${bestPracticesHero(p5BP)}
          </div>
        </div>
      </div>
    </div>
  `;

  const html = `<!doctype html>
<html>
<head>
<meta charset="utf-8"/>
<style>${css}</style>
</head>
<body class="${DEBUG ? "debug" : ""}">
  ${page1}
  ${page2}
  ${page3}
  ${page4}
  ${page5}
</body>
</html>`;

  return html;
}