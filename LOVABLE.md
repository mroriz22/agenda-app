# Integrar app Lovable / vibecoded

O template é um **OS de fábrica**. A UI do Lovable é o **produto**.  
Regra de ouro: **não sobrescreva `src/factory/**`**.

## Mapa

| Path | Quem mexe |
|------|-----------|
| `src/factory/**` | Fábrica (auth access, trial, paywall, analytics, quack) |
| `src/lib/auth.ts`, `schema.ts`, `db.ts`, `quack.ts` | Fábrica |
| `src/app/api/auth/**`, `api/webhooks/**`, `api/factory/**` | Fábrica |
| `src/app/login/**` | Pode trocar UI, manter better-auth client |
| `src/app/(product)/**` ou páginas suas | **Lovable cola aqui** |
| `src/app/dashboard/**` | Exemplo — substitua pelo app |

## Passo a passo (15–30 min)

### 1. Clone o template

```bash
gh repo create meu-saas --template SEU/saas-template --clone
cd meu-saas
cp .env.example .env
# SAAS_SLUG, APP_NAME, TRIAL_DAYS, QUACK_*, FACTORY_*
```

### 2. Export do Lovable

- Baixe o projeto (Next/React).
- **NÃO** substitua o repo inteiro.
- Copie **páginas/componentes** do produto para:
  - `src/app/(product)/...`  ou
  - `src/components/product/...`

Ignore do Lovable (se vier): auth próprio, stripe, supabase auth duplicado — a fábrica já tem Better Auth + Quack.

### 3. Proteja rotas pagas

**Server (recomendado)** — layout do app:

```tsx
// src/app/(product)/layout.tsx
import { RequireAccess } from "@/factory";

export default function ProductLayout({ children }: { children: React.ReactNode }) {
  return <RequireAccess>{children}</RequireAccess>;
}
```

**Client (Lovable client components)**:

```tsx
"use client";
import { useAccess, trackClient } from "@/factory";

export function PremiumFeature() {
  const { loading, access, authenticated } = useAccess();
  if (loading) return null;
  if (!authenticated) { window.location.href = "/login"; return null; }
  if (!access?.allowed) {
    window.location.href = "/paywall";
    return null;
  }
  return <button onClick={() => trackClient("feature_used", { id: "export" })}>Export</button>;
}
```

### 4. CTA de compra

Use o checkout Quack (env), não invente payment form:

```tsx
<a href={process.env.NEXT_PUBLIC_QUACK_CHECKOUT_URL}>Assinar</a>
// ou access.checkoutUrl vindo de /api/factory/me
```

Defina no Coolify:

```bash
QUACK_CHECKOUT_URL=https://pay.quackcheckout.com/c/org/produto
# ou URL de offer com slug
```

> `QUACK_CHECKOUT_URL` é server-side no paywall. Se o Lovable precisar no client, espelhe em `NEXT_PUBLIC_QUACK_CHECKOUT_URL` (mesmo valor).

### 5. Trial

Automático no **signup** (`TRIAL_DAYS`, default 7).  
0 = sem trial → paywall imediato até pagar.

### 6. Analytics → admin central

Todo evento relevante já vai pro control plane se configurado:

```bash
FACTORY_CONTROL_URL=https://control.seudominio.com
FACTORY_INGEST_KEY=...
SAAS_SLUG=meu-saas
```

No Lovable, dispare eventos de produto:

```ts
import { trackClient } from "@/factory";
await trackClient("onboarding_completed", { step: 3 });
```

Eventos de sistema (signup, trial, paywall, purchase) já saem sozinhos.

### 7. Checklist “integração perfeita”

- [ ] Signup cria user + trial
- [ ] Rota paga mostra conteúdo durante trial
- [ ] Após trial expira → PaywallScreen + CTA Quack
- [ ] Webhook `order.paid` → status `active`
- [ ] Eventos aparecem no `saas-control`
- [ ] `src/factory` intacto

## Anti-padrões

| Não faça | Faça |
|----------|------|
| Auth do Lovable + Better Auth | Só Better Auth |
| Stripe/MercadoPago paralelo | Só Quack |
| Soft paywall só no client | `RequireAccess` server |
| Escrever analytics key no browser | `trackClient` → `/api/factory/track` |
| Fork profundo do template | Clone e só troque UI |

## Feature flags simples

Em `src/factory/config.ts` → `plans.*.features`.

```tsx
import { RequireAccess } from "@/factory";
// só quem tem feature "exports"
<RequireAccess feature="exports">{children}</RequireAccess>
```
