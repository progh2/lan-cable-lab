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
    use: "십자 분리대(separator)가 있어 간섭이 적습니다. 서버실·핵심 구간에 씁니다.",
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
    use: "재킷이 더 두껍고 차폐·간격이 엄격합니다. 장거리 10G에 적합.",
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

/** Wire color ids used for both standards */
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
  "welcome",
  "pick_cat",
  "pick_len",
  "take_reel",
  "cut",
  "take_stripper",
  "strip",
  "return_stripper",
  "untwist",
  "arrange",
  "take_cutter",
  "trim",
  "return_cutter",
  "take_plug",
  "insert",
  "take_crimper",
  "crimp",
  "return_crimper",
  "flip_end",
  "done_both",
  "take_tester",
  "test",
  "return_tester",
  "complete",
];

export const COACH = {
  welcome: {
    title: "안녕하세요, 미림 실습실입니다",
    body: "오늘은 UTP 랜선을 직접 만들고 테스터로 확인합니다. 오른쪽 선반에서 재료를, 왼쪽 공구대에서 공구를 꺼내 쓰세요. 쓴 공구는 꼭 걸이에 되돌리세요.",
    hint: "시작하기를 누르거나, 선반의 Cat5e 릴을 살펴보세요.",
  },
  pick_cat: {
    title: "1. 케이블 종류 고르기",
    body: "Cat5e가 기본입니다. Cat6 이상은 십자 분리대가 있고 재킷이 조금 더 굵습니다. 선반의 릴에 마우스를 올리면 속도와 용도가 나옵니다.",
    hint: "선반에서 원하는 카테고리 릴을 클릭하세요.",
  },
  pick_len: {
    title: "2. 길이 고르기",
    body: "실습은 1m 또는 2m면 충분합니다. 너무 짧으면 압착 여유(약 2~3cm)가 없고, 너무 길면 낭비가 됩니다.",
    hint: "화면의 길이 버튼을 누르세요.",
  },
  take_reel: {
    title: "3. 릴에서 케이블 꺼내기",
    body: "선택한 릴을 다시 클릭하면 작업대 위에 케이블이 놓입니다. 재킷 색과 굵기를 확인해 보세요.",
    hint: "선택한 릴을 클릭하세요.",
  },
  cut: {
    title: "4. 길이만큼 자르기",
    body: "커터로 릴에서 필요한 길이만 잘라 냅니다. 공구대에서 커터를 집으세요.",
    hint: "왼쪽 공구대의 커터(가위형)를 클릭하세요.",
  },
  take_stripper: {
    title: "5. 스트리퍼 집기",
    body: "재킷만 벗겨야 합니다. 내부 도체를 상하게 하면 단선·합선이 납니다. 스트리퍼를 공구대에서 집으세요.",
    hint: "스트리퍼를 클릭하세요.",
  },
  strip: {
    title: "6. 재킷 벗기기",
    body: "끝에서 약 2~2.5cm만 벗깁니다. 너무 깊으면 페어가 상하고, 너무 얕으면 플러그에 안 들어갑니다. 케이블 끝을 클릭한 뒤 깊이 슬라이더를 맞추세요.",
    hint: "작업대 케이블 끝을 클릭하세요. 권장 깊이 2.2cm.",
  },
  return_stripper: {
    title: "공구 걸기 — 스트리퍼",
    body: "도구는 쓴 뒤 바로 제자리에. 다음 사람이 찾을 수 있고, 칼날이 작업대를 다치지 않습니다.",
    hint: "공구대의 빈 스트리퍼 자리를 클릭하세요.",
  },
  untwist: {
    title: "7. 페어 풀기",
    body: "네 쌍(주황·녹·파랑·갈)을 살짝 풉니다. 재킷 바로 앞까지 너무 많이 풀면 NEXT(누화)가 커져 기가비트에서 실패할 수 있습니다. 풀린 길이는 짧게!",
    hint: "풀린 페어를 클릭해 정리하세요.",
  },
  arrange: {
    title: "8. 8가닥 배열 (T568A/B)",
    body: "한국 학교·사무실은 보통 T568B입니다. 같은 케이블 양 끝을 같은 규격으로 하면 스트레이트, 한쪽 A·한쪽 B면 크로스오버입니다. 색 순서를 맞추세요.",
    hint: "표준을 고른 뒤, 가닥을 클릭하거나 ‘자동 정렬’로 연습하세요. 일부러 틀린 순서로도 압착은 됩니다.",
  },
  take_cutter: {
    title: "9. 커터로 끝 맞추기",
    body: "8가닥 끝을 가지런히 자릅니다. 길이가 들쭉날쭉하면 핀이 안 닿아 테스터에서 해당 핀이 꺼집니다.",
    hint: "공구대에서 커터를 집으세요.",
  },
  trim: {
    title: "10. 끝 정리(트림)",
    body: "플러그 금핀 깊이까지 딱 맞게 자릅니다. 케이블을 클릭하세요.",
    hint: "작업대 케이블 끝을 클릭해 트림합니다.",
  },
  return_cutter: {
    title: "공구 걸기 — 커터",
    body: "커터를 걸이에 되돌리세요. 날이 열린 채 두면 다칩니다.",
    hint: "공구대의 커터 자리를 클릭하세요.",
  },
  take_plug: {
    title: "11. RJ45 플러그 집기",
    body: "선반의 투명 플러그를 집습니다. 부트(부츠)는 선택입니다. 클립(탭) 방향을 기억하세요.",
    hint: "선반의 RJ45 플러그를 클릭하세요.",
  },
  insert: {
    title: "12. 플러그에 삽입",
    body: "탭(클립)이 아래, 금핀이 위를 향하게 놓고 앞에서 보면 1번 핀이 왼쪽입니다. 재킷이 플러그 안쪽까지 들어가야 압착 시 고정됩니다.",
    hint: "플러그와 케이블을 클릭해 삽입하세요. 탭 방향 토글을 확인!",
  },
  take_crimper: {
    title: "13. 크림퍼 집기",
    body: "압착기(크림퍼)로 금핀을 도체에 박고 스트레인 릴리프를  잡습니다.",
    hint: "공구대의 크림퍼를 클릭하세요.",
  },
  crimp: {
    title: "14. 압착",
    body: "한 번에 힘 있게. 덜 누르면 핀이 뜨고, 두 번 누르면 플러그가 깨질 수 있습니다.",
    hint: "플러그가 끼워진 케이블을 클릭해 압착하세요.",
  },
  return_crimper: {
    title: "공구 걸기 — 크림퍼",
    body: "크림퍼를 제자리에. 무거워서 작업대 끝에 두면 떨어집니다.",
    hint: "공구대 크림퍼 자리를 클릭하세요.",
  },
  flip_end: {
    title: "15. 반대쪽 끝",
    body: "같은 작업을 다른 쪽에도 합니다. 스트레이트는 같은 표준, 크로스오버는 A+B입니다. 허브-허브 구식 연결에 크로스가 쓰였고, 지금은 자동 MDI-X가 많아 스트레이트가 기본입니다.",
    hint: "‘반대쪽 작업’을 누르세요. 표준을 바꿀 수 있습니다.",
  },
  done_both: {
    title: "양 끝 압착 완료",
    body: "이제 테스터로 8가닥 연속성과 배열을 확인합니다.",
    hint: "테스터를 집으세요.",
  },
  take_tester: {
    title: "16. 테스터 집기",
    body: "테스터 본체와 리모컨에 양 끝을 꽂습니다. 공구대(또는 선반 옆)의 테스터를 집으세요.",
    hint: "테스터를 클릭하세요.",
  },
  test: {
    title: "17. 테스트",
    body: "정상 스트레이트면 LED 1→8이 순서대로 켜집니다. 핀이 바뀌면 해당 번호가 어긋나거나 안 켜집니다. 한 끝 A·한 끝 B면 크로스 패턴입니다.",
    hint: "테스터의 버튼을 클릭하세요.",
  },
  return_tester: {
    title: "공구 걸기 — 테스터",
    body: "테스터를 제자리에 두고 실습을 마무리하세요. 공구가 나와 있으면 감점입니다.",
    hint: "테스터 자리를 클릭하세요.",
  },
  complete: {
    title: "실습 완료!",
    body: "잘했습니다. 매뉴얼에서 이론을 복습하고, 다른 카테고리나 크로스오버로 다시 만들어 보세요.",
    hint: "다시 만들기 또는 매뉴얼을 열어 보세요.",
  },
};

export const COMMON_MISTAKES = [
  "재킷을 너무 깊게 벗겨 페어가 길게 풀림",
  "T568B인데 녹/주황 페어를 바꿈 (3·6번 핀)",
  "양 끝을 다른 표준으로 만들어 의도치 않은 크로스오버",
  "플러그 탭 방향을 뒤집어 1번 핀이 반대로 감",
  "트림이 들쭉날쭉해 일부 핀이 접촉 불량",
  "공구를 작업대에 두고 다음 조에게 넘김",
];
