# Ship playbook (agente)

Pipeline completo: **código externo → SaaS no ar**.

## Inputs que o user deve dar (ou o agente pede 1x)

| Input | Ex |
|-------|-----|
| `SLUG` | `leadflow` |
| `APP_NAME` | `LeadFlow` |
| `DOMAIN` | `app.leadflow.com` |
| `EXTERNAL` | path zip/pasta Lovable (opcional) |
| `PRICE_CENTS` | `4900` |
| `TRIAL_DAYS` | `7` |
| Quack agent token | `ck_live_...` (só provisionamento) |
| Coolify | `COOLIFY_HOST` + `COOLIFY_API_TOKEN` (fora do git) |

## Pipeline (ordem fixa — não pule)

```
1. new-saas          → repo + env base
2. import-external   → UI em (product)/  [se houver EXTERNAL]
3. agent-rewrite     → auth/billing → @/factory  (usa import-report.md)
4. db:push           → schema no Postgres do SaaS
5. quack-provision   → product + deliveryUrl + webhook (dryRun → approve)
6. coolify-deploy    → app + domain + env
7. smoke             → build + hmac + /api/factory/me
8. control-ping      → track import_completed
```

### Comandos

```bash
# 1
./scripts/new-saas.sh "$SLUG" "$APP_NAME"
cd ../saas-$SLUG

# 2
node scripts/import-external.mjs "$EXTERNAL"

# 3 — AGENTE: ler .factory/import-report.md e aplicar rewrites
#     NUNCA editar paths em .factory/manifest.json → protected

# 4
# CREATE DATABASE saas_$SLUG no Postgres shared
pnpm install && pnpm db:push

# 5 — ver scripts/quack-provision.md (dryRun obrigatório)

# 6 — ver scripts/coolify.md

# 7
./scripts/smoke-factory.sh

# 8
curl -sS -X POST "$FACTORY_CONTROL_URL/api/v1/ingest" \
  -H "Authorization: Bearer $FACTORY_INGEST_KEY" \
  -H "content-type: application/json" \
  -d "{\"saasSlug\":\"$SLUG\",\"appName\":\"$APP_NAME\",\"events\":[{\"name\":\"ship_completed\",\"ts\":$(date +%s000)}]}"
```

## Definition of Done

- [ ] `pnpm build` green
- [ ] Signup cria trial
- [ ] Rota paga bloqueia sem access
- [ ] Checkout Quack URL abre
- [ ] Webhook test / pagamento real → `active`
- [ ] Evento no saas-control
- [ ] HTTPS no domínio

## Tempo-alvo

| Sem UI externa | ~30–45 min (env + Quack + Coolify) |
| Com Lovable limpo | ~1–2 h (rewrites) |
| Vibecode com Stripe/Supabase auth | ~2–4 h (strip + rewrite) |
