/** LAN Cable Lab — constants, pinouts, categories */

export const CATS = {
  cat5e: {
    id: "cat5e",
    name: "Cat5e",
    color: 0x2f6b3a,
    jacketHex: "#2f6b3a",
    thickness: 0.055,
    hasSeparator: false,
    speed: "1 Gbps / 100 MHz",
    use: "교실·일반 네트워크의 기본. 미림에서도 가장 많이 연습합니다.",
    unlocked: true,
  },
  cat6: {
    id: "cat6",
    name: "Cat6",
    color: 0x1e4d8c,
    jacketHex: "#1e4d8c",
    thickness: 0.062,
    hasSeparator: true,
    speed: "1~10 Gbps / 250 MHz",
    use: "십자 분리대(separator)가 있어 간섭이 적습니다. 서버실·핵심 구간에 쓹니다.",
    unlocked: true,
  },
  cat6a: {
    id: "cat6a",
    name: "Cat6a",
    color: 0x5b2c8a,
    jacketHex: "#5b2c8a",
    thickness: 0.072,
    hasSeparator: true,
    speed: "10 Gbps / 500 MHz",
    use: "재킷이 더 두께고 차폐·간격이 엄격합니다. 장거리 10G에 적합.",
    unlocked: true,
  },
  cat7: {
    id: "cat7",
    name: "Cat7",
    color: 0x8b1e1e,
    jacketHex: "#8b1e1e",
    thickness: 0.078,
    hasSeparator: true,
    speed: "10 Gbps+ / 600 MHz",
    use: "개별 페어 차폐(S/FTP). 학교 실습보다 특수 설비에서 더 흔합니다.",
    unlocked: true,
  },
};

export const LENGTHS = [
  { id: "1m", label: "1 m", meters: 1 },
  { id: "2m", label: "2 m", meters: 2 },
];

export const WIRE_DEFS = {
  wo: { id: "wo", name: "흰주황", hex: 0xffe0b2, stripe: 0xe67e22 },
  o: { id: "o", name: "주황", hex: 0xe67e22 },
  wg: { id: "wg", name: "흰녹", hex: 0xc8e6c9, stripe: 0x2e7d32 },
  g: { id: "g", name: "녹", hex: 0x2e7d32 },
  b: { id: "b", name: "파랑", hex: 0x1565c0 },
  wb: { id: "wb", name: "흰파랑", hex: 0xbbdefb, stripe: 0x1565c0 },
  wbr: { id: "wbr", name: "흰갈", hex: 0xd7ccc8, stripe: 0x6d4c41 },
  br: { id: "br", name: "갈", hex: 0x6d4c41 },
};

export const T568B = ["wo", "o", "wg", "b", "wb", "g", "wbr", "br"];
export const T568A = ["wg", "g", "wo", "b", "wb", "o", "wbr", "br"];
export const STANDARD_LABEL = { A: "T568A", B: "T568B" };

export const STEPS = [
  "welcome", "pick_cat", "pick_len", "take_reel", "cut", "take_stripper", "strip",
  "return_stripper", "untwist", "arrange", "take_cutter", "trim", "return_cutter",
  "take_plug", "insert", "take_crimper", "crimp", "return_crimper", "flip_end",
  "done_both", "take_tester", "test", "return_tester", "complete",
];

export const JOB_TICKET = "의뢰: Cat5e 1m 스트레이트 · 양끝 T568B";

export const JOB_CHECKS = [
  { id: "accept", label: "의뢰 받기" },
  { id: "reel", label: "Cat5e 가져오기" },
  { id: "cut", label: "커터로 자르기" },
  { id: "stripA", label: "끝 A 재킷 벗기기" },
  { id: "untwistA", label: "끝 A 페어 풀기" },
  { id: "arrangeA", label: "끝 A T568B 정렬" },
  { id: "trimA", label: "끝 A 트림" },
  { id: "crimpA", label: "끝 A RJ45 압착" },
  { id: "endB", label: "반대쪽도 땱같이 T568B" },
  { id: "stripB", label: "끝 B 재킷 벗기기" },
  { id: "crimpB", label: "끝 B 압착" },
  { id: "test", label: "테스터로 확인" },
  { id: "done", label: "의뢰 완료" },
];

function step(body, art) {
  return { title: "지금 할 일", body, hint: "막히면 수첩을 먼저 보세요.", art };
}

export const COACH = {
  welcome: step("첫 의뢰는 Cat5e 1m 스트레이트, 양끝 T568B입니다. 시작하기를 누르세요.", "welcome"),
  pick_cat: step("이 의뢰는 Cat5e로 이미 정해져 있어요. 선반에서 가져오면 됩니다.", "reel"),
  pick_len: step("길이는 1m로 이미 정해져 있어요.", "reel"),
  take_reel: step("선반에서 Cat5e 릴을 작업대로 가져오세요.", "reel"),
  cut: step("커터로 1m만큼 한 번에 자르세요.", "cutter"),
  take_stripper: step("스트리퍼로 재킷만 2.2cm 벗기세요.", "stripper"),
  strip: step("권장 깊이 2.2cm로 재킷만 벗기세요.", "stripper"),
  return_stripper: step("쓴 스트리퍼를 걸이에 거세요.", "hang"),
  untwist: step("네 쌍을 짧게만 푸세요.", "untwist"),
  arrange: step("수첩의 T568B 그림대로 8가닥을 정렬하세요.", "arrange"),
  take_cutter: step("커터로 8가닥 끝을 가지런히 자르세요.", "trim"),
  trim: step("플러그 깊이에 맞게 끝을 트림하세요.", "trim"),
  return_cutter: step("커터를 걸이에 거세요.", "hang"),
  take_plug: step("RJ45를 끼우고 탭은 아래로 두세요.", "insert"),
  insert: step("재킷이 플러그 안까지 들어가게 끼우세요.", "insert"),
  take_crimper: step("크림퍼로 한 번에 압착하세요.", "crimp"),
  crimp: step("크림퍼로 한 번에 힘 있게 압착하세요.", "crimp"),
  return_crimper: step("크림퍼를 걸이에 거세요.", "hang"),
  flip_end: step("반대쪽도 땱같이 T568B로 만드세요.", "crossover"),
  done_both: step("테스터로 8가닥이 이어졌는지 확인하세요.", "tester"),
  take_tester: step("테스터로 양 끝을 확인하세요.", "tester"),
  test: step("테스터로 1부터 8까지 켜지는지 보세요.", "tester"),
  return_tester: step("테스터를 걸이에 걸고 의뢰를 마치세요.", "hang"),
  complete: step("의뢰 완료! 작업대가 깨끗하면 잘한 겁니다.", "complete"),
};

export const COMMON_MISTAKES = [
  { id: "deep", title: "탈피가 너무 깊음", text: "페어가 길게 풀리면 누화가 커져요." },
  { id: "swap36", title: "3·6번 바꿈", text: "녹/주황 페어를 바꾸면 테스터가 어귳나요." },
  { id: "accidental-x", title: "의도치 않은 크로스", text: "양 끝을 다른 표준으로 만들면 크로스가 됩니다." },
  { id: "tab", title: "탭을 뒤집음", text: "탭이 위면 1번이 반대로 가요." },
  { id: "uneven", title: "트림이 들쪽날쪽", text: "짧은 가닥은 핀이 안 닿아 LED가 께줘요." },
  { id: "tools", title: "공구를 두고 감", text: "다음 조를 위해 걸이에 걸어 주세요." },
];
