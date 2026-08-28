# saas-template

OS da **fábrica de SaaS** — multi-repo, Next only.

| Peça | Tech |
|------|------|
| App | Next.js (App Router) |
| Auth | Better Auth |
| DB / cache | Postgres + Drizzle · Redis |
| Billing | Quack Checkout + trial + paywall |
| Analytics | → [`saas-control`](../saas-control) |
| Deploy | Coolify / VPS BR |

## Ideia

```
src/factory/**     ← NÃO toque (trial, paywall, quack, analytics)
src/app/**         ← UI do produto (Lovable cola aqui)
```

Guia de merge: **[LOVABLE.md](./LOVABLE.md)**  
Novo SaaS: **[scripts/new-saas.md](./scripts/new-saas.md)**

## Quick start

```bash
docker compose up -d   # postgres :5435 · redis :6380
cp .env.example .env
pnpm install
pnpm db:push
pnpm dev
```

## Externo → SaaS no ar (agente)

```bash
./scripts/new-saas.sh leadflow "LeadFlow"
cd ../saas-leadflow
pnpm factory:import /path/to/lovable-export   # ou .zip
# agente lê .factory/import-report.md e reescreve auth/billing → @/factory
pnpm factory:smoke
# depois: Quack + Coolify (scripts/ship.md)
```

Skill do agente: `saas-factory` · playbook: `scripts/ship.md` · regras: `AGENTS.md`

Com control plane local:

```bash
# outro terminal — ver saas-control README
cd ../saas-control && pnpm dev
# template .env:
# FACTORY_CONTROL_URL=http://localhost:3100
# FACTORY_INGEST_KEY=dev-ingest-key-change-me
# SAAS_SLUG=saas-template
```

## Fluxo de acesso

```
signup → trial (TRIAL_DAYS)
       → <RequireAccess> libera app
       → trial expira → PaywallScreen → QUACK_CHECKOUT_URL
       → order.paid webhook → status active
       → eventos → saas-control
```

## API fábrica (pro front)

| Endpoint | |
|----------|--|
| `GET /api/factory/me` | session + access snapshot |
| `POST /api/factory/track` | analytics (proxy pro control) |
| `POST /api/webhooks/quack` | entrega Quack (HMAC) |

```ts
import { RequireAccess, useAccess, trackClient, factoryConfig } from "@/factory";
```

## Env crítico

| var | |
|-----|--|
| `SAAS_SLUG` | id estável no admin |
| `TRIAL_DAYS` | 0 = sem trial |
| `QUACK_CHECKOUT_URL` | CTA paywall |
| `QUACK_WEBHOOK_SECRET` | HMAC inbound |
| `FACTORY_CONTROL_URL` + `FACTORY_INGEST_KEY` | analytics central |

Agent key Quack **não** entra no runtime do app.
