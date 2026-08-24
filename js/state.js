import { T568B } from "./config.js";

function emptyEnd() {
  return {
    stripped: false,
    stripCm: null,
    pairs: [false, false, false, false],
    wires: [false, false, false, false, false, false, false, false],
    slots: [null, null, null, null, null, null, null, null],
    tray: shuffleWires(),
    bootOn: false,
    inserted: false,
    crimped: false,
  };
}

function shuffleWires() {
  const ids = [...T568B];
  for (let i = ids.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [ids[i], ids[j]] = [ids[j], ids[i]];
  }
  if (ids.every((id, i) => id === T568B[i])) return shuffleWires();
  return ids;
}

export function createState() {
  return {
    stage: "welcome",
    currentEnd: "A",
    reelId: null,
    cutLengthM: null,
    ends: { A: emptyEnd(), B: emptyEnd() },
    reelOrder: shuffleReels(),
  };
}

function shuffleReels() {
  const order = ["cat6", "cat5e", "cat6a", "blank"];
  for (let i = order.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [order[i], order[j]] = [order[j], order[i]];
  }
  return order;
}

export function endOf(state) {
  return state.ends[state.currentEnd];
}

export function resetJob() {
  return createState();
}

export function isT568B(slots) {
  return T568B.every((id, i) => slots[i] === id);
}

export function allPairsUntwisted(end) {
  return end.pairs.every(Boolean);
}

export function allWiresStraight(end) {
  return end.wires.every(Boolean);
}

export function allSlotsFilled(end) {
  return end.slots.every(Boolean);
}

export function prepareEndB(state) {
  state.currentEnd = "B";
  state.ends.B = emptyEnd();
}

export function pullOutToSort(end) {
  end.inserted = false;
}
