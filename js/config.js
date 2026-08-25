/** LAN Cable Lab — 2D desk. First job is fixed. */

export const JOB = {
  id: "001",
  title: "작업지시서",
  cat: "Cat5e",
  lengthM: 1.0,
  lengthTolM: 0.05,
  kind: "스트레이트",
  standard: "T568B",
  connector: "관통형 RJ45",
  boot: "양쪽 필수",
  stripCm: 3.0,
  stripTolCm: 0.5,
};

export const T568B = ["wo", "o", "wg", "blu", "wblu", "g", "wbr", "br"];

export const WIRES = {
  wo: { id: "wo", name: "흰주황", short: "WO", hex: "#f3e0c4", stripe: "#e67e22" },
  o: { id: "o", name: "주황", short: "O", hex: "#e67e22" },
  wg: { id: "wg", name: "흰녹", short: "WG", hex: "#dcecd8", stripe: "#2e7d32" },
  g: { id: "g", name: "녹", short: "G", hex: "#2e7d32" },
  blu: { id: "blu", name: "파랑", short: "Blu", hex: "#1565c0" },
  wblu: { id: "wblu", name: "흰파랑", short: "WBlu", hex: "#d6e6f5", stripe: "#1565c0" },
  wbr: { id: "wbr", name: "흰갈", short: "WBr", hex: "#e8ddd6", stripe: "#6d4c41" },
  br: { id: "br", name: "갈", short: "Br", hex: "#6d4c41" },
};

export const PAIRS = [
  { ids: ["wo", "o"], name: "주황 페어" },
  { ids: ["wg", "g"], name: "녹 페어" },
  { ids: ["blu", "wblu"], name: "파랑 페어" },
  { ids: ["wbr", "br"], name: "갈 페어" },
];

export const REELS = [
  {
    id: "cat6",
    jacket: "#3a5474",
    flange: "#d5d0c4",
    print: "CAT6  23AWG  4PR UTP  250MHz",
    reject: "재킷 인쇄는 CAT6입니다. 의뢰서는 Cat5e입니다.",
  },
  {
    id: "cat5e",
    jacket: "#3f5a3c",
    flange: "#d5d0c4",
    print: "CAT5E  24AWG  4PR UTP CMR  100MHz",
    ok: true,
  },
  {
    id: "cat6a",
    jacket: "#4a3c5c",
    flange: "#d5d0c4",
    print: "CAT6A  23AWG UTP  500MHz  10G",
    reject: "이 릴은 CAT6A입니다. 의뢰는 Cat5e입니다.",
  },
  {
    id: "blank",
    jacket: "#6a6560",
    flange: "#b8b3a8",
    print: null,
    faded: "마모됨  ·  ??AWG UTP",
    reject: "재킷 인쇄가 없어 규격을 확인할 수 없습니다.",
  },
];

export const STAGES = [
  "welcome",
  "reel",
  "cut",
  "strip",
  "untwist",
  "sort",
  "boot",
  "insert",
  "inspect",
  "crimp",
  "complete",
];

export const PROMPT = {
  welcome: "의뢰서를 읽고, 접수 도장을 표시칸에 끌어 놓으시오.",
  reel: "재킷 인쇄를 확인하시오. 맞는 릴만 작업대에 올리시오.",
  cut: "케이블을 초록 띠(1.00m ±5cm)까지 푼 뒤, 니퍼 왼쪽 파선을 그 길이에 맞추시오.",
  strip: "스트리퍼를 초록 띠(약 3.0cm)에 맞춘 뒤, 재킷을 멀리 잡아 벗기시오.",
  untwist: "페어를 휙 끌어 풀고, 가닥 여덟 줄을 하나씩 곧게 펴시오.",
  sort: "T568B 순서로 여덟 칸에 넣으시오. 자동 정렬은 없습니다.",
  boot: "부트의 왼쪽 구멍으로 케이블을 끼우시오. 플러그보다 먼저입니다.",
  insert: "관통형 플러그의 왼쪽 입구로 밀어, 가닥이 앞 구멍으로 나오게 하시오.",
  inspect: "관통형 앞면 출구 여덟 구멍의 색을 의뢰서 T568B와 대조하시오.",
  crimp: "크림퍼를 플러그 위에 올리고, 쥐고 있으시오. 여분이 잘립니다.",
  complete: "양쪽 끝 압착 완료. 관통형 T568B 스트레이트입니다.",
};
