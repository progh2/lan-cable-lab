import { JOB, REELS, WIRES, PAIRS, T568B } from "./config.js";
import {
  endOf, isT568B, allPairsUntwisted, allWiresStraight, allSlotsFilled,
} from "./state.js";
import {
  bindDrag, bindHold, bindPickDrag, place, clamp, hits,
} from "./drag.js";
import { qs, wireStyle } from "./ui.js";

function el(html) {
  const d = document.createElement("div");
  d.innerHTML = html.trim();
  return d.firstElementChild;
}

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

function cut(root, api, add) {
  const box = el(`
    <div class="stage-canvas">
      <div class="length-read" id="read">0.20 m</div>
      <div class="ruler" id="ruler"></div>
      <div class="cut-run" id="run">
        <div class="cable-body" id="body"></div>
        <div class="cable-tip" id="tip"></div>
        <div class="cutter tool" id="cutter">커터</div>
      </div>
    </div>
  `);
  root.appendChild(box);
  const ruler = qs("#ruler", box);
  const run = qs("#run", box);
  const body = qs("#body", box);
  const tip = qs("#tip", box);
  const cutter = qs("#cutter", box);
  const read = qs("#read", box);
  ticks(ruler, [
    [0, "0", true],
    [33.3, "50cm", true],
    [66.7, "1.0m", true],
    [100, "1.5m", true],
  ]);

  let meters = 0.2;
  let cutterOn = false;

  function trackW() {
    return Math.max(ruler.clientWidth || run.clientWidth || 1, 1);
  }
  function xToM(x) {
    return clamp((x / trackW()) * 1.5, 0.05, 1.5);
  }
  function paint() {
    const w = trackW();
    const tipX = (meters / 1.5) * w;
    body.style.left = "8px";
    body.style.width = `${Math.max(20, tipX - 4)}px`;
    tip.style.left = `${tipX}px`;
    read.textContent = `${meters.toFixed(2)} m`;
  }
  function checkCutter() {
    const c = cutter.getBoundingClientRect();
    const b = body.getBoundingClientRect();
    const mid = c.left + c.width / 2;
    const on = mid >= b.left && mid <= b.right + 16 && Math.abs((c.top + c.height / 2) - (b.top + b.height / 2)) < 56;
    cutterOn = on;
    if (on) {
      const local = mid - ruler.getBoundingClientRect().left;
      meters = xToM(local);
      paint();
      api.primary("이 길이로 자르기", commit);
    } else {
      api.primary(null);
    }
  }
  function commit() {
    if (Math.abs(meters - JOB.lengthM) <= JOB.lengthTolM) {
      api.state.cutLengthM = meters;
      api.go("strip");
    } else {
      api.reject(meters < JOB.lengthM ? `${meters.toFixed(2)}m — 너무 짧습니다. 1.00m ±5cm.` : `${meters.toFixed(2)}m — 너무 깁니다. 1.00m ±5cm.`);
    }
  }

  requestAnimationFrame(() => {
    paint();
    place(cutter, 16, run.clientHeight - 80);
  });

  add(bindDrag(tip, {
    container: run,
    axis: "x",
    onMove(x) {
      meters = xToM(x);
      paint();
      checkCutter();
    },
    onEnd: checkCutter,
  }));
  add(bindDrag(cutter, {
    container: run,
    onMove(x, y) {
      place(cutter, clamp(x, 0, run.clientWidth - 76), clamp(y, 0, run.clientHeight - 64));
      checkCutter();
    },
    onEnd: checkCutter,
  }));
}

function strip(root, api, add) {
  const end = endOf(api.state);
  const which = api.state.currentEnd;
  const box = el(`
    <div class="stage-canvas">
      <div class="depth-read" id="read">끝 ${which} · 칼날 — cm</div>
      <div class="cm-ruler" id="ruler"></div>
      <div class="cut-run" id="run">
        <div class="strip-cable" id="cable"></div>
        <div class="jacket-peel" id="jacket"></div>
        <div class="stripper tool" id="stripper">스트리퍼</div>
      </div>
    </div>
  `);
  root.appendChild(box);
  const ruler = qs("#ruler", box);
  const run = qs("#run", box);
  const cable = qs("#cable", box);
  const jacket = qs("#jacket", box);
  const stripper = qs("#stripper", box);
  const read = qs("#read", box);
  ticks(ruler, [
    [0, "5cm", true],
    [20, "4", false],
    [40, "3cm", true],
    [60, "2", false],
    [80, "1", false],
    [100, "0 끝", true],
  ]);

  let depth = 0.2;

  function cableBox() {
    return cable.getBoundingClientRect();
  }
  function setDepthFromX(clientX) {
    const r = cableBox();
    const t = clamp((clientX - r.left) / r.width, 0, 1);
    depth = clamp(5 * (1 - t), 0.1, 5);
    paint();
  }
  function paint() {
    const r = cable.getBoundingClientRect();
    const parent = run.getBoundingClientRect();
    const t = 1 - depth / 5;
    const bladeX = r.left - parent.left + r.width * t;
    jacket.style.left = `${bladeX}px`;
    jacket.style.width = `${Math.max(8, r.right - parent.left - bladeX)}px`;
    stripper.style.left = `${bladeX - 18}px`;
    read.textContent = `끝 ${which} · 칼날 ${depth.toFixed(1)} cm`;
  }

  requestAnimationFrame(() => {
    place(stripper, run.clientWidth - 90, 100);
    paint();
  });

  add(bindDrag(stripper, {
    container: run,
    onMove(x, y, ev) {
      place(stripper, clamp(x, 0, run.clientWidth - 70), clamp(y, 0, run.clientHeight - 58));
      setDepthFromX(ev.clientX);
    },
  }));

  add(bindDrag(jacket, {
    container: run,
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
            <div class="twist" style="--a:${a.hex};--b:${b.hex}"></div>
            <span>${p.name}${end.pairs[i] ? " · 풀림" : " · 끌어 풀기"}</span>
          </div>
        `);
        host.appendChild(card);
        if (!end.pairs[i]) bindFlick(card, () => {
          end.pairs[i] = true;
          paint();
        }, add, api);
      });
      return;
    }
    wrap.innerHTML = `<div class="straights" id="straights"></div>`;
    const host = qs("#straights", wrap);
    T568B.forEach((id, i) => {
      const w = WIRES[id];
      const card = el(`
        <div class="straight-wire ${end.wires[i] ? "done" : ""}" data-i="${i}" style="${wireStyle(id)}">
          ${w.name}${end.wires[i] ? " · 펴짐" : " · 잡아 펴기"}
        </div>
      `);
      host.appendChild(card);
      if (!end.wires[i]) bindFlick(card, () => {
        end.wires[i] = true;
        paint();
      }, add, api, 56);
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
      place(bootEl, clamp(x, 0, row.clientWidth - 70), clamp(y, 0, row.clientHeight - 40));
    },
    onEnd() {
      if (hits(bootEl, cable, 0.18)) {
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

  add(bindDrag(bundle, {
    container: row,
    onMove(x, y) {
      place(bundle, clamp(x, 0, row.clientWidth - 80), clamp(y, 0, row.clientHeight - 36));
      const near = hits(bundle, plug, 0.12);
      showEmerge(near);
    },
    onEnd() {
      if (hits(bundle, plug, 0.2)) {
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
        ${i + 1}<br>${w.short}
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
        <div class="crimper" id="crimper">크림퍼</div>
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

  requestAnimationFrame(() => place(crimper, row.clientWidth - 120, 16));

  function seatCheck() {
    seated = hits(crimper, plug, 0.2);
    meter.classList.toggle("hidden", !seated);
    if (seated) api.toast("크림퍼를 쥐고 있으세요.");
  }

  add(bindDrag(crimper, {
    container: row,
    onMove(x, y) {
      place(crimper, clamp(x, 0, row.clientWidth - 100), clamp(y, 0, row.clientHeight - 72));
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
