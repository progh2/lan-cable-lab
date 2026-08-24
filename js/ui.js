import { CATS, COACH, WIRE_DEFS, T568A, T568B, COMMON_MISTAKES, JOB_CHECKS } from "./config.js";
import { endState } from "./state.js";

export function qs(sel) { return document.querySelector(sel); }

function toCss(hex) { return "#" + hex.toString(16).padStart(6, "0"); }
function contrast(hex) {
  const r = (hex >> 16) & 255, g = (hex >> 8) & 255, b = hex & 255;
  return r * 0.3 + g * 0.6 + b * 0.1 > 160 ? "#1a120a" : "#fffaf0";
}
const HEX = { wo: "#ffe0b2", o: "#e67e22", wg: "#c8e6c9", g: "#2e7d32", b: "#1565c0", wb: "#bbdefb", wbr: "#d7ccc8", br: "#6d4c41" };

export function bindUI(handlers) {
  const start = qs("#btn-start");
  if (start) start.addEventListener("click", handlers.start);
  const prim = qs("#btn-primary");
  if (prim) prim.addEventListener("click", () => handlers.primary && handlers.primary());
  qs("#btn-manual").addEventListener("click", handlers.toggleManual);
  qs("#btn-diagram").addEventListener("click", handlers.toggleDiagram);
  qs("#btn-close-manual").addEventListener("click", handlers.toggleManual);
  qs("#btn-close-diagram").addEventListener("click", handlers.toggleDiagram);
  qs("#btn-pin-diagram").addEventListener("click", handlers.pinDiagram);
  document.querySelectorAll("[data-len]").forEach((b) => b.addEventListener("click", () => handlers.pickLen(b.dataset.len)));
  document.querySelectorAll("[data-std]").forEach((b) => b.addEventListener("click", () => handlers.pickStd(b.dataset.std)));
  qs("#btn-auto-order").addEventListener("click", handlers.autoOrder);
  qs("#btn-shuffle-order").addEventListener("click", handlers.shuffleOrder);
  qs("#btn-next-end").addEventListener("click", handlers.nextEnd);
  qs("#btn-retry").addEventListener("click", handlers.retry);
  qs("#btn-restart").addEventListener("click", handlers.restart);
  qs("#btn-tab").addEventListener("click", handlers.toggleTab);
  qs("#strip-go").addEventListener("click", handlers.confirmStrip);
  qs("#btn-celebrate-ok").addEventListener("click", () => qs("#modal-celebrate").classList.add("hidden"));
  qs("#cat-chips").addEventListener("click", (e) => { const b = e.target.closest("[data-cat]"); if (b) handlers.pickCat(b.dataset.cat); });
  qs("#tool-tiles").addEventListener("click", (e) => { const b = e.target.closest("[data-tool]"); if (b) handlers.takeTool(b.dataset.tool); });
  qs("#actions").addEventListener("click", (e) => { const b = e.target.closest("[data-act]"); if (b) handlers.action(b.dataset.act); });
}

export function getPrimary(state) {
  const labels = { stripper: "스트리퍼", cutter: "커터", crimper: "크림퍼", tester: "테스터" };
  const outName = Object.keys(state.toolsOut).find((k) => state.toolsOut[k]);
  const hangish = new Set(["return_stripper", "return_cutter", "return_crimper", "return_tester"]);
  const need = (name) => {
    const s = state.step;
    if (name === "cutter") return s === "cut" || s === "take_cutter" || s === "trim";
    if (name === "stripper") return s === "take_stripper" || s === "strip";
    if (name === "crimper") return s === "take_crimper" || s === "crimp";
    if (name === "tester") return s === "take_tester" || s === "test" || s === "done_both";
    return false;
  };
  if (outName && (hangish.has(state.step) || !need(outName))) {
    return { act: "hang", label: labels[outName] + " 걸이에 걸기", art: "hang" };
  }
  const map = {
    welcome: { act: "start", label: "의뢰 받기 · 시작하기" },
    pick_cat: { act: "reel:cat5e", label: "선반에서 Cat5e 가져오기" },
    pick_len: { act: "reel:cat5e", label: "선반에서 Cat5e 가져오기" },
    take_reel: { act: "reel:cat5e", label: "선반에서 Cat5e 가져오기" },
    cut: { act: "cut", label: "커터로 자르기" },
    take_stripper: { act: "strip", label: "스트리퍼로 재킷 벗기기 (2.2cm)" },
    strip: { act: "strip", label: "스트리퍼로 재킷 벗기기 (2.2cm)" },
    untwist: { act: "untwist", label: "페어 풀기" },
    arrange: { act: "arrange", label: "T568B 그림대로 정렬" },
    take_cutter: { act: "trim", label: "끝 트림하기" },
    trim: { act: "trim", label: "끝 트림하기" },
    take_plug: { act: "insert", label: "RJ45 끼우기" },
    insert: { act: "insert", label: "RJ45 끼우기" },
    take_crimper: { act: "crimp", label: "RJ45 끼우고 압착" },
    crimp: { act: "crimp", label: "압착하기" },
    flip_end: { act: "flip", label: "반대쪽도 똑같이 T568B" },
    done_both: { act: "test", label: "테스터로 확인" },
    take_tester: { act: "test", label: "테스터로 확인" },
    test: { act: "test", label: "테스터로 확인" },
    complete: { act: "restart", label: "새 의뢰 받기" },
  };
  return map[state.step] || { act: "hang", label: "다음" };
}

export function renderCoach(state) {
  const c = COACH[state.step] || COACH.welcome;
  const title = qs("#coach-title");
  if (title) title.textContent = "지금 할 일";
  qs("#coach-body").textContent = c.body;
  const hint = qs("#coach-hint");
  if (hint) hint.textContent = c.hint || "";
  const badge = qs("#end-badge");
  if (badge) badge.textContent = state.currentEnd === "A" ? "끝 A" : "끝 B · 반대쪽도 T568B";
  const score = qs("#score-val");
  if (score) score.textContent = String(state.score);
  const prim = getPrimary(state);
  renderStepArt(prim.art || c.art || state.step);
  const btn = qs("#btn-primary");
  if (btn) btn.textContent = prim.label;
}

export function renderStepArt(kind) {
  const el = qs("#step-art");
  if (!el) return;
  el.innerHTML = (ART[kind] || ART.welcome)();
}

export function renderCatChips(state) {
  const box = qs("#cat-chips");
  box.classList.add("hidden");
  box.innerHTML = "";
}

export function renderToolTiles(state) {
  const box = qs("#tool-tiles");
  const prim = getPrimary(state);
  if (prim.act !== "hang") { box.classList.add("hidden"); box.innerHTML = ""; return; }
  box.classList.remove("hidden");
  const names = [["stripper", "스트리퍼"], ["cutter", "커터"], ["crimper", "크림퍼"], ["tester", "테스터"]];
  box.innerHTML = names.filter(([id]) => state.toolsOut[id]).map(([id, label]) =>
    `<button type="button" class="tool-tile out" data-tool="${id}"><strong>${label}</strong><span>꺼냄</span></button>`
  ).join("");
}

export function renderActions(state) {
  const prim = getPrimary(state);
  qs("#actions").innerHTML = `<button type="button" class="act-btn hi" data-act="${prim.act}">${prim.label}</button>`;
}

export function renderChecklist(state) {
  const A = state.ends.A, B = state.ends.B;
  const done = {
    accept: state.step !== "welcome",
    reel: state.reelOnBench || state.cableOnBench,
    cut: state.cableOnBench,
    stripA: A.stripped, untwistA: A.untwisted, arrangeA: A.orderLocked || A.trimmed,
    trimA: A.trimmed, crimpA: A.crimped,
    endB: state.currentEnd === "B" || B.crimped,
    stripB: B.stripped, crimpB: B.crimped,
    test: !!state.testResult, done: state.step === "complete",
  };
  let foundNow = false;
  qs("#check-steps").innerHTML = JOB_CHECKS.map((it) => {
    const ok = !!done[it.id];
    let cls = ok ? "ok" : "";
    if (!ok && !foundNow) { cls = "now"; foundNow = true; }
    return `<li class="${cls}">${ok ? "✓" : "○"} ${it.label}</li>`;
  }).join("");
  const toolsEl = qs("#check-tools");
  if (toolsEl) toolsEl.innerHTML = "";
}

export function renderWires(state) {
  const e = endState(state);
  const box = qs("#wire-row");
  box.innerHTML = "";
  e.order.forEach((id, i) => {
    const d = WIRE_DEFS[id];
    const b = document.createElement("button");
    b.type = "button"; b.className = "wire-chip";
    b.style.background = toCss(d.hex); b.style.color = contrast(d.hex);
    b.textContent = `${i + 1} ${d.name}`; b.dataset.i = String(i);
    box.appendChild(b);
  });
}

export function setPanels(state) {
  const step = state.step;
  qs("#panel-len").classList.add("hidden");
  qs("#panel-arrange").classList.toggle("hidden", step !== "arrange");
  qs("#panel-strip").classList.toggle("hidden", step !== "strip" && step !== "take_stripper");
  qs("#panel-insert").classList.toggle("hidden", step !== "insert");
  qs("#panel-flip").classList.toggle("hidden", step !== "flip_end");
  qs("#panel-result").classList.toggle("hidden", !["test", "return_tester", "complete"].includes(step) || !state.testResult);
  qs("#hover-tip").classList.add("hidden");
}

export function showHoverTip(text, x, y) {
  const el = qs("#hover-tip");
  if (!text) { el.classList.add("hidden"); return; }
  el.textContent = text; el.style.left = `${x + 14}px`; el.style.top = `${y + 14}px`; el.classList.remove("hidden");
}

export function renderResult(result) {
  const el = qs("#result-box");
  if (!result) { el.innerHTML = ""; return; }
  const kind = result.kind === "straight" ? "스트레이트 통과" : result.kind === "crossover" ? "크로스오버 (학습 통과)" : "불합격";
  el.innerHTML = `<strong>${kind}</strong><ul>${result.reasons.map((r) => `<li>${r}</li>`).join("")}</ul>`;
}

export function showCelebrate(result, score, toolsOut) {
  qs("#cele-title").textContent = result && result.pass ? (result.kind === "crossover" ? "크로스오버 완성!" : "합격! 연결 성공") : "다시 한 번!";
  qs("#cele-body").textContent = result && result.pass ? `점수 ${score}점. ${toolsOut ? "공구가 아직 나와 있으면 걸이에 돌려 주세요." : "공구도 모두 제자리입니다."}` : ((result && result.reasons[0]) || "테스터가 실패를 표시했습니다.");
  qs("#modal-celebrate").classList.remove("hidden");
}

function plugPins(order, title) {
  const pins = order.map((id, i) => {
    const y = 28 + i * 18;
    return `<rect x="118" y="${y}" width="92" height="14" rx="3" fill="${HEX[id]}" stroke="#1a1208"/><text x="108" y="${y + 12}" text-anchor="end" font-size="11" font-weight="800">${i + 1}</text><text x="216" y="${y + 12}" font-size="10" font-weight="700">${WIRE_DEFS[id].name}</text>`;
  }).join("");
  return `<svg viewBox="0 0 280 190" class="art-svg" role="img" aria-label="${title}"><rect x="4" y="8" width="88" height="174" rx="10" fill="#d8c4a0" stroke="#3d2614" stroke-width="3"/><path d="M28 182 h40 l8 10 h-56 z" fill="#8a6a3a"/><text x="48" y="24" text-anchor="middle" font-size="11" font-weight="800">탭 아래</text>${pins}<text x="140" y="16" font-size="13" font-weight="800">${title}</text></svg>`;
}
function twoPlugs(cross) {
  const a = T568B.map((id, i) => {
    const y = 20 + i * 14;
    const dest = cross ? 20 + ((i === 0 ? 2 : i === 1 ? 5 : i === 2 ? 0 : i === 5 ? 1 : i) * 14) : y;
    return `<line x1="70" y1="${y}" x2="170" y2="${dest}" stroke="${HEX[id]}" stroke-width="4"/>`;
  }).join("");
  return `<svg viewBox="0 0 240 140" class="art-svg" role="img"><rect x="8" y="8" width="52" height="124" rx="8" fill="#cfc3a6" stroke="#3d2614" stroke-width="2"/><rect x="180" y="8" width="52" height="124" rx="8" fill="#cfc3a6" stroke="#3d2614" stroke-width="2"/>${a}<text x="120" y="138" text-anchor="middle" font-size="12" font-weight="800">${cross ? "A ↔ B 교차" : "1:1 같은 색"}</text></svg>`;
}
const icon = (label, inner) => `<svg viewBox="0 0 160 110" class="art-svg">${inner}<text x="80" y="104" text-anchor="middle" font-size="12" font-weight="800">${label}</text></svg>`;
const iconReel = () => icon("케이블 릴", `<circle cx="70" cy="55" r="38" fill="#2f6b3a" stroke="#1a1208" stroke-width="3"/><circle cx="70" cy="55" r="12" fill="#efe4cf"/>`);
const iconCutter = () => icon("커터", `<path d="M20 80 L70 40 L80 50 L30 90 Z" fill="#888"/><path d="M90 30 L140 20 L145 32 L95 44 Z" fill="#c45c26"/>`);
const iconStripper = () => icon("스트리퍼", `<rect x="30" y="40" width="100" height="28" rx="8" fill="#3d5a80"/><rect x="70" y="48" width="40" height="12" fill="#1a1208"/>`);
const iconUntwist = () => icon("페어 풀기", `<path d="M20 70 q20 -30 40 0 t40 0 t40 0" fill="none" stroke="#e67e22" stroke-width="4"/><path d="M20 78 q20 -30 40 0 t40 0 t40 0" fill="none" stroke="#2e7d32" stroke-width="4"/>`);
const iconTrim = () => icon("끝 맞추기", Object.values(HEX).map((c,i)=>`<rect x="${20+i*16}" y="30" width="12" height="40" fill="${c}"/>`).join("") + `<line x1="16" y1="28" x2="148" y2="28" stroke="#c45c26" stroke-width="3"/>`);
const iconInsert = () => icon("탭 아래", `<rect x="90" y="20" width="50" height="55" rx="8" fill="#d8c4a0" stroke="#3d2614" stroke-width="3"/><rect x="20" y="40" width="70" height="18" rx="6" fill="#2f6b3a"/>`);
const iconCrimp = () => icon("크림퍼", `<path d="M30 90 L70 40 L90 48 L50 98 Z" fill="#555"/><rect x="68" y="44" width="24" height="14" fill="#d8c4a0"/>`);
const iconTester = () => icon("테스터", `<rect x="16" y="24" width="128" height="48" rx="8" fill="#1f2a22" stroke="#5dcc88"/>` + [0,1,2,3,4,5,6,7].map(i=>`<circle cx="${30+i*14}" cy="48" r="5" fill="${i%2?"#5dcc88":"#ffe08a"}"/>`).join(""));
const iconHang = () => icon("걸이에 반납", `<rect x="20" y="24" width="120" height="12" rx="4" fill="#6b4423"/><rect x="40" y="36" width="16" height="40" fill="#3d5a80"/>`);
const ART = {
  welcome: () => `<div class="art-row">${iconReel()}${iconCutter()}</div>`,
  reel: iconReel, cutter: iconCutter, stripper: iconStripper, hang: iconHang,
  untwist: iconUntwist, arrange: () => plugPins(T568B, "T568B"), trim: iconTrim,
  insert: iconInsert, crimp: iconCrimp, tester: iconTester,
  crossover: () => twoPlugs(true), complete: () => `<div class="art-row">${iconTester()}${twoPlugs(false)}</div>`,
};

export function buildManual() {
  qs("#manual-pages").innerHTML = `
    <article class="man-card">${iconReel()}<h3>UTP가 뭔가요?</h3><p>꼬인 네 쌍이 간섭을 줄여 줘요.</p></article>
    <article class="man-card wide"><div class="std-pair">${plugPins(T568B, "T568B")}${plugPins(T568A, "T568A")}</div><h3>T568B / T568A</h3><p>이 의뢰는 양끝 T568B 스트레이트.</p></article>
    <article class="man-card">${iconHang()}<h3>공구 예절</h3><p>쓰고 바로 걸이.</p></article>`;
}

export function buildDiagramSheet() {
  qs("#diag-b").innerHTML = plugPins(T568B, "T568B");
  qs("#diag-a").innerHTML = plugPins(T568A, "T568A");
  const extra = qs("#diag-vs");
  if (extra) extra.innerHTML = `<div class="std-pair">${twoPlugs(false)}${twoPlugs(true)}</div>`;
}

export function toast(msg) {
  const t = qs("#toast");
  t.textContent = msg; t.classList.remove("hidden");
  clearTimeout(toast._tm);
  toast._tm = setTimeout(() => t.classList.add("hidden"), 2800);
}

export { CATS, LENGTHS } from "./config.js";
