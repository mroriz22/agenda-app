# AGENTS.md — SaaS Factory OS

Você está operando o **template da fábrica**. Objetivo: pegar código externo (Lovable/vibecode) e deixar um SaaS **no ar** com auth, trial, paywall, Quack e analytics — o mais rápido possível.

## Lei de ouro

1. **Nunca edite** paths em `.factory/manifest.json` → `protected`.
2. UI do produto só em `src/app/(product)`, `src/components/product`, `src/lib/product`.
3. Acesso/billing **só** via `@/factory` (`RequireAccess`, `useAccess`, `trackClient`, `getSessionAccess`).
4. Pagamento **só** Quack. Sem Stripe/MP/Supabase Auth no runtime.
5. Escritas Quack = **dryRun → preview pro user → confirm**. Nunca pule.
6. Secrets (`ck_live_`, Coolify token, `whsec_`) **não** commitam.

## Pipeline (use na ordem)

Leia `scripts/ship.md`. Resumo:

| Step | Ação |
|------|------|
| 1 | `./scripts/new-saas.sh <slug> "<Name>"` |
| 2 | `node scripts/import-external.mjs <pasta\|zip>` |
| 3 | Ler `.factory/import-report.md` e reescrever auth/billing |
| 4 | `pnpm install && pnpm db:push` |
| 5 | Quack product + webhook (`scripts/quack-provision.md`) |
| 6 | Coolify (`scripts/coolify.md`) — **confirmar user antes de criar em prod** |
| 7 | `./scripts/smoke-factory.sh` |
| 8 | Ping `saas-control` ingest |

## API que o produto usa (não reinventar)

```ts
import {
  RequireAccess,   // server layout wrapper
  useAccess,       // client hook
  trackClient,     // client analytics
  getSessionAccess,
  factoryConfig,
  analytics,
} from "@/factory";
```

- Login: `/login` (Better Auth)
- Paywall: `/paywall`
- Webhook: `POST /api/webhooks/quack`
- Me: `GET /api/factory/me`

## Reescritas típicas (externo → factory)

| Externo | Factory |
|---------|---------|
| Clerk / Supabase Auth / NextAuth | Better Auth + `useAccess` / `getSessionAccess` |
| Stripe Checkout | `QUACK_CHECKOUT_URL` / `access.checkoutUrl` |
| `middleware` auth | `RequireAccess` no layout `(product)` |
| Prisma client próprio | Drizzle `db()` + schema factory (ou schema product separado **sem** duplicar user) |
| Firebase | remover |

## Definition of Done

- build green
- trial no signup
- paywall sem access
- Quack webhook → active
- evento no control plane
- HTTPS no domínio

## Next.js

Leia docs em `node_modules/next/dist/docs/` se algo de App Router divergir do treino.
