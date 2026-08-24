# LAN Cable Lab - Complete Test Checklist

**Test Date:** _________  
**Tester:** _________  
**URL:** http://127.0.0.1:8080/  
**Browser:** _________

## Pre-Test Setup
- [ ] Hard refresh browser (Ctrl+Shift+R / Cmd+Shift+R) to bypass cache
- [ ] Open DevTools Console tab to monitor errors
- [ ] Verify screen resolution: _______ x _______

---

## Stage 1: Receipt Stamp (접수)
- [ ] **Title displays:** "미팀바이스랩 - 랜선 검사실"
- [ ] **Ticket visible** with specs:
  - [ ] No.001 작업지시서
  - [ ] Cat5e 1m 스트레이트
  - [ ] 양쪽 T568B  
  - [ ] 관통형 RJ45
  - [ ] 부트 필수
- [ ] **Wire color legend visible:** 8 colored squares (WO, O, WG, B, WB, G, WBr, Br)
- [ ] **Red 접수 stamp** visible at bottom right
- [ ] **Dashed target box** with text "접수 도장을 여기로"
- [ ] **Drag stamp** to target → smooth transition to reel stage

**Result:** ☐ PASS  ☐ FAIL  
**Notes:** _______________________________________________

---

## Stage 2: Reel Selection
- [ ] **Four reels visible** with different colors
- [ ] **Tap/click a reel** → modal shows "제 잇 인쇄" with specs
- [ ] **Modal close button** "닫기" works
- [ ] **Workbench target** visible: "작업대 - 릴을 여기로"

### Test Wrong Reel
- [ ] Drag **wrong reel** (not green CAT5E) to workbench
- [ ] **반려 stamp** appears (red rejection stamp)
- [ ] **Error message** displays explaining mismatch
- [ ] Rejection auto-clears after 2-3 seconds

### Test Correct Reel
- [ ] Drag **green CAT5E reel** to workbench
- [ ] Smooth transition to cutting stage

**Result:** ☐ PASS  ☐ FAIL  
**Notes:** _______________________________________________

---

## Stage 3: Cutting (NEW - CRITICAL TEST)

### Visual Elements
- [ ] **Green band** visible on ruler around 1.0m mark
- [ ] **Ruler labels:** 0, 0.5m, 1.0m, 1.5m clearly marked
- [ ] **Green cable** with orange copper tip visible
- [ ] **Red 커터 tool** at bottom
- [ ] **Readout displays:** "푼 길이 X.XX m · 커터를 1.0m 띠 위에"

### Test Wrong Length (Rejection)
- [ ] Drag **copper tip** to extend cable to ~0.5m
- [ ] **Readout updates** with snapped value (multiples of 0.01m)
- [ ] Drag **커터** onto the cable body (on the green cable itself)
- [ ] **Button appears:** "이 길이로 자르기"
- [ ] **Button stays visible** (doesn't flicker)
- [ ] **Click button**
- [ ] **반려 stamp** appears with message "0.XX m — 너무 짧습니다. 1.00m ±5cm."
- [ ] Rejection auto-clears, returns to same stage

### Test Correct Length
- [ ] Drag **copper tip** to extend cable until readout shows **~1.00m**
  - Note: Should snap to 0.95m - 1.05m (within green band)
  - Actual value tested: _______ m
- [ ] Verify tip is **within or near green band**
- [ ] Drag **커터** onto cable body **in green band area**
- [ ] **Button appears:** "이 길이로 자르기"
- [ ] **Button remains stable** (no flickering)
- [ ] **Click button**
- [ ] **Success:** Smooth transition to strip stage (no rejection)

**Result:** ☐ PASS  ☐ FAIL  
**Critical Issues:** _______________________________________________

---

## Stage 4: Strip (재킷 벗기기)

### Visual Elements
- [ ] **CM ruler** visible (0 끝 to 5cm)
- [ ] **Green band** around 3cm mark
- [ ] **Cable segment** visible
- [ ] **스트리퍼 tool** visible
- [ ] **Jacket piece** labeled "재킷 · 잡아 벗기기"
- [ ] **Readout:** "끝 A · 칼날 — cm"

### Test Strip Process
- [ ] Drag **스트리퍼** along ruler
- [ ] **Readout updates** showing depth (should target ~3.0cm in green band)
- [ ] Position stripper at **~3.0cm** (within green band)
- [ ] **Drag jacket piece** far away (off screen or to edge)
- [ ] **Success:** Transition to untwist stage

**Result:** ☐ PASS  ☐ FAIL  
**Notes:** _______________________________________________

---

## Stage 5: Untwist (쌍 풀기)

### Visual Elements
- [ ] **Four twisted pairs** visible (different colors)
- [ ] **Clear instruction** to untwist pairs

### Test Untwist Process
- [ ] **Drag/flick pair 1** → pair separates into 2 wires
- [ ] **Drag/flick pair 2** → pair separates
- [ ] **Drag/flick pair 3** → pair separates
- [ ] **Drag/flick pair 4** → pair separates
- [ ] **8 individual wires** now visible
- [ ] **Drag/flick each** of 8 wires to spread them out
- [ ] **After all 8 wires** are separated: primary button appears
- [ ] **Click primary** → transition to sort stage

**Result:** ☐ PASS  ☐ FAIL  
**Notes:** _______________________________________________

---

## Stage 6: Sort (정렬)

### Visual Elements
- [ ] **8 colored wires** visible, scattered
- [ ] **8 numbered slots** (1-8) at top or designated area
- [ ] **T568B order reference** visible somewhere on screen
- [ ] **No auto-sort button** exists

### Test Wrong Order (Optional but Recommended)
- [ ] Drag wires into slots in **wrong order**
- [ ] Complete through Insert → Inspect stages
- [ ] At Inspect: **반려** should occur
- [ ] Verify returns to **sort stage** to fix

### Test Correct T568B Order
Drag wires into slots 1-8 in this exact order:
1. [ ] **Slot 1:** 흰주황 (White-Orange)
2. [ ] **Slot 2:** 주황 (Orange)
3. [ ] **Slot 3:** 흰녹 (White-Green)
4. [ ] **Slot 4:** 파랑 (Blue)
5. [ ] **Slot 5:** 흰파랑 (White-Blue)
6. [ ] **Slot 6:** 녹 (Green)
7. [ ] **Slot 7:** 흰갈 (White-Brown)
8. [ ] **Slot 8:** 갈 (Brown)

- [ ] **All 8 wires placed** correctly
- [ ] **Primary button** appears
- [ ] **Click** → transition to boot stage

**Result:** ☐ PASS  ☐ FAIL  
**Notes:** _______________________________________________

---

## Stage 7: Boot (부트 끼우기)

### Visual Elements
- [ ] **Cable** visible (sorted wires bundled)
- [ ] **부트** (boot) piece visible
- [ ] **Plug** should be visible but **not yet interactable**

### Test Boot Installation
- [ ] **Drag 부트** onto cable
- [ ] **Boot snaps** into position on cable
- [ ] **Plug becomes available** (if it wasn't before)
- [ ] **Primary button** or auto-transition to insert stage

**Result:** ☐ PASS  ☐ FAIL  
**Notes:** _______________________________________________

---

## Stage 8: Insert (삽입)

### Visual Elements
- [ ] **Wire bundle** visible
- [ ] **Pass-through RJ45 plug** visible
- [ ] **Instruction** about inserting until wires emerge

### Test Insertion
- [ ] **Drag wire bundle** into plug
- [ ] Wires should **visibly emerge** from other end of plug
- [ ] **"출구 확인" button** appears
- [ ] **Click button** → transition to inspect stage

**Result:** ☐ PASS  ☐ FAIL  
**Notes:** _______________________________________________

---

## Stage 9: Inspect (검수)

### Visual Elements
- [ ] **8 magnified holes** visible (close-up view of plug end)
- [ ] Each hole shows **wire color**
- [ ] **Instruction** to verify T568B order

### Test Inspection
- [ ] **Verify colors** in holes match T568B order (1-8):
  - 1: 흰주황, 2: 주황, 3: 흰녹, 4: 파랑, 5: 흰파랑, 6: 녹, 7: 흰갈, 8: 갈
- [ ] **"색이 맞다" button** or similar appears
- [ ] **Click** → transition to crimp stage

**If wrong order was used:**
- [ ] **반려 stamp** appears
- [ ] **Returns to sort stage** to re-arrange wires

**Result:** ☐ PASS  ☐ FAIL  
**Notes:** _______________________________________________

---

## Stage 10: Crimp (압착)

### Visual Elements
- [ ] **RJ45 plug** with inserted wires visible
- [ ] **크림퍼** (crimper) tool visible

### Test Crimping Process
- [ ] **Drag 크림퍼** onto the plug
- [ ] **Release mouse/touch** (drop crimper on plug)
- [ ] **Press and HOLD** crimper button/tool
- [ ] **Progress indicator** or animation shows crimping
- [ ] **Hold until complete** (don't release early)
- [ ] **Success:** Crimping completes

**Result:** ☐ PASS  ☐ FAIL  
**Notes:** _______________________________________________

---

## CRITICAL: End A → End B Transition

### Cable Graphic Change (MUST VERIFY)
After End A crimp completes:
- [ ] **Cable strip at top changes**
- [ ] **Left side:** Shows completed RJ45 plug + boot (End A finished)
- [ ] **Right side:** Shows bare cable (End B not started yet)
- [ ] **Label or indicator** shows now working on "끝 B" (End B)

**Screenshot or describe cable graphic:** _______________________________________________

### End B Workflow
Repeat stages 4-10 for End B:
- [ ] **Stage 4:** Strip (new jacket, new 3cm strip)
- [ ] **Stage 5:** Untwist (new pairs/wires - or skip if already done?)
- [ ] **Stage 6:** Sort (new order or re-use?)
- [ ] **Stage 7:** Boot (new boot for End B)
- [ ] **Stage 8:** Insert (new plug for End B)
- [ ] **Stage 9:** Inspect (verify End B colors)
- [ ] **Stage 10:** Crimp (End B crimp)

### Final Completion
- [ ] After End B crimp: **Completion screen** or **final stamp**
- [ ] **Cable graphic** shows both ends complete (plugs + boots on both sides)

**Result:** ☐ PASS  ☐ FAIL  
**Notes:** _______________________________________________

---

## Mobile/Responsive Test (~390px width)

### Resize Browser
- [ ] Resize browser to **~390px width** (iPhone SE / small mobile)
- [ ] OR use DevTools device emulation

### Test at Mobile Width
- [ ] **Ticket remains readable**
- [ ] **All drag targets** are large enough for touch (minimum 44x44px)
- [ ] **Tools (stamps, cutter, stripper, etc.)** are easy to drag
- [ ] **Text is legible** (not too small)
- [ ] **No horizontal scrolling** required
- [ ] **All stages functional** at narrow width

**Tested stages at 390px:**
- [ ] Receipt stamp
- [ ] Reel selection  
- [ ] Cutting
- [ ] Strip
- [ ] Untwist
- [ ] Sort
- [ ] Boot
- [ ] Insert
- [ ] Inspect
- [ ] Crimp

**Result:** ☐ PASS  ☐ FAIL  
**Issues:** _______________________________________________

---

## Console Errors

### JavaScript Errors
List any errors that appear in DevTools Console:

1. _______________________________________________
2. _______________________________________________
3. _______________________________________________

### Network Errors
- [ ] Any failed resource loads? (other than favicon.ico)

_______________________________________________

---

## Final Assessment

### Can a Student Complete Without Skip Button?
- [ ] **YES** - All stages completable through drag interactions
- [ ] **NO** - Stuck at stage: _______

### Severity 1 Bugs (Blocking)
1. _______________________________________________
2. _______________________________________________

### Severity 2 Bugs (High - Impacts UX)
1. _______________________________________________
2. _______________________________________________

### Severity 3 Bugs (Medium - Annoying but Workaroundable)
1. _______________________________________________
2. _______________________________________________

### Severity 4 Bugs (Low - Polish/Cosmetic)
1. _______________________________________________
2. _______________________________________________

---

## Overall Verdict

☐ **PASS** - Ready for student use  
☐ **PASS WITH MINOR ISSUES** - Works but has cosmetic bugs  
☐ **FAIL** - Critical bugs prevent completion  

**Summary:** _______________________________________________
_______________________________________________
_______________________________________________

**Tester Signature:** ___________ **Date:** ___________
