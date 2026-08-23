import { CATS, T568A, T568B, STEPS } from "./config.js";

function emptyEnd() {
  return {
    stripped: false,
    stripDepth: null,
    stripOk: false,
    untwisted: false,
    standard: "B",
    order: [...T568B],
    orderLocked: false,
    trimmed: false,
    tabDown: true,
    inserted: false,
    crimped: false,
    plugTaken: false,
  };
}

export function createState() {
  return {
    step: "welcome",
    cat: "cat5e",
    length: "1m",
    reelOnBench: false,
    cableOnBench: false,
    currentEnd: "A",
    ends: { A: emptyEnd(), B: emptyEnd() },
    toolsOut: {
      stripper: false,
      cutter: false,
      crimper: false,
      tester: false,
    },
    toolsLeftOutCount: 0,
    score: 100,
    flags: {
      stripFailHint: false,
      wrongOrder: false,
      unexpectedCrossover: false,
      intendedCrossover: false,
      shortPairs: false,
      tabWrong: false,
    },
    testResult: null,
    log: [],
    diagramPinned: true,
    selectedWireIndex: null,
  };
}

export function endState(s) {
  return s.ends[s.currentEnd];
}

export function setStep(s, step) {
  if (!STEPS.includes(step)) return;
  s.step = step;
}

export function resetCable(s) {
  s.reelOnBench = false;
  s.cableOnBench = false;
  s.currentEnd = "A";
  s.ends = { A: emptyEnd(), B: emptyEnd() };
  s.testResult = null;
  s.flags = {
    stripFailHint: false,
    wrongOrder: false,
    unexpectedCrossover: false,
    intendedCrossover: false,
    shortPairs: false,
    tabWrong: false,
  };
  s.selectedWireIndex = null;
}

export function applyOrder(end, standard, custom) {
  end.standard = standard;
  end.order = custom ? [...custom] : standard === "A" ? [...T568A] : [...T568B];
}

export function expectedOrder(standard) {
  return standard === "A" ? [...T568A] : [...T568B];
}

export function ordersEqual(a, b) {
  return a.length === b.length && a.every((v, i) => v === b[i]);
}

export function analyzeCable(s) {
  const A = s.ends.A;
  const B = s.ends.B;
  const reasons = [];
  const pinMap = [];

  if (!A.crimped || !B.crimped) {
    return { pass: false, kind: "incomplete", reasons: ["양 끝이 아직 압착되지 않았습니다."], leds: Array(8).fill("off"), pinMap };
  }

  if (A.tabDown === false || B.tabDown === false) {
    s.flags.tabWrong = true;
    reasons.push("플러그 탭 방향이 뒤집혀 1번 핀이 반대로 들어갔습니다.");
  }

  if (!A.stripOk || !B.stripOk) {
    s.flags.shortPairs = true;
    reasons.push("재킷 탈피 깊이가 나빠 페어가 상했거나 너무 짧게 남았습니다.");
  }

  const aOk = ordersEqual(A.order, expectedOrder(A.standard));
  const bOk = ordersEqual(B.order, expectedOrder(B.standard));
  if (!aOk || !bOk) {
    s.flags.wrongOrder = true;
    reasons.push("선택한 표준과 실제 가닥 순서가 다릅니다. 색 배열을 다시 보세요.");
  }

  // Map pin i on end A (physical order) to which color, then find that color's pin on B
  const leds = [];
  for (let i = 0; i < 8; i++) {
    const color = A.order[i];
    const j = B.order.indexOf(color);
    pinMap.push({ from: i + 1, to: j + 1, color });
    if (A.tabDown === false) {
      // reversed insertion: treat as pin 9-i
    }
  }

  const sameStd = A.standard === B.standard;
  const aMatchesBstd = ordersEqual(A.order, expectedOrder(B.standard));
  const crossover = A.standard !== B.standard && aOk && bOk;
  const straight = sameStd && aOk && bOk && A.tabDown && B.tabDown && A.stripOk && B.stripOk;

  if (crossover && A.tabDown && B.tabDown && A.stripOk && B.stripOk) {
    s.flags.intendedCrossover = true;
    // Classic crossover swaps 1-3, 2-6
    for (let i = 0; i < 8; i++) {
      const color = A.order[i];
      const j = B.order.indexOf(color);
      const expectedCross = { 0: 2, 1: 5, 2: 0, 5: 1 }[i];
      const ok = expectedCross !== undefined ? j === expectedCross : j === i;
      leds[i] = ok ? "cross" : "fail";
    }
    return {
      pass: true,
      kind: "crossover",
      reasons: ["양 끝이 A+B 입니다. 크로스오버 케이블입니다. (구형 허브-허브, 지금은 학습용)"],
      leds,
      pinMap,
    };
  }

  if (straight) {
    for (let i = 0; i < 8; i++) leds[i] = "ok";
    return { pass: true, kind: "straight", reasons: ["스트레이트 케이블 — 양 끝 같은 표준, 핀 1:1 연결."], leds, pinMap };
  }

  // mismatch LEDs
  for (let i = 0; i < 8; i++) {
    const color = A.order[i];
    let j = B.order.indexOf(color);
    if (A.tabDown === false) j = 7 - j;
    if (B.tabDown === false) j = 7 - j;
    if (!A.stripOk && i % 2 === 0) {
      leds[i] = "fail";
    } else {
      leds[i] = j === i ? "ok" : "fail";
    }
    if (leds[i] === "fail" && !reasons.some((r) => r.includes("핀"))) {
      reasons.push(`핀 ${i + 1}번이 반대쪽 ${j + 1}번과 연결되어 배열이 어긋났습니다.`);
    }
  }

  if (A.standard !== B.standard && !(aOk && bOk)) {
    s.flags.unexpectedCrossover = true;
    reasons.push("양 끝 표준이 다른데 배열도 흐트러져 있습니다. 의도한 크로스오버가 아닙니다.");
  } else if (A.standard !== B.standard) {
    s.flags.unexpectedCrossover = true;
  }

  if (reasons.length === 0) reasons.push("배선이 규격과 다릅니다.");

  return { pass: false, kind: "fail", reasons, leds, pinMap };
}

export function deduct(s, n, why) {
  s.score = Math.max(0, s.score - n);
  s.log.push(why);
}

export function catInfo(s) {
  return CATS[s.cat];
}
