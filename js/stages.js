import { JOB, REELS, WIRES, PAIRS, T568B } from "./config.js";
import {
  endOf, isT568B, allPairsUntwisted, allWiresStraight, allSlotsFilled,
} from "./state.js";
import {
  bindDrag, bindHold, bindPickDrag, place, clamp, hits, centerDist,
} from "./drag.js";
import { qs, wireStyle, setPrompt } from "./ui.js";

function el(html) {
  const d = document.createElement("div");
  d.innerHTML = html.trim();
  return d.firstElementChild;
}

function toolMarkup(kind, label) {
  return `<div class="${kind} tool" id="${kind}" role="img" aria-label="${label}">${TOOL_SVG[kind]}<span class="tool-label">${label}</span></div>`;
}

function clampTool(node, x, y, box) {
  return [
    clamp(x, 0, Math.max(0, box.clientWidth - node.offsetWidth)),
    clamp(y, 0, Math.max(0, box.clientHeight - node.offsetHeight)),
  ];
}

/** Flat 2D silhouettes — flush nipper, jacket stripper, RJ45 crimp tool. */
const TOOL_SVG = {
  cutter: `
    <svg class="tool-svg" viewBox="0 0 170 110" overflow="visible" aria-hidden="true">
      <line class="cut-guide" x1="6" y1="-48" x2="6" y2="154" stroke="#f0d48a" stroke-width="2.2" stroke-dasharray="5 4"/>
      <g>
        <path d="M70 58 C96 70 124 84 150 96 C157 99 164 95 163 87 C162 79 155 76 148 74 C122 64 96 54 72 52 Z" fill="#2c2c28" stroke="#1a1b14" stroke-width="2.2" stroke-linejoin="round"/>
        <path d="M88 72 L146 90" stroke="#5a5a52" stroke-width="2.6" stroke-linecap="round" opacity=".4"/>
        <path d="M70 52 C96 40 124 26 150 14 C157 11 164 15 163 23 C162 31 155 34 148 36 C122 46 96 56 72 58 Z" fill="#9c1f1f" stroke="#1a1b14" stroke-width="2.2" stroke-linejoin="round"/>
        <path d="M88 38 L146 20" stroke="#d46a5a" stroke-width="2.6" stroke-linecap="round" opacity=".45"/>
        <path d="M82 50 C92 55 92 55 82 60" stroke="#8c8e80" stroke-width="2.2" fill="none"/>
        <path d="M48 42 L74 47 L74 63 L48 68 Z" fill="#7d868e" stroke="#1a1b14" stroke-width="2.2"/>
        <path d="M10 82 L10 56 L50 55 L60 74 L36 90 Z" fill="#8b9298" stroke="#1a1b14" stroke-width="2.2" stroke-linejoin="round"/>
        <path d="M10 28 L10 54 L50 55 L60 36 L36 20 Z" fill="#c5ccd2" stroke="#1a1b14" stroke-width="2.2" stroke-linejoin="round"/>
        <path d="M10 28 L10 82" stroke="#efe6cf" stroke-width="2.8" stroke-linecap="butt"/>
        <path d="M12 55 L50 55" stroke="#2a2b22" stroke-width="1.8"/>
        <circle cx="64" cy="55" r="9" fill="#c9b888" stroke="#1a1b14" stroke-width="2.2"/>
        <circle cx="64" cy="55" r="3.4" fill="#6e7064"/>
      </g>
    </svg>`,
  stripper: `
    <svg class="tool-svg" viewBox="0 0 120 88" aria-hidden="true">
      <path d="M64 48 L104 78 Q108 82 101 85 L56 54 Z" fill="#2c2c28" stroke="#1a1b14" stroke-width="2"/>
      <path d="M54 48 L26 84 Q22 88 29 87 L62 52 Z" fill="#d4a017" stroke="#1a1b14" stroke-width="2"/>
      <path d="M50 58 L34 80" stroke="#f0d48a" stroke-width="2.5" stroke-linecap="round" opacity=".45"/>
      <path d="M8 12 L70 16 L64 38 L14 42 Z" fill="#8b9298" stroke="#1a1b14" stroke-width="2"/>
      <path d="M14 16 L64 19 L60 32 L18 36 Z" fill="#c5ccd2" stroke="#1a1b14" stroke-width="1.2"/>
      <circle cx="26" cy="26" r="6.6" fill="#2a2b22" stroke="#1a1b14" stroke-width="1.6"/>
      <circle cx="42" cy="26" r="4.8" fill="#2a2b22" stroke="#1a1b14" stroke-width="1.6"/>
      <circle cx="54" cy="26" r="3.2" fill="#2a2b22" stroke="#1a1b14" stroke-width="1.5"/>
      <path d="M18 38 L48 36 L46 44 L16 44 Z" fill="#6e7064" stroke="#1a1b14" stroke-width="1.3"/>
      <circle cx="58" cy="48" r="7.2" fill="#c9b888" stroke="#1a1b14" stroke-width="2"/>
      <circle cx="58" cy="48" r="2.8" fill="#6e7064"/>
    </svg>`,
  crimper: `
    <svg class="tool-svg" viewBox="0 0 120 88" aria-hidden="true">
      <path d="M58 50 L112 74 Q116 78 110 82 L52 58 Z" fill="#2c2c28" stroke="#1a1b14" stroke-width="2"/>
      <path d="M50 52 L78 86 Q73 90 67 87 L42 56 Z" fill="#9c1f1f" stroke="#1a1b14" stroke-width="2"/>
      <path d="M8 10 L54 6 L72 20 L68 48 L18 50 L6 36 Z" fill="#7d868e" stroke="#1a1b14" stroke-width="2"/>
      <path d="M14 14 L52 11 L64 20 L62 28 L16 30 Z" fill="#c5ccd2" stroke="#1a1b14" stroke-width="1.2"/>
      <path d="M20 18 L58 16 L60 34 L22 36 Z" fill="#2a2b22" stroke="#1a1b14" stroke-width="1.6"/>
      <g fill="#c9a227">
        <rect x="24" y="20" width="2.5" height="11"/>
        <rect x="28.6" y="20" width="2.5" height="11"/>
        <rect x="33.2" y="20" width="2.5" height="11"/>
        <rect x="37.8" y="20" width="2.5" height="11"/>
        <rect x="42.4" y="20" width="2.5" height="11"/>
        <rect x="47" y="20" width="2.5" height="11"/>
        <rect x="51.6" y="20" width="2.5" height="11"/>
      </g>
      <path d="M28 44 L62 42 L60 54 L26 54 Z" fill="#5a6268" stroke="#1a1b14" stroke-width="1.6"/>
      <path d="M32 48 h22" stroke="#c9b888" stroke-width="2"/>
      <circle cx="52" cy="54" r="7.2" fill="#c9b888" stroke="#1a1b14" stroke-width="2"/>
      <circle cx="52" cy="54" r="2.8" fill="#6e7064"/>
    </svg>`,
};

function ticks(host, items) {
  host.innerHTML = items.map(([pct, label, major]) =>
    `<i class="tick ${major ? "major" : ""}" style="left:${pct}%">${label ? `<span>${label}</span>` : ""}</i>`
  ).join("");
}

function slotIds(end) {
  return end.slots.map((id) => (id && WIRES[id] ? id : "wo"));
}

function strandBars(ids, cls = "utp-strand") {
  return ids.map((id) => `<i class="${cls}" style="${wireStyle(id)}"></i>`).join("");
}

/** Rubber RJ45 boot, side view: tapered, hollow opening on the LEFT. */
function bootSvg() {
  return `
    <svg class="part-svg" viewBox="0 0 120 58" aria-hidden="true">
      <path d="M22 16 C16 16 11 20 11 29 C11 38 16 42 22 42 L86 46 C100 47 110 44 114 40 L114 18 C110 14 100 11 86 12 Z" fill="#1c3d1c" fill-opacity=".82" stroke="#0c160c" stroke-width="2.2" stroke-linejoin="round"/>
      <path d="M26 18 L84 15 C96 14 106 17 110 20 L110 26 C104 22 94 20 82 21 L28 24 Z" fill="#3d6a3d" opacity=".42"/>
      <path d="M40 15 L38 43" stroke="#2a522a" stroke-width="3.2" opacity=".5"/>
      <path d="M54 14 L52 44" stroke="#2a522a" stroke-width="3.2" opacity=".42"/>
      <path d="M68 14 L66 45" stroke="#2a522a" stroke-width="3.2" opacity=".36"/>
      <ellipse cx="18" cy="29" rx="10" ry="15" fill="#143014" stroke="#0c160c" stroke-width="2.2"/>
      <ellipse cx="16" cy="29" rx="6.6" ry="11" fill="#060a06"/>
      <ellipse cx="17.4" cy="29" rx="3.1" ry="6" fill="#243824"/>
      <path d="M112 17 L118 14 L118 44 L112 41 Z" fill="#244a24" stroke="#0c160c" stroke-width="1.8"/>
    </svg>`;
}

/** Pass-through RJ45, side view: clear body, gold contacts, opening on the LEFT. */
function plugSvg() {
  return `
    <svg class="part-svg" viewBox="0 0 168 78" aria-hidden="true">
      <path d="M72 6 L122 6 L128 16 L66 16 Z" fill="#c5d2cc" stroke="#1a1b14" stroke-width="1.8"/>
      <path d="M86 8 H116" stroke="#8a9690" stroke-width="2"/>
      <g fill="#d4b12a" stroke="#6a5810" stroke-width=".7">
        <rect x="76" y="16" width="5.6" height="11" rx=".6"/>
        <rect x="83" y="16" width="5.6" height="11" rx=".6"/>
        <rect x="90" y="16" width="5.6" height="11" rx=".6"/>
        <rect x="97" y="16" width="5.6" height="11" rx=".6"/>
        <rect x="104" y="16" width="5.6" height="11" rx=".6"/>
        <rect x="111" y="16" width="5.6" height="11" rx=".6"/>
        <rect x="118" y="16" width="5.6" height="11" rx=".6"/>
        <rect x="125" y="16" width="5.6" height="11" rx=".6"/>
      </g>
      <path d="M24 20 L138 20 L156 24 L156 62 L138 66 L24 66 C12 66 6 58 6 43 C6 28 12 20 24 20 Z" fill="#d8e8e2" fill-opacity=".58" stroke="#1a1b14" stroke-width="2.1"/>
      <g stroke="#1a1b14" stroke-opacity=".16" stroke-width="1">
        <path d="M28 28 H136"/><path d="M28 33 H136"/><path d="M28 38 H136"/><path d="M28 43 H136"/>
        <path d="M28 48 H136"/><path d="M28 53 H136"/><path d="M28 58 H136"/>
      </g>
      <ellipse cx="16" cy="43" rx="11" ry="20" fill="#2a3330" stroke="#1a1b14" stroke-width="1.8"/>
      <ellipse cx="14" cy="43" rx="7" ry="14" fill="#121816"/>
      <ellipse cx="16" cy="43" rx="3.4" ry="7" fill="#3a4440"/>
      <path d="M138 20 L156 24 L156 62 L138 66 Z" fill="#c9d6d0" fill-opacity=".88" stroke="#1a1b14" stroke-width="1.6"/>
      <g fill="#1a1b14">
        <rect x="144" y="28" width="7" height="2.2" rx=".4"/>
        <rect x="144" y="32.4" width="7" height="2.2" rx=".4"/>
        <rect x="144" y="36.8" width="7" height="2.2" rx=".4"/>
        <rect x="144" y="41.2" width="7" height="2.2" rx=".4"/>
        <rect x="144" y="45.6" width="7" height="2.2" rx=".4"/>
        <rect x="144" y="50" width="7" height="2.2" rx=".4"/>
        <rect x="144" y="54.4" width="7" height="2.2" rx=".4"/>
        <rect x="144" y="58.8" width="7" height="2.2" rx=".4"/>
      </g>
    </svg>`;
}

function utpRunMarkup(end, { bootOn = false } = {}) {
  const ids = slotIds(end);
  return `
    <div class="utp-run" id="cable" role="img" aria-label="UTP 케이블, 정렬된 8가닥">
      <div class="utp-jacket"><span class="jacket-etch">CAT5E</span></div>
      ${bootOn ? `<div class="rj45-boot on-cable" aria-hidden="true">${bootSvg()}</div>` : ""}
      <div class="utp-tip">${strandBars(ids)}</div>
    </div>`;
}

function bootPartMarkup(ids) {
  return `
    <div class="rj45-boot" id="boot" role="img" aria-label="고무 부트, 왼쪽 구멍">
      ${bootSvg()}
      <div class="boot-lanes" id="boot-lanes">${strandBars(ids, "plug-strand")}</div>
    </div>`;
}

function plugPartMarkup(ids, { emerge = false, id = "plug" } = {}) {
  const shown = emerge ? " on" : "";
  const laneW = emerge ? ' style="width:72%"' : "";
  return `
    <div class="rj45-plug" id="${id}" role="img" aria-label="관통형 RJ45, 왼쪽 입구">
      ${plugSvg()}
      <div class="plug-lanes${shown}" id="lanes"${laneW}>${strandBars(ids, "plug-strand")}</div>
      <div class="plug-emerge${shown}" id="emerge">${strandBars(ids, "emerge-strand")}</div>
    </div>`;
}

const INSERT_REASON = {
  "from-right": "오른쪽에서는 안 들어갑니다.",
  skew: "왼쪽 구멍 높이를 맞추세요.",
  "wrong-end": "가닥 끝(오른쪽)으로 끼우세요.",
};

function overlapArea(a, b) {
  const ix = Math.max(0, Math.min(a.right, b.right) - Math.max(a.left, b.left));
  const iy = Math.max(0, Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top));
  return ix * iy;
}

/** Pure geometry: tip must enter the part's left hollow; jacket stays on the left. */
export function verdictFromRects(tip, jacket, part, cable) {
  const overlapAll = overlapArea(cable, part);
  const overlapTip = overlapArea(tip, part);
  const tipMidX = tip.left + tip.width / 2;
  const partMidX = part.left + part.width / 2;
  const iyTip = Math.max(0, Math.min(tip.bottom, part.bottom) - Math.max(tip.top, part.top));
  const close = overlapAll > 80 || overlapTip > 30
    || Math.hypot(tipMidX - partMidX, (tip.top + tip.height / 2) - (part.top + part.height / 2)) < 88;
  if (!close) return "idle";

  const vRatio = iyTip / Math.max(1, Math.min(tip.height, part.height));
  if (jacket.left > part.left + part.width * 0.15) return "from-right";
  const tipHorizNear = tip.right > part.left - 20 && tip.left < part.right;
  if (vRatio < 0.2 && overlapAll > 50 && tipHorizNear) return "skew";
  if (overlapAll > 80 && overlapTip < 25) return "wrong-end";
  if (overlapTip > 40 && tip.right > part.left + 8 && jacket.left < part.left + part.width * 0.3 && vRatio >= 0.2) {
    return "ok";
  }
  return "idle";
}

/** Cable may enter a boot/plug only from the part's left (hollow) side. */
function leftInsertVerdict(cable, part) {
  const tip = qs(".utp-tip", cable) || cable;
  const jacket = qs(".utp-jacket", cable) || cable;
  return verdictFromRects(
    tip.getBoundingClientRect(),
    jacket.getBoundingClientRect(),
    part.getBoundingClientRect(),
    cable.getBoundingClientRect(),
  );
}

function bounceReject(el, x, y, api, reason) {
  place(el, x, y);
  el.classList.remove("reject-bounce");
  requestAnimationFrame(() => el.classList.add("reject-bounce"));
  el.addEventListener("animationend", () => el.classList.remove("reject-bounce"), { once: true });
  api.toast(reason);
}

function clampPart(node, x, y, box) {
  return [
    clamp(x, -40, Math.max(0, box.clientWidth - 48)),
    clamp(y, 0, Math.max(0, box.clientHeight - node.offsetHeight)),
  ];
}

function showJacket(reel) {
  const sheet = qs("#inspect-sheet");
  const faded = !reel.print;
  sheet.innerHTML = `
    <div class="paper">
      <h2>재킷 인쇄</h2>
      <p>릴을 돌려 외피를 읽습니다.</p>
      <div class="jacket-print ${faded ? "faded" : ""}">${reel.print || reel.faded}</div>
      <p>${faded ? "규격 표시가 없습니다." : "인쇄를 작업지시서와 대조하시오."}</p>
      <button type="button" class="primary" id="close-print">닫기</button>
    </div>
  `;
  sheet.classList.remove("hidden");
  const close = () => sheet.classList.add("hidden");
  sheet.onclick = (e) => { if (e.target === sheet) close(); };
  qs("#close-print", sheet).onclick = close;
}

export function mountStage(name, root, api) {
  root.innerHTML = "";
  const cleanups = [];
  const add = (fn) => cleanups.push(fn);
  const fn = STAGES[name] || STAGES.welcome;
  fn(root, api, add);
  add(() => {
    const sheet = qs("#inspect-sheet");
    sheet.classList.add("hidden");
    sheet.onclick = null;
  });
  return () => cleanups.forEach((c) => c());
}

const STAGES = {
  welcome, reel, cut, strip, untwist, sort, boot, insert, inspect, crimp, complete,
};

const STAMP_SVG = `
  <svg class="stamp-svg" viewBox="0 0 88 128" aria-hidden="true">
    <ellipse cx="44" cy="15" rx="16" ry="9" fill="#6b3e18" stroke="#1a1b14" stroke-width="2"/>
    <path d="M28 15c0 7 7 11 16 11s16-4 16-11" fill="#8a5324"/>
    <path d="M32 14 L32 58 L56 58 L56 14 Z" fill="#a86b32" stroke="#1a1b14" stroke-width="2"/>
    <path d="M36 20 L36 54" stroke="#c4894a" stroke-width="1.6" opacity=".55"/>
    <path d="M42 18 L42 56" stroke="#6b3e18" stroke-width="1.1" opacity=".35"/>
    <path d="M50 22 L50 52" stroke="#d4a05a" stroke-width="1.3" opacity=".4"/>
    <path d="M20 56 L68 56 L74 70 L14 70 Z" fill="#7a4a1e" stroke="#1a1b14" stroke-width="2" stroke-linejoin="round"/>
    <path d="M24 59 L64 59 L67 66 L21 66 Z" fill="#c4894a" opacity=".32"/>
    <path d="M14 70 L74 70 L76 94 L12 94 Z" fill="#9c1f1f" stroke="#1a1b14" stroke-width="2" stroke-linejoin="round"/>
    <path d="M18 74 L70 74 L71 82 L17 82 Z" fill="#c43a3a" opacity=".4"/>
    <text x="44" y="89" text-anchor="middle" fill="#f6d4cc" font-size="13" font-weight="800" letter-spacing="1">접수</text>
    <ellipse cx="44" cy="97" rx="32" ry="8" fill="#6e1212" stroke="#1a1b14" stroke-width="2"/>
    <ellipse cx="44" cy="96" rx="26" ry="4.5" fill="#4a0c0c" opacity=".55"/>
  </svg>`;

function welcome(root, api, add) {
  const pins = T568B.map((id, i) => {
    const w = WIRES[id];
    return `<li><i class="pin-dot" style="${wireStyle(id)}"></i>${i + 1} ${w.short}</li>`;
  }).join("");
  const box = el(`
    <div class="stage-canvas welcome-desk">
      <article class="job-slip" id="slip" aria-label="오늘 의뢰 쪽지">
        <i class="slip-fold" aria-hidden="true"></i>
        <p class="slip-kicker">오늘 의뢰</p>
        <p class="slip-job">Cat5e 1m 스트레이트 · 양끝 T568B · 관통형 · 부트 필수</p>
        <ol class="slip-t568b">${pins}</ol>
        <div class="intake-ink" id="intake-ink" aria-hidden="true">접수</div>
      </article>
      <div class="rubber-stamp" id="ink" role="button" tabindex="0" aria-label="접수 도장. 집어 쪽지에 찍으시오.">
        ${STAMP_SVG}
        <span class="tool-label">접수 도장</span>
      </div>
    </div>
  `);
  root.appendChild(box);
  const stampEl = qs("#ink", box);
  const slip = qs("#slip", box);
  const inkMark = qs("#intake-ink", box);
  let stamped = false;
  let goTimer = 0;
  add(() => clearTimeout(goTimer));

  function parkStamp() {
    const br = box.getBoundingClientRect();
    const er = stampEl.getBoundingClientRect();
    place(stampEl, er.left - br.left, er.top - br.top);
    stampEl.style.right = "auto";
    stampEl.style.bottom = "auto";
  }
  requestAnimationFrame(parkStamp);

  function stampTheSlip() {
    if (stamped) return;
    stamped = true;
    stampEl.classList.remove("lifted");
    const over = hits(stampEl, slip, 0.08) || centerDist(stampEl, slip) < 130;
    if (!over) {
      stampEl.classList.add("flying");
      const br = box.getBoundingClientRect();
      const sr = slip.getBoundingClientRect();
      const x = sr.left - br.left + sr.width * 0.5 - stampEl.offsetWidth * 0.28;
      const y = sr.top - br.top + sr.height * 0.18;
      place(stampEl, x, y);
    }
    stampEl.classList.add("stamping");
    stampEl.setAttribute("aria-disabled", "true");
    inkMark.classList.add("on");
    goTimer = setTimeout(() => api.go("reel"), 780);
  }

  add(bindDrag(stampEl, {
    container: box,
    onStart() {
      if (stamped) return;
      stampEl.classList.add("lifted");
    },
    onMove(x, y) {
      if (stamped) return;
      place(stampEl, ...clampTool(stampEl, x, y, box));
    },
    onEnd(_ev, meta) {
      if (stamped) return;
      stampEl.classList.remove("lifted");
      if (!meta.moved) {
        stampTheSlip();
        return;
      }
      if (hits(stampEl, slip, 0.1) || centerDist(stampEl, slip) < 140) {
        stampTheSlip();
      } else {
        api.toast("쪽지 위에 도장을 찍으시오.");
      }
    },
  }));

  const onKey = (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      stampTheSlip();
    }
  };
  stampEl.addEventListener("keydown", onKey);
  add(() => stampEl.removeEventListener("keydown", onKey));
}

function reel(root, api, add) {
  const order = api.state.reelOrder;
  const box = el(`<div class="stage-canvas"><div class="rack" id="rack"></div><div class="drop-tray" id="tray">작업대 · 릴을 여기로</div></div>`);
  root.appendChild(box);
  const rack = qs("#rack", box);
  const tray = qs("#tray", box);
  order.forEach((id) => {
    const r = REELS.find((x) => x.id === id);
    const card = el(`
      <div class="reel" data-id="${r.id}">
        <div class="reel-drum" style="color:${r.jacket};border-color:${r.flange}"></div>
        <small>눌러 재킷 인쇄 · 끌어 올리기</small>
      </div>
    `);
    rack.appendChild(card);
    bindPickDrag(card, {
      add,
      onTap() { showJacket(r); },
      onDrop(ev) {
        const p = document.elementFromPoint(ev.clientX, ev.clientY);
        const over = p && (p === tray || tray.contains(p));
        if (!over) return;
        if (r.ok) {
          api.state.reelId = r.id;
          api.go("cut");
        } else {
          api.reject(r.reject);
        }
      },
    });
  });
}

function selectedReel(state) {
  return REELS.find((x) => x.id === state.reelId) || REELS.find((x) => x.ok);
}

function cut(root, api, add) {
  const reel = selectedReel(api.state);
  const lo = ((JOB.lengthM - JOB.lengthTolM) / 1.5) * 100;
  const hi = ((JOB.lengthM + JOB.lengthTolM) / 1.5) * 100;
  const box = el(`
    <div class="stage-canvas cut-stage">
      <div class="length-read" id="read">푼 길이 0.20 m</div>
      <div class="cut-bench">
        <div class="cut-reel" id="reel" role="img" aria-label="Cat5e 케이블 릴">
          <div class="cut-drum" style="color:${reel.jacket};border-color:${reel.flange}">
            <span class="cut-print">Cat5e</span>
          </div>
          <div class="cut-lead" id="lead" aria-hidden="true"></div>
          <i class="cut-mouth" id="mouth" aria-hidden="true"></i>
          <small>릴 · 소스</small>
        </div>
        <div class="measure-track" id="track">
          <div class="ok-band" style="left:${lo}%;width:${hi - lo}%"></div>
          <div class="ruler" id="ruler"></div>
          <i class="cut-hair hidden" id="hair" aria-hidden="true"></i>
          <div class="cable-body" id="body"></div>
          <div class="cable-cut-face hidden" id="face" aria-hidden="true"></div>
          <div class="cable-pull" id="tip">
            <i class="free-end" aria-hidden="true"></i>
            <span>당기기</span>
          </div>
        </div>
      </div>
      ${toolMarkup("cutter", "니퍼")}
    </div>
  `);
  root.appendChild(box);
  const canvas = box;
  const track = qs("#track", box);
  const ruler = qs("#ruler", box);
  const body = qs("#body", box);
  const hair = qs("#hair", box);
  const face = qs("#face", box);
  const tip = qs("#tip", box);
  const lead = qs("#lead", box);
  const drum = qs(".cut-drum", box);
  const cutter = qs("#cutter", box);
  const guide = qs(".cut-guide", cutter);
  const read = qs("#read", box);
  ticks(ruler, [
    [0, "0", true],
    [33.3, "0.5m", true],
    [66.7, "1.0m", true],
    [100, "1.5m", true],
  ]);

  let unspool = 0.2;
  let severed = false;
  let offered = false;
  let goTimer = 0;
  add(() => clearTimeout(goTimer));

  function snapM(m) {
    return Math.round(clamp(m, 0.05, 1.5) * 100) / 100;
  }
  function clientToM(clientX) {
    const r = track.getBoundingClientRect();
    return snapM(((clientX - r.left) / r.width) * 1.5);
  }
  function guideClientX() {
    const g = guide.getBoundingClientRect();
    return g.left + g.width / 2;
  }
  function mouthX() {
    return track.getBoundingClientRect().left;
  }
  function nearBenchY(cy) {
    const t = track.getBoundingClientRect();
    return cy >= t.top - 40 && cy <= t.bottom + 56;
  }
  function atReelMouth() {
    const c = cutter.getBoundingClientRect();
    const cy = c.top + c.height / 2;
    return nearBenchY(cy) && Math.abs(guideClientX() - mouthX()) <= 22;
  }
  function paint() {
    const w = Math.max(track.clientWidth, 1);
    const unspoolPx = (unspool / 1.5) * w;
    const onMouth = atReelMouth();
    drum.style.setProperty("--spin", `${Math.round(unspool * 80)}deg`);
    if (onMouth) {
      hair.classList.remove("hidden");
      hair.style.left = "0px";
    } else {
      hair.classList.add("hidden");
    }
    read.textContent = `푼 길이 ${unspool.toFixed(2)} m`;
    if (severed) {
      const gap = 14;
      body.style.left = `${gap}px`;
      body.style.width = `${Math.max(20, unspoolPx - 4)}px`;
      body.classList.add("detached");
      lead.classList.add("leftover");
      face.classList.remove("hidden");
      face.style.left = `${gap}px`;
      tip.classList.add("hidden");
    } else {
      body.style.left = "0px";
      body.style.width = `${Math.max(24, unspoolPx)}px`;
      body.classList.remove("detached");
      lead.classList.remove("leftover");
      face.classList.add("hidden");
      tip.classList.remove("hidden");
      tip.style.left = `${Math.max(0, unspoolPx - 8)}px`;
    }
  }
  function checkCutter() {
    paint();
    if (severed) return;
    if (atReelMouth()) {
      if (!offered) {
        offered = true;
        api.primary("릴 쪽에서 자르기", commit);
      }
    } else {
      offered = false;
      api.primary(null);
    }
  }
  function commit() {
    if (severed) return;
    severed = true;
    offered = false;
    api.primary(null);
    paint();
    const m = unspool;
    if (Math.abs(m - JOB.lengthM) <= JOB.lengthTolM) {
      api.state.cutLengthM = m;
      goTimer = setTimeout(() => api.go("strip"), 480);
    } else {
      api.reject(m < JOB.lengthM
        ? `${m.toFixed(2)}m — 너무 짧습니다. 1.00m ±5cm.`
        : `${m.toFixed(2)}m — 너무 깁니다. 1.00m ±5cm.`
      ).then(() => {
        severed = false;
        paint();
        checkCutter();
      });
    }
  }
  function parkNipperAtMouth(y) {
    const cr = canvas.getBoundingClientRect();
    const t = track.getBoundingClientRect();
    const c = cutter.getBoundingClientRect();
    const inset = guideClientX() - c.left;
    const x = clamp(mouthX() - cr.left - inset, 0, Math.max(0, canvas.clientWidth - cutter.offsetWidth));
    if (y == null) {
      y = clamp(t.bottom - cr.top - 22, 0, Math.max(0, canvas.clientHeight - cutter.offsetHeight));
    }
    place(cutter, x, y);
    return [x, y];
  }
  function snapNipperToMouth(x, y) {
    [x, y] = clampTool(cutter, x, y, canvas);
    place(cutter, x, y);
    const c = cutter.getBoundingClientRect();
    const cy = c.top + c.height / 2;
    if (!nearBenchY(cy)) return [x, y];
    return parkNipperAtMouth(y);
  }

  parkNipperAtMouth();
  requestAnimationFrame(() => {
    parkNipperAtMouth();
    paint();
    checkCutter();
  });

  function pullTo(ev) {
    if (severed) return;
    unspool = clientToM(ev.clientX);
    paint();
    checkCutter();
  }
  add(bindDrag(tip, {
    container: track,
    axis: "x",
    onMove(_x, _y, ev) { pullTo(ev); },
    onEnd: checkCutter,
  }));
  add(bindDrag(body, {
    container: track,
    axis: "x",
    onMove(_x, _y, ev) { pullTo(ev); },
    onEnd: checkCutter,
  }));
  add(bindDrag(cutter, {
    container: canvas,
    onMove(x, y) {
      snapNipperToMouth(x, y);
      checkCutter();
    },
    onEnd() {
      const c = cutter.getBoundingClientRect();
      if (nearBenchY(c.top + c.height / 2)) parkNipperAtMouth(parseFloat(cutter.style.top) || 0);
      checkCutter();
    },
  }));
}

function strip(root, api, add) {
  const end = endOf(api.state);
  const which = api.state.currentEnd;
  const lo = ((5 - (JOB.stripCm + JOB.stripTolCm)) / 5) * 100;
  const hi = ((5 - (JOB.stripCm - JOB.stripTolCm)) / 5) * 100;
  const box = el(`
    <div class="stage-canvas">
      <div class="depth-read" id="read">끝 ${which} · 칼날 0.2 cm</div>
      <div class="measure-track" id="track">
        <div class="ok-band" style="left:${lo}%;width:${Math.max(4, hi - lo)}%"></div>
        <div class="ruler" id="ruler"></div>
        <div class="strip-cable" id="cable"></div>
      </div>
      <div class="jacket-peel" id="jacket">재킷 · 잡아 벗기기</div>
      ${toolMarkup("stripper", "스트리퍼")}
    </div>
  `);
  root.appendChild(box);
  const canvas = box;
  const track = qs("#track", box);
  const ruler = qs("#ruler", box);
  const jacket = qs("#jacket", box);
  const stripper = qs("#stripper", box);
  const read = qs("#read", box);
  ticks(ruler, [
    [0, "5cm", true],
    [20, "4", false],
    [40, "3cm", true],
    [60, "2", false],
    [80, "1", false],
    [100, "끝 0", true],
  ]);

  let depth = 0.2;

  function snapCm(cm) {
    return Math.round(clamp(cm, 0.1, 5) * 10) / 10;
  }
  function clientToCm(clientX) {
    const r = track.getBoundingClientRect();
    return snapCm(5 * (1 - (clientX - r.left) / r.width));
  }
  function paint() {
    const tr = track.getBoundingClientRect();
    const cr = canvas.getBoundingClientRect();
    const w = Math.max(tr.width, 1);
    const t = 1 - depth / 5;
    const bladeX = (tr.left - cr.left) + w * t;
    jacket.style.left = `${bladeX}px`;
    jacket.style.top = `${tr.top - cr.top + 36}px`;
    jacket.style.width = `${Math.max(16, w - w * t)}px`;
    stripper.style.left = `${clamp(bladeX - 24, 0, canvas.clientWidth - stripper.offsetWidth)}px`;
    stripper.style.top = `${tr.top - cr.top + 8}px`;
    read.textContent = `끝 ${which} · 칼날 ${depth.toFixed(1)} cm  · 띠에 맞춘 뒤 재킷을 벗기시오`;
  }

  requestAnimationFrame(() => {
    paint();
  });

  add(bindDrag(stripper, {
    container: canvas,
    onMove(x, y, ev) {
      place(stripper, ...clampTool(stripper, x, y, canvas));
      depth = clientToCm(ev.clientX);
      paint();
    },
  }));

  add(bindDrag(jacket, {
    container: canvas,
    onMove(x, y) {
      jacket.style.left = `${x}px`;
      jacket.style.top = `${y}px`;
    },
    onEnd(ev, meta) {
      const peeled = Math.hypot(meta.x - meta.x0, meta.y - meta.y0) > 70;
      if (!peeled) {
        paint();
        return;
      }
      if (Math.abs(depth - JOB.stripCm) <= JOB.stripTolCm) {
        end.stripped = true;
        end.stripCm = depth;
        api.go("untwist");
      } else {
        paint();
        api.reject(depth < JOB.stripCm
          ? `${depth.toFixed(1)}cm — 너무 짧습니다. 관통형은 약 3.0cm.`
          : `${depth.toFixed(1)}cm — 너무 깊습니다. 재킷이 상합니다.`);
      }
    },
  }));
}

/** Bouquet order: adjacent pairs, stripped end up. Index into T568B / end.wires. */
const FAN = ["wo", "o", "wg", "g", "blu", "wblu", "wbr", "br"];
const STRAIGHT_NEED = FAN.map((_, i) => 4 + (i % 3));
const STRAIGHT_MIN_PX = 64;
const VB_W = 220;
const VB_H = 340;

function untwist(root, api, add) {
  const end = endOf(api.state);
  const wrap = el(`<div class="stage-canvas" id="box"></div>`);
  root.appendChild(wrap);
  let bouquetOn = false;

  function paint() {
    api.primary(null);
    if (!allPairsUntwisted(end)) {
      wrap.innerHTML = `<div class="pairs" id="pairs"></div>`;
      const host = qs("#pairs", wrap);
      PAIRS.forEach((p, i) => {
        const a = WIRES[p.ids[0]];
        const b = WIRES[p.ids[1]];
        const card = el(`
          <div class="pair ${end.pairs[i] ? "done" : ""}" data-i="${i}">
            <i class="twist" style="--a:${a.hex};--b:${b.hex}"></i>
            <span>${p.name}${end.pairs[i] ? " · 풀림" : " · 끌어 풀기"}</span>
          </div>
        `);
        host.appendChild(card);
        if (!end.pairs[i]) bindFlick(card, () => {
          end.pairs[i] = true;
          paint();
        }, add, api, 36);
      });
      return;
    }
    mountBouquet();
  }

  function mountBouquet() {
    if (bouquetOn) {
      offerSort();
      return;
    }
    bouquetOn = true;
    const strokes = FAN.map((id, fanI) => (end.wires[T568B.indexOf(id)] ? STRAIGHT_NEED[fanI] : 0));
    wrap.innerHTML = `
      <div class="straight-lab">
        <p class="straight-hint">한 가닥씩 여러 번 문질러 당겨 펴세요.</p>
        <div class="bouquet" role="img" aria-label="세로로 세운 랜선. 아래는 재킷, 위는 가닥 여덟 줄.">
          <svg viewBox="0 0 ${VB_W} ${VB_H}" preserveAspectRatio="xMidYMax meet">
            <rect class="bouquet-pad" x="0" y="0" width="${VB_W}" height="${VB_H}"/>
            ${jacketBodySvg()}
            <g id="fan-wires">${FAN.map((id, fanI) => `
              <g class="strand-g" data-fan="${fanI}" data-id="${id}">
                <path class="strand-hit"/>
                <path class="strand-outline"/>
                <path class="strand-body"/>
                <path class="strand-stripe"/>
                <circle class="strand-tip" r="2.6"/>
              </g>`).join("")}</g>
            ${jacketRimSvg()}
          </svg>
        </div>
      </div>
    `;
    setPrompt("한 가닥씩 여러 번 문질러 당겨 펴세요.");
    const svg = qs("svg", wrap);
    const host = qs("#fan-wires", wrap);
    FAN.forEach((_, fanI) => paintStrand(fanI, strokes[fanI]));

    function paintStrand(fanI, count) {
      const id = FAN[fanI];
      const w = WIRES[id];
      const g = host.children[fanI];
      const pts = strandPoints(fanI, Math.min(1, count / STRAIGHT_NEED[fanI]));
      const d = pathFrom(pts);
      const tip = pts[pts.length - 1];
      qs(".strand-hit", g).setAttribute("d", d);
      qs(".strand-outline", g).setAttribute("d", d);
      const body = qs(".strand-body", g);
      body.setAttribute("d", d);
      body.setAttribute("stroke", w.hex);
      const stripe = qs(".strand-stripe", g);
      if (w.stripe) {
        stripe.setAttribute("d", d);
        stripe.setAttribute("stroke", w.stripe);
        stripe.setAttribute("stroke-dasharray", "5.5 3.2");
        stripe.classList.remove("hidden");
      } else {
        stripe.classList.add("hidden");
      }
      const tipEl = qs(".strand-tip", g);
      tipEl.setAttribute("cx", tip[0].toFixed(2));
      tipEl.setAttribute("cy", tip[1].toFixed(2));
      const done = count >= STRAIGHT_NEED[fanI];
      g.classList.toggle("done", done);
      g.setAttribute("aria-label", `${w.name}${done ? " 펴짐" : ""}`);
    }
    function offerSort() {
      if (allWiresStraight(end)) api.primary("색 정렬로", () => api.go("sort"));
      else api.primary(null);
    }

    let live = null;
    function toSvg(ev) {
      const ctm = svg.getScreenCTM();
      if (!ctm) return { x: 0, y: 0 };
      return new DOMPoint(ev.clientX, ev.clientY).matrixTransform(ctm.inverse());
    }
    function distTo(fanI, ev) {
      const path = qs(".strand-hit", host.children[fanI]);
      const pt = toSvg(ev);
      const len = path.getTotalLength();
      let min = Infinity;
      for (let t = 0; t <= 1; t += 0.04) {
        const p = path.getPointAtLength(len * t);
        min = Math.min(min, Math.hypot(p.x - pt.x, p.y - pt.y));
      }
      return min;
    }
    function pickWire(ev) {
      let best = null;
      let bestD = 20;
      FAN.forEach((_, i) => {
        if (end.wires[T568B.indexOf(FAN[i])]) return;
        const d = distTo(i, ev);
        if (d < bestD) {
          bestD = d;
          best = i;
        }
      });
      return best;
    }

    const down = (ev) => {
      if (ev.isPrimary === false) return;
      if (ev.button != null && ev.button !== 0) return;
      const fanI = pickWire(ev);
      if (fanI == null) return;
      if (end.wires[T568B.indexOf(FAN[fanI])]) return;
      ev.preventDefault();
      svg.setPointerCapture(ev.pointerId);
      live = {
        id: ev.pointerId,
        fanI,
        x: ev.clientX,
        y: ev.clientY,
        near: 0,
        along: 0,
      };
      host.children[fanI].classList.add("active");
    };
    const move = (ev) => {
      if (!live || ev.pointerId !== live.id) return;
      ev.preventDefault();
      const dx = ev.clientX - live.x;
      const dy = ev.clientY - live.y;
      const step = Math.hypot(dx, dy);
      live.x = ev.clientX;
      live.y = ev.clientY;
      if (distTo(live.fanI, ev) <= 34) {
        live.near += step;
        live.along += Math.abs(dy);
      }
    };
    const up = (ev) => {
      if (!live || ev.pointerId !== live.id) return;
      const s = live;
      live = null;
      host.children[s.fanI].classList.remove("active");
      try { svg.releasePointerCapture(ev.pointerId); } catch { /* already */ }
      const stateI = T568B.indexOf(FAN[s.fanI]);
      if (end.wires[stateI]) return;
      if (s.near < 14 && s.along < 14) {
        api.toast("한 가닥을 여러 번 문질러 당겨 펴세요.");
        return;
      }
      if (s.near < STRAIGHT_MIN_PX || s.along < 44) {
        api.toast("더 길게 문질러 당겨 주세요.");
        return;
      }
      strokes[s.fanI] += 1;
      if (strokes[s.fanI] >= STRAIGHT_NEED[s.fanI]) {
        end.wires[stateI] = true;
      }
      paintStrand(s.fanI, strokes[s.fanI]);
      offerSort();
    };

    svg.addEventListener("pointerdown", down);
    svg.addEventListener("pointermove", move);
    svg.addEventListener("pointerup", up);
    svg.addEventListener("pointercancel", up);
    add(() => {
      svg.removeEventListener("pointerdown", down);
      svg.removeEventListener("pointermove", move);
      svg.removeEventListener("pointerup", up);
      svg.removeEventListener("pointercancel", up);
    });
    offerSort();
  }

  paint();
}

function jacketBodySvg() {
  return `
    <g class="jacket-body" aria-hidden="true">
      <rect x="76" y="254" width="68" height="80" rx="12" fill="#2f462c" stroke="#1a1b14" stroke-width="2.2"/>
      <rect x="80" y="258" width="60" height="72" rx="10" fill="#3f5a3c"/>
      <path d="M88 266 v56" stroke="#6a8a62" stroke-width="8" stroke-linecap="round" opacity=".38"/>
      <path d="M130 270 v48" stroke="#243424" stroke-width="9" stroke-linecap="round" opacity=".28"/>
    </g>
  `;
}

function jacketRimSvg() {
  return `
    <g class="jacket-rim" aria-hidden="true">
      <ellipse cx="110" cy="254" rx="32" ry="10" fill="#4a6a46" stroke="#1a1b14" stroke-width="2"/>
      <ellipse cx="110" cy="252" rx="20" ry="6.4" fill="#1c1d17"/>
    </g>
  `;
}

function strandPoints(fanI, progress) {
  const startX = 110 + (fanI - 3.5) * 3.2;
  const startY = 252;
  const pair = Math.floor(fanI / 2);
  const inPair = fanI % 2;
  const tipX = 20 + pair * 52 + inPair * 20;
  const tipY = 16;
  const amp = (1 - progress) * (13 + (fanI % 3) * 2);
  const n = 12;
  const pts = [];
  for (let s = 0; s <= n; s++) {
    const t = s / n;
    const x = startX + (tipX - startX) * t;
    const y = startY + (tipY - startY) * t;
    const mid = Math.sin(t * Math.PI);
    const wig = Math.sin((t * 3.35 + fanI * 0.62) * Math.PI) * amp * (0.3 + 0.7 * mid);
    const wig2 = Math.cos((t * 6.2 + fanI * 1.1) * Math.PI) * amp * 0.26 * t;
    pts.push([x + wig + wig2, y]);
  }
  return pts;
}

function pathFrom(pts) {
  if (pts.length < 2) return "";
  let d = `M${pts[0][0].toFixed(2)},${pts[0][1].toFixed(2)}`;
  for (let i = 1; i < pts.length - 1; i++) {
    const xc = (pts[i][0] + pts[i + 1][0]) / 2;
    const yc = (pts[i][1] + pts[i + 1][1]) / 2;
    d += ` Q${pts[i][0].toFixed(2)},${pts[i][1].toFixed(2)} ${xc.toFixed(2)},${yc.toFixed(2)}`;
  }
  const last = pts[pts.length - 1];
  d += ` T${last[0].toFixed(2)},${last[1].toFixed(2)}`;
  return d;
}

function bindFlick(node, onFlick, add, api, need = 48) {
  let x0 = 0;
  let y0 = 0;
  const down = (e) => {
    if (e.button != null && e.button !== 0) return;
    e.preventDefault();
    node.setPointerCapture(e.pointerId);
    x0 = e.clientX;
    y0 = e.clientY;
  };
  const up = (e) => {
    const d = Math.hypot(e.clientX - x0, e.clientY - y0);
    if (d >= need) onFlick();
    else api.toast("더 길게 끌어 주세요.");
  };
  node.addEventListener("pointerdown", down);
  node.addEventListener("pointerup", up);
  add(() => {
    node.removeEventListener("pointerdown", down);
    node.removeEventListener("pointerup", up);
  });
}

function sort(root, api, add) {
  const end = endOf(api.state);
  const box = el(`<div class="stage-canvas"><div class="sort-wrap"><div class="slots" id="slots"></div><div class="tray" id="tray"></div></div></div>`);
  root.appendChild(box);
  const slotsEl = qs("#slots", box);
  const trayEl = qs("#tray", box);

  function paint() {
    slotsEl.innerHTML = "";
    trayEl.innerHTML = "";
    T568B.forEach((_, i) => {
      const id = end.slots[i];
      const slot = el(`<div class="slot ${id ? "filled" : ""}" data-i="${i}"><span class="num">${i + 1}</span></div>`);
      if (id) {
        const w = WIRES[id];
        slot.setAttribute("style", wireStyle(id, true));
        const shaft = el(`<span class="slot-wire" data-id="${id}" style="${wireStyle(id, true)}">${w.name}</span>`);
        slot.appendChild(shaft);
        bindWire(shaft, id);
      }
      slotsEl.appendChild(slot);
    });
    end.tray.filter((id) => !end.slots.includes(id)).forEach((id) => {
      const w = WIRES[id];
      const chip = el(`<span class="wire-chip" data-id="${id}" style="${wireStyle(id)}">${w.name}</span>`);
      trayEl.appendChild(chip);
      bindWire(chip, id);
    });
    if (allSlotsFilled(end)) {
      api.primary("이 순서로 진행", () => api.go(end.bootOn ? "insert" : "boot"));
    } else {
      api.primary(null);
    }
  }

  function bindWire(chip, id) {
    bindPickDrag(chip, {
      add,
      onTap() { api.toast("칸으로 끌어 넣으세요."); },
      onDrop(ev) {
        const under = document.elementFromPoint(ev.clientX, ev.clientY);
        const slot = under && under.closest(".slot");
        const trayHit = under && (under.id === "tray" || under.closest("#tray"));
        if (slot) {
          const i = Number(slot.dataset.i);
          end.slots.forEach((v, j) => { if (v === id) end.slots[j] = null; });
          end.slots[i] = id;
          paint();
        } else if (trayHit) {
          end.slots.forEach((v, j) => { if (v === id) end.slots[j] = null; });
          paint();
        }
      },
    });
  }

  paint();
}

function boot(root, api, add) {
  const end = endOf(api.state);
  if (end.bootOn) {
    api.go("insert");
    return;
  }
  const box = el(`
    <div class="stage-canvas">
      <div class="work-row" id="row">
        <p class="insert-hint">← 왼쪽 구멍으로</p>
        ${utpRunMarkup(end)}
        ${bootPartMarkup(slotIds(end))}
      </div>
    </div>
  `);
  root.appendChild(box);
  const row = qs("#row", box);
  const cable = qs("#cable", box);
  const bootEl = qs("#boot", box);
  const bootLanes = qs("#boot-lanes", box);
  let cableHome = [8, 40];
  let bootHome = [200, 40];
  let seated = false;

  function homes() {
    const h = row.clientHeight;
    const w = row.clientWidth;
    cableHome = [8, Math.max(10, h * 0.36)];
    bootHome = [Math.max(200, Math.min(w * 0.56, w - bootEl.offsetWidth - 90)), Math.max(10, h * 0.34)];
  }
  function paintBootLanes(t) {
    const pct = Math.max(0, Math.min(1, t));
    bootLanes.style.width = `${pct * 70}%`;
    bootLanes.classList.toggle("on", pct > 0.1);
  }
  function bootDepth() {
    const C = cable.getBoundingClientRect();
    const P = bootEl.getBoundingClientRect();
    if (C.left + C.width / 2 >= P.left + P.width / 2) return 0;
    return Math.max(0, Math.min(1, (C.right - P.left) / (P.width * 0.9)));
  }
  function snapBootOn() {
    seated = true;
    end.bootOn = true;
    bootEl.classList.add("seated");
    const cr = cable.getBoundingClientRect();
    const jr = qs(".utp-jacket", cable).getBoundingClientRect();
    const rr = row.getBoundingClientRect();
    place(bootEl, jr.right - rr.left - 80, cr.top - rr.top + (cr.height - bootEl.offsetHeight) / 2);
    paintBootLanes(1);
    api.primary("플러그 삽입", () => api.go("insert"));
  }
  function trySeat(moved) {
    const v = leftInsertVerdict(cable, bootEl);
    if (v === "ok") {
      snapBootOn();
      return;
    }
    if (INSERT_REASON[v]) {
      const home = moved === bootEl ? bootHome : cableHome;
      bounceReject(moved, home[0], home[1], api, INSERT_REASON[v]);
      paintBootLanes(0);
      api.primary(null);
    }
  }

  requestAnimationFrame(() => {
    homes();
    place(cable, ...cableHome);
    place(bootEl, ...bootHome);
  });

  add(bindDrag(cable, {
    container: row,
    onMove(x, y) {
      place(cable, ...clampPart(cable, x, y, row));
      if (seated) snapBootOn();
      else paintBootLanes(leftInsertVerdict(cable, bootEl) === "from-right" ? 0 : bootDepth());
    },
    onEnd() {
      if (!seated) trySeat(cable);
    },
  }));
  add(bindDrag(bootEl, {
    container: row,
    onMove(x, y) {
      if (seated) {
        snapBootOn();
        return;
      }
      place(bootEl, ...clampPart(bootEl, x, y, row));
      paintBootLanes(leftInsertVerdict(cable, bootEl) === "from-right" ? 0 : bootDepth());
    },
    onEnd() {
      if (!seated) trySeat(bootEl);
    },
  }));
}

function insert(root, api, add) {
  const end = endOf(api.state);
  if (!end.bootOn) {
    api.go("boot");
    return;
  }
  const ids = slotIds(end);
  const box = el(`
    <div class="stage-canvas">
      <div class="work-row" id="row">
        <p class="insert-hint">← 왼쪽 구멍으로</p>
        ${utpRunMarkup(end, { bootOn: true })}
        ${plugPartMarkup(ids)}
      </div>
    </div>
  `);
  root.appendChild(box);
  const row = qs("#row", box);
  const cable = qs("#cable", box);
  const plug = qs("#plug", box);
  const lanes = qs("#lanes", box);
  const emerge = qs("#emerge", box);
  let cableHome = [8, 40];
  let plugHome = [240, 36];

  function homes() {
    const h = row.clientHeight;
    const w = row.clientWidth;
    cableHome = [8, Math.max(10, h * 0.36)];
    plugHome = [Math.max(240, Math.min(w * 0.58, w - plug.offsetWidth - 90)), Math.max(8, h * 0.28)];
  }
  function paintThrough(t) {
    const pct = Math.max(0, Math.min(1, t));
    lanes.style.width = `${pct * 72}%`;
    lanes.classList.toggle("on", pct > 0.08);
    const out = Math.max(0, (pct - 0.55) / 0.45);
    emerge.style.width = `${out * 28}px`;
    emerge.classList.toggle("on", out > 0.15);
  }
  function depthT() {
    const C = cable.getBoundingClientRect();
    const P = plug.getBoundingClientRect();
    if (C.left + C.width / 2 >= P.left + P.width / 2) return 0;
    return Math.max(0, Math.min(1, (C.right - P.left) / (P.width * 0.85)));
  }
  function snapIn() {
    const pr = plug.getBoundingClientRect();
    const rr = row.getBoundingClientRect();
    const y = pr.top - rr.top + (pr.height - cable.offsetHeight) / 2;
    place(cable, pr.left - rr.left - cable.offsetWidth + 48, clamp(y, 0, row.clientHeight - cable.offsetHeight));
    paintThrough(1);
    end.inserted = true;
    api.primary("출구 확인", () => api.go("inspect"));
  }
  function trySeat(moved) {
    const v = leftInsertVerdict(cable, plug);
    if (v === "ok") {
      snapIn();
      return;
    }
    if (INSERT_REASON[v]) {
      end.inserted = false;
      const home = moved === plug ? plugHome : cableHome;
      bounceReject(moved, home[0], home[1], api, INSERT_REASON[v]);
      paintThrough(0);
      api.primary(null);
      return;
    }
    end.inserted = false;
    paintThrough(0);
    api.primary(null);
  }

  requestAnimationFrame(() => {
    homes();
    place(cable, ...cableHome);
    place(plug, ...plugHome);
    paintThrough(0);
  });

  add(bindDrag(cable, {
    container: row,
    onMove(x, y) {
      place(cable, ...clampPart(cable, x, y, row));
      const v = leftInsertVerdict(cable, plug);
      paintThrough(v === "from-right" ? 0 : depthT());
    },
    onEnd() { trySeat(cable); },
  }));
  add(bindDrag(plug, {
    container: row,
    onMove(x, y) {
      place(plug, ...clampPart(plug, x, y, row));
      const v = leftInsertVerdict(cable, plug);
      paintThrough(v === "from-right" ? 0 : depthT());
    },
    onEnd() {
      if (leftInsertVerdict(cable, plug) === "idle") {
        plugHome = [
          parseFloat(plug.style.left) || plugHome[0],
          parseFloat(plug.style.top) || plugHome[1],
        ];
      }
      trySeat(plug);
    },
  }));
}

/** Front-on pass-through RJ45: latch down, pin 1 left, wires exit the face. */
function inspectFaceSvg() {
  return `
    <svg class="inspect-plug-svg" viewBox="0 0 400 250" aria-hidden="true">
      <path d="M48 22 H336 L360 46 V132 L336 148 H48 L24 132 V46 Z" fill="#cfdcd6" stroke="#1a1b14" stroke-width="2.6" stroke-linejoin="round"/>
      <path d="M48 22 H336 L352 36 H32 Z" fill="#e4eeea" stroke="#1a1b14" stroke-width="1.5"/>
      <path d="M360 46 V132 L336 148 V36 Z" fill="#9aada6" stroke="#1a1b14" stroke-width="1.5"/>
      <path d="M40 50 H360 V78 H40 Z" fill="#2a3330" stroke="#1a1b14" stroke-width="1.7"/>
      <g fill="#d4b12a" stroke="#6a5810" stroke-width=".85">
        <rect x="52" y="52" width="30" height="24" rx="1"/>
        <rect x="90" y="52" width="30" height="24" rx="1"/>
        <rect x="128" y="52" width="30" height="24" rx="1"/>
        <rect x="166" y="52" width="30" height="24" rx="1"/>
        <rect x="204" y="52" width="30" height="24" rx="1"/>
        <rect x="242" y="52" width="30" height="24" rx="1"/>
        <rect x="280" y="52" width="30" height="24" rx="1"/>
        <rect x="318" y="52" width="30" height="24" rx="1"/>
      </g>
      <path d="M48 86 H336 V138 H48 Z" fill="#d8e8e2" fill-opacity=".28"/>
      <path d="M156 148 L244 148 L262 196 L138 196 Z" fill="#aebbb5" stroke="#1a1b14" stroke-width="2.3" stroke-linejoin="round"/>
      <path d="M166 156 L234 156 L246 186 L154 186 Z" fill="#7d8b85" stroke="#1a1b14" stroke-width="1.4"/>
      <path d="M184 166 H216" stroke="#efe6cf" stroke-width="3.2" stroke-linecap="round"/>
    </svg>`;
}

function inspectPlugMarkup(ids) {
  const exits = ids.map((id, i) => {
    const w = WIRES[id] || WIRES.wo;
    return `
      <div class="inspect-exit">
        <b class="inspect-hole" aria-hidden="true"></b>
        <i class="inspect-stub" style="${wireStyle(id)}"></i>
        <span class="inspect-pin">${i + 1}</span>
        <small>${w.short}</small>
      </div>`;
  }).join("");
  return `
    <div class="inspect-plug" role="img" aria-label="관통형 RJ45 앞면 출구">
      <div class="inspect-side" aria-hidden="true">
        <div class="utp-jacket"><span class="jacket-etch">CAT5E</span></div>
        <div class="rj45-boot on-cable">${bootSvg()}</div>
        <div class="inspect-side-plug">${plugSvg()}</div>
      </div>
      <div class="inspect-plug-frame">
        ${inspectFaceSvg()}
        <div class="inspect-exits">${exits}</div>
      </div>
    </div>`;
}

function inspect(root, api, add) {
  const end = endOf(api.state);
  const ids = slotIds(end);
  const box = el(`
    <div class="stage-canvas">
      <div class="inspect-stage">
        <p class="inspect-caption">앞면 · 출구 여덟 구멍 · 핀 1이 왼쪽</p>
        ${inspectPlugMarkup(ids)}
        <div class="inspect-actions">
          <button type="button" class="danger" id="pull">순서 틀림 · 빼기</button>
          <button type="button" class="ok" id="ok">색이 맞다 · 압착</button>
        </div>
      </div>
    </div>
  `);
  root.appendChild(box);
  qs("#pull", box).onclick = () => api.pullOut();
  qs("#ok", box).onclick = () => {
    if (isT568B(end.slots)) api.go("crimp");
    else api.wrongInspect();
  };
  add(() => {});
}

const CRIMP_PLIER_SVG = `
  <svg class="tool-svg crimp-plier-svg" viewBox="0 0 300 170" aria-hidden="true">
    <g class="handle-lower">
      <path d="M176 94 L286 148 C296 153 304 146 298 137 L186 88 Z" fill="#2c2c28" stroke="#1a1b14" stroke-width="2.4" stroke-linejoin="round"/>
      <path d="M204 108 L276 142" stroke="#5a5a52" stroke-width="2.2" opacity=".35"/>
    </g>
    <g class="handle-upper">
      <path d="M176 78 L284 24 C294 19 304 26 296 35 L184 86 Z" fill="#9c1f1f" stroke="#1a1b14" stroke-width="2.4" stroke-linejoin="round"/>
      <path d="M204 66 L274 32" stroke="#d46a5a" stroke-width="2.2" opacity=".4"/>
    </g>
    <path fill-rule="evenodd" d="M8 18 H176 L186 86 L176 154 H8 C2 150 0 132 2 86 C0 40 2 22 8 18 Z M12 30 H168 V128 H12 Z" fill="#7d868e" stroke="#1a1b14" stroke-width="2.4" stroke-linejoin="round"/>
    <path d="M14 22 H172 L180 36 H16 Z" fill="#c5ccd2" stroke="#1a1b14" stroke-width="1.2"/>
    <path d="M12 128 H168 L166 148 H14 Z" fill="#5a6268" stroke="#1a1b14" stroke-width="1.6"/>
    <rect x="161" y="30" width="7" height="98" fill="#d8dde0" stroke="#1a1b14" stroke-width="1.2"/>
    <g fill="#c9a227" stroke="#5a4a10" stroke-width=".8">
      <rect x="22" y="32" width="14" height="14"/>
      <rect x="39" y="32" width="14" height="14"/>
      <rect x="56" y="32" width="14" height="14"/>
      <rect x="73" y="32" width="14" height="14"/>
      <rect x="90" y="32" width="14" height="14"/>
      <rect x="107" y="32" width="14" height="14"/>
      <rect x="124" y="32" width="14" height="14"/>
      <rect x="141" y="32" width="14" height="14"/>
    </g>
    <path d="M20 122 H156" stroke="#c9b888" stroke-width="2.2"/>
    <circle cx="176" cy="86" r="13" fill="#c9b888" stroke="#1a1b14" stroke-width="2.4"/>
    <circle cx="176" cy="86" r="4.4" fill="#6e7064"/>
  </svg>`;

function crimp(root, api, add) {
  const end = endOf(api.state);
  const box = el(`
    <div class="stage-canvas crimp-stage">
      <div class="crimp-bench" id="row">
        ${plugPartMarkup(slotIds(end), { emerge: true })}
        <div class="crimp-plier tool" id="crimper" role="img" aria-label="크림퍼">
          <div class="crimp-plier-body">
            ${CRIMP_PLIER_SVG}
            <div class="crimp-die" id="jaw"></div>
          </div>
          <span class="tool-label">크림퍼</span>
        </div>
        <div class="hold-meter hidden" id="meter"><i></i></div>
      </div>
    </div>
  `);
  root.appendChild(box);
  const row = qs("#row", box);
  const plug = qs("#plug", box);
  const crimper = qs("#crimper", box);
  const jaw = qs("#jaw", box);
  const meter = qs("#meter", box);
  const bar = qs("i", meter);
  let seated = false;

  requestAnimationFrame(() => {
    const side = row.clientWidth - crimper.offsetWidth - plug.offsetWidth;
    if (side > 28) {
      place(plug, 10, Math.max(10, (row.clientHeight - plug.offsetHeight) * 0.42));
      place(crimper, row.clientWidth - crimper.offsetWidth - 6, Math.max(4, (row.clientHeight - crimper.offsetHeight) * 0.16));
    } else {
      place(crimper, Math.max(4, (row.clientWidth - crimper.offsetWidth) * 0.5), 2);
      place(plug, 8, Math.max(crimper.offsetHeight - 8, row.clientHeight - plug.offsetHeight - 26));
    }
  });

  function inJaws() {
    return hits(jaw, plug, 0.28) || centerDist(jaw, plug) < 36;
  }
  function snapIntoJaws() {
    const pr = plug.getBoundingClientRect();
    const jr = jaw.getBoundingClientRect();
    const dx = (pr.left + pr.width / 2) - (jr.left + jr.width / 2);
    const dy = (pr.top + pr.height / 2) - (jr.top + jr.height / 2);
    place(crimper, ...clampTool(crimper, crimper.offsetLeft + dx, crimper.offsetTop + dy, row));
  }
  function seatCheck() {
    const was = seated;
    seated = inJaws();
    crimper.classList.toggle("on-plug", seated);
    meter.classList.toggle("hidden", !seated);
    if (seated) {
      snapIntoJaws();
      if (!was) api.toast("크림퍼를 쥐고 있으세요.");
    }
  }

  add(bindDrag(crimper, {
    container: row,
    onMove(x, y) {
      place(crimper, ...clampTool(crimper, x, y, row));
      crimper.classList.toggle("on-plug", inJaws());
    },
    onEnd: seatCheck,
  }));

  add(bindHold(crimper, {
    ms: 1400,
    enabled: () => seated,
    onProgress(t) {
      bar.style.width = `${t * 100}%`;
      crimper.classList.add("squeezing");
      plug.classList.toggle("cutting", t > 0.55);
    },
    onCancel() {
      bar.style.width = "0";
      crimper.classList.remove("squeezing");
      plug.classList.remove("cutting");
    },
    onDone() {
      end.crimped = true;
      api.finishCrimp();
    },
  }));
}

function complete(root, api) {
  const box = el(`
    <div class="stage-canvas">
      <div class="done-board">
        <div class="ink pass">통과</div>
        <p>양쪽 관통형 · 양끝 T568B · 부트 장착 · 1m 스트레이트</p>
      </div>
    </div>
  `);
  root.appendChild(box);
  api.primary("새 의뢰", () => api.reset());
}
