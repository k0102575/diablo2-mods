# 구현 근거

`cubemain.txt`에 무기(`weap`)/방어구(`armo`) × 품질 8종 = 16개 조합식을 추가합니다. 입력 장비를 첫 재료로 하고 `nos`로 기존 소켓을 배제합니다. `gem4`는 최상급 해골을 포함하며 말 룬 코드는 `r23`입니다.

출력은 `useitem,sock=6`이며 `sock` 속성은 저품질·일반·고급 6~6, 매직 1~2, 나머지 1~1로 설정합니다. 6은 강제로 모든 장비에 6개를 부여한다는 뜻이 아니라 게임의 장비별/ilvl별 제한까지 요청하는 값입니다. 품질·ilvl·장비 테이블을 덮어쓰지 않습니다.

레거시 동작을 검토한 공개 연구 자료:

- [D2MOO PlrTrade.cpp](https://github.com/ThePhrozenKeep/D2MOO/blob/master/source/D2Game/src/PLAYER/PlrTrade.cpp): 첫 입력의 `useitem` 소켓 출력 검사에서 최대 소켓 0인 장비를 거부. 원본 복제 후 속성을 적용하고, 이미 소켓이 있으면 후속 소켓 출력이 다시 덮어쓰지 않음.
- [D2MOO ItemMods.cpp](https://github.com/ThePhrozenKeep/D2MOO/blob/master/source/D2Common/src/Items/ItemMods.cpp): `ITEMMODS_PropertyFunc14`는 범위 내 무작위 소켓 수를 장비 최대와 인벤토리 크기로 제한.
- [D2MOO Items.cpp](https://github.com/ThePhrozenKeep/D2MOO/blob/master/source/D2Common/src/Items/Items.cpp): `ITEMS_GetMaxSockets`는 ilvl 1~25 / 26~40 / 41 이상 및 베이스 최대치를 반영.
- [D2MOO SUnitNpc.cpp](https://github.com/ThePhrozenKeep/D2MOO/blob/master/source/D2Game/src/UNIT/SUnitNpc.cpp): 라주크 품질별 소켓 보상 규칙.

공개 자료는 동작 확인에만 사용했으며 소스 코드를 복사하지 않았습니다. 레거시 구현은 최신 D2R 엔진과 동일하다는 보장이 없으므로 실제 게임 테스트가 필요합니다. NPC가 수행하는 수리·감정·퀘스트 처리까지 복제하지는 않습니다.
