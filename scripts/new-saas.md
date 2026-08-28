# Checklist: clonar este template → SaaS live

## 1. Repo

```bash
# via GitHub template (marque este repo como Template)
gh repo create SEU_ORG/saas-SLUG --template SEU_ORG/saas-template --private --clone
cd saas-SLUG
```

Ou:

```bash
cp -a saas-template saas-SLUG
cd saas-SLUG
rm -rf .git && git init
# edite package.json name, APP_NAME
```

## 2. DB na VPS (Postgres compartilhado)

```sql
CREATE DATABASE saas_SLUG;
CREATE USER saas_SLUG WITH PASSWORD '...';
GRANT ALL PRIVILEGES ON DATABASE saas_SLUG TO saas_SLUG;
-- Postgres 15+: grant schema
\c saas_SLUG
GRANT ALL ON SCHEMA public TO saas_SLUG;
```

## 3. Env

```bash
cp .env.example .env
# SAAS_SLUG=SLUG  APP_NAME=...  TRIAL_DAYS=7
# DATABASE_URL, REDIS_URL, REDIS_PREFIX=saas_SLUG:
# BETTER_AUTH_SECRET, BETTER_AUTH_URL=https://app.dominio
# QUACK_CHECKOUT_URL=...  QUACK_WEBHOOK_SECRET=...  QUACK_PRODUCT_ID=...
# FACTORY_CONTROL_URL=https://control.dominio  FACTORY_INGEST_KEY=...
```

## 4. Migrate

```bash
pnpm db:push   # ou db:migrate em prod
```

## 5. Coolify

1. New Resource → Application → este repo
2. Build pack: Dockerfile
3. Domain + SSL
4. Env vars (mesmo `.env` de prod)
5. Deploy

## 6. Quack (agent API — dryRun → approve)

1. `POST /products` com `deliveryUrl=https://app.dominio/login`
2. Dashboard → Webhooks → `https://app.dominio/api/webhooks/quack`
   - events: `order.paid`, `subscription.activated`, `subscription.renewed`
   - copiar secret → `QUACK_WEBHOOK_SECRET`
3. `QUACK_PRODUCT_ID=<id>`
4. Redeploy se necessário

## 7. Smoke

1. Link/checkout Quack → pagar (ou evento de teste)
2. Webhook 200 + row em `entitlement`
3. Login no app → dashboard mostra plan

## NÃO colocar no runtime do app

- Agent API key (`ck_live_...`) — só no teu agente/CI de provisionamento
