# 구현 근거 — 1.1.0

`cubemain.txt`에 무기(`weap`)/방어구(`armo`) × 아래 작업/품질 조합 9종 = **18개 조합식**을 추가합니다. 장비를 첫 재료로 하고 `nos`로 기존 소켓을 배제합니다. `gem4`는 최상급 해골을 포함합니다.

| 작업 | 품질 | 룬 코드 | sock min / max | 행 수 |
|---|---|---|---|---:|
| 최대 | low / nor / hiq | 움 r22 | 6 / 6 | 6 |
| 랜덤 | hiq만 | 풀 r21 | 1 / 6 | 2 |
| 라주크 | mag | 말 r23 | 1 / 2 | 2 |
| 라주크 | rar / set / uni / crf | 말 r23 | 1 / 1 | 8 |

`recipes`는 mode/quality/rune/min/max 명세를 갖습니다. 출력은 `useitem,sock=6`이며 소켓 속성은 위 범위입니다. 6은 모든 장비에 6개를 강제로 부여한다는 뜻이 아니라 게임의 장비별/ilvl별 제한까지 요청하는 값입니다. 랜덤은 1~6 추첨 후 상한을 적용하므로 최대 4인 장비는 4개가 나올 기대 확률이 50%입니다. hiq+r21과 hiq+r22는 재료가 달라 구분됩니다. 엘리트 등급/무형은 별도 품질로 처리하지 않습니다.

1.0.x의 말+low/nor/hiq 최대 소켓 행은 새 버전에서 생성하지 않습니다. 기존 게임의 행을 삭제하는 코드는 없으며 D2RMM 전체 재설치가 이전 모드 출력을 대체합니다. 장비 테이블·아이템 레벨·품질·드롭·저장 형식은 변경하지 않습니다. 별도 config 항목은 없습니다.

1.0.1의 경로 수정을 유지합니다. 경로는 `String.fromCharCode(92)`로 구분자 한 개를 생성하여 다른 모드와 동일한 D2RMM 캐시 키를 사용합니다. 자동 검사는 양쪽 설치 순서에서 움·풀·말 및 보석 전환·묶음 분리와 18개 소켓 조합식을 함께 보존하는지 확인합니다. 이 검사는 게임 실행을 대신하지 않습니다.

레거시 동작을 검토한 공개 연구 자료:

- [D2MOO PlrTrade.cpp](https://github.com/ThePhrozenKeep/D2MOO/blob/master/source/D2Game/src/PLAYER/PlrTrade.cpp): 첫 입력의 `useitem` 소켓 출력 검사에서 최대 소켓 0인 장비를 거부. 원본 복제 후 속성을 적용하고, 이미 소켓이 있으면 후속 소켓 출력이 다시 덮어쓰지 않음.
- [D2MOO ItemMods.cpp](https://github.com/ThePhrozenKeep/D2MOO/blob/master/source/D2Common/src/Items/ItemMods.cpp): `ITEMMODS_PropertyFunc14`는 범위 내 무작위 소켓 수를 장비 최대와 인벤토리 크기로 제한.
- [D2MOO Items.cpp](https://github.com/ThePhrozenKeep/D2MOO/blob/master/source/D2Common/src/Items/Items.cpp): `ITEMS_GetMaxSockets`는 ilvl 1~25 / 26~40 / 41 이상 및 베이스 최대치를 반영.
- [D2MOO SUnitNpc.cpp](https://github.com/ThePhrozenKeep/D2MOO/blob/master/source/D2Game/src/UNIT/SUnitNpc.cpp): 라주크 품질별 소켓 보상 규칙.

공개 자료는 동작 확인에만 사용했으며 소스 코드를 복사하지 않았습니다. 레거시 구현은 최신 D2R 엔진과 동일하다는 보장이 없으므로 실제 게임 테스트가 필요합니다. NPC가 수행하는 수리·감정·퀘스트 처리까지 복제하지는 않습니다.
