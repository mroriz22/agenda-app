#!/usr/bin/env bash
# Clona o template e prepara um SaaS novo (local).
# Uso:
#   ./scripts/new-saas.sh meu-saas "Meu SaaS"
#   TEMPLATE_REPO=org/saas-factory-template ./scripts/new-saas.sh foo "Foo"
set -euo pipefail

SLUG="${1:-}"
NAME="${2:-}"
if [[ -z "$SLUG" || -z "$NAME" ]]; then
  echo "uso: $0 <slug> \"<App Name>\""
  echo "ex:  $0 leadflow \"LeadFlow\""
  exit 1
fi

if [[ ! "$SLUG" =~ ^[a-z0-9][a-z0-9-]{0,48}$ ]]; then
  echo "slug inválido (use a-z0-9-)"
  exit 1
fi

TEMPLATE_REPO="${TEMPLATE_REPO:-}"
PARENT_DIR="${PARENT_DIR:-$(cd "$(dirname "$0")/../.." && pwd)}"
TARGET="${PARENT_DIR}/saas-${SLUG}"

if [[ -e "$TARGET" ]]; then
  echo "já existe: $TARGET"
  exit 1
fi

if [[ -n "$TEMPLATE_REPO" ]] && gh repo view "$TEMPLATE_REPO" &>/dev/null; then
  echo "→ criando repo a partir do template ${TEMPLATE_REPO}"
  gh repo create "saas-${SLUG}" \
    --template "$TEMPLATE_REPO" \
    --private \
    --clone \
    --description "$NAME (factory clone)"
  # gh clona em ./saas-SLUG no cwd
  if [[ -d "saas-${SLUG}" && "$(pwd)/saas-${SLUG}" != "$TARGET" ]]; then
    mv "saas-${SLUG}" "$TARGET"
  fi
else
  echo "→ copiando template local; defina TEMPLATE_REPO para criar no seu GitHub"
  SRC="$(cd "$(dirname "$0")/.." && pwd)"
  cp -a "$SRC" "$TARGET"
  rm -rf "$TARGET/.git" "$TARGET/node_modules" "$TARGET/.next"
  cd "$TARGET"
  git init -b main
fi

cd "$TARGET"

# package name
if [[ -f package.json ]]; then
  if command -v node >/dev/null; then
    node -e "
      const fs=require('fs');
      const p=JSON.parse(fs.readFileSync('package.json','utf8'));
      p.name='saas-${SLUG}';
      fs.writeFileSync('package.json', JSON.stringify(p,null,2)+'\n');
    "
  fi
fi

cp -n .env.example .env 2>/dev/null || cp .env.example .env

# reescreve env chave
python3 - <<PY
from pathlib import Path
p = Path(".env")
text = p.read_text() if p.exists() else ""
repl = {
  "APP_NAME": """${NAME}""",
  "SAAS_SLUG": "${SLUG}",
  "REDIS_PREFIX": "${SLUG}:",
}
for k,v in repl.items():
    import re
    if re.search(rf"^{k}=", text, re.M):
        text = re.sub(rf"^{k}=.*$", f"{k}={v}", text, flags=re.M)
    else:
        text += f"\n{k}={v}\n"
p.write_text(text)
print("env atualizado:", ", ".join(repl))
PY

# secret fresco se ainda for placeholder
if grep -q "troque-por-um-secret" .env 2>/dev/null || grep -q "dev-secret" .env 2>/dev/null; then
  SECRET=$(openssl rand -base64 32 | tr -d '\n')
  if grep -q "^BETTER_AUTH_SECRET=" .env; then
    sed -i "s|^BETTER_AUTH_SECRET=.*|BETTER_AUTH_SECRET=${SECRET}|" .env
  else
    echo "BETTER_AUTH_SECRET=${SECRET}" >> .env
  fi
  echo "BETTER_AUTH_SECRET gerado"
fi

echo ""
echo "✓ SaaS scaffold em: $TARGET"
echo ""
echo "Próximos passos:"
echo "  1. CREATE DATABASE saas_${SLUG//-/_};  (Postgres VPS/local)"
echo "  2. Ajuste DATABASE_URL / BETTER_AUTH_URL / QUACK_* / FACTORY_* no .env"
echo "  3. cd $TARGET && pnpm install && pnpm db:push && pnpm dev"
echo "  4. Coolify → apontar repo + domain"
echo "  5. Quack: criar produto + webhook → /api/webhooks/quack"
echo "  6. Colar UI Lovable em src/app (ver LOVABLE.md)"
echo ""
