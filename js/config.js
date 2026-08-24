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
    use: "\uad50\uc2e4\u00b7\uc77c\ubc18 \ub124\ud2b8\uc6cc\ud06c\uc758 \uae30\ubcf8. \ubbf8\ub9bc\uc5d0\uc11c\ub3c4 \uac00\uc7a5 \ub9ce\uc774 \uc5f0\uc2b5\ud569\ub2c8\ub2e4.",
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
    use: "\uc2ed\uc790 \ubd84\ub9ac\ub300(separator)\uac00 \uc788\uc5b4 \uac04\uc12d\uc774 \uc801\uc2b5\ub2c8\ub2e4. \uc11c\ubc84\uc2e4\u00b7\ud575\uc2ec \uad6c\uac04\uc5d0 \uc4ed\ub2c8\ub2e4.",
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
    use: "\uc7ac\ud0b7\uc774 \ub354 \ub450\uaed8\uace0 \ucc28\ud3d0\u00b7\uac04\uaca9\uc774 \uc5c4\uaca9\ud569\ub2c8\ub2e4. \uc7a5\uac70\ub9ac 10G\uc5d0 \uc801\ud569.",
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
    use: "\uac1c\ubcc4 \ud398\uc5b4 \ucc28\ud3d0(S/FTP). \ud559\uad50 \uc2e4\uc2b5\ubcf4\ub2e4 \ud2b9\uc218 \uc124\ube44\uc5d0\uc11c \ub354 \ud754\ud569\ub2c8\ub2e4.",
    unlocked: true,
  },
};

export const LENGTHS = [
  { id: "1m", label: "1 m", meters: 1 },
  { id: "2m", label: "2 m", meters: 2 },
];

export const WIRE_DEFS = {
  wo: { id: "wo", name: "\ud770\uc8fc\ud669", hex: 0xffe0b2, stripe: 0xe67e22 },
  o: { id: "o", name: "\uc8fc\ud669", hex: 0xe67e22 },
  wg: { id: "wg", name: "\ud770\ub179", hex: 0xc8e6c9, stripe: 0x2e7d32 },
  g: { id: "g", name: "\ub179", hex: 0x2e7d32 },
  b: { id: "b", name: "\ud30c\ub791", hex: 0x1565c0 },
  wb: { id: "wb", name: "\ud770\ud30c\ub791", hex: 0xbbdefb, stripe: 0x1565c0 },
  wbr: { id: "wbr", name: "\ud770\uac08", hex: 0xd7ccc8, stripe: 0x6d4c41 },
  br: { id: "br", name: "\uac08", hex: 0x6d4c41 },
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

export const JOB_TICKET = "\uc758\ub8b0: Cat5e 1m \uc2a4\ud2b8\ub808\uc774\ud2b8 \u00b7 \uc591\ub05d T568B";

export const JOB_CHECKS = [
  { id: "accept", label: "\uc758\ub8b0 \ubc1b\uae30" },
  { id: "reel", label: "Cat5e \uac00\uc838\uc624\uae30" },
  { id: "cut", label: "\ucee4\ud130\ub85c \uc790\ub974\uae30" },
  { id: "stripA", label: "\ub05d A \uc7ac\ud0b7 \ubc97\uae30\uae30" },
  { id: "untwistA", label: "\ub05d A \ud398\uc5b4 \ud480\uae30" },
  { id: "arrangeA", label: "\ub05d A T568B \uc815\ub82c" },
  { id: "trimA", label: "\ub05d A \ud2b8\ub9bc" },
  { id: "crimpA", label: "\ub05d A RJ45 \uc555\ucc29" },
  { id: "endB", label: "\ubc18\ub300\ucabd\ub3c4 \ub611\uac19\uc774 T568B" },
  { id: "stripB", label: "\ub05d B \uc7ac\ud0b7 \ubc97\uae30\uae30" },
  { id: "crimpB", label: "\ub05d B \uc555\ucc29" },
  { id: "test", label: "\ud14c\uc2a4\ud130\ub85c \ud655\uc778" },
  { id: "done", label: "\uc758\ub8b0 \uc644\ub8cc" },
];

function step(body, art) {
  return { title: "\uc9c0\uae08 \ud560 \uc77c", body, hint: "\ub9c9\ud788\uba74 \uc218\ucca9\uc744 \uba3c\uc800 \ubcf4\uc138\uc694.", art };
}

export const COACH = {
  welcome: step("\uccab \uc758\ub8b0\ub294 Cat5e 1m \uc2a4\ud2b8\ub808\uc774\ud2b8, \uc591\ub05d T568B\uc785\ub2c8\ub2e4. \uc2dc\uc791\ud558\uae30\ub97c \ub204\ub974\uc138\uc694.", "welcome"),
  pick_cat: step("\uc774 \uc758\ub8b0\ub294 Cat5e\ub85c \uc774\ubbf8 \uc815\ud574\uc838 \uc788\uc5b4\uc694. \uc120\ubc18\uc5d0\uc11c \uac00\uc838\uc624\uba74 \ub429\ub2c8\ub2e4.", "reel"),
  pick_len: step("\uae38\uc774\ub294 1m\ub85c \uc774\ubbf8 \uc815\ud574\uc838 \uc788\uc5b4\uc694.", "reel"),
  take_reel: step("\uc120\ubc18\uc5d0\uc11c Cat5e \ub9b4\uc744 \uc791\uc5c5\ub300\ub85c \uac00\uc838\uc624\uc138\uc694.", "reel"),
  cut: step("\ucee4\ud130\ub85c 1m\ub9cc\ud07c \ud55c \ubc88\uc5d0 \uc790\ub974\uc138\uc694.", "cutter"),
  take_stripper: step("\uc2a4\ud2b8\ub9ac\ud37c\ub85c \uc7ac\ud0b7\ub9cc 2.2cm \ubc97\uae30\uc138\uc694.", "stripper"),
  strip: step("\uad8c\uc7a5 \uae4a\uc774 2.2cm\ub85c \uc7ac\ud0b7\ub9cc \ubc97\uae30\uc138\uc694.", "stripper"),
  return_stripper: step("\uc4f4 \uc2a4\ud2b8\ub9ac\ud37c\ub97c \uac78\uc774\uc5d0 \uac70\uc138\uc694.", "hang"),
  untwist: step("\ub124 \uc30d\uc744 \uc9e7\uac8c\ub9cc \ud478\uc138\uc694.", "untwist"),
  arrange: step("\uc218\ucca9\uc758 T568B \uadf8\ub9bc\ub300\ub85c 8\uac00\ub2e5\uc744 \uc815\ub82c\ud558\uc138\uc694.", "arrange"),
  take_cutter: step("\ucee4\ud130\ub85c 8\uac00\ub2e5 \ub05d\uc744 \uac00\uc9c0\ub7f0\ud788 \uc790\ub974\uc138\uc694.", "trim"),
  trim: step("\ud50c\ub7ec\uadf8 \uae4a\uc774\uc5d0 \ub9de\uac8c \ub05d\uc744 \ud2b8\ub9bc\ud558\uc138\uc694.", "trim"),
  return_cutter: step("\ucee4\ud130\ub97c \uac78\uc774\uc5d0 \uac70\uc138\uc694.", "hang"),
  take_plug: step("RJ45\ub97c \ub07c\uc6b0\uace0 \ud0ed\uc740 \uc544\ub798\ub85c \ub450\uc138\uc694.", "insert"),
  insert: step("\uc7ac\ud0b7\uc774 \ud50c\ub7ec\uadf8 \uc548\uae4c\uc9c0 \ub4e4\uc5b4\uac00\uac8c \ub07c\uc6b0\uc138\uc694.", "insert"),
  take_crimper: step("\ud06c\ub9bc\ud37c\ub85c \ud55c \ubc88\uc5d0 \uc555\ucc29\ud558\uc138\uc694.", "crimp"),
  crimp: step("\ud06c\ub9bc\ud37c\ub85c \ud55c \ubc88\uc5d0 \ud798 \uc788\uac8c \uc555\ucc29\ud558\uc138\uc694.", "crimp"),
  return_crimper: step("\ud06c\ub9bc\ud37c\ub97c \uac78\uc774\uc5d0 \uac70\uc138\uc694.", "hang"),
  flip_end: step("\ubc18\ub300\ucabd\ub3c4 \ub611\uac19\uc774 T568B\ub85c \ub9cc\ub4dc\uc138\uc694.", "crossover"),
  done_both: step("\ud14c\uc2a4\ud130\ub85c 8\uac00\ub2e5\uc774 \uc774\uc5b4\uc84c\ub294\uc9c0 \ud655\uc778\ud558\uc138\uc694.", "tester"),
  take_tester: step("\ud14c\uc2a4\ud130\ub85c \uc591 \ub05d\uc744 \ud655\uc778\ud558\uc138\uc694.", "tester"),
  test: step("\ud14c\uc2a4\ud130\ub85c 1\ubd80\ud130 8\uae4c\uc9c0 \ucf1c\uc9c0\ub294\uc9c0 \ubcf4\uc138\uc694.", "tester"),
  return_tester: step("\ud14c\uc2a4\ud130\ub97c \uac78\uc774\uc5d0 \uac78\uace0 \uc758\ub8b0\ub97c \ub9c8\uce58\uc138\uc694.", "hang"),
  complete: step("\uc758\ub8b0 \uc644\ub8cc! \uc791\uc5c5\ub300\uac00 \uae68\ub057\ud558\uba74 \uc798\ud55c \uac81\ub2c8\ub2e4.", "complete"),
};

export const COMMON_MISTAKES = [
  { id: "deep", title: "\ud0c8\ud53c\uac00 \ub108\ubb34 \uae4a\uc74c", text: "\ud398\uc5b4\uac00 \uae38\uac8c \ud480\ub9ac\uba74 \ub204\ud654\uac00 \ucee4\uc838\uc694." },
  { id: "swap36", title: "3\u00b76\ubc88 \ubc14\uafc8", text: "\ub179/\uc8fc\ud669 \ud398\uc5b4\ub97c \ubc14\uafb8\uba74 \ud14c\uc2a4\ud130\uac00 \uc5b4\uadf3\ub098\uc694." },
  { id: "accidental-x", title: "\uc758\ub3c4\uce58 \uc54a\uc740 \ud06c\ub85c\uc2a4", text: "\uc591 \ub05d\uc744 \ub2e4\ub978 \ud45c\uc900\uc73c\ub85c \ub9cc\ub4e4\uba74 \ud06c\ub85c\uc2a4\uac00 \ub429\ub2c8\ub2e4." },
  { id: "tab", title: "\ud0ed\uc744 \ub4a4\uc9d1\uc74c", text: "\ud0ed\uc774 \uc704\uba74 1\ubc88\uc774 \ubc18\ub300\ub85c \uac00\uc694." },
  { id: "uneven", title: "\ud2b8\ub9bc\uc774 \ub4e4\ucabd\ub0a0\ucabd", text: "\uc9e7\uc740 \uac00\ub2e5\uc740 \ud540\uc774 \uc548 \ub2ee\uc544 LED\uac00 \uaed8\uc838\uc694." },
  { id: "tools", title: "\uacf5\uad6c\ub97c \ub450\uace0 \uac10", text: "\ub2e4\uc74c \uc870\ub97c \uc704\ud574 \uac78\uc774\uc5d0 \uac78\uc5b4 \uc8fc\uc138\uc694." },
];
