#!/bin/sh
# 전체 테스트: 시뮬레이션(시드 3개) + 실제 브라우저. 하나라도 실패하면 종료 코드 1.
cd "$(dirname "$0")/.." || exit 1
fail=0
for s in 12345 7 2026; do
  out=$(TEST_SEED=$s node tests/sim.test.js) || fail=1
  echo "sim seed $s: $(echo "$out" | tail -1)"; echo "$out" | grep '^FAIL'
done
out=$(node tests/browser.test.js) || fail=1
echo "browser: $(echo "$out" | tail -1)"; echo "$out" | grep '^FAIL'
[ $fail -eq 0 ] && echo "ALL GREEN" || echo "FAILED"
exit $fail
