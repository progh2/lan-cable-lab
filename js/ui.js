import { CATS, COACH, WIRE_DEFS, T568A, T568B, LENGTHS, COMMON_MISTAKES } from "./config.js";
import { endState } from "./state.js";

export function qs(sel) {
  return document.querySelector(sel);
}

export function bindUI(handlers) {
  qs("#btn-start").addEventListener("click", handlers.start);
  qs("#btn-manual").addEventListener("click", handlers.toggleManual);
  qs("#btn-diagram").addEventListener("click", handlers.toggleDiagram);
  qs("#btn-close-manual").addEventListener("click", handlers.toggleManual);
  qs("#btn-close-diagram").addEventListener("click", handlers.toggleDiagram);
  qs("#btn-pin-diagram").addEventListener("click", handlers.pinDiagram);
  document.querySelectorAll("[data-len]").forEach((b) => {
    b.addEventListener("click", () => handlers.pickLen(b.dataset.len));
  });
  document.querySelectorAll("[data-std]").forEach((b) => {
    b.addEventListener("click", () => handlers.pickStd(b.dataset.std));
  });
  qs("#btn-auto-order").addEventListener("click", handlers.autoOrder);
  qs("#btn-shuffle-order").addEventListener("click", handlers.shuffleOrder);
  qs("#btn-next-end").addEventListener("click", handlers.nextEnd);
  qs("#btn-retry").addEventListener("click", handlers.retry);
  qs("#btn-restart").addEventListener("click", handlers.restart);
  qs("#btn-tab").addEventListener("click", handlers.toggleTab);
  qs("#strip-go").addEventListener("click", handlers.confirmStrip);
  qs("#btn-celebrate-ok").addEventListener("click", () => qs("#modal-celebrate").classList.add("hidden"));
}

export function renderCoach(state) {
  const c = COACH[state.step] || COACH.welcome;
  qs("#coach-title").textContent = c.title;
  qs("#coach-body").textContent = c.body;
  qs("#coach-hint").textContent = c.hint;
  qs("#end-badge").textContent = state.currentEnd === "A" ? "끝 A (한쪽)" : "끝 B (반대쪽)";
  qs("#score-val").textContent = String(state.score);
}

export function renderChecklist(state) {
  const e = endState(state);
  const items = [
    ["카테고리", !!state.cat],
    ["길이", !!state.length && state.step !== "welcome"],
    ["재단", state.cableOnBench],
    ["탈피", e.stripped],
    ["페어 정리", e.untwisted],
    ["배열", e.orderLocked || e.trimmed],
    ["트림", e.trimmed],
    ["삽입", e.inserted],
    ["압착 A", state.ends.A.crimped],
    ["압착 B", state.ends.B.crimped],
    ["테스트", !!state.testResult],
  ];
  const tools = [
    ["스트리퍼", !state.toolsOut.stripper],
    ["커터", !state.toolsOut.cutter],
    ["크림퍼", !state.toolsOut.crimper],
    ["테스터", !state.toolsOut.tester],
  ];
  qs("#check-steps").innerHTML = items
    .map(([n, ok]) => `<li class="${ok ? "ok" : ""}">${ok ? "✓" : "○"} ${n}</li>`)
    .join("");
  qs("#check-tools").innerHTML = tools
    .map(([n, ok]) => `<li class="${ok ? "ok" : "warn"}">${ok ? "걸림" : "꺼냄"} · ${n}</li>`)
    .join("");
}

export function renderWires(state) {
  const e = endState(state);
  const box = qs("#wire-row");
  box.innerHTML = "";
  e.order.forEach((id, i) => {
    const d = WIRE_DEFS[id];
    const b = document.createElement("button");
    b.type = "button";
    b.className = "wire-chip";
    b.style.background = toCss(d.hex);
    b.style.color = contrast(d.hex);
    b.textContent = `${i + 1} ${d.name}`;
    b.dataset.i = String(i);
    box.appendChild(b);
  });
}

export function setPanels(state) {
  const step = state.step;
  qs("#panel-len").classList.toggle("hidden", step !== "pick_len");
  qs("#panel-arrange").classList.toggle("hidden", step !== "arrange");
  qs("#panel-strip").classList.toggle("hidden", step !== "strip");
  qs("#panel-insert").classList.toggle("hidden", step !== "insert");
  qs("#panel-flip").classList.toggle("hidden", step !== "flip_end");
  qs("#panel-result").classList.toggle("hidden", !["test", "return_tester", "complete"].includes(step) || !state.testResult);
  qs("#hover-tip").classList.toggle("hidden", true);
}

export function showHoverTip(text, x, y) {
  const el = qs("#hover-tip");
  if (!text) {
    el.classList.add("hidden");
    return;
  }
  el.textContent = text;
  el.style.left = `${x + 14}px`;
  el.style.top = `${y + 14}px`;
  el.classList.remove("hidden");
}

export function renderResult(result) {
  const el = qs("#result-box");
  if (!result) {
    el.innerHTML = "";
    return;
  }
  const kind =
    result.kind === "straight"
      ? "스트레이트 통과"
      : result.kind === "crossover"
        ? "크로스오버 (학습 통과)"
        : "불합격";
  el.innerHTML = `<strong>${kind}</strong><ul>${result.reasons.map((r) => `<li>${r}</li>`).join("")}</ul>`;
}

export function showCelebrate(result, score, toolsOut) {
  const m = qs("#modal-celebrate");
  const title = qs("#cele-title");
  const body = qs("#cele-body");
  if (result && result.pass) {
    title.textContent = result.kind === "crossover" ? "크로스오버 완성!" : "합격! 연결 성공";
    body.textContent = `점수 ${score}점. ${toolsOut ? "공구가 아직 나와 있으면 걸이에 돌려 주세요." : "공구도 모두 제자리입니다."}`;
  } else {
    title.textContent = "다시 한 번!";
    body.textContent = (result && result.reasons[0]) || "테스터가 실패를 표시했습니다.";
  }
  m.classList.remove("hidden");
}

export function buildManual() {
  const root = qs("#manual-pages");
  root.innerHTML = `
    <article>
      <h3>UTP가 뭔가요?</h3>
      <p>UTP(Unshielded Twisted Pair)는 차폐 없이 <b>꼬인 네 쌍</b>의 전선입니다. 꼬임이 전자기 간섭(누화, NEXT)을 줄입니다. 랜선 한 가닥 안에는 주황·녹·파랑·갈색 페어가 들어 있습니다. 각 페어는 “색 + 흰색 줄무늬” 두 가닥입니다.</p>
    </article>
    <article>
      <h3>카테고리</h3>
      <ul>
        ${Object.values(CATS)
          .map((c) => `<li><b>${c.name}</b> — ${c.speed}. ${c.use}${c.hasSeparator ? " (십자 분리대)" : ""}</li>`)
          .join("")}
      </ul>
      <p>숫자가 클수록 주파수와 허용 속도가 올라가고, 재킷·분리대·차폐가 엄격해집니다.</p>
    </article>
    <article>
      <h3>핀 번호와 플러그 방향</h3>
      <p>RJ45를 <b>클립(탭)이 아래</b>, 금핀이 위로 보이게 들었습니다. 앞에서 보면 <b>왼쪽이 1번, 오른쪽이 8번</b>입니다. 이 약속이 바뀌면 모든 색이 거울처럼 뒤집힙니다.</p>
    </article>
    <article>
      <h3>T568B (한국 학교에서 흔함)</h3>
      <ol class="pin-ol">
        ${T568B.map((id, i) => `<li style="--c:${toCss(WIRE_DEFS[id].hex)}">${i + 1}. ${WIRE_DEFS[id].name}</li>`).join("")}
      </ol>
      <h3>T568A</h3>
      <ol class="pin-ol">
        ${T568A.map((id, i) => `<li style="--c:${toCss(WIRE_DEFS[id].hex)}">${i + 1}. ${WIRE_DEFS[id].name}</li>`).join("")}
      </ol>
      <p>A와 B의 차이는 <b>주황 페어와 녹 페어의 자리</b>뿐입니다. 파랑·갈색은 같습니다.</p>
    </article>
    <article>
      <h3>스트레이트 vs 크로스오버</h3>
      <p><b>스트레이트</b>: 양 끝을 같은 표준(보통 B+B)으로 만듭니다. PC↔스위치가 기본입니다.</p>
      <p><b>크로스오버</b>: 한쪽 T568A, 다른 쪽 T568B. 같은 종류 장비끼리 직접 이을 때 쓰였습니다. 요즘 NIC는 Auto MDI-X라 스트레이트만으로도 됩니다. 실습에서는 패턴을 읽기 위해 만들어 봅니다.</p>
    </article>
    <article>
      <h3>자주 하는 실수</h3>
      <ul>${COMMON_MISTAKES.map((m) => `<li>${m}</li>`).join("")}</ul>
      <p>테스터 LED가 순서대로 1→8이면 스트레이트 정상, 1↔3·2↔6이 바뀌면 전형적인 크로스, 일부만 꺼지면 단선·트림 불량입니다.</p>
    </article>
    <article>
      <h3>공구 예절</h3>
      <p>스트리퍼·커터·크림퍼·테스터는 <b>쓰고 바로 걸이</b>에 겁니다. 작업대에 두면 칼날 사고와 분실이 납니다. 이 시뮬레이터는 공구를 안 돌리면 감점합니다.</p>
    </article>
  `;
}

export function buildDiagramSheet() {
  const a = qs("#diag-a");
  const b = qs("#diag-b");
  a.innerHTML = T568A.map((id, i) => row(i, id)).join("");
  b.innerHTML = T568B.map((id, i) => row(i, id)).join("");
}

function row(i, id) {
  const d = WIRE_DEFS[id];
  return `<div class="diag-row"><span class="pin">${i + 1}</span><span class="sw" style="background:${toCss(d.hex)}"></span><span>${d.name}</span></div>`;
}

function toCss(hex) {
  return "#" + hex.toString(16).padStart(6, "0");
}

function contrast(hex) {
  const r = (hex >> 16) & 255;
  const g = (hex >> 8) & 255;
  const b = hex & 255;
  return r * 0.3 + g * 0.6 + b * 0.1 > 160 ? "#1a120a" : "#fffaf0";
}

export function toast(msg) {
  const t = qs("#toast");
  t.textContent = msg;
  t.classList.remove("hidden");
  clearTimeout(toast._tm);
  toast._tm = setTimeout(() => t.classList.add("hidden"), 2800);
}

export { CATS, LENGTHS };
