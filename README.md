# 미림 랜선 실습실

브라우저에서 UTP 랜선 제작을 연습하는 3D 실습실입니다.

**GitHub Pages:** https://progh2.github.io/lan-cable-lab/

스마트폰에서는 **아래 큰 버튼(엄지 막대)** 이 기본 조작입니다. 3D를 정확히 찍지 않아도 됩니다.

## 로컬 실행

```bash
./serve.sh
```

또는 `python3 -m http.server 8080`

## 수업

- 위: 3D 작업대
- 가운데: 엄지 조작 막대 (선반 / 공구 / 반납 / 테스트)
- 아래: 그림 코치
- 매뉴얼은 카드처럼 옆으로 넘기며 밥니다.

공구는 사용 후 걸이에 반납합니다.

## 배포

`main` 푸시 시 GitHub Actions가 저장소 루트를 GitHub Pages에 배포합니다.
