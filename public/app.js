const form = document.querySelector("#question-form");
const question = document.querySelector("#question");
const button = document.querySelector("#analyze-button");
const notice = document.querySelector("#notice");
const grid = document.querySelector("#market-grid");
const analyst = document.querySelector("#analyst-shell");
const evidenceShell = document.querySelector("#evidence-shell");
const evidenceList = document.querySelector("#evidence-list");
const captureMeta = document.querySelector("#capture-meta");
let latest = null;

const money = (value) => new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 }).format(value);
const pct = (value) => value == null ? "Unknown" : `${value.toFixed(2)}%`;
const escapeHtml = (value) => String(value).replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" }[char]));

function showNotice(message, type = "warning") { notice.textContent = message; notice.className = `notice ${type}`; }
function clearNotice() { notice.textContent = ""; notice.className = "notice hidden"; }
function showLoading() {
  grid.className = "market-grid loading-state";
  grid.innerHTML = `<div class="loading-inner" role="status"><span class="loading-mark" aria-hidden="true"></span><strong>Building an evidence-backed comparison</strong><span>Querying live onchain markets → validating market evidence → calculating deterministic metrics → generating grounded analysis</span><small>This can take about 13 seconds while live Graph data is checked.</small></div>`;
}

function renderMarkets(data) {
  if (!data.observations.length) { grid.className = "market-grid empty-state"; grid.innerHTML = `<div class="empty-inner"><span class="empty-icon">×</span><span>No qualified live Graph observations returned.</span></div>`; return; }
  grid.className = "market-grid";
  grid.innerHTML = data.observations.map((o) => `<article class="market-card ${o.protocol === data.comparisons.highestSupplyRate ? "is-highlight" : ""}">
    <div class="market-top"><div><div class="protocol-name">${escapeHtml(o.protocol)}</div><div class="market-name">${escapeHtml(o.marketName)}</div></div><span class="${o.freshness}">${o.freshness}</span></div>
    <div class="rate-row"><span class="rate">${pct(o.supplyRatePct)}</span><span class="rate-label">supply rate</span></div>
    <div class="metric-line"><span>Utilization</span><b>${o.utilizationPct.toFixed(1)}%</b></div><div class="util-bar"><i style="width:${Math.min(100, o.utilizationPct)}%"></i></div>
    <div class="metric-line"><span>Observable liquidity</span><b>${money(o.liquidityProxy)} USDC</b></div><div class="metric-line"><span>Borrow rate</span><b>${pct(o.borrowRatePct)}</b></div>
    <div class="card-foot"><span>${o.freshnessAgeSeconds == null ? "Age unavailable" : `${o.freshnessAgeSeconds}s ago`}</span><button data-evidence="${escapeHtml(o.evidence.deploymentId)}">View evidence ↗</button></div>
  </article>`).join("");
  grid.querySelectorAll("[data-evidence]").forEach((el) => el.addEventListener("click", () => openEvidence(el.dataset.evidence)));
}

function renderAnswer(answer) {
  analyst.classList.remove("hidden");
  document.querySelector("#answer-title").textContent = answer.title;
  document.querySelector("#answer-mode").textContent = answer.mode === "fallback" ? "Deterministic fallback" : "AI interpretation";
  document.querySelector("#answer-summary").textContent = answer.summary ?? "";
  document.querySelector("#answer-summary").classList.toggle("hidden", !answer.summary);
  document.querySelector("#answer-observe").textContent = answer.sections.observe;
  document.querySelector("#answer-compare").textContent = answer.sections.compare;
  document.querySelector("#answer-return").textContent = answer.sections.returnSource;
  document.querySelector("#answer-risks").innerHTML = answer.sections.risks.map((risk) => `<li>${escapeHtml(risk)}</li>`).join("");
}

function renderEvidence(data) {
  evidenceShell.classList.remove("hidden");
  document.querySelector("#evidence-count").textContent = `${data.evidence.sources.length} source records`;
  evidenceList.innerHTML = data.observations.map((o) => `<div class="evidence-row" data-row="${escapeHtml(o.evidence.deploymentId)}"><div class="evidence-protocol">${escapeHtml(o.protocol)}</div><div class="evidence-source">The Graph standardized lending Subgraph · block ${o.blockNumber.toLocaleString()}</div><button data-expand="${escapeHtml(o.evidence.deploymentId)}">Inspect ↗</button></div>`).join("");
  evidenceList.querySelectorAll("[data-expand]").forEach((el) => el.addEventListener("click", () => openEvidence(el.dataset.expand)));
}

function openEvidence(deploymentId) {
  const row = evidenceList.querySelector(`[data-row="${CSS.escape(deploymentId)}"]`);
  if (!row) return;
  const existing = row.querySelector(".evidence-detail");
  if (existing) { existing.remove(); return; }
  const o = latest.observations.find((item) => item.evidence.deploymentId === deploymentId);
  const detail = document.createElement("div"); detail.className = "evidence-detail";
  detail.innerHTML = `<div><span>Market role</span>${escapeHtml(o.economicRole)}</div><div><span>Block timestamp</span>${new Date(o.blockTimestamp * 1000).toISOString()}</div><div><span>Captured at</span>${escapeHtml(o.capturedAt)}</div><div><span>Deployment</span><code>${escapeHtml(o.evidence.deploymentId)}</code></div><div><span>Market ID</span><code>${escapeHtml(o.marketId)}</code></div><div><span>Method</span>utilization = borrows / supply · rates are percentage points</div><div><span>Unknowns</span>Incentives: unknown</div><div><span>Freshness</span>${o.freshness} · ${o.freshnessAgeSeconds}s old</div><div class="evidence-metrics"><span>Normalized metrics</span>${money(o.supply)} USDC supplied · ${money(o.borrows)} USDC borrowed · ${o.utilizationPct.toFixed(2)}% utilization · supply ${pct(o.supplyRatePct)} · borrow ${pct(o.borrowRatePct)} · ${money(o.liquidityProxy)} USDC liquidity proxy</div>`;
  row.appendChild(detail);
}

form.addEventListener("submit", async (event) => {
  event.preventDefault(); clearNotice(); button.disabled = true; button.querySelector("span").textContent = "Investigating…"; captureMeta.textContent = "Working through live evidence"; showLoading();
  try {
    const response = await fetch("/api/analyze", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ question: question.value }) });
    const body = await response.json();
    if (!response.ok) throw new Error(body.error?.message ?? "The live Graph request failed.");
    latest = body; renderMarkets(body); renderAnswer(body.answer); renderEvidence(body); captureMeta.innerHTML = `<strong>Updated just now</strong> · ${body.observations.length} qualified sources`;
    if (body.status === "partial") showNotice(`${body.unavailable.map((item) => item.protocol).join(", ")} could not be qualified. It is excluded from the current comparison.`);
    if (body.observations.some((item) => item.freshness !== "fresh")) showNotice("One or more observations are stale. Current ranking is withheld until every source is fresh.");
  } catch (error) { grid.className = "market-grid empty-state"; grid.innerHTML = `<div class="empty-inner"><span class="empty-icon">!</span><span>Live evidence could not be loaded.</span></div>`; showNotice(error.message, "error"); captureMeta.textContent = "Analysis unavailable"; }
  finally { button.disabled = false; button.querySelector("span").textContent = "Analyze evidence"; }
});
