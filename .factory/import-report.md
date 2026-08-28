# Import report

- **source:** `/home/wa/projects/smartdayz`
- **dryRun:** false
- **copied:** 0
- **stripped:** 0
- **skipped protected:** 0

## Deps do externo pra REMOVER (não instalar no factory)

_nenhuma detectada_

## Arquivos stripped (auth/billing externo)

_none_

## Rewrites necessários (agente)

_nenhum pattern óbvio — ainda assim rode grep por supabase/stripe/clerk_

## Checklist do agente (ordem)

1. [ ] `pnpm install` (sem deps stripped)
2. [ ] Fix imports quebrados (paths `@/` do externo → `@/components/product` ou `@/lib/product`)
3. [ ] Substituir auth/billing pelos exports de `@/factory`
4. [ ] Confirmar `src/app/(product)/layout.tsx` usa `<RequireAccess>`
5. [ ] `pnpm build`
6. [ ] `./scripts/smoke-factory.sh`
7. [ ] Preencher env + Quack + Coolify (`./scripts/ship.sh` se configurado)
8. [ ] Disparar `trackClient('import_completed')` smoke no control

## Copiados

_none_
