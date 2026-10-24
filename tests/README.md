# 봉인 너머 테스트

- `sh tests/run.sh` 전체 실행 (시뮬레이션 3개 시드 + 브라우저). 실패하면 종료 코드 1.
- `node tests/sim.test.js` 시뮬레이션만. `TEST_SEED=숫자`로 맵 시드 변경.
- `node tests/browser.test.js` 실제 Chromium으로 조작·패널·저장 확인. `PW_PATH`로 playwright 경로 지정 가능.
- 하네스(`harness.js`)는 index.html의 스크립트를 꺼내 가짜 DOM 위에서 돌리고, Math.random을 시드 고정한다.
- 게임 쪽 테스트 훅은 `window.__seal`. 출시 빌드에서는 빼야 한다.
