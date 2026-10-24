# 봉인 너머 — 다음 세션 인수인계 (2026-10-24, v40 기준)

새 세션의 Claude가 이 파일 하나만 읽고 이어서 작업할 수 있게 쓴 문서다. 위에서부터 읽으면 된다.

## 0. 새 세션에서 맨 먼저 할 일

1. 이 묶음(봉인너머_인수인계_v40.zip)을 풀어 작업 폴더에 둔다. 게임 본체는 `index.html` 하나다.
   - 묶음이 없으면 게임 아티팩트를 Artifact `read`로 읽어 최신 본체를 받는다: https://claude.ai/artifact/KqtwaMB6jLPdoVb8F9tmJ9 (같은 아티팩트에 `HANDOFF.md`와 `tests/`도 함께 올려 두었다. `read` + `path`로 받을 수 있다.)
2. `PW_PATH=$(npm root -g)/playwright sh tests/run.sh` 로 전부 초록인지 확인한다(시뮬레이션 312개×시드 3종, 브라우저 45개). Chromium은 `/opt/pw-browsers/chromium`(tests/browser/_lib.cjs에 하드코딩. 환경이 다르면 고친다).
3. 수정 → 테스트 → 같은 아티팩트 URL에 재배포(`url` 지정, label에 버전명) 순서를 지킨다.
4. 현재 v40(연결망 제거·전진기지 습격까지). 바로 아래 'v33' 단락의 '다음 후보'에서 사용자에게 고르게 하거나, 사용자가 새로 지시한 것을 한다. 사용자 피드백 방식은 1절 참고.

v19 변경 요약: UI 배율 자동(화면 기준 1~1.6배, [ ]로 조절), 월드 배율 2.5(- =), 군더더기 문구 제거, 장신구 드롭 감소(빛나는 적 1.2%×50%, 보스 1개), 구리 수요 약 45% 감축 + 수정 코어 구리 +1/5초 + 적 구리 드롭 증가, 레벨(`gainXP`, `CONFIG.hero`), 무기 +1~+5(`WT`, `WT_COST`, `WT_PERK`, 레시피 `w_<무기>_<단계>`), 제작 탭은 장비 사슬의 다음 단계만(`CRAFT_CATS`, `chainNext`), 캐릭터 탭 작업 고르기(`ui.accMode`), 자원 툴팁 '쓰는 곳'(`RES_USE`). 제작 명령이 잠김 조건(`recipeLock`)도 검사한다(이전엔 UI만 막았다).

v32 지하 바다: H=210, `CONFIG.sea`(x 6~208, y 150~207, 코어 184,188, 보스 184,175, 균열 110,200), `genSea`(genHigh 뒤), 타일 DEEP(deep)·SAND·CORAL·CLAM(진주)·SEADOOR(고대 골렘 처치 시 열림). 이동 모드 문자열: 'g' 기본, 'r' 포함이면 깊은 물 통과(뗏목), 'h' 포함이면 구덩이 통과(갈고리), 'w'는 물에서만(헤엄치는 적), 'f'는 비행. `openSea`(바다 진입 시), `swimAI`(매복꾼), `leviAI`(심해 군주: under 무적 → tele 붉은 원 → open 빈틈), hurtEnemy는 e.under면 무시. 길 검사는 바다 균열(g.sea)과 섬 코어(c.sea)를 뺀다. 목표 단계에 raft·sea·levi·seacore. G.seaStair 저장. 위협 단계 7개(…·지하 바다·하드모드·하드모드 바이옴·엔딩 후).
v40: recomputeNet은 깨어 있는 코어 전부가 뿌리, 전신주는 영역이 닿으면(거리 ≤ 반지름 합+1) 붙음. canPlace 전신주는 terrConn 안만, relay는 막음. 습격 `RAID_UNITS`·`CONFIG.raid`·`baseDefense`·`pickRaidTarget`(G.warned 때)·`raidField`·`spawnRaids`(spawnNight 끝), 적 `e.rk`가 G.raidF[k] 거리장을 따름, 표적 표시는 drawCore. 함락은 damageCore에서 영역 안 건물 → 잔해(lostK), restoreRuins가 lostK 코어 잠든 동안 건너뜀.

v39: 정제기 제거(건설 목록·canPlace에서 막음, STRUCTURES.drill 정의는 예전 저장 호환용). 장기: 월드 배치 철학(사용자 확정) — 큰 틀은 본거지 중심 동심원(바깥 고리일수록 어려움), 개별 바이옴 모양은 직각·부정형·옆에 붙기 등 바이옴마다 따로. 지도 설계 문서로 잡을 것.

v38: 배선은 `planChain(sid,tx,ty)`(캐시 G.planC)·`drawChainPlan`·명령 {type:'chain', list}. dragLine은 남아 있지만 안 쓴다. `freeForNode`, `REF_KEEP`(정제기 보존량)·`refCan`.

v37: `dragLine`/`lineEnd`/`lineFrom`(G.line, 건설 모드에서 link가 있는 건물을 끌 때), 중계탑 `relay`(STRUCTURES, BUILD_TABS.eco, isNode로 전신주와 같은 연결 노드), P키·하단 '메뉴'(hb-menu)로 일시정지.
장기 과제(사용자): 절벽은 지금처럼 우겨넣지 말고 '문법'을 가진 입체 구조물 체계로 — 2층 단·계단·사원·일반 제단·석상 등을 미리 만든 조각(프리팹)과 배치 규칙으로 짓는 방향. 시제품 절벽(CONFIG.cliffs)은 그때까지 평원에만 둔다.

v36: 숫자는 피해만 정수(fN), 공격 속도 발/초·재사용 시간은 소수 첫째로 되돌림. 월드 슬롯: `SAVE_BASE`/`slotKey`/`setSlot`/`curSlot`(변수명 slot은 UI 함수와 겹쳐 못 씀), `slotInfo`, `openSlots`/`closeSlots`/`pickSlot`/`newSlot`/`deleteSlot`, `drawSlots`(drawHUD0 끝), ui.slots 동안 step 정지. 부팅 시 openSlots — 하네스(harness.js)와 브라우저 _lib.cjs는 부팅 뒤 closeSlots를 부른다.

v35: 화면 숫자 정수만(`fN`=반올림, `cleanNum`은 모든 소수 반올림, '배'·ms 예외), 포탑 속도 '분당 공격'. 자원 밸런스: CORE_LV 생산 본거지 1·2·2·3 / 다른 코어 1·1·2·2, 둘째 생산물 10초마다(G.prodOdd), `coreProdQ`(정수 순환은 본거지만). 채굴기(id는 그대로 drill) → 정제기: `REFINE` 제련법, `refOf`/`cycleRefine`, 명령 {type:'refine'}, 패널 버튼 id sel-refine, 재료 없으면 s.idle. incomeNow는 정제기 재료를 음수로.
남은 논의: 8번 코어 연결 피로 → '줄 긋기 자동 배선' 제안, 사용자 확인 대기. 절벽 시제품 반응 대기.

v34 피드백 묶음: 업글 표시는 건설 모드만(drawWorldMarks), `flyWay`/`flyField`(마비 정령 우회), `cleanNum`(pop·uText), `drawAreas`/`drawTileArea`/`AREA`(토템·등불·화로 범위 칸), 사원 시야 -2·어둠 .66, 바다는 '숨은 바다'(어둠 .22, 시야 +2, 물빛), `jo(낱말, 조사)`, 전신주 `lv[].link`·`pylonLink`(recomputeNet·nearConnectedNode), 귀환 `RECALL`·`startRecall`·`updRecall`(명령 recall, H), 평원 절벽 시제품 `genCliffs`·타일 CLIFF(drawWall의 D.cliff 분기, gen의 carveTo가 길을 뚫음).
보류·논의 중: 자원 밸런스(코어 생산이 단계마다 선형 증가 vs 소비처 유한 → 후반 과잉) 개편안을 정한 뒤 채굴기 처리 결정. 코어 연결 피로(8번)는 '줄 긋기 자동 배선' 제안 상태. 절벽은 시제품 반응 보고 확대 여부 결정.

v33 하드모드 세 갈래: H=272. `CONFIG.volc`(x 4~106, y 210~270, 입구 x40, 코어 86,258, 균열 18,262, erupt) · `CONFIG.blight`(x 108~210, 입구 x150, 코어 190,258, 균열 160,266, 심장 3곳, rotEvery, spreadEvery). `genVolc`/`genBlight`(genSea 뒤) + 공용 `branchStair`(바다 모래톱→HSEAL 3줄→갈래 바닥)·`branchCarve`. zoneAt 'volc'/'blight'(y≥210). 새 타일 LAVA(deep+lava: blockedTile에서 'r'로도 못 지나감, 'w'도 불가)·CRUST·BASALT·VROCK·OBSID(pick3)·HSEAL(비행도 막음)·MIRE·FLESH·BLIGHTC(pick3). 자원 obsid·blightc(G.gotObsid/gotBlightc). `openVolc`/`openBlight`(진입 시), `heartsLeft`(G.heartsDown), `heartAI`, `heartDown`, 모체는 심장이 남으면 hurtEnemy에서 무시·잠에서 못 깸. 위험 원 `addBomb`/`updBombs`/`drawBombs`(G.bombs, 저장 안 함) — 화산탄(`volcTick`)과 화염 거신 'erupt' 공용, `rockAt`. `blightZoneTick`(영역 정화·심장 번짐), blightTick은 오염지에선 진흙으로. 서리 등잔 P.lantern(updPlayer에서 앞 용암→CRUST), 정화 망토 P.cloak, 흑요석 갑옷 gear.armor 6. 보스 K.leashR(서리 거인·화염 거신·모체; 반피 소환 공용). 코어 `branch:true`(고산·화산·오염지) → 제단 조건·baseCores. 목표 `BRANCH`·`branchInfo`(QUESTS의 'branch' 한 줄이 갈래 하위 단계 id를 돌려준다). threatStage 5 = 갈래 아무거나 열림. 저장 SAVE_VER 7(맵 크기 바뀜).
주의: sim.test.js 뒤쪽 블록의 boot()가 전역 localStorage를 갈아 끼우므로, 뒤쪽 테스트에서 저장을 볼 땐 맨 위 `store` 대신 전역 localStorage를 쓴다.
다음 후보: 하드모드 전 선택 바이옴(화석 협곡·고치 동굴 제안됨), 지역 이름 카드, 보스 고유 장비, 테크트리 양자택일, 레벨업 특성(보류).

v31: 사원 지름길 — 타일 WAYPAD(입구 방·성소), `padList`(타일에서 찾음, `tileFind` 캐시), `nearPad`/`usePad`, G.padOn. 저장 후 seal2 목표 화살표가 사라지던 문제도 tileFind로 고침.

v30 바이옴 재배치: 진행은 평원 → 동굴 → 사원(제단) → 하드모드 → 고산. `genRuins(rg)` 전면 재작성(CONFIG.ruins.cells [5,4], entC 4, sanctum 12,135 36×10; `ruinRooms` 방 목록·type, `seal2Pos`), 두 번째 봉인은 동굴과 사원 사이(y96~97) 굴. 제단 CONFIG.altar 38,139, 고대 코어 20,140, 고대 골렘은 코어 동쪽 9칸. genTerrain의 유적 부분·발광 버섯 제거, 동굴 수정은 veins(T.CRYSTAL, 34). genHigh 지형: 능선 노이즈(1-|2n-1|)·고개·빙하 ICEF·깊은 눈 DRIFT·첨탑·운석 크레이터, 입구 ICES(enterHardmode에서 ICEW로), 마지막에 산정 코어·균열까지 굴 보장. 새 타일 CARPET·ICES·DRIFT. blockedTile 'f'·dijkstra 'fly'는 벽 통과(기반암·봉인·봉인된 얼음만 막힘). 목표는 `QUESTS`(done/info) + `currentQuest`·`cutInterrupt`, objective·objTarget 둘 다 여기서. 고친 목표 버그: 사원 적대 고대 포탑을 '포탑'으로 쳐서 첫 단계(석궁 포탑)가 시작부터 넘어가던 것. 위협 단계 순서: 골짜기·동굴·사원·하드모드·고산·엔딩 후(1·4·7·11·14·16). SAVE_VER 5. 테스트에서 `__seal.CONFIG`로 좌표를 읽는다.

v29: `CONFIG.threat`(stageN, growCap), `threatStage`/`threatN`(G.thStage·thStart 저장)이 spawnNight·둥지 체력·hordePulse의 n. 비교(같은 시드, 균열 전부 열림 가정, 예약 수): 빠른 진행(봉인 4밤·유적 8·고산 12·하드 16)은 24밤 핏빛 857→608, 느린 진행(봉인 8·유적 16)은 730→325. 초반 7밤은 같다.

v28: 맵 W=214(CONFIG.W). `CONFIG.high`(x 150~210, 입구 y40, 코어 196,50, 균열 184,16, cold 설정). `genHigh`(gen 끝에서), 새 타일 SNOW·ICEW(torch)·METEOR·PINE(drawPine)·CHASM(pit)·ICEF(ice, 빠름)·VAULTF·STATUE. zoneAt 'high'(x>146), 벽 topH/faceH + 눈 덮개. `openHigh`(고산 진입 시: 균열·거인·늑대), `coreLock`, 산정 코어 CORE_DEFS 6번째(high). 추위 `P.cold`(updPlayer, `warmAt`=영역 또는 G.braziers), 화로 `brazier`(anywhere·selfPowered, 온기 warm). 갈고리 `p.grapple` → 돌진 중 moveEnt 모드 'h'(구덩이 통과), 구덩이 위면 연장·실패 시 gStart로. 서리 거인은 bossAI에 leash 처리 + 'breath'. 유적: 석상, 금고 2개(바위 굴 + 구덩이 3칸, 없으면 막다른 방을 해자 섬으로), openCache 금고 보너스, `ruinRegrow`(새벽), 되찾은 relic 영역 4칸(recomputeNet), 낮에도 G.dark .5 + 횃불·빛줄기. `checkPurify`(G.purified n/s, growNest 제외). spawnFlood 세 번째 태그 'high'. SAVE_VER 4. 테스트는 WW=214 사용. 생성 버그 수정: 풀숲 코어가 바위에 갇히던 시드(carve 목록에 42,29), 석상이 통로 입구를 막던 것.

v27: 무기 스킬 `SKILLS`·`useSkill`(명령 `{type:'skill'}`, Q), `p.skillCD[무기]`, 검은 `p.sdash`(돌진 중 hit 목록), 석궁은 `heavy` 화살(`mark`, `stag`), 지팡이는 `G.pfields`(피해)+`G.fields`(감속, col). 보스 흔들림 `K.stag`·`stagMax`·`staggerBoss`(hurtEnemy에서 pl일 때만, 6번째 인자 stagMul), `drawStagBar`. 봇 측정(Lv8 +2 무기 수호자 / Lv14 +4 흑철 주인, 회피함): 수호자 50~126초(검이 가장 빠르지만 가장 많이 맞음), 주인 30~78초(실전은 30초 증원이 더해짐). 스킬을 쓰면 10~30% 짧아짐. 주의: v26 HANDOFF의 봇 수치는 무기 단계가 0으로 들어간 잘못된 측정이었다.

v26: 포탑 역할 개편(`turretFire` 안 종류별 점수: bolt 비행+3·방어×-3, shell 폭발 범위 안 적 수, beam 한 줄 적 수·방어·체력) · `noAir`(수정 포탑) · 단계 특수 `pierce`/`field`(G.fields, 2초 감속)/`mark`(e.markT·markMul, 모든 피해 증가) · `perk` 문구는 건설 툴팁·선택 패널에 · 결계 등불 `lamp`(G.lamps 매 스텝, `lampAt`, 교란 무효·정령 피해·감속, 보스 절반) · 보스(`CONFIG.boss`, `bossAI` 예고 tele→act/즉발→`bossOpen` 빈틈, `drawBossTele`, 비플레이어 피해 25%는 hurtEnemy에서, 빈틈 피해 2배) · 고대 골렘 내려찍기 뒤 빈틈 1.6초 · 보스전 중 spawnNight 건너뜀 · 건설 바 9칸(Digit9).
측정(같은 자원 예산, 테스트 하네스): 수정 포탑이 비행·방어·관통 모두 되던 걸 대공 불가로 바꿔 역할이 갈림 — 정령 웨이브는 석궁만, 골렘은 수정(13.5초) > 투석(14) > 석궁(20), 굴쥐 40은 투석(5.5) > 수정(7.5) > 석궁(8.5). 마비 정령 섞인 무리: 등불 없으면 23/26 처치, 있으면 26/26 34.5초. 봇 보스전(Lv8 +2 무기): 수호자 85~196초. 스크립트는 다음 세션에 없으니 필요하면 tests/harness로 다시 짠다.

v25: 오염된 땅 효과(`TILES[].blight`, `blightTick` 새벽·하드모드에서, canPlace 금지, 지상 적 1.3배 속도) · UI 가독성(툴팁 요약, Alt로 자세히 / 자원 3열 아이콘 / 코어 목록 접기 `ui.coresOpen`, id `cores-toggle`) · 피해 소수화(`wDmg` 반올림 제거, `fN` 표시, `hitsTo` 처치 타수) · 조작(Space=돌진 고정, Shift=부적 `{type:'charm'}`, Alt+F=같은 종류 모두) · 체크포인트(`CP_KEY`, `cpMilestone` 서명이 바뀐 뒤 첫 새벽에 `autoSave`가 `writeCheckpoint`; 본거지 패배 시 Enter=`restoreCheckpoint`, R=새 판, 승리·새 판은 지움).
아스트라(사용자가 쓰는 다른 조사 에이전트) 보고서 《봉인 너머 장르와 16개 레퍼런스 역설계》를 벤치마킹했다. 남은 반영 예정: 보스전 중 일반 증원 흡수/유예(I2), 보스 '예고→회피→약점' 패턴, 코어별 고유 기능·지역 정화(바이옴 연결 논의 재료), 진행 단계별 습격 예산(I1), 심연 목표 차별화.

v24: 감사 수정(수치표 사거리·분당 수입 둘째 생산물·고대 포탑 철거/일괄 업그레이드·순간이동 목록·죽은 코드), 광물 원칙(모든 광물이 장비·연구·업그레이드 셋 다에 쓰임: 태양 벼리기·태양 장화·룬 갑옷·룬 곡괭이, 포탑 4단계 태양·심연 각인은 5단계, 토템 3단계, 코어 4단계), 지형(물·구덩이·발광 버섯·무너진 기둥, `genTerrain`, `GEAR` 표). 개발자 가이드북: https://claude.ai/artifact/AJwmt2Gvdqa3yP35Z7mWEd (이 문서가 가장 상세한 설명서다). 저장 형식 3.

v23 남쪽 유적(두 번째 바이옴, 사용자 결정: 골짜기 남쪽으로 맵 확장 · 테마 '무너진 고대 유적' · 새 광물이 기존 테크트리와 이어질 것 · 시점은 무관 → 2장과 3장 사이로 넣음):
- 맵 150×150. `CONFIG.ruins`(x 8~118, y 98~146, 5×3 방 격자, 봉인 각도 300도). 생성은 `genRuins()`(gen 안에서 호출, 기존 지형 난수 순서는 그대로). 구역 판정 `zoneAt(x,y)`('surface'|'cave'|'ruin'), 캔 자리 바닥 `digFloor`.
- 타일: 태양석 광맥(SUN)·룬석 광맥(RUNE)(강화 곡괭이 필요), 고대 벽돌(RWALL, 단단함), 유적 바닥(RUINF), 유물 상자(CACHE, `openCache`), 남쪽 봉인(SEAL2). 자원 `sun`·`rune`, 처음 얻으면 `G.gotRuin`.
- 진행: 동쪽 봉인 뒤 '남쪽 봉인 열쇠'(key2, 수정12·정수4·구리8) → `openSeal2()` → 유적. 고대 수호 골렘(`colossus`, `K.leash`, `leashAI`/`slamAt`, 집에서 14칸 넘게 안 끌려감)을 잡으면 `G.colossusDown` → 고대 코어(CORE_DEFS 5번째, `ruin:true`, 태양석+룬석 생산) 깨우기 → 전신주로 연결. 제단은 '모든 코어'가 이어져야 응답하므로 유적이 3장(수호자) 앞 관문이 된다.
- 고대 포탑(`STRUCTURES.relic`, noBuild·selfPowered): 생성 때 `hostile:true`. 적대면 나를 쏘고(foe 투사체), 적이 공격하지 않고 흐름장에선 통과 불가, 피해 안 받음. `nearRelic/relicWhy/reclaimRelic`: 주변 6칸 깬 적 없음 + 룬석 4 → 내 것. 철거 불가.
- 새 적 돌 골렘(방어 2, 공성). 서쪽 방 고대 균열(`g.ruin`, 남쪽 봉인 열 때 열림)에서 밤마다 굴쥐·골렘(4번째 밤부터 부풀이). 범람은 `spawnFlood(spec, ruinOnly)`.
- 테크 연결: 연구 4단계 신설(태양 렌즈 atkS: 포탑 사거리+1·화상 3초 / 룬 각인 defS: 벽·함정 4단계, 룬 벽 가시 2 / 룬 굴착 ecoS: 채굴기·전신주 4단계), 흑철 연구는 5단계로 밀리고 선행이 4단계. 무기 +4 비용 = 태양석10·룬석8·수정6. 고대 포탑 2단계는 태양 렌즈. 연구 탭은 5줄이 되어 카드 높이를 자동으로 줄인다.
- 저장 형식 2(이전 저장은 새 판으로 시작).

## 1. 사용자와 일하는 방식 (중요)

- 한국어로 답한다. 직설적이고 단정적으로. 격려·얼버무림 없이. 부정확한 표현은 바로 지적당한다.
- 표·굵은 글씨·번호 목록 남발은 AI 티가 난다고 싫어한다. 답은 산문 위주, 필요한 곳만 목록.
- 짧은 "ㅇㅋ", "ㅇㅇ"는 "진행해"라는 뜻이다. 다시 묻지 말 것. 애매하면 합리적으로 해석하고 해석한 내용을 한 줄로 밝힌다.
- 맥북을 쓴다. F키 대신 Shift+숫자 단축키를 쓴다.
- 감사원 사무관 출신이다. "감사의 관점에서" 보라고 하면 코드 전체를 읽고 심각도별로 확인된 문제/판단 필요 문제를 나눠 보고한다.
- 레퍼런스 조사는 "말만 듣고 재현 가능할 정도로" 깊게 해야 한다. 표면적 나열은 불합격.
- 작업은 끝까지 해서 결과물로 보여준다. 계획만 늘어놓고 승인 대기하지 않는다(단, 큰 리팩터링은 "어떻게 할지 먼저 설명"을 요구한 적이 있다).
- 사용자는 내부 사고를 영어 축약(caveman) 스타일로 하길 원하고, 최종 답은 정상 한국어.

## 2. 프로젝트 개요

- 목표: 스팀 글로벌 출시용 게임. 첫 매출, 장기 프로젝트 가능성. 1인 바이브 코딩(Claude가 직접 구현, Codex는 보조 가능).
- 경위: 테라리아류 채굴 → 숙주 침투(바이러스) → 도시를 삼킨 숲 → 원소 반응 3안(거절) → 문답으로 확정한 《봉인 너머》.
- 확정된 큰 방향(사용자 확인):
  - 테라리아식 정해진 진행 노선 + 엔딩(최종 보스) + 엔딩 후 콘텐츠(하드모드·끝없는 심연, 쥐굴/블러드본 성배 던전식).
  - 판타지. 발견감은 있되 과하게 강조하지 않는다.
  - 표준화된 거점(코어) 점령 + 영역 안 자유 건설, 수평 확장, 3/4 탑뷰(스타듀 각도).
  - 혼합 웨이브, 마우스 조준 전투, 무기 + 포탑 + 기지 업그레이드. 생물 수집 없음.
  - 솔로 기본 + 1~4인 협동 예정. 절차 생성 맵.
  - 스2 유즈맵 행성요새·벙커 밖은 위험해식 "건물 눌러 그 자리에서 업그레이드".

## 3. 현재 게임 (v19)

한 줄 요약: 평화로운 골짜기 본거지에서 시작해 봉인을 열고 수정 동굴의 코어 4개를 전신주로 이어 영역을 넓히고, 밤 웨이브와 둥지를 처리하며 제단에서 보스를 불러 하드모드를 거쳐 엔딩을 보고, 그 뒤 석판으로 무한 심연을 내려간다.

진행 흐름:
1. 지상(골짜기): 나무·돌·구리 캐기 → 장비 작업대(C)에서 봉인 열쇠.
2. 봉인을 열면 동쪽 수정 동굴(셀룰러 오토마타). 둥지 2개, 잠든 갑충, 범람.
3. 코어 4개(본거지·풀숲·수정 북·수정 남)를 깨우고 전신주로 연결. 연결된 코어/전신주가 영역(건설 가능 구역).
4. 둥지를 부수면 정수 + 장신구. 매 새벽 둥지가 자란다(최대 5, 하드모드 6). 지상 균열은 3·5번째 밤에 추가.
5. 4코어 연결 + 수호자의 공물(정수10·수정15) → 제단(131,49)에서 봉인의 수호자. 처치 → 하드모드(오염 지대, 흑철 광맥, 심연 균열 2개, 그림자 사냥개, 적 체력 1.5배).
6. 흑철 → 4단계 연구·흑철 장비 → 봉인의 핵 → 봉인의 주인(30초마다 무리). 처치 → 엔딩 화면(저장 유지).
7. 엔딩 후 제단 = 심연 문. 석판으로 60×60 층 진입. 목표(사냥/채굴/사수/굴 파기) → 보스(5층마다 수호자/주인 강화, 그 외 감시자 무리) → 돌파(파편, 장신구, 다음 석판). 변조 9종. 파편: 장신구 품질+1, 석판 올리기, 포탑 4단계 '심연 각인', 체크포인트 석판.

시스템 목록: 3/4 렌더링(벽 윗면+앞면, 행 단위 y정렬), 안개, 낮밤(105초/45초, 3번째 밤 핏빛), 흐름장 3종(미로/공성/비행), 길 완전 차단 금지(pathOK), 잔해 새벽 복구(50%), 연구 4갈래(공격/방어/코어·채집/정수) 4단계, 장비 작업대(무기·방어구·도구·열쇠·공물), 장신구 18종(반지2·목걸이·부적, 품질 1~5, 반지 세트), 코어 간 순간이동, 일괄 업그레이드(Shift+F), 자동 저장(localStorage), WebAudio 효과음, 층(layer) 구조.

조작: WASD 이동, Space 돌진(부적 끼면 부적 능력), 좌클릭 공격(캘 수 있는 벽이면 캐기), 우클릭 캐기·창 닫기, 휠/1~3 무기, Q 직전 무기(건설 중엔 탭), B 건설, Tab 메뉴(마지막 탭)·I 캐릭터·C 제작·T 연구, 메뉴 안 Q/E·1~5 탭, E 상호작용/패널(다시 E 닫기), F 업그레이드, Shift+F 일괄, G 수리, Alt 누르고 있기 = 모든 건물 단계·체력, Esc 가장 위 창 닫기(없으면 일시정지), M 소리, R 두 번 새 판.

v18 UI(개편안 문서 그대로 구현):
- HTML 창 전부 삭제. 모든 UI를 캔버스에 즉시모드로 그린다 → 키보드 초점이 iframe 밖으로 나갈 일이 없다(창 닫으면 조작 안 되던 버그의 근본 해결). 남은 대비책: 초점을 잃으면 "화면을 한 번 클릭하면…" 문구.
- 통합 메뉴(모달): 캐릭터 / 제작 / 연구 / 기록(+ 엔딩 후 제단 옆이면 심연 문). 혼자면 열려 있는 동안 게임이 멈춘다. 제작·연구는 어디서나 보고, 실행만 본거지 근처(이유는 버튼 툴팁·상단 문구에).
- 맥락 패널(비모달, 우하단): 이름·단계 마름모·체력 막대·'지금 → 다음' 수치표(연구 보너스 반영, 오르는 값 초록 +차이)·업그레이드 비용(가진/필요, 부족 빨강)·못 하는 이유·버튼(업그레이드 F/수리 G/같은 종류 모두 ⇧F/철거/연구 열기/코어 이동/심연 귀환·다음 층). 패널이 열리면 오른쪽 코어 목록은 숨고, 하단 바는 패널을 피해 왼쪽으로 밀린다.
- 툴팁: 모든 칸·버튼, 호버 0.15초. 형식 = 이름·종류 / 설명 / 수치(지금→다음) / 줄 목록 / 비용(아이콘 가진/필요) / 이유(빨강) / 단축키. 패널 버튼은 패널 왼쪽에, 하단 바는 바 위에 뜬다.
- 캐릭터 탭: 캐릭터 그림을 둘러싼 장신구 4칸(빈 칸 실루엣, 잠긴 칸 자물쇠), 장비·무기 칸, 능력치 8개(호버하면 끼었을 때 값 미리보기 초록/빨강, 세트 켜짐/꺼짐), 보관함 8×3 아이콘(품질색 테두리·별). 클릭 = 끼기(반지: 빈 칸 → 세트 맞추는 칸 → 품질 낮은 칸), 낀 칸 클릭 = 빼기, 우클릭 = 분해(5초 '되돌리기' 버튼), 커서 올리고 R = 재련, U = 심연 강화.
- 제작 탭: 무기/방어구/도구/열쇠·공물 묶음 + 카드(가짐·만들 수 있음·재료 부족·잠김+여는 조건). 툴팁에 만들면 바뀌는 수치(최대 체력 12→15 등).
- 연구 탭: 4갈래 세로 줄 + 선행 연결선. 툴팁에 '풀리는 것'을 데이터표에서 자동 추출(예: 벽 2단계: 체력 50→120).
- 기록 탭: 지난 알림 50개(스크롤), 지금 목표, 조작표.
- 건설 바: 공격/방어/코어·채집 탭(Q), 카드에 건물 그림·비용·잠김 연구명, 툴팁에 역할·수치·업그레이드 경로.
- HUD: 자원 옆 분당 수입(+12/분, 호버하면 출처별), 좌하단 알림 로그 6줄(9초에 걸쳐 흐려짐, 큰 사건만 가운데 제목), 월드에 업그레이드 가능 노란 화살표·체력 50% 미만 렌치·호버 이름표.
디버그: ` 자원+50, Shift+` 밤 당기기, Shift+1 디버그 정보, Shift+2 안개 끄기, Shift+3 시험 심연 왕복, Shift+4 엔딩으로 점프. `window.__seal` 테스트 훅. (출시 전 제거)

## 4. 코드 구조 (index.html, 약 2,000줄, 바닐라 JS + Canvas 2D)

- 맨 위 `DECISIONS` 주석: 버전별 설계 결정 로그(v5 피날레 항목은 v8에서 대체됨).
- `CONFIG` 수치표 → 데이터 표: `T/TILES`, `RES`, `STRUCTURES`(lv 배열, tech/abyss 게이트), `GRP`, `BUILD_ORDER`, `RESEARCH`, `CORE_LV`, `WEAPONS`, `RECIPES`(vis/req/needsCrystal), `ACC`(장신구), `ENEMIES`, `CORE_DEFS`, `NESTS`.
- 상태: 전역 `let` 변수들. **층 구조**: 장소 상태(지형·건물·코어·적·입구·캔버스·층 시계 등)는 `saveLayer/useLayer`로 바꿔 끼운다. 목록은 `LAYER_G`와 saveLayer 안 변수 목록 두 곳. 판 상태(P, res, tech, S, G의 진행 플래그)는 층과 무관. 플레이어 타이머는 `G.runT`(층 시계 `G.clock` 쓰지 말 것).
- 저장: `saveGame/loadGame/packLayer/unpackLayer`, `G_RUN` 목록. 새 판 상태를 추가하면 `G_RUN`이나 `LAYER_G`에 넣어야 저장된다.
- 명령: `applyCommand(pid, cmd)` (멀티 대비). 고정 스텝 1/60 `step()`.
- 심연: `makeTablet/rollMods/populateAbyss/genAbyss/enterTablet/updAbyss/startAbyssBoss/floorClear/floorFail(지연 처리)/hasMod`.
- UI(v18, `// ===== 캔버스 UI` 절): 즉시모드. `hot(x,y,w,h,{act,ract,tip,id,acc,tipLeft,tipUp})`로 매 프레임 클릭 영역 등록 → `uiAt()` 맨 위 것부터 판정. 부품 `uBtn/uBox/uScroll/costRow/drawTip`. 상태 `ui`(menu, tab, craftCat, scroll, hoverR, preview, bar). 그리는 순서는 `drawHUD`: HUD → 하단 바(`drawHotbar`/`drawBuildBar`) → `drawSelPanel` → `drawLog` → 배너 → `drawMenu`(탭별 `drawCharTab/drawCraftTab/drawResearchTab/drawLogTab/drawAltarTab`) → 오버레이 → 툴팁. 수치는 `lvStats(L, D)`(연구 보너스 포함)와 `STAT_DEF` 하나로 패널·툴팁·연구 '풀리는 것'이 모두 같은 숫자를 쓴다. 월드 표시 `drawWorldMarks/drawPlate`. 알림 `logPush`(say/say2가 부른다, G.log 50개, 저장 안 함).
- 새 명령: `unsalvage`(마지막 분해 되돌리기, p.lastSalvage).
- 알려진 기술 부채: 플레이어 1명 전제(P 전역)가 곳곳에 있음(멀티 전 정리), 디버그 기능 잔존. (지형 너머 조준·벽 너머 직진은 v20에서 `losClear`로 해결)

## 5. 테스트

- `tests/harness.js`: index.html의 스크립트를 꺼내 가짜 DOM에서 실행, Math.random을 시드 고정.
- `tests/sim.test.js`: 경로 규칙·둥지·균열·제단·하드모드·잔해·장신구·층 왕복·감사 회귀·저장·무한 심연·변조/파편.
- `tests/browser/*.js` + `tests/browser.test.js`: 실제 Chromium(iframe 샌드박스 호스트 흉내)으로 조작·패널·코어 이동·저장 새로고침·엔딩/심연. 공용 `tests/browser/_lib.cjs`의 `T.click(id)`는 `__seal.ui()`가 내보내는 캔버스 UI 좌표를 눌러준다(UI id: `sel-up` `sel-rep` `sel-all` `sel-del` `warp-N` `tab-char|craft|research|log|altar` `menu-close` `bag-N` `slot-ring0..` `acc-undo` `cat-N` `craft-<id>` `res-<id>` `build-<id>` `bt-atk|def|eco` `hb-*` `tablet-N` `tabup-N` `cp-N`).
- 시뮬레이션의 'UI sweep'은 진행 단계 5곳(초반·봉인 후·하드모드·엔딩 후 제단·심연)에서 모든 탭·패널을 그리고 `__seal.drawTips()`로 툴팁 전부를 그려 예외가 없는지 본다.
- `sh tests/run.sh` 전체. 수정할 때마다 돌리고 올렸다.

## 6. 사용자 피드백 처리 상태 (v18 시점)

1. 창을 열었다 닫으면 화면을 다시 클릭해야 조작됨 → v18에서 HTML 요소 자체를 없앴다. 사용자 확인 전(Claude 앱에서 직접 확인 필요).
2. UI가 불친절·번거로움("진짜 개중요") → v18 개편. 사용자 플레이 피드백 대기.
3. 자원 분포가 인위적(특히 구리). → v17에서 광맥 방식으로 수정함(아래 8절). 사용자 확인 전.

## 7. 다음 할 일 (합의된 순서)

(2026-10-22 갱신, v28까지: 보스·스킬·고산·유적 개편·정화 완료) 남은 것: 테크트리 양자택일, 목표 카드의 재료 획득처, 레벨업 특성(나중), 그리고 캐릭터 성장(액션 RPG) 논의, 보스 패턴 추가(결계 아레나·포탑 파괴 등). 원래 계획: 포탑은 보스에게 약 25% 피해(기본 규칙, 나중에 결계 아레나·보스가 포탑 파괴 추가 가능), 보스 패턴 AI(예고→공격→빈틈), 회피 무적, 보스전 중 일반 증원 유예, 캐릭터 성장(액션 RPG) 논의. 그다음 고산지대(추위 규칙, 온도 UI 없이 '영역 밖은 위험'으로 직관 전달), 유적 개편, 바이옴 연결 구조(사용자와 더 논의), 테크 갈래 선택.

가이드북 문서: https://claude.ai/code/artifact/845291be-a2dc-4693-8eb9-25783df95be4 (v21 콘텐츠 전체 분류 + 진단). 합의: 1) 선택지 만들기 → 사용자 보류(성장 RPG성 정도를 별도 심층 논의, 레벨 특성·건물 최종 단계 갈래·판 변주 카드·벼리기 통합 모두 폐기 아님) 2) ~~바이옴 하나 추가~~(v23 남쪽 유적) 3) 적·건물 상성 ← 다음. 골렘 방어 2(화살·검 약함, 광선·투석·화상 강함)가 첫 상성 씨앗. 단계별로, 레퍼런스 조사 후 질문하며 진행.


1. ~~UI 전면 개편~~ (v18 완료) — 설계: UI 조사 문서의 "개편안"(https://claude.ai/code/artifact/966c0302-1e8b-4047-aaa0-c02a883044a0). 구현 순서: 캔버스 UI 틀(버튼·칸·탭·스크롤 목록·툴팁) + HTML 창 제거 → 맥락 패널(우하단, 지금→다음 표) + 호버 이름표 + 월드 업그레이드 화살표 → 통합 메뉴(Tab: 캐릭터/제작/연구/기록, 솔로 일시정지) → 건설 바 탭·툴팁, HUD 수입 표시, 알림 로그 → 브라우저 테스트 재작성. 사용자에게 직접 플레이 피드백을 받아가며.
   - 조사 한계: 스크린샷을 직접 못 봐서 레퍼런스 배치는 위키+기억. 사용자가 원하면 실제 게임 스크린샷을 첨부받아 보강.
2. ~~특수 적 3종~~(v21: bomber/hook/hex, `specialAI`, `explodeAt`) · ~~플레이 기록~~(v21 기록 탭) · ~~첫 30분 목표 단계·화살표~~(v21). 남은 것: 사용자 플레이 기록을 받아 밸런스 조정.
3. 출시 기술 결정(HTML을 Electron/Tauri로 포장 vs Godot 등 엔진 이전). 멀티 방식이 여기에 달림.
4. 그래픽 패스(Core Keeper식 타일 격자 조명, 캐릭터·적 그림, 타격감).
5. 1~4인 협동(P 전역 정리 + 네트워크).

## 8. v17 자원 분포 변경 내용

`veins(ore, count, len, canHost, weight, rng)` — Terraria TileRunner식 무작위 보행 광맥. 바위(STONE/DIRT) 칸에만 박고, 걸음마다 반경이 줄어든다. 지상 구리 16줄기(본거지에서 멀수록 시작 확률↑), 동굴 구리 12줄기, 하드모드 흑철 22줄기(동굴 쪽 가중치 1, 지상 0.5). 수정은 노이즈 덩어리 유지. 시드 1~3에서 구리 268~322칸(지상 177~223, 본거지 14칸 안 11~34).

## 9. 링크 모음

- 게임(최신 v18): https://claude.ai/artifact/KqtwaMB6jLPdoVb8F9tmJ9 (v17 백업이 필요하면 아티팩트 버전 기록)
- UI 레퍼런스 해부와 개편안(문서): https://claude.ai/code/artifact/966c0302-1e8b-4047-aaa0-c02a883044a0
- Core Keeper·Necesse 역설계와 장신구·무한 심연 설계(문서): https://claude.ai/code/artifact/6c49d08e-08b7-47c8-b0c7-b500a9f226a8
- 스타 유즈맵 11개 + 다른 게임 10개 레퍼런스 조사(문서): https://claude.ai/artifact/N3URkvbNrJ8BmrmQiZVFMW
- 이전 시제품: 도시를 삼킨 숲 https://claude.ai/artifact/CaaUoR66rtdidHRB5qSYMD · 숙주 침투 https://claude.ai/artifact/G6drwCfUoYBg8zA8ndfCKR
- 초기 명세: `specs/spec_04_beyond_the_seal.md` (v1 기준, 지금과 많이 다름. 역사 참고용)

## 10. 주요 조사 결론 요약 (문서를 못 열 때 대비)

- 유즈맵·게임 레퍼런스: 볼륨을 만드는 장치는 낮의 공격 목표(Left 2 Die), 넓어지는 공격 방향(Dead of Night), 특수 적, 보스/최종 무리, 세계별 고유 자원. 봉인 너머는 이 중 둥지 공격·위협 확장·보스·하드모드 자원까지 넣었고 특수 적이 남았다.
- 리뷰 기반 조작 교훈: Thronefall(수동 업그레이드 지루함, 밤 뒤 자동 복구 호평), Dome Keeper(자동 방어 없음·반복 채굴 불만), Core Keeper(한 칸씩 설치 불편).
- Core Keeper: 하는 만큼 오르는 스킬 12종(레벨 100, 5레벨마다 특성), 장신구 슬롯 반지2·목걸이·보조손·가방·랜턴·주머니4, 수치 범위 굴림, 2/3/5 세트, 타일 격자 조명(어둠=자원).
- Necesse: 트링킷 4+1칸 → 보스마다 슬롯 확장(최대 8), 능력 트링킷이 돌진 키 대체, 회복력(때리면 차는 보호막), 정착지 구역 자동화·행복도, 인커전(석판·티어·변조·업그레이드 파편 25×티어).
- UI 원칙(개편안 근거): 창은 통합 메뉴+맥락 패널 둘뿐, 누르기 전에 보인다(호버), 지금→다음 숫자, 부족 자원 빨강, 연구가 푸는 것을 구체 수치로, 월드에 할 일 표시, 알림은 로그로.
