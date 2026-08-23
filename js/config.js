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
    use: "십자 분리대(separator)가 있어 간섭이 적습니다. 서버실·핵심 구간에 쓰니다.",
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

export const COACH = {
  welcome: { title: "안녕하세요, 미림 실습실입니다", body: "작업대에서 랜선을 만들고, 공구는 걸이에 돌려 주세요.", hint: "시작하기를 누르거나, 아래 버튼으로 선반을 골라 보세요.", art: "welcome" },
  pick_cat: { title: "1. 케이블 종류 고르기", body: "교실 기본은 Cat5e예요. 큰 색깔 버튼을 눌러 고르세요.", hint: "Cat5e / 6 / 6a / 7 중 하나를 눌러 주세요.", art: "reel" },
  pick_len: { title: "2. 길이 고르기", body: "실습은 1m 또는 2m면 충분해요.", hint: "길이 버튼을 누르세요.", art: "reel" },
  take_reel: { title: "3. 릴에서 케이블 께내기", body: "같은 릴을 한 번 더 누르면 작업대에 올라와요.", hint: "‘선반 고르기’ 또는 같은 카테고리 버튼을 누르세요.", art: "reel" },
  cut: { title: "4. 길이만큼 자르기", body: "커터로 릴에서 필요한 길이만 잘라요.", hint: "아래 ‘커터’를 누른 뒤 ‘케이블 작업’을 누르세요.", art: "cutter" },
  take_stripper: { title: "5. 스트리퍼 집기", body: "재킷만 벗기는 칼이에요. 도체를 베지 않게 조심!", hint: "‘스트리퍼’ 큰 버튼을 누르세요.", art: "stripper" },
  strip: { title: "6. 재킷 벗기기", body: "끝에서 약 2~2.5cm만 벗겨요. 권장은 2.2cm.", hint: "깊이를 맞춘 뒤 ‘이 깊이로 벗기기’를 누르세요.", art: "stripper" },
  return_stripper: { title: "공구 걸기 — 스트리퍼", body: "쓠 공구는 바로 걸이에 걸어야 다음 친구가 찾아요.", hint: "‘반납’ 또는 스트리퍼 타일을 다시 누르세요.", art: "hang" },
  untwist: { title: "7. 페어 풀기", body: "네 쌍을 살짝만 풀어요. 너무 많이 풀면 누화가 커져요.", hint: "‘케이블 작업’을 눌러 페어를 정리하세요.", art: "untwist" },
  arrange: { title: "8. 8가닥 배열 (T568A/B)", body: "학교는 보통 T568B. 양 끝이 같으면 스트레이트예요.", hint: "표준을 고른 뒤 ‘규격대로 정렬’을 눌러 보세요.", art: "arrange" },
  take_cutter: { title: "9. 커터로 끝 맞추기", body: "8가닥 끝을 가지런히 잘라야 핀이 모두 닻아요.", hint: "‘커터’를 집으세요.", art: "cutter" },
  trim: { title: "10. 끝 정리(트림)", body: "플러그 금핀 깊이에 딱 맞게 잘라요.", hint: "‘케이블 작업’으로 트림하세요.", art: "trim" },
  return_cutter: { title: "공구 걸기 — 커터", body: "랡이 열린 커터는 걸이에 걸어야 안전해요.", hint: "‘반납’을 누르세요.", art: "hang" },
  take_plug: { title: "11. RJ45 플러그 집기", body: "탭(클립)이 아래, 왼쪽이 1번이에요.", hint: "‘플러그’ 버튼을 누르세요.", art: "insert" },
  insert: { title: "12. 플러그에 삽입", body: "재킷이 플러그 안쪽까지 들어가야 압착이 단단해요.", hint: "탭 방향을 확인하고 ‘케이블 작업’으로 넣으세요.", art: "insert" },
  take_crimper: { title: "13. 크림퍼 집기", body: "압착기로 금핀을 도체에 박아요.", hint: "‘크림퍼’를 누르세요.", art: "crimp" },
  crimp: { title: "14. 압착", body: "한 번에 힘 있게. 두 번은 플러그가 깨질 수 있어요.", hint: "‘케이블 작업’으로 압착하세요.", art: "crimp" },
  return_crimper: { title: "공구 걸기 — 크림퍼", body: "무거운 크림퍼는 작업대 끝에 두지 말고 걸이에.", hint: "‘반납’을 누르세요.", art: "hang" },
  flip_end: { title: "15. 반대쪽 끝", body: "같은 표준이면 스트레이트, A+B면 크로스오버예요.", hint: "‘반대쪽 작업 시작’을 누르세요.", art: "crossover" },
  done_both: { title: "양 끝 압착 완료", body: "이제 테스터로 8가닥이 이어졌는지 확인해요.", hint: "‘테스터’를 집으세요.", art: "tester" },
  take_tester: { title: "16. 테스터 집기", body: "본체와 리모컨에 양 끝을 꼭아요.", hint: "‘테스터’를 누르세요.", art: "tester" },
  test: { title: "17. 테스트", body: "스트레이트면 LED가 1→8 순서대로 켜져요.", hint: "‘테스트 시작’을 누르세요.", art: "tester" },
  return_tester: { title: "공구 걸기 — 테스터", body: "테스터를 제자리에 두면 실습이 끝나요.", hint: "‘반납’을 누르세요.", art: "hang" },
  complete: { title: "실습 완료!", body: "잘했어요! 다른 카테고리나 크로스오버로 다시 만들어 보세요.", hint: "새 케이블 또는 매뉴얼을 열어 보세요.", art: "complete" },
};

export const COMMON_MISTAKES = [
  { id: "deep", title: "탈피가 너무 깊음", text: "페어가 길게 풀리면 누화가 커져요." },
  { id: "swap36", title: "3·6번 바꿈", text: "녹/주황 페어를 바꾸면 테스터가 어귳나요." },
  { id: "accidental-x", title: "의도치 않은 크로스", text: "양 끝을 다른 표준으로 만들면 크로스가 됩니다." },
  { id: "tab", title: "탭을 뒤집음", text: "탭이 위면 1번이 반대로 가요." },
  { id: "uneven", title: "트림이 들쪹날쪹", text: "짧은 가닥은 핀이 안 닻아 LED가 꺼져요." },
  { id: "tools", title: "공구를 두고 감", text: "다음 조를 위해 걸이에 걸어 주세요." },
];
