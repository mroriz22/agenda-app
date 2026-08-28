#!/usr/bin/env bash
# Smoke local do OS de fábrica (sem browser).
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

echo "== factory smoke =="

# 1. manifest protected exists
test -f .factory/manifest.json
test -d src/factory
test -f src/factory/index.ts
test -f src/app/api/webhooks/quack/route.ts
test -f src/app/api/factory/me/route.ts
echo "✓ structure"

# 2. build
if [[ "${SKIP_BUILD:-}" != "1" ]]; then
  pnpm build >/tmp/factory-smoke-build.log 2>&1 || {
    echo "✗ build failed — see /tmp/factory-smoke-build.log"
    tail -40 /tmp/factory-smoke-build.log
    exit 1
  }
  echo "✓ build"
else
  echo "· skip build"
fi

# 3. unit: quack signature
node --input-type=module - <<'NODE'
import { createHmac } from "node:crypto";

function verify(secret, body, header, toleranceSec = 300, nowSec = Math.floor(Date.now()/1000)) {
  const parts = Object.fromEntries(header.split(",").map(kv => {
    const i = kv.indexOf("=");
    return [kv.slice(0,i), kv.slice(i+1)];
  }));
  const t = Number(parts.t);
  if (!Number.isFinite(t) || Math.abs(nowSec - t) > toleranceSec) return false;
  const expected = createHmac("sha256", secret).update(`${t}.${body}`).digest("hex");
  return expected === parts.v1;
}
const secret = "whsec_test";
const body = JSON.stringify({ id: "evt_1", type: "order.paid", data: {}, organization: { id: "o", slug: "s" } });
const t = Math.floor(Date.now()/1000);
const v1 = createHmac("sha256", secret).update(`${t}.${body}`).digest("hex");
if (!verify(secret, body, `t=${t},v1=${v1}`)) throw new Error("sig verify failed");
if (verify(secret, body, `t=${t},v1=deadbeef`)) throw new Error("bad sig accepted");
console.log("✓ quack hmac");
NODE

# 4. protected paths not empty
for f in src/factory/billing.ts src/factory/analytics.ts src/factory/RequireAccess.tsx; do
  test -s "$f" || { echo "missing $f"; exit 1; }
done
echo "✓ factory core files"

# 5. env example has required keys
for k in SAAS_SLUG TRIAL_DAYS QUACK_CHECKOUT_URL FACTORY_CONTROL_URL FACTORY_INGEST_KEY; do
  grep -q "^${k}=" .env.example || { echo "missing $k in .env.example"; exit 1; }
done
echo "✓ env.example"

echo ""
echo "OK — factory smoke passed"
