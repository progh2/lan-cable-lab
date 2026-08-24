import { CATS, WIRE_DEFS } from "./config.js";
import {
  createState, endState, setStep, resetCable, applyOrder, analyzeCable, deduct,
} from "./state.js";
import { createWorkshop } from "./workshop.js";
import {
  bindUI, renderCoach, renderChecklist, renderWires, setPanels, renderResult,
  showCelebrate, buildManual, buildDiagramSheet, toast, qs,
  renderCatChips, renderToolTiles, renderActions, getPrimary,
} from "./ui.js";

const state = createState();
const canvas = document.getElementById("view");
const workshop = createWorkshop(canvas, onPick, onHover);

buildManual();
buildDiagramSheet();
bindUI({
  start, toggleManual, toggleDiagram, pinDiagram, pickLen, pickStd,
  autoOrder, shuffleOrder, nextEnd, retry, restart, toggleTab, confirmStrip,
  pickCat, takeTool, action, primary,
});

qs("#wire-row").addEventListener("click", (e) => {
  const b = e.target.closest(".wire-chip");
  if (!b || state.step !== "arrange") return;
  const i = Number(b.dataset.i);
  const end = endState(state);
  if (state.selectedWireIndex === null) {
    state.selectedWireIndex = i; b.classList.add("sel");
    toast(`${i + 1}번을 선택. 바꿀 자리를 다시 누르세요.`);
  } else {
    const j = state.selectedWireIndex;
    const arr = end.order;
    [arr[j], arr[i]] = [arr[i], arr[j]];
    state.selectedWireIndex = null;
    refresh(); workshop.rebuildCable(state);
  }
});

function start() {
  state.cat = "cat5e"; state.length = "1m";
  if (["welcome", "pick_cat", "pick_len"].includes(state.step)) setStep(state, "take_reel");
  workshop.highlightReels(state.cat);
  refresh();
  toast("수첩만 보세요. 다음은 Cat5e를 가져오는 일입니다.");
}
function primary() { action(getPrimary(state).act); }

function pickCat(cat) {
  if (!CATS[cat]) return;
  state.cat = "cat5e";
  workshop.highlightReels(state.cat);
  if (["welcome", "pick_cat", "pick_len", "take_reel"].includes(state.step)) {
    state.reelOnBench = true; setStep(state, "cut");
    toast("Cat5e를 작업대에 올렸습니다."); refresh();
  }
}

function action(act) {
  if (!act) return;
  if (act === "start") return start();
  if (act === "restart") return restart();
  if (act === "arrange") return autoOrder();
  if (act === "flip") return nextEnd();
  if (act === "untwist") return doUntwist();
  if (act === "cut") {
    if (!state.reelOnBench && !state.cableOnBench) { state.cat = "cat5e"; state.reelOnBench = true; }
    if (!state.toolsOut.cutter) takeTool("cutter"); else doCut();
    return;
  }
  if (act === "strip") {
    if (!state.toolsOut.stripper) takeTool("stripper");
    if (state.step === "take_stripper") setStep(state, "strip");
    confirmStrip(); return;
  }
  if (act === "trim") {
    if (!state.toolsOut.cutter) takeTool("cutter");
    doTrim(); return;
  }
  if (act === "insert") {
    if (state.step === "take_plug") takePlug();
    doInsert(); return;
  }
  if (act === "crimp") {
    if (!endState(state).inserted) {
      if (state.step === "take_plug") takePlug();
      doInsert();
    }
    if (!state.toolsOut.crimper) takeTool("crimper");
    doCrimp(); return;
  }
  if (act.startsWith("reel:")) { pickCat(act.slice(5)); return; }
  if (act.startsWith("tool:")) { takeTool(act.slice(5)); return; }
  if (act === "hang") {
    const name = ["cutter", "stripper", "crimper", "tester"].find((k) => state.toolsOut[k]);
    if (name) returnTool(name); else toast("나와 있는 공구가 없어요.");
    return;
  }
  if (act === "test") {
    if (!state.toolsOut.tester) takeTool("tester");
    doTest(); return;
  }
  if (act === "plug") { takePlug(); return; }
  if (act === "cable") onPick("cable", { kind: "cable" });
}

function toggleManual() { qs("#manual").classList.toggle("hidden"); }
function toggleDiagram() { qs("#diagram").classList.toggle("hidden"); }
function pinDiagram() {
  state.diagramPinned = !state.diagramPinned;
  qs("#diagram").classList.toggle("pinned", state.diagramPinned);
  qs("#btn-pin-diagram").textContent = state.diagramPinned ? "떠 있는 용지 고정됨" : "작업대 옆에 고정";
}
function pickLen(id) {
  state.length = "1m"; setStep(state, "take_reel"); refresh();
}
function pickStd(std) {
  if (state.step !== "arrange") return;
  applyOrder(endState(state), std);
  endState(state).orderLocked = false;
  workshop.rebuildCable(state); refresh();
}
function autoOrder() {
  if (state.step !== "arrange") return;
  const e = endState(state);
  applyOrder(e, "B"); e.standard = "B"; e.orderLocked = true;
  workshop.rebuildCable(state); setStep(state, "take_cutter");
  toast("T568B 그림대로 정렬했습니다."); refresh();
}
function shuffleOrder() {
  if (state.step !== "arrange") return;
  autoOrder();
}
function nextEnd() {
  if (state.step !== "flip_end") return;
  state.currentEnd = "B";
  const b = state.ends.B;
  b.standard = "B"; applyOrder(b, "B");
  setStep(state, "take_stripper"); workshop.rebuildCable(state);
  toast("반대쪽도 똑같이 T568B입니다."); refresh();
}
function retry() {
  const e = endState(state);
  if (state.step === "strip" || state.flags.stripFailHint) {
    e.stripped = false; e.stripOk = false; setStep(state, "strip");
  } else if (!e.crimped) setStep(state, "arrange");
  else if (state.testResult && !state.testResult.pass) {
    e.inserted = false; e.crimped = false; e.trimmed = false; e.orderLocked = false;
    setStep(state, "arrange"); workshop.rebuildCable(state);
  }
  qs("#modal-celebrate").classList.add("hidden"); refresh();
}
function restart() {
  Object.keys(state.toolsOut).forEach((k) => {
    if (state.toolsOut[k]) { deduct(state, 5, `${k} 미반납 재시작`); state.toolsLeftOutCount += 1; }
    state.toolsOut[k] = false; workshop.setToolOut(k, false);
  });
  resetCable(state); state.score = 100; state.cat = "cat5e"; state.length = "1m";
  setStep(state, "welcome");
  workshop.rebuildCable(state); workshop.setTesterLeds(Array(8).fill("off")); workshop.highlightReels(state.cat);
  qs("#modal-celebrate").classList.add("hidden");
  toast("새 의뢰를 시작합니다."); refresh();
}
function toggleTab() {
  if (state.step !== "insert") return;
  const e = endState(state);
  e.tabDown = !e.tabDown;
  qs("#tab-state").textContent = e.tabDown ? "탭 아래 · 1번 왼쪽" : "탭 위 · 위험";
  workshop.rebuildCable(state);
}
function confirmStrip() {
  if (state.step !== "strip") return;
  const depth = Number(qs("#strip-depth").value);
  const e = endState(state);
  e.stripped = true; e.stripDepth = depth; e.stripOk = depth >= 1.8 && depth <= 2.6;
  if (!e.stripOk) {
    state.flags.stripFailHint = true; deduct(state, 8, "탈피 깊이 불량");
    toast(depth < 1.8 ? "너무 얕아요." : "너무 깊어요.");
  } else toast("좋은 깊이입니다.");
  workshop.rebuildCable(state); setStep(state, "return_stripper"); refresh();
}
function onHover(id, data) {
  const tip = qs("#hover-tip");
  if (!id) { tip.classList.add("hidden"); return; }
  let text = "";
  if (data.kind === "reel") { const c = CATS[data.cat]; text = `${c.name}  ·  ${c.speed}`; }
  else if (data.kind === "tool") text = data.tool;
  else if (data.kind === "plug") text = "RJ45";
  else if (data.kind === "cable") text = "케이블";
  else if (data.kind === "wire") text = `${data.index + 1}번`;
  else if (data.kind === "tester-btn") text = "테스트";
  if (text) { tip.textContent = text; tip.classList.remove("hidden"); }
}
function needTool(name) {
  if (!state.toolsOut[name]) { toast("먼저 공구를 집으세요."); return false; }
  return true;
}
function takeTool(name) {
  if (state.toolsOut[name]) { returnTool(name); return; }
  if (name === "stripper" && state.toolsOut.cutter) { toast("커터를 먼저 걸이에."); return; }
  state.toolsOut[name] = true; workshop.setToolOut(name, true);
  if (state.step === "cut" && name === "cutter") doCut();
  else if (state.step === "take_stripper" && name === "stripper") setStep(state, "strip");
  else if (state.step === "take_cutter" && name === "cutter") setStep(state, "trim");
  else if (state.step === "take_crimper" && name === "crimper") setStep(state, "crimp");
  else if ((state.step === "take_tester" || state.step === "done_both") && name === "tester") setStep(state, "test");
  refresh();
}
function returnTool(name) {
  if (!state.toolsOut[name]) return;
  state.toolsOut[name] = false; workshop.setToolOut(name, false);
  toast(`${toolLabel(name)}를 걸이에 걸었습니다.`);
  if (state._afterCut && name === "cutter") { state._afterCut = false; setStep(state, "take_stripper"); }
  if (state.step === "return_stripper" && name === "stripper") setStep(state, "untwist");
  if (state.step === "return_cutter" && name === "cutter") setStep(state, "take_plug");
  if (state.step === "return_crimper" && name === "crimper") setStep(state, state.currentEnd === "A" ? "flip_end" : "done_both");
  if (state.step === "return_tester" && name === "tester") finishUp();
  refresh();
}
function toolLabel(n) { return { stripper: "스트리퍼", cutter: "커터", crimper: "크림퍼", tester: "테스터" }[n]; }
function doCut() {
  if (state.step !== "cut" || !needTool("cutter")) return;
  state.cableOnBench = true; workshop.rebuildCable(state);
  toast("잘랐습니다. 커터를 걸이에."); state._afterCut = true; setStep(state, "take_stripper"); refresh();
}
function doUntwist() {
  if (state.step !== "untwist") return;
  endState(state).untwisted = true; workshop.rebuildCable(state); setStep(state, "arrange");
  toast("페어를 짧게 풀었습니다."); refresh();
}
function doTrim() {
  if (state.step !== "trim" || !needTool("cutter")) return;
  endState(state).trimmed = true; endState(state).orderLocked = true;
  workshop.rebuildCable(state); setStep(state, "return_cutter"); toast("트림 완료."); refresh();
}
function takePlug() {
  if (state.step !== "take_plug") return;
  endState(state).plugTaken = true; setStep(state, "insert"); refresh();
}
function doInsert() {
  if (state.step !== "insert") return;
  const e = endState(state);
  if (!e.plugTaken) { toast("플러그를 먼저."); return; }
  e.inserted = true; workshop.rebuildCable(state); setStep(state, "take_crimper"); refresh();
}
function doCrimp() {
  if (state.step !== "crimp" || !needTool("crimper")) return;
  const e = endState(state);
  if (!e.inserted) return;
  e.crimped = true; workshop.rebuildCable(state); setStep(state, "return_crimper"); refresh();
}
function doTest() {
  if (state.step !== "test" || !needTool("tester")) return;
  const result = analyzeCable(state);
  state.testResult = result;
  workshop.setTesterLeds(Array(8).fill("off"));
  result.leds.forEach((st, i) => {
    setTimeout(() => workshop.setTesterLeds(result.leds.map((v, j) => (j <= i ? v : "off"))), 220 * i);
  });
  renderResult(result);
  const leftover = Object.values(state.toolsOut).filter(Boolean).length;
  if (!result.pass) deduct(state, 12, "테스터 불합격");
  setTimeout(() => showCelebrate(result, state.score, leftover > 0), 220 * 8);
  setStep(state, "return_tester"); refresh();
}
function finishUp() {
  setStep(state, "complete"); toast("의뢰 완료!"); refresh();
}
function onPick(id, data) {
  if (data.kind === "reel") {
    if (["welcome", "pick_cat", "pick_len", "take_reel"].includes(state.step)) {
      state.cat = "cat5e"; state.reelOnBench = true; workshop.highlightReels(state.cat);
      setStep(state, "cut"); refresh(); return;
    }
    if (state.step === "cut" && state.toolsOut.cutter) { doCut(); return; }
  }
  if (data.kind === "tool") { takeTool(data.tool); return; }
  if (data.kind === "tester-btn") { doTest(); return; }
  if (data.kind === "plug") { takePlug(); return; }
  if (data.kind === "cable") {
    if (state.step === "cut") doCut();
    else if (state.step === "untwist") doUntwist();
    else if (state.step === "trim") doTrim();
    else if (state.step === "insert") doInsert();
    else if (state.step === "crimp") doCrimp();
  }
  if (data.kind === "wire" && state.step === "untwist") doUntwist();
  if (data.kind === "plugged") {
    if (state.step === "crimp") doCrimp();
    if (state.step === "insert") doInsert();
  }
}
function refresh() {
  renderCoach(state); renderChecklist(state); renderWires(state); setPanels(state);
  renderCatChips(state); renderToolTiles(state); renderActions(state);
  const cat = qs("#cat-chip"); if (cat) cat.textContent = CATS[state.cat].name;
  const len = qs("#len-chip"); if (len) len.textContent = state.length;
  const std = qs("#std-chip"); if (std) std.textContent = `끝${state.currentEnd} T568B`;
  if (state.testResult) renderResult(state.testResult);
  const sv = qs("#strip-val");
  if (sv) sv.textContent = `${Number(qs("#strip-depth").value).toFixed(1)} cm`;
}
qs("#strip-depth").addEventListener("input", () => {
  qs("#strip-val").textContent = `${Number(qs("#strip-depth").value).toFixed(1)} cm`;
});
document.addEventListener("keydown", (e) => {
  if (e.key === "m" || e.key === "M") toggleManual();
  if (e.key === "d" || e.key === "D") toggleDiagram();
  if (e.key === "r" || e.key === "R") workshop.controls.reset();
});
workshop.highlightReels(state.cat);
refresh(); setStep(state, "welcome"); refresh();
canvas.addEventListener("pointermove", (e) => {
  const tip = qs("#hover-tip");
  tip.style.left = e.clientX + 14 + "px";
  tip.style.top = e.clientY + 14 + "px";
});
