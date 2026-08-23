import { CATS, T568A, T568B, WIRE_DEFS } from "./config.js";
import {
  createState,
  endState,
  setStep,
  resetCable,
  applyOrder,
  analyzeCable,
  deduct,
} from "./state.js";
import { createWorkshop } from "./workshop.js";
import {
  bindUI,
  renderCoach,
  renderChecklist,
  renderWires,
  setPanels,
  renderResult,
  showCelebrate,
  buildManual,
  buildDiagramSheet,
  toast,
  qs,
  showHoverTip,
} from "./ui.js";

const state = createState();
const canvas = document.getElementById("view");

const workshop = createWorkshop(canvas, onPick, onHover);

buildManual();
buildDiagramSheet();
bindUI({
  start,
  toggleManual,
  toggleDiagram,
  pinDiagram,
  pickLen,
  pickStd,
  autoOrder,
  shuffleOrder,
  nextEnd,
  retry,
  restart,
  toggleTab,
  confirmStrip,
});

qs("#wire-row").addEventListener("click", (e) => {
  const b = e.target.closest(".wire-chip");
  if (!b || state.step !== "arrange") return;
  const i = Number(b.dataset.i);
  const end = endState(state);
  if (state.selectedWireIndex === null) {
    state.selectedWireIndex = i;
    b.classList.add("sel");
    toast(`${i + 1}번을 선택. 바꿀 자리를 다시 누르세요.`);
  } else {
    const j = state.selectedWireIndex;
    const arr = end.order;
    [arr[j], arr[i]] = [arr[i], arr[j]];
    state.selectedWireIndex = null;
    refresh();
    workshop.rebuildCable(state);
  }
});

function start() {
  if (state.step === "welcome") setStep(state, "pick_cat");
  refresh();
  toast("선반의 케이블 릴을 골라 보세요.");
}

function toggleManual() {
  qs("#manual").classList.toggle("hidden");
}

function toggleDiagram() {
  qs("#diagram").classList.toggle("hidden");
}

function pinDiagram() {
  state.diagramPinned = !state.diagramPinned;
  qs("#diagram").classList.toggle("pinned", state.diagramPinned);
  qs("#btn-pin-diagram").textContent = state.diagramPinned ? "떠 있는 용지 고정됨" : "작업대 옆에 고정";
}

function pickLen(id) {
  if (state.step !== "pick_len") return;
  state.length = id;
  setStep(state, "take_reel");
  toast(`${id}를 골랐습니다. 같은 릴을 한 번 더 클릭해 작업대로 가져오세요.`);
  refresh();
}

function pickStd(std) {
  if (state.step !== "arrange") return;
  applyOrder(endState(state), std);
  endState(state).orderLocked = false;
  workshop.rebuildCable(state);
  refresh();
  toast(`${std === "A" ? "T568A" : "T568B"} 순서로 바꿨습니다. 가닥을 눌러 순서를 바꿀 수 있습니다.`);
}

function autoOrder() {
  if (state.step !== "arrange") return;
  const e = endState(state);
  applyOrder(e, e.standard);
  e.orderLocked = true;
  workshop.rebuildCable(state);
  setStep(state, "take_cutter");
  toast("규격대로 정렬했습니다. 커터로 끝을 맞추세요.");
  refresh();
}

function shuffleOrder() {
  if (state.step !== "arrange") return;
  const e = endState(state);
  const a = [...e.order];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  e.order = a;
  e.orderLocked = true;
  workshop.rebuildCable(state);
  setStep(state, "take_cutter");
  toast("일부러 섞었습니다. 압착은 되지만 테스터에서 실패할 수 있어요.");
  refresh();
}

function nextEnd() {
  if (state.step !== "flip_end") return;
  state.currentEnd = "B";
  const b = state.ends.B;
  b.standard = state.ends.A.standard;
  applyOrder(b, b.standard);
  setStep(state, "take_stripper");
  workshop.rebuildCable(state);
  toast("반대쪽입니다. 스트레이트를 원하면 같은 표준, 크로스는 A/B를 다르게.");
  refresh();
}

function retry() {
  const e = endState(state);
  if (state.step === "strip" || state.flags.stripFailHint) {
    e.stripped = false;
    e.stripOk = false;
    setStep(state, "strip");
  } else if (!e.crimped) {
    setStep(state, "arrange");
  } else if (state.testResult && !state.testResult.pass) {
    e.inserted = false;
    e.crimped = false;
    e.trimmed = false;
    e.orderLocked = false;
    setStep(state, "arrange");
    workshop.rebuildCable(state);
  }
  qs("#modal-celebrate").classList.add("hidden");
  refresh();
}

function restart() {
  const tools = { ...state.toolsOut };
  Object.keys(tools).forEach((k) => {
    if (tools[k]) {
      deduct(state, 5, `${k}를 제자리에 두지 않고 다시 시작`);
      state.toolsLeftOutCount += 1;
    }
    state.toolsOut[k] = false;
    workshop.setToolOut(k, false);
  });
  resetCable(state);
  state.score = 100;
  setStep(state, "pick_cat");
  workshop.rebuildCable(state);
  workshop.setTesterLeds(Array(8).fill("off"));
  workshop.highlightReels(state.cat);
  qs("#modal-celebrate").classList.add("hidden");
  toast("새 케이블을 시작합니다.");
  refresh();
}

function toggleTab() {
  if (state.step !== "insert") return;
  const e = endState(state);
  e.tabDown = !e.tabDown;
  qs("#tab-state").textContent = e.tabDown ? "탭 아래 · 1번 왼쪽 (권장)" : "탭 위 · 핀 방향 반대 (위험)";
  workshop.rebuildCable(state);
}

function confirmStrip() {
  if (state.step !== "strip") return;
  const depth = Number(qs("#strip-depth").value);
  const e = endState(state);
  e.stripped = true;
  e.stripDepth = depth;
  e.stripOk = depth >= 1.8 && depth <= 2.6;
  if (!e.stripOk) {
    state.flags.stripFailHint = true;
    deduct(state, 8, "탈피 깊이 불량");
    toast(
      depth < 1.8
        ? "너무 얕아요. 플러그에 재킷이 안 들어갑니다. 그래도 진행은 할 수 있어요."
        : "너무 깊어요. 페어가 길게 풀려 누화가 커집니다."
    );
  } else {
    toast("좋은 깊이입니다. 재킷만 벗겨졌어요.");
  }
  workshop.rebuildCable(state);
  setStep(state, "return_stripper");
  refresh();
}

function onHover(id, data) {
  const tip = qs("#hover-tip");
  if (!id) {
    tip.classList.add("hidden");
    return;
  }
  let text = "";
  if (data.kind === "reel") {
    const c = CATS[data.cat];
    text = `${c.name}  ·  ${c.speed}\n${c.use}`;
  } else if (data.kind === "tool") {
    const names = { stripper: "스트리퍼 (재킷 탈피)", cutter: "커터 (재단·트림)", crimper: "크림퍼 (압착)", tester: "케이블 테스터" };
    text = names[data.tool] + (state.toolsOut[data.tool] ? " — 작업대에 있음. 걸이에 클릭" : " — 클릭해서 집기");
  } else if (data.kind === "plug") text = "RJ45 모듈러 플러그";
  else if (data.kind === "boot") text = "부트(부츠) — 꺾임 방지, 선택";
  else if (data.kind === "cable") text = "작업 중인 케이블";
  else if (data.kind === "wire") {
    const e = endState(state);
    const w = WIRE_DEFS[e.order[data.index]];
    text = `${data.index + 1}번 핀 · ${w.name}`;
  } else if (data.kind === "tester-btn") text = "테스트 시작";
  if (text) {
    tip.textContent = text;
    tip.classList.remove("hidden");
  }
}

function needTool(name) {
  if (!state.toolsOut[name]) {
    toast("먼저 공구대에서 해당 공구를 집으세요.");
    return false;
  }
  return true;
}

function takeTool(name) {
  if (state.toolsOut[name]) {
    returnTool(name);
    return;
  }
  if (name === "stripper" && state.toolsOut.cutter) {
    toast("커터를 먼저 걸이에 걸어 주세요. 공구는 하나씩.");
    return;
  }
  state.toolsOut[name] = true;
  workshop.setToolOut(name, true);
  toast(toolTakeMsg(name));
  if (state.step === "cut" && name === "cutter") {
    doCut();
  } else if (state.step === "take_stripper" && name === "stripper") {
    setStep(state, "strip");
  } else if (state.step === "take_cutter" && name === "cutter") {
    setStep(state, "trim");
  } else if (state.step === "take_crimper" && name === "crimper") {
    setStep(state, "crimp");
  } else if ((state.step === "take_tester" || state.step === "done_both") && name === "tester") {
    setStep(state, "test");
  }
  refresh();
}

function returnTool(name) {
  if (!state.toolsOut[name]) return;
  state.toolsOut[name] = false;
  workshop.setToolOut(name, false);
  toast(`${toolLabel(name)}를 걸이에 걸었습니다. 깔끔해요!`);
  if (state._afterCut && name === "cutter") {
    state._afterCut = false;
    setStep(state, "take_stripper");
  }
  if (state.step === "return_stripper" && name === "stripper") setStep(state, "untwist");
  if (state.step === "return_cutter" && name === "cutter") setStep(state, "take_plug");
  if (state.step === "return_crimper" && name === "crimper") {
    if (state.currentEnd === "A") setStep(state, "flip_end");
    else setStep(state, "done_both");
  }
  if (state.step === "return_tester" && name === "tester") finishUp();
  refresh();
}

function toolLabel(n) {
  return { stripper: "스트리퍼", cutter: "커터", crimper: "크림퍼", tester: "테스터" }[n];
}

function toolTakeMsg(n) {
  return `${toolLabel(n)}를 작업대로 가져왔습니다. 쓴 뒤에는 걸이에 돌려 주세요.`;
}

function doCut() {
  if (state.step !== "cut") return;
  if (!needTool("cutter")) return;
  state.cableOnBench = true;
  workshop.rebuildCable(state);
  toast("길이에 맞게 잘랐습니다. 커터를 먼저 걸이에 걸어 주세요.");
  state._afterCut = true;
  setStep(state, "take_stripper");
  refresh();
}

function doUntwist() {
  if (state.step !== "untwist") return;
  const e = endState(state);
  e.untwisted = true;
  workshop.rebuildCable(state);
  setStep(state, "arrange");
  toast("페어를 짧게 풀었습니다. 재킷 가까이 꼬임을 남기세요.");
  refresh();
}

function doTrim() {
  if (state.step !== "trim") return;
  if (!needTool("cutter")) return;
  endState(state).trimmed = true;
  endState(state).orderLocked = true;
  workshop.rebuildCable(state);
  setStep(state, "return_cutter");
  toast("끝을 가지런히 잘랐습니다. 커터를 걸이에.");
  refresh();
}

function takePlug() {
  if (state.step !== "take_plug") return;
  endState(state).plugTaken = true;
  setStep(state, "insert");
  toast("플러그를 집었습니다. 탭을 아래로, 1번이 왼쪽인지 확인하세요.");
  refresh();
}

function doInsert() {
  if (state.step !== "insert") return;
  const e = endState(state);
  if (!e.plugTaken) {
    toast("선반에서 플러그를 먼저 집으세요.");
    return;
  }
  e.inserted = true;
  workshop.rebuildCable(state);
  setStep(state, "take_crimper");
  toast("삽입 완료. 재킷이 플러그 안까지 들어갔는지 보고 크림퍼를 집으세요.");
  refresh();
}

function doCrimp() {
  if (state.step !== "crimp") return;
  if (!needTool("crimper")) return;
  const e = endState(state);
  if (!e.inserted) {
    toast("플러그에 먼저 넣으세요.");
    return;
  }
  e.crimped = true;
  workshop.rebuildCable(state);
  setStep(state, "return_crimper");
  toast(`${state.currentEnd} 끝을 압착했습니다. 크림퍼를 걸이에 걸어 주세요.`);
  refresh();
}

function doTest() {
  if (state.step !== "test") return;
  if (!needTool("tester")) return;
  const result = analyzeCable(state);
  state.testResult = result;
  workshop.setTesterLeds(Array(8).fill("off"));
  result.leds.forEach((st, i) => {
    setTimeout(() => {
      const cur = result.leds.map((v, j) => (j <= i ? v : "off"));
      workshop.setTesterLeds(cur);
    }, 220 * i);
  });
  renderResult(result);
  const leftover = Object.values(state.toolsOut).filter(Boolean).length;
  if (!result.pass) deduct(state, 12, "테스터 불합격");
  if (leftover > 1) deduct(state, leftover * 3, "공구 미반납");
  setTimeout(() => {
    showCelebrate(result, state.score, leftover > 0);
  }, 220 * 8);
  setStep(state, "return_tester");
  refresh();
}

function finishUp() {
  const leftover = Object.entries(state.toolsOut).filter(([, v]) => v);
  leftover.forEach(([k]) => {
    deduct(state, 6, `${k} 미반납`);
    state.toolsLeftOutCount += 1;
  });
  setStep(state, "complete");
  toast(leftover.length ? "공구가 남아 감점되었습니다." : "실습 종료. 작업대가 깨끗합니다!");
  refresh();
}

function onPick(id, data) {
  if (data.kind === "reel") {
    if (state.step === "welcome" || state.step === "pick_cat") {
      state.cat = data.cat;
      workshop.highlightReels(state.cat);
      toast(`${CATS[data.cat].name} — ${CATS[data.cat].speed}`);
      setStep(state, "pick_len");
      refresh();
      return;
    }
    if (state.step === "take_reel" && data.cat === state.cat) {
      state.reelOnBench = true;
      setStep(state, "cut");
      toast("릴에서 케이블을 빼 두었습니다. 커터로 자르세요.");
      refresh();
      return;
    }
    if (state.step === "cut" && state.toolsOut.cutter) {
      doCut();
      return;
    }
  }

  if (data.kind === "tool") {
    takeTool(data.tool);
    return;
  }

  if (data.kind === "tester-btn") {
    doTest();
    return;
  }

  if (data.kind === "plug") {
    takePlug();
    return;
  }

  if (data.kind === "boot") {
    toast("부트를 씌우면 꺾임을 줄입니다. 이 실습에서는 선택 사항이에요.");
    return;
  }

  if (data.kind === "cable") {
    if (state.step === "cut") doCut();
    else if (state.step === "strip") qs("#panel-strip").classList.remove("hidden");
    else if (state.step === "untwist") doUntwist();
    else if (state.step === "trim") doTrim();
    else if (state.step === "insert") doInsert();
    else if (state.step === "crimp") doCrimp();
    return;
  }

  if (data.kind === "wire") {
    if (state.step === "untwist") doUntwist();
    else if (state.step === "arrange") {
      const btn = qs("#wire-row").children[data.index];
      if (btn) btn.click();
    }
    return;
  }

  if (data.kind === "plugged") {
    if (state.step === "crimp") doCrimp();
    if (state.step === "insert") doInsert();
  }
}

function refresh() {
  renderCoach(state);
  renderChecklist(state);
  renderWires(state);
  setPanels(state);
  qs("#cat-chip").textContent = CATS[state.cat].name;
  qs("#len-chip").textContent = state.length;
  qs("#std-chip").textContent = `끝${state.currentEnd} ${endState(state).standard === "A" ? "T568A" : "T568B"}`;
  if (state.testResult) renderResult(state.testResult);
  qs("#strip-val").textContent = `${Number(qs("#strip-depth").value).toFixed(1)} cm`;
}

qs("#strip-depth").addEventListener("input", () => {
  qs("#strip-val").textContent = `${Number(qs("#strip-depth").value).toFixed(1)} cm`;
});

document.addEventListener("keydown", (e) => {
  if (e.key === "m" || e.key === "M") toggleManual();
  if (e.key === "d" || e.key === "D") toggleDiagram();
  if (e.key === "r" || e.key === "R") {
    workshop.controls.reset();
  }
});

workshop.highlightReels(state.cat);
refresh();
setStep(state, "welcome");
refresh();

canvas.addEventListener("pointermove", (e) => {
  const tip = qs("#hover-tip");
  tip.style.left = e.clientX + 14 + "px";
  tip.style.top = e.clientY + 14 + "px";
});
