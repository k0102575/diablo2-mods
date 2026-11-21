# 구현 및 조사 기록

## 1.1.0-alpha.3 중첩형 아이콘

보관형 phs의 HD asset을 prg/dismantling_hammer_stack으로 분리했다. 정상/lowend RGBA v31 sprite 두 개와 research/stacked-hammer-icon.json의 해시를 빌드에 포함한다. 단품 asset과 sprite를 덮어쓰지 않으며 새 misc 모델 별칭은 현재 게임에서 읽은 망치 바닥 모델을 그대로 쓴다. 클래식 invfile은 단품의 기존 참조를 유지한다.

## 1.1.0-alpha.2 중첩 보관

원래 단품 prh/prgh를 유지하고 보관형 phs/prgs를 추가한다. 묶음은 stackable=1, minstack=1, maxstack=256, spawnstack=1, compactsave=0이며 상점/드롭/고급창고 자동중첩 대상에서 제외한다. 동일 망치 HD 자산을 재사용해 새 이미지 파일은 추가하지 않는다.

단품→묶음1 조합1개와 quantity=1..256 각각에 대응하는 인출 조합256개를 추가한다. 인출 결과는 단품prh,nor와 (수량>1일때만)phs,qty=N-1이다. quantity스탯의 현재 행 위치를 이름으로 조회하며 ID70을 고정하지 않는다. 기존 분해3232+제작3+변환/분리257=3492행을 추가하며 안전 상한에 모두 포함한다.

olegbl MIT 패턴을 응용한 구간을 주석에 표시했다. 설치ZIP에 LICENSES/olegbl-MIT.txt를 포함한다. 런타임 엔진 수량/자동합치기/가격 동작은 별도 게임 검사 대상이다.

## 1.1.0-alpha.1 선택형 드롭

설치 옵션을 먼저 검증한다. 활성화된 경우에만 global/excel/treasureclassex.txt를 읽고 15개 Good 행의 존재·유일성·양수 Picks·가중치·빈 슬롯을 검사한다. 모든 대상이 통과하면 표의 복사본에 빈 후보 칸 하나씩만 채워 저장한다. NoDrop과 기존 Prob/Picks, 행 순서 및 다른 모드의 필드는 보존한다. 후보 추가로 실제 상대 확률은 변하며 게임 엔진에서의 드롭 빈도는 미검증이다. 원본 파일을 직접 수정하지 않고 D2RMM 병합 출력만 쓴다.

## 현재 구현 — 1.0.0

Standard/Tiered 공통 생성기를 사용합니다. 대기 아이템 32종, 분해 조합 3,232개와 망치 제작 3개(총 3,235개), 망치 판매 옵션과 룬별 확률 툴팁을 제공합니다. 원래 룬·퀘스트 망치·몬스터 드롭 테이블은 변경하지 않습니다. 최신 검증 상태는 [TESTING.ko.md](TESTING.ko.md)를 참고하세요.

아래는 개발 시점별 근거·문제 해결 기록입니다. 과거의 미검증 표기와 구현 수량은 당시 버전 기준이며 현재 상태는 위 요약과 검증 기록을 따릅니다.

## 확인한 근거

- [공식 D2RMM DOCS](https://github.com/olegbl/d2rmm/blob/master/DOCS.md): 모드는 설치 시 데이터를 변경하며 런타임 게임 스크립트가 아니다.
- [공식 ModConfig 타입](https://github.com/olegbl/d2rmm/blob/master/src/bridge/ModConfig.d.ts): number/defaultValue/minValue/maxValue, checkbox, select/options의 실제 정의를 확인했다.
- [공식 ModAPI](https://olegbl.github.io/d2rmm/interfaces/ModAPI.ModAPI.html), [공식 API 참조](https://github.com/olegbl/d2rmm/blob/master/.claude/d2r-modding-api.md): readTsv/writeTsv, readJson/writeJson, getNextStringID, getVersion만 사용한다.
- [D2R Data Guide](https://locbones.github.io/D2R_DataGuide/): compactsave=1은 추가 속성을 저장하지 않으므로 대기 아이템은 0을 사용한다. 이는 Blizzard가 아닌 커뮤니티 교정 가이드다.
- [실제 cubemain](https://github.com/D2R-Reimagined/d2r-reimagined-mod/blob/main/data/global/excel/cubemain.txt): CORRUPT ITEM DUMMY 행은 `corruptedDummy` 속성에 min=1/max=100을 부여한다. op=18, 임계 조건 등을 사용하는 실제 데이터가 있다. 이 모드의 정상 작동이나 현행 순정 게임의 스키마를 보장하는 증거는 아니다. 조사 표본에 param/스탯 이름의 대응이 일치하지 않는 부분도 있어 ID 숫자를 복사하지 않았다.
- [실제 HD 매핑](https://github.com/D2R-Reimagined/d2r-reimagined-mod/blob/main/data/hd/items/items.json): 배열 안 아이템 코드별 `asset` 구조를 확인했다. 설치 시 입력 룬의 매핑을 복제하며 자산 파일을 배포하지 않는다.
- [cubemain 원저자 가이드](https://d2mods.info/forum/kb/viewarticle?a=284), [열람한 보존본](https://diablo2.org/kb/file-guides/cubemain-txt): op=18은 아이템 스탯이 value와 다르면 거부, output b/c는 별도 출력, mod chance는 속성 확률. 구버전 엔진 문서이므로 현행 D2R 게임 확인이 필요하다.

공개 Reimagined의 misc/itemtypes/itemstatcost/properties/cubemain/armor/weapons 원문을 실제로 다운로드·파싱했다. URL, 다운로드 내용 SHA-256, 행 수는 `research/sources.json`에 기록했다. main은 가변 참조이며 commit 핀은 확보하지 못했다. 전체 테이블은 배포하지 않으며 저장소 fixture는 헤더와 직접 만든 합성 행이다. 사용자 설치의 순정 CASC 데이터는 확보하지 못했다. Nexus Corruptions 내부 파일은 검사하지 않았고 동일 구현이라고 주장하지 않는다.

## 구현

1. 설치 시 확률을 검사한다. 모든 필수 컬럼/참조/JSON 구조와 충돌을 쓰기 전에 검사한다.
2. itemstatcost의 ID(또는 *ID)는 참고값으로 보존하고 행 위치를 실제 ID로 사용해 끝에 스탯 하나를 추가한다. 스탯 이름의 공백/중복은 거부한다. 511은 종료 표식으로 예약하여 사용하지 않는다. 빈 ID 덮어쓰기를 하지 않는다. 7비트 저장/전송, Save Add=0, Encode=0, ValShift=0; 파라미터 없음, 표시 함수 없음. `Saved/CSvBits`는 캐릭터 기본 스탯용이므로 새 아이템 스탯에 설정하지 않는다. 실제 저장 유지와 클라이언트 동기화는 게임 검증 대상이다.
3. properties의 func1=1로 prg_roll에 min/max 값을 전달한다. 설치 코드에는 난수 호출이 없다.
4. 독립 타입 prgp, 3글자 아이템 코드 pg0~pgv 중 지원 등급에 대응하는 아이템을 생성한다. 입력 룬의 아이콘·바닥 그래픽·소리와 HD 자산 참조만 재사용하고 타입/affix/벤더 컬럼은 상속하지 않는다. 이름은 원래 룬 이름 뒤에 `— 분해 대기`를 붙인다. 전용 이미지 교체 위치는 mod.js 주석으로 표시했다. 문자열 키 PRG 접두사, 스탯/프로퍼티 prg 접두사를 사용한다. 한국어/영어 제공, 나머지 언어는 영어 대체.
5. 첫 조합은 두 재료를 소비하고 새 normal 대기 아이템에 prg_roll=1..100 속성을 100% 부여한다.
6. 등급마다 op=18 동등 비교 행 100개. 각각 단일 대기 아이템만 입력으로 받으며 1..100에 정확히 한 행이 대응한다. 기본 1~50/51~75/76~85/86~100. 확률 0인 구간도 허용한다. 첫 일치 순서에 의존하지 않는다.
7. output과 output b에 깨끗한 기본 아이템 코드만 쓴다. useitem/mod 전송을 쓰지 않아 대기 스탯을 결과에 복사하지 않는다. output c는 사용하지 않는다.

시제품은 101개, 전체는 3,232개 조합/32개 대기 아이템/1개 타입/1개 스탯/1개 프로퍼티. 첫 일치/넓은 임계값 방식은 채택하지 않았다. 조합 표 전체 32,767행을 시험판의 보수적 안전 상한으로 검사한다. 이는 현행 D2R 한도를 입증한 숫자가 아니며, 엔진 한도·3,232행의 성능은 게임에서 확인해야 한다. 조사 테이블 자체가 17,056행인 것은 실제 대형 표가 존재한다는 증거일 뿐이다.

## 경로와 제약

악마술사의 군림 전용으로 global/excel만 편집한다. 경로 선택 옵션과 base 테이블 지원은 제거했다. 기존 레저렉션 캐릭터는 지원하지 않는다. 데이터 모드는 DLC 구매 여부나 게임 실행을 차단하는 기능을 제공하지 않는다. 필수 파일이 없거나 스키마가 다르면 설치를 중단한다. 현행 패치의 실제 게임 호환성은 검증 전이다.

mock은 조합 행의 논리만 검증한다. 엔진이 misc normal 결과에 속성을 적용하는지, 저장 후 스탯 유지, op의 대상, 2개 출력, HD/레거시 렌더링, 조합 속도는 실행 전까지 미확정이다. 실패하면 백업 시험 세이브로 재현하여 구현을 수정해야 한다. 공개 배포 전 이 항목들을 닫아야 한다.

## 2026-11-03: First-transmute failure investigation

D2RMM 1.9.2 installation succeeded but Ist + identify scroll did nothing and left both ingredients intact. Pending item codes were four characters (prg0-prgv). The D2R Data Guide documents a three-character limit in HD Items.json: https://locbones.github.io/D2R_DataGuide/ . A first-hand modder report also describes four-character code failures: https://us.forums.blizzard.com/en/d2r/t/modding-four-character-item-codes-are-not-read-by-the-game/174772 . This report is not a Blizzard fix announcement.

Changed pending item codes to pg0-pgv and added collision guards. The separate itemtypes identifier prgp remains unchanged. This removes a documented compatibility issue; the cause of the reported first-transmute failure is not yet confirmed in game. The old mock tests incorrectly accepted four-character item codes and could not catch this problem.

Retest one Ist + loose identify scroll, then resolve the pending item alone. If still inert, inspect generated cubemain.txt PRDG rows, misc.txt pgm row and D2RMM install logs. Old pending items are not save-compatible with these new codes; use a test-save backup. If no pending item was ever created, there is no pending item to migrate.


## 2026-11-04: misc auto prefix 설치 오류 (alpha.3)

사용자가 mod 0.1.0-alpha.2 / D2RMM 1.9.2 / 100/0/0/0 설정에서 첫 조합 무반응을 보고했고, 이후 설치 로그에서 `[PRDG] global\excel\misc.txt: missing column auto prefix`가 확인되었다. 현재 확보한 근거는 이 오류 메시지이며 사용자의 전체 원본/출력 테이블은 아직 받지 않았다. 이 설치 실패가 이전 모든 무반응의 원인이라고 확정하지 않는다.

`auto prefix`는 설치 코드에서 읽거나 할당하지 않는데 필수 열 목록에만 포함되어 있었다. 신규 misc 행은 빈 행에서 생성하므로 해당 열이 존재할 때도 접두사가 상속되지 않는다. 사용하지 않는 이 열의 존재 요구만 제거했고 다른 필수 열과 출력 열 검사는 유지했다.

합성 fixture의 헤더와 각 행에서 이 열을 삭제하여 수정 전 동일 오류를 재현했다. 수정 후 해당 스키마에서 100/0/0/0 Ist-only 및 기본 확률의 전체 등급 생성을 검사했고 기존 검사와 함께 24개 시나리오가 통과했다. 이번 환경에는 공개 수정 테이블 전체가 없어 actualTables=false이다. 실제 사용자 테이블과 D2RMM 앱 설치·게임 조합은 여전히 재검증이 필요하다.


### 후속 설치 로그: missing column normcode

사용자가 제공한 2026-11-04T13:15:05Z 로그는 확률 100/0/0/0, istOnly=true, 단독 모드 설치에서 misc 읽기 직후 `missing column normcode`로 중단된다. 따라서 auto prefix 오류와 동일하다고 보고 수정 파일 미적용을 먼저 의심한 안내는 잘못이었다. 이 로그는 사용자의 전체 misc 헤더를 제공하지 않는다.

normcode/ubercode/ultracode는 조사 스키마에 있는 열로, 모드의 misc 아이템 생성에 무조건 요구할 필요가 없다. 필수 목록과 고정 출력에서 제거하고 열이 존재할 때만 자기 코드를 할당하도록 수정했다. 필수 검사에서만 제거하면 add()의 출력 열 검사에서 다시 실패하므로 두 경로를 함께 수정했다. 각 열의 개별 누락과 auto prefix를 포함한 동시 누락을 검사하며, 헤더에 없는 필드를 새 행에 만들지 않는 것도 검사했다. 모의 API 합성 fixture 29개 시나리오 PASS, 실제 앱/게임 재검증은 필요하다.


### 후속 설치 로그: Non-contiguous itemstatcost IDs at row 212

2026-11-04T13:18:26Z 로그는 7개 테이블을 모두 읽은 뒤 row 212의 ID 검사에서 실패한다. 사용자의 해당 행 값은 아직 확보하지 않았지만, 공개 D2R-Excel 데이터에서도 인덱스 212의 passive_mastery_gethit_rate에 *ID=213이 기록되어 있다. https://github.com/pinkufairy/D2R-Excel/blob/main/itemstatcost.txt . https://locbones.github.io/D2R_DataGuide/#itemstatcosttxt 는 *ID를 게임이 직접 읽지 않는 주석으로 설명하고, 원저자 가이드 보존본 https://diablo2.org/kb/file-guides/itemstatcost-txt 는 실제 ID가 행 위치임을 명시한다. 이 공개 표본은 사용자 게임과 같은 빌드임을 입증하지 않는다.

주석 ID와 행 위치의 일치를 강제하던 검사를 스탯 이름의 공백/중복 검사로 교체했다. 기존 행·주석값·순서는 보존하고, 새 ID는 기존 행 수로 계산하여 마지막에 추가한다. 예약 ID 511 차단은 유지한다. 회귀 검사에 row 212의 *ID=213, 빈 주석 ID, ID 510 사용 가능/511 차단, 기존 행 보존, 모든 결과 조합 param의 실제 추가 위치 일치를 포함했다. 합성 fixture 33개 시나리오 PASS이며 실제 앱 설치와 게임 동작은 미확인이다.


## 기존 모드 병용 시 속성 연결 조사

단독 테스트에서 사용자 보고상 네 결과와 저장/재접속, 결과 룬의 업그레이드/소켓/시험용 룬워드가 정상 동작했다. 병용 테스트에서는 대기 아이템에 가변 화염/번개/냉기 저항 감소가 표시되고 재조합 불가가 보고되었다.

제공된 최종 TSV 4개를 검사했다. prg_roll 스탯은 데이터 행 인덱스 374이고 모든 결과 조합 param도 374이다. 32등급/3,232행이 존재하고 각 등급의 100개 결과는 25/25/25/25로 정확히 분기한다. properties의 item-mythic이 인덱스 290/291에 완전히 같은 행으로 두 번 존재한다. prg_roll 속성은 인덱스 295, 바로 앞 294는 passive_fire_pierce/passive_ltng_pierce/passive_cold_pierce를 부여하는 pierce-elem이다. 고유 코드 순번으로는 prg_roll이 294가 되어 한 칸 어긋날 경우 표시 증상과 일치한다. 실제 현행 엔진의 링크 및 로딩 동작은 아직 직접 확인하지 않았으므로 이는 유력 가설이며 확정된 게임 재현 결과는 아니다.

원인 모드 특정에는 활성 모드 목록·순서 및 item-mythic 행을 추가하는 소스가 필요하다. 기존 모드 행은 자동 삭제/재배열하지 않고, properties 중복 코드가 있으면 우리 모드가 쓰기 전에 구체적인 코드와 행을 알리고 설치를 중단하도록 방어 검사를 추가했다. 동일/상이한 중복 행의 차단을 포함해 합성 검사 35개 PASS. 사용자 원본 테이블은 work/에만 보관하고 버전 관리·배포 ZIP에서 제외한다.


## Relics of Sanctuary 소스 확인 및 alpha.4 호환 처리

제공된 Relics 소스에서 addMythicProperty()가 item-mythic을 추가하고, enableExaltedUniques 또는 enableMythicSets일 때 실행되는 addNewItems()가 내장 properties.json의 같은 정의를 추가하는 것을 확인했다. 이는 중복 생성 경로를 확정하지만 현행 엔진의 연결 해석은 여전히 게임 재시험 대상이다.

기존 모드를 수정하지 않고 우리 설치 생성기에서만 호환 처리한다. 동일한 item-mythic 정의(func1=8/stat1=item_mythic, 헤더 기준 전체 값 일치)의 두 번째 이후 코드만 prg_mythic_<원래 행 인덱스의 36진수>로 변경한다. 첫 정의와 기존 숫자 인덱스, 스탯, 다른 모든 필드는 보존한다. 원본 PRG 이름 충돌 검사 후 별칭을 생성하므로 충돌을 묵인하지 않는다. 내용이 다른 Mythic 중복 및 다른 코드 중복은 계속 거부한다.

합성 검사 39개 PASS. 사용자가 제공한 properties/itemstatcost/cubemain/misc에서 기존 PRDG 생성 행만 제거하여 재설치 입력으로 사용하고 나머지 테이블과 JSON 리소스는 합성 자료로 보완한 검사를 별도로 수행했다. properties의 인덱스 291 코드만 변경되며 원래 행 290의 Mythic 정의, 모든 기존 스탯/조합법/행 위치가 보존된다. 모든 속성 코드가 고유해져 prg_roll의 물리적 위치와 고유 코드 순번이 295로 일치한다. 원본 게임 및 사용자 모드 소스는 배포물에 포함하지 않는다. 이미 잘못 생성된 아이템 복구는 보장하지 않는다.


## 0.1.0 정식 배포 준비

사용자가 최종 테스트 완료 mod.js를 제공했다. 정식 런타임 코드는 이 파일을 기준으로 하고, istOnly 분기와 시험판 로그 문구만 제거했다. 앞선 클라우드 전용의 일반 properties 중복 차단 및 선택적 misc 등급코드 쓰기 변경은 테스트 완료본에 없으므로 정식 기준에 포함하지 않았다. 따라서 다른 이름의 중복 코드를 자동 검출한다고 주장하지 않는다. 테스트 완료본과의 diff로 범위를 검토한다.

mod.json 이름 Probabilistic Rune Downgrade, author 빵길빵길, version 0.1.0. istOnly 설정은 삭제하고 ranks는 항상 2..33이다. 기본 확률 50/25/10/15는 유지한다. 사용자의 병용 환경 100회 결과는 27/25/23/25, 재접속 후 정상으로 보고되었다. 공개 업로드는 이 로컬 준비 작업에 포함하지 않는다.

## 2026-11-05: 간편 설치 ZIP 및 주석 검토

mods-only ZIP은 mods/ProbabilisticRuneDowngrade 아래의 mod.js/mod.json/LICENSE.txt만 포함한다. 기존 공개 ZIP과 태그는 유지하고 별도 릴리스 자산을 추가한다. mod.js는 ID 참고값을 검사한다던 오래된 주석을 정정하고 추첨 저장 시점·확률 변경 시 재해석·스탯 추가 순서·Relics 중복 처리 범위·쓰기 실패 시 주의사항을 보완했다. 공개 v0.1.0 소스와 주석/공백을 제외한 실행 토큰이 같은지 확인했고 생성기 38개 검사 및 제공 TSV 4개를 이용한 병용 생성 검사를 통과했다. 실행 동작 변경은 없다.

## 2026-11-06: 0.1.1 분해 대기 전용 HD 아이콘

바론9의 GlowingRunes_2_0.zip 중 엘드~조드 일반/lowend sprite 64개를 원본 바이트 그대로 포함하고 이름만 prg_pending_02~33으로 분리한다. 허용 문구·출처·파일별 원본 경로와 해시는 CREDITS.md 및 research/glowing-runes.json에 기록한다. 이 이미지에는 MIT를 새로 적용하지 않는다.

공식 D2RMM API의 copyFile(src,dst,overwrite)로 포함 파일을 복사한다. 공식 소스 `src/main/worker/BridgeAPI.ts`의 extractSprite는 misc 아이템에 `hd/global/ui/items/misc/${asset}.lowend.sprite`를 사용한다. 확인한 D2RMM 커밋은 826ace147d8ff2303cd7a4b323de25a477d9409c이다. 새 대기 HD asset은 rune/prg_pending_<등급>이며 원래 룬의 매핑·invfile·flippyfile은 변경하지 않는다.

HD 바닥 모델에도 같은 asset 이름이 사용되므로 설치 중 현재 입력 룬의 hd/items/misc/<asset>.json을 읽어 새 경로에 연결한다. 모델 파일 자체를 배포하거나 다른 모드의 모델 자산을 복사해 저장소에 넣지 않는다. 필요한 모델을 읽을 수 없으면 설치를 중단한다. 새 경로의 실제 엔진 렌더링은 사용자 게임에서 검증해야 한다. 기존 확률·레시피·대기 코드·저장 스탯은 바꾸지 않는다.

## 2026-11-06: 분해 망치 실험 브랜치

0.2.0-alpha.1에서 prh(3글자)를 재료 코드로 예약한다. itemtypes의 prgh는 Equiv1=misc, StorePage=misc, Normal=1이며 별도의 저장 스탯을 추가하지 않는다. misc의 새 행은 비퀘스트·비중첩 1×1이다. 기존 hdm 퀘스트 무기의 invfile/flippyfile 및 선택적 소리 필드만 참조하며 퀘스트·장비 기능은 상속하지 않는다. HD 매핑은 misc/prg/dismantling_hammer의 전용 sprite를 가리키고, 설치 시 hdm의 현재 weapon 모델 정의를 misc의 새 경로로 연결한다. 새 일반·저해상도 sprite는 승인된 AI 생성 PNG를 변환한 것이며 research/hammer-icon.json에 해시를 기록한다.

GheedMin/Max=1, GheedMagicMin/Max=0, GheedMagicLvl=255, PermStoreItem=1, multibuy=0, NightmareUpgrade/HellUpgrade=xxx로 설정한다. NPC 전역 표와 TC를 변경하지 않는다. 기드의 실제 재고·모든 난이도 판매는 게임 확인 대상이다.

기본 cost=1에 대한 참고 근거는 ThePhrozenKeep/D2MOO의 source/D2Common/src/Items/Items.cpp, ITEMS_CalculateTransactionCost이다. 구버전 복원 코드에서는 NPC·퀘스트·흥정 계산 후 nCost<1이면 1로 보정한다. https://github.com/ThePhrozenKeep/D2MOO/blob/master/source/D2Common/src/Items/Items.cpp . 이는 현행 D2R 엔진의 동작을 직접 검증한 근거가 아니므로 구매·판매 1골드는 게임에서 확인해야 한다.

첫 입력과 꽝 출력만 isc에서 prh로 바꾸고 기존 조합 행 수·확률·prg_roll·pg0~pgv는 유지한다. Corruption Shards ZIP이나 코드는 이 구현에 사용하지 않았다. 제작자의 크레딧 동의 및 필요시 코드 사용 허락은 사용자 제공 답변으로 확인했으며, 실제 코드를 사용했다고 기록하지 않는다.

## 2026-11-09: 0.3.0-alpha.1 두 확률 배포판

소스 mod.json/mod.js는 Tiered다. D2RMM section/children 설정은 ModConfig.d.ts,평탄한설정ID값은ModConfigValue.d.ts 및 ModsContext.tsx getDefaultConfig의재귀병합을근거로작성했다. 실제1.9앱UI는검증전이다.

probabilityMode 판종상수는 tools/package-editions.mjs가 Standard패키지에서만고정변환한다. 같은도구의산출코드/설정을자동검사에서실행하고Python빌드가소비한다. 빌드는소스파일을덮어쓰지않는다. 구버전옵션이남아있어도판종을자동추측하지않는다. Standard는기존4개ID, Tiered는low/mid/high접두사12개ID다. 모든구간을읽고검증한후기존게임테이블읽기/생성단계로진행한다.

입력rank2~20=low,21~25=mid,26~33=high를각등급생성루프에서선택하며 op18·저장값1~100·prg_roll·pg0~pgv는유지한다. 별도의스탯이나아이템/이미지를추가하지않는다. 세그룹같은값일때Standard산출과동일함을검사했다.


## 0.4.0-alpha.1 — 망치 제작

추가 조합은 `mau,mag` / `9m9,mag` / `7m7,mag` 세 행이다. 각각 `r14`(돌), `skz`(최상급 해골), `jew`(주얼)를 추가 입력으로 받고 `numinputs=4`, `output=prh,nor`, `lvl=1`로 고정 망치 하나를 출력한다. 출력 b/c, 추첨 op, 추가 스탯은 사용하지 않는다. 주얼에는 품질 조건을 붙이지 않는다. 무기에는 `mag` 조건을 붙이며 에테리얼을 배제하는 조건은 없다. 정확한 아이템 코드만 허용하고 hamm 전체 타입은 허용하지 않는다. 특정 무기로 제한하는 판은 `hammerCraftBases` 목록을 조정할 수 있다. 현재 기본판에는 한손 망치/그레이트 마울 계열을 추가하지 않았다.

설치 시 입력 무기 3종과 세 재료의 코드가 각각 정확히 한 행 존재하는지 확인한다. 새 조합을 포함해 전체 조합 행 안전 상한을 검사한다. 기존 3,232개 분해 조합에 제작 3개가 더해져 우리 모드가 추가하는 조합은 총 3,235개다. 재료 테이블과 드롭 테이블은 쓰지 않는다.

두 배포판에 공유하는 checkbox `sellHammerAtGheed`는 기본 true이고 구형 저장 설정에 값이 없을 때도 true로 처리한다. false이면 새 망치 행의 GheedMin/GheedMax/PermStoreItem을 0으로 설정한다. 판매 가격·그림·조합 결과에는 영향을 주지 않는다. 보유 망치 삭제/NPC 매각 차단 기능은 아니다. 새 게임에서 실제 재고 반영 여부를 확인해야 한다.

기존 아이템/스탯 코드를 유지하지만, 게임 검증 전 알파이며 설치 전 대기 아이템을 처리하고 세이브를 백업한다. 0.3.0 알파 실제 테스트도 별도 미완료 상태이다.
