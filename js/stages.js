import { JOB, REELS, WIRES, PAIRS, T568B } from "./config.js";
import {
  endOf, isT568B, allPairsUntwisted, allWiresStraight, allSlotsFilled,
} from "./state.js";
import {
  bindDrag, bindHold, bindPickDrag, place, clamp, hits, centerDist,
} from "./drag.js";
import { qs, wireStyle } from "./ui.js";

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

function welcome(root, api, add) {
  const box = el(`
    <div class="stage-canvas">
      <div class="welcome-card">
        <h2>오늘 의뢰</h2>
        <ul>
          <li>규격 Cat5e — 다른 릴은 반려</li>
          <li>길이 1.00m (±5cm)</li>
          <li>양끝 T568B 스트레이트</li>
          <li>관통형 RJ45 — 탈피 약 3cm, 앞에서 색 확인</li>
          <li>부트는 플러그보다 먼저, 양쪽 모두</li>
        </ul>
        <div class="accept-box" id="accept">접수 도장을 여기로</div>
      </div>
      <div class="stamp-drag" id="ink">접수</div>
    </div>
  `);
  root.appendChild(box);
  const ink = qs("#ink", box);
  const accept = qs("#accept", box);
  add(bindDrag(ink, {
    container: box,
    onMove(x, y) { place(ink, x, y); },
    onEnd() {
      if (hits(ink, accept, 0.22)) api.go("reel");
    },
  }));
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

function untwist(root, api, add) {
  const end = endOf(api.state);
  const wrap = el(`<div class="stage-canvas" id="box"></div>`);
  root.appendChild(wrap);

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
    wrap.innerHTML = `<div class="straights" id="straights"></div>`;
    const host = qs("#straights", wrap);
    T568B.forEach((id, i) => {
      const w = WIRES[id];
      const card = el(`
        <div class="straight-wire ${end.wires[i] ? "done" : ""}" data-i="${i}">
          <i class="strand" style="${wireStyle(id)}"></i>
          <span>${w.name}${end.wires[i] ? " · 펴짐" : " · 잡아 펴기"}</span>
        </div>
      `);
      host.appendChild(card);
      if (!end.wires[i]) bindFlick(card, () => {
        end.wires[i] = true;
        paint();
      }, add, api, 36);
    });
    if (allWiresStraight(end)) {
      api.primary("색 정렬로", () => api.go("sort"));
    }
  }
  paint();
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
        const chip = el(`<span class="wire-chip" data-id="${id}" style="${wireStyle(id)}">${w.name}</span>`);
        slot.appendChild(chip);
        bindWire(chip, id);
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
        <div class="cable-horiz" id="cable"></div>
        <div class="plug-ghost">플러그는 부트 후</div>
        <div class="boot" id="boot">부트</div>
      </div>
    </div>
  `);
  root.appendChild(box);
  const row = qs("#row", box);
  const cable = qs("#cable", box);
  const bootEl = qs("#boot", box);
  requestAnimationFrame(() => place(bootEl, row.clientWidth - 100, 24));
  add(bindDrag(bootEl, {
    container: row,
    onMove(x, y) {
      place(bootEl, clamp(x, 0, row.clientWidth - 84), clamp(y, 0, row.clientHeight - 48));
    },
    onEnd() {
      if (hits(bootEl, cable, 0.04) || centerDist(bootEl, cable) < 150) {
        end.bootOn = true;
        bootEl.style.left = `${cable.offsetLeft + cable.offsetWidth - 36}px`;
        bootEl.style.top = `${cable.offsetTop - 8}px`;
        api.primary("플러그 삽입", () => api.go("insert"));
      }
    },
  }));
}

function insert(root, api, add) {
  const end = endOf(api.state);
  if (!end.bootOn) {
    api.go("boot");
    return;
  }
  const colors = end.slots.map((id) => WIRES[id] || WIRES.wo);
  const box = el(`
    <div class="stage-canvas">
      <div class="work-row" id="row">
        <div class="pt-plug" id="plug">
          <div style="padding:6px 8px;font-size:0.72rem;font-weight:800">관통형 전면</div>
          <div class="holes" id="holes">${colors.map(() => "<b></b>").join("")}</div>
          <div class="emerge" id="emerge"></div>
        </div>
        <div class="bundle" id="bundle">${colors.map((w) => `<i style="${wireStyle(w.id)}"></i>`).join("")}</div>
      </div>
    </div>
  `);
  root.appendChild(box);
  const row = qs("#row", box);
  const plug = qs("#plug", box);
  const bundle = qs("#bundle", box);
  const emerge = qs("#emerge", box);
  const holes = qs("#holes", box);

  requestAnimationFrame(() => place(bundle, 10, row.clientHeight * 0.42));

  function showEmerge(on) {
    emerge.innerHTML = on
      ? colors.map((w) => `<i style="${wireStyle(w.id)}"></i>`).join("")
      : "";
    [...holes.children].forEach((h, i) => {
      h.classList.toggle("on", on);
      if (on) h.style.background = colors[i].stripe || colors[i].hex;
    });
  }

  function seated() {
    return hits(bundle, plug, 0.04) || centerDist(bundle, plug) < 140;
  }
  add(bindDrag(bundle, {
    container: row,
    onMove(x, y) {
      place(bundle, clamp(x, 0, row.clientWidth - 80), clamp(y, 0, row.clientHeight - 36));
      showEmerge(seated());
    },
    onEnd() {
      if (seated()) {
        end.inserted = true;
        const pr = plug.getBoundingClientRect();
        const rr = row.getBoundingClientRect();
        place(bundle, pr.left - rr.left - 70, pr.top - rr.top + 16);
        showEmerge(true);
        api.primary("출구 확인", () => api.go("inspect"));
      } else {
        showEmerge(false);
        api.primary(null);
      }
    },
  }));
}

function inspect(root, api, add) {
  const end = endOf(api.state);
  const box = el(`
    <div class="stage-canvas">
      <div class="face">
        <div class="magnify">
          <h3>관통형 앞면 · 출구 여덟 구멍</h3>
          <div class="holes-row" id="holes"></div>
        </div>
        <div class="inspect-actions">
          <button type="button" class="danger" id="pull">순서 틀림 · 빼기</button>
          <button type="button" class="ok" id="ok">색이 맞다 · 압착</button>
        </div>
      </div>
    </div>
  `);
  root.appendChild(box);
  const row = qs("#holes", box);
  end.slots.forEach((id, i) => {
    const w = WIRES[id];
    row.appendChild(el(`
      <div class="hole">
        <div class="circ" style="${wireStyle(id)}"></div>
        ${i + 1} ${w.short}<br>${w.name}
      </div>
    `));
  });
  qs("#pull", box).onclick = () => api.pullOut();
  qs("#ok", box).onclick = () => {
    if (isT568B(end.slots)) api.go("crimp");
    else api.wrongInspect();
  };
  add(() => {});
}

function crimp(root, api, add) {
  const end = endOf(api.state);
  const box = el(`
    <div class="stage-canvas">
      <div class="work-row" id="row">
        <div class="pt-plug" id="plug" style="left:30%;right:auto;top:32%">
          <div style="padding:6px;font-size:0.75rem;font-weight:800">여분 돌출</div>
          <div class="emerge" style="right:-10px">${end.slots.map((id) => `<i style="${wireStyle(id)}"></i>`).join("")}</div>
        </div>
        ${toolMarkup("crimper", "크림퍼")}
        <div class="hold-meter hidden" id="meter"><i></i></div>
      </div>
    </div>
  `);
  root.appendChild(box);
  const row = qs("#row", box);
  const plug = qs("#plug", box);
  const crimper = qs("#crimper", box);
  const meter = qs("#meter", box);
  const bar = qs("i", meter);
  let seated = false;

  requestAnimationFrame(() => place(crimper, Math.max(8, row.clientWidth - crimper.offsetWidth - 8), 12));

  function seatCheck() {
    seated = hits(crimper, plug, 0.05) || centerDist(crimper, plug) < 130;
    meter.classList.toggle("hidden", !seated);
    if (seated) api.toast("크림퍼를 쥐고 있으세요.");
  }

  add(bindDrag(crimper, {
    container: row,
    onMove(x, y) {
      place(crimper, ...clampTool(crimper, x, y, row));
    },
    onEnd: seatCheck,
  }));

  add(bindHold(crimper, {
    ms: 1400,
    enabled: () => seated,
    onProgress(t) { bar.style.width = `${t * 100}%`; },
    onCancel() { bar.style.width = "0"; },
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
