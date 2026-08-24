import { createState, resetJob, endOf, prepareEndB, pullOutToSort } from "./state.js";
import { PROMPT } from "./config.js";
import {
  renderTicket, renderCableStrip, setPrompt, setPrimary,
  toast, stamp, bindChrome, showReset,
} from "./ui.js";
import { mountStage } from "./stages.js";

let state = createState();
let unmount = () => {};

const api = {
  get state() { return state; },
  go,
  primary: setPrimary,
  toast,
  reject(reason) {
    return stamp("reject", "반려", reason);
  },
  async finishCrimp() {
    endOf(state).crimped = true;
    chrome();
    if (state.currentEnd === "A") {
      await stamp("pass", "끝 A", "왼쪽 플러그가 붙었습니다. 반대쪽을 벗기시오.");
      prepareEndB(state);
      go("strip");
    } else {
      go("complete");
    }
  },
  pullOut() {
    pullOutToSort(endOf(state));
    toast("플러그를 뺐습니다. 순서를 고치세요.");
    go("sort");
  },
  async wrongInspect() {
    pullOutToSort(endOf(state));
    await stamp("reject", "반려", "출구 색이 T568B가 아닙니다. 플러그를 빼고 다시 정렬하세요.");
    go("sort");
  },
  reset() {
    state = resetJob();
    go("welcome");
  },
};

function chrome() {
  renderCableStrip(state);
  setPrompt(PROMPT[state.stage] || "");
  showReset(state.stage !== "welcome");
}

function go(stage) {
  const end = endOf(state);
  if (stage === "insert" && !end.bootOn) stage = "boot";
  if (stage === "crimp" && !end.inserted) stage = "insert";
  if (stage === "inspect" && !end.inserted) stage = "insert";
  if (stage === "untwist" && !end.stripped) stage = "strip";
  state.stage = stage;
  setPrimary(null);
  chrome();
  unmount();
  unmount = mountStage(stage, document.getElementById("stage"), api);
}

function start() {
  renderTicket();
  bindChrome({ onReset: () => api.reset() });
  go("welcome");
}

start();
