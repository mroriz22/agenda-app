# Coolify (agente)

Token **nunca** no git. Use apenas variáveis de ambiente do seu próprio
ambiente: `COOLIFY_HOST` + `COOLIFY_API_TOKEN`.

API base típica: `https://$COOLIFY_HOST/api/v1`  
Header: `Authorization: Bearer $COOLIFY_API_TOKEN`

## Por SaaS

1. **Database** no Postgres shared: `CREATE DATABASE saas_SLUG;`
2. **Application** a partir do GitHub `saas-SLUG`
   - Build: Dockerfile
   - Port: 3000
   - Domain: `$DOMAIN`
3. **Env** (colar do `.env` de prod):
   - `DATABASE_URL`, `REDIS_URL`, `REDIS_PREFIX`
   - `BETTER_AUTH_*`, `APP_NAME`, `SAAS_SLUG`, `TRIAL_DAYS`
   - `QUACK_*`, `FACTORY_*`
4. Deploy + wait healthy
5. SSL automático Coolify

## Checklist pós-deploy

```bash
curl -sS -o /dev/null -w "%{http_code}" "https://$DOMAIN/"
curl -sS "https://$DOMAIN/api/factory/me"   # 401 esperado sem cookie
```

## Nota

Automação full via API Coolify varia por versão. Se a API local do Leo já cria apps (checkout-shark), reutilize o mesmo padrão de `COOLIFY_*` — **confirmar com o user antes de criar resource em produção**.
