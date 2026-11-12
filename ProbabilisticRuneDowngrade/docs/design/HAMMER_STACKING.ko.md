# 룬 분해 망치 중첩 — 1.2.0 설계안

아직 구현되지 않은 후속 기능이다. 현재 배포판 1.0.0의 망치는 비중첩이며, 1.1.0은 선택형 몬스터 드롭을 다룬다.

## 목표

다른 중첩 모드를 필수로 요구하지 않고 망치를 보관·분리할 수 있게 한다. 일반 룬이나 분해 대기 아이템은 이 기능으로 중첩하지 않는다.

## 참고 구현과 사용 조건

olegbl의 Stackable Runes/Gems는 단품과 별도 중첩형 아이템, 큐브 변환·분리 조합을 제공한다. 공식 저장소의 확인 커밋은 d999b4b73ceacfafbdbe29ebd77bcdb20448336e이다.

- [Stackable Runes](https://github.com/olegbl/d2rmm.mods/tree/d999b4b73ceacfafbdbe29ebd77bcdb20448336e/StackableRunes)
- [Stackable Gems](https://github.com/olegbl/d2rmm.mods/tree/d999b4b73ceacfafbdbe29ebd77bcdb20448336e/StackableGems)
- [MIT License](https://github.com/olegbl/d2rmm.mods/blob/d999b4b73ceacfafbdbe29ebd77bcdb20448336e/LICENSE), Copyright (c) 2022 Oleg Lokhvitsky.

코드 또는 상당 부분을 재사용하면 원저작권 표시와 MIT 전문을 저장소·설치 ZIP에 포함한다. 기존 게임·외부 이미지의 권리는 별도로 유지한다. 현재 단계에서는 원본 코드를 배포물에 포함하지 않았다.

## 설계 검토

기존 망치 코드 prh를 보존하고 별도 중첩형과 변환 조합을 두는 방식을 우선 검토한다. 최대 중첩 수, 직접 재료 사용 여부와 분리 방법은 구현 검토 후 정한다. 기존 아이템의 저장 형식을 무조건 바꾸는 방식은 피한다.

## 검증 기준

- 여러 개에서 분해 재료로 정확히 1개 소비, 꽝에 1개 반환.
- 수량 1·최대치·초과치의 합치기/분리, 빈 중첩 소멸, 수량 보존.
- 제작·상점·선택형 드롭으로 얻은 망치의 합치기와 가격 계산.
- 저장·재접속·바닥 드롭/줍기, 기존 비중첩 망치와 대기 룬 보존.
- Standard/Tiered 및 다른 중첩·보관함 모드와의 병용.
