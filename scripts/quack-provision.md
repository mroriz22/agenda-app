# Provisionar produto na Quack (agente)

Base: `https://api.quackcheckout.com/api/agent`  
Header: `Authorization: Bearer <ck_live_...>`  
**Escritas = dryRun true → mostrar preview → user aprova → dryRun false + confirmationToken.**

## 1. whoami + products (evitar duplicata)

```bash
curl -sS "$Q_BASE/whoami" -H "Authorization: Bearer $Q_TOKEN"
curl -sS "$Q_BASE/products" -H "Authorization: Bearer $Q_TOKEN"
```

## 2. Criar produto (dryRun)

```bash
curl -sS -X POST "$Q_BASE/products" \
  -H "Authorization: Bearer $Q_TOKEN" \
  -H "content-type: application/json" \
  -d "{
    \"dryRun\": true,
    \"name\": \"$APP_NAME\",
    \"slug\": \"$SLUG\",
    \"type\": \"subscription\",
    \"interval\": \"month\",
    \"priceCents\": $PRICE_CENTS,
    \"allowedMethods\": [\"pix\", \"card\"],
    \"status\": \"live\",
    \"deliveryUrl\": \"https://$DOMAIN/login\"
  }"
```

Mostre preview → se OK:

```bash
curl -sS -X POST "$Q_BASE/products" \
  -H "Authorization: Bearer $Q_TOKEN" \
  -H "content-type: application/json" \
  -d "{ ..., \"dryRun\": false, \"confirmationToken\": \"...\" }"
```

Grave no `.env` do SaaS:

```bash
QUACK_PRODUCT_ID=<id>
QUACK_CHECKOUT_URL=https://pay.quackcheckout.com/c/<org>/<slug>
# URL real pode variar — use a do dashboard/links se diferente
```

## 3. Webhook (manual no dashboard ou API se existir)

URL: `https://$DOMAIN/api/webhooks/quack`  
Events: `order.paid`, `subscription.activated`, `subscription.renewed`, `subscription.past_due`, `subscription.canceled`  
Secret → `QUACK_WEBHOOK_SECRET`

## 4. Offer promocional (opcional)

Offer com `slug` = URL estável de ads (não use `/links` single-use pra funil).
