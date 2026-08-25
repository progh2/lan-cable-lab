import { JOB, WIRES, T568B, PROMPT } from "./config.js";

export function qs(sel, root = document) {
  return root.querySelector(sel);
}

export function wireStyle(id) {
  const w = WIRES[id];
  if (!w) return "";
  if (w.stripe) {
    return `background:repeating-linear-gradient(90deg,${w.hex} 0 7px,${w.stripe} 7px 10px);color:#1a1610`;
  }
  return `background:${w.hex};color:${luma(w.hex) > 150 ? "#1a1610" : "#f4efe4"}`;
}

function luma(hex) {
  const n = parseInt(hex.slice(1), 16);
  const r = (n >> 16) & 255;
  const g = (n >> 8) & 255;
  const b = n & 255;
  return r * 0.3 + g * 0.6 + b * 0.1;
}

export function wireChip(id, extra = "") {
  const w = WIRES[id];
  return `<span class="wire-chip ${extra}" data-id="${id}" style="${wireStyle(id)}">${w.name}</span>`;
}

export function renderTicket() {
  const pins = T568B.map((id, i) => {
    const w = WIRES[id];
    return `<li><i class="pin-dot" style="${wireStyle(id)}"></i>${i + 1} ${w.short}</li>`;
  }).join("");
  qs("#ticket").innerHTML = `
    <div class="ticket-head">
      <span class="serial">No.${JOB.id}</span>
      <strong>${JOB.title}</strong>
      <span class="stamp-line">미림마이스터고</span>
    </div>
    <p class="ticket-job">Cat5e 1m 스트레이트 · 양끝 T568B · 관통형 RJ45 · 부트 필수</p>
    <ul class="ticket-pins">${pins}</ul>
  `;
}

export function renderCableStrip(state) {
  const el = qs("#cable-strip");
  const has = state.cutLengthM != null;
  const a = state.ends.A;
  const b = state.ends.B;
  const working = state.stage !== "welcome" && state.stage !== "reel" && state.stage !== "complete";

  el.innerHTML = `
    <div class="end-flag ${a.crimped ? "done" : state.currentEnd === "A" && working ? "now" : ""}">
      <span>끝 A</span>
      <small>${endLabel(a, state, "A")}</small>
    </div>
    <div class="cable-draw ${has ? "has" : "empty"}" aria-hidden="true">
      ${endCap(a, "A")}
      <div class="jacket-run"></div>
      ${endCap(b, "B")}
    </div>
    <div class="end-flag ${b.crimped ? "done" : state.currentEnd === "B" && working ? "now" : ""}">
      <span>끝 B</span>
      <small>${endLabel(b, state, "B")}</small>
    </div>
  `;
}

function endLabel(end, state, which) {
  if (end.crimped) return "압착 완료";
  if (!state.cutLengthM) return "대기";
  if (state.currentEnd !== which) return end.stripped ? "작업 중" : "벗기지 않음";
  if (end.inserted) return "플러그 삽입";
  if (end.bootOn) return "부트 장착";
  if (end.slots.some(Boolean)) return "색 정렬";
  if (end.stripped) return "탈피";
  return which === "A" ? "작업 중" : "대기";
}

function miniTip(end) {
  if (!end.slots.every(Boolean)) return "";
  return `<div class="mini-tip">${end.slots.map((id) => `<i style="${wireStyle(id)}"></i>`).join("")}</div>`;
}

function endCap(end, which) {
  const side = which === "A" ? "left" : "right";
  if (end.crimped || end.inserted) {
    return `<div class="cap plug ${side}">
      <div class="boot-bit"></div>
      <div class="rj45"><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i></div>
    </div>`;
  }
  if (end.bootOn && end.slots.every(Boolean)) {
    return `<div class="cap prepared ${side}"><div class="boot-bit"></div>${miniTip(end)}</div>`;
  }
  if (end.slots.every(Boolean)) {
    return `<div class="cap prepared ${side}">${miniTip(end)}</div>`;
  }
  return `<div class="cap bare ${side}"><div class="copper"></div></div>`;
}

export function setPrompt(text) {
  qs("#prompt").textContent = text;
}

export function setPrimary(label, onClick) {
  const btn = qs("#btn-primary");
  if (!label) {
    btn.classList.add("hidden");
    btn.textContent = "";
    btn.onclick = null;
    return;
  }
  btn.classList.remove("hidden");
  btn.textContent = label;
  btn.onclick = onClick;
}

export function toast(msg) {
  const t = qs("#toast");
  t.textContent = msg;
  t.classList.remove("hidden");
  clearTimeout(toast._tm);
  toast._tm = setTimeout(() => t.classList.add("hidden"), 2600);
}

export function stamp(kind, title, reason) {
  return new Promise((resolve) => {
    const el = qs("#stamp-layer");
    el.className = `stamp-layer ${kind}`;
    el.innerHTML = `
      <div class="stamp-card">
        <div class="ink ${kind}">${title}</div>
        ${reason ? `<p>${reason}</p>` : ""}
      </div>
    `;
    el.classList.remove("hidden");
    const done = () => {
      clearTimeout(stamp._tm);
      el.className = "stamp-layer hidden";
      el.innerHTML = "";
      el.onclick = null;
      resolve();
    };
    el.onclick = done;
    clearTimeout(stamp._tm);
    stamp._tm = setTimeout(done, kind === "pass" ? 1600 : 2200);
  });
}

export function bindChrome({ onReset }) {
  qs("#btn-reset").addEventListener("click", onReset);
}

export function showReset(on) {
  qs("#btn-reset").classList.toggle("hidden", !on);
}

export { JOB, PROMPT, WIRES, T568B };
