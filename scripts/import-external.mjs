#!/usr/bin/env node
/**
 * Importa código externo (Lovable export, zip, pasta Next) pra dentro do template.
 *
 *   node scripts/import-external.mjs /path/to/lovable-export
 *   node scripts/import-external.mjs ./incoming.zip --dry-run
 *
 * Não toca em paths protected do .factory/manifest.json.
 * Copia UI → src/app/(product) e src/components/product.
 * Gera .factory/import-report.md pro agente terminar a integração.
 */
import { createHash } from "node:crypto";
import {
  cpSync,
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  readdirSync,
  rmSync,
  statSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { basename, dirname, extname, join, relative, resolve } from "node:path";
import { execSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");
const argv = process.argv.slice(2);
const dryRun = argv.includes("--dry-run");
const srcArg = argv.find((a) => !a.startsWith("-"));

if (!srcArg) {
  console.error("uso: node scripts/import-external.mjs <pasta|zip> [--dry-run]");
  process.exit(1);
}

const manifest = JSON.parse(readFileSync(join(ROOT, ".factory/manifest.json"), "utf8"));
const stripDeps = new Set(manifest.stripFromExternal?.deps ?? []);
const stripGlobs = manifest.stripFromExternal?.pathGlobs ?? [];

function matchGlob(path, glob) {
  // glob bem simples: ** e *
  const esc = glob
    .replace(/[.+^${}()|[\]\\]/g, "\\$&")
    .replace(/\*\*/g, "§§")
    .replace(/\*/g, "[^/]*")
    .replace(/§§/g, ".*");
  return new RegExp(`^${esc}$`).test(path.replace(/\\/g, "/"));
}

function isProtected(rel) {
  const r = rel.replace(/\\/g, "/");
  return (manifest.protected ?? []).some((p) => matchGlob(r, p) || matchGlob(r, p.replace(/\/\*\*$/, "/**")));
}

function shouldStrip(rel) {
  const r = rel.replace(/\\/g, "/");
  return stripGlobs.some((g) => matchGlob(r, g) || matchGlob(basename(r), g));
}

function walk(dir, base = dir, out = []) {
  for (const name of readdirSync(dir)) {
    if (name === "node_modules" || name === ".git" || name === ".next" || name === "dist") continue;
    const full = join(dir, name);
    const st = statSync(full);
    if (st.isDirectory()) walk(full, base, out);
    else out.push(relative(base, full));
  }
  return out;
}

function extractZip(zipPath) {
  const dir = mkdtempSync(join(tmpdir(), "factory-import-"));
  execSync(`unzip -q -o ${JSON.stringify(zipPath)} -d ${JSON.stringify(dir)}`, { stdio: "inherit" });
  // se zip tem 1 pasta root, desce
  const kids = readdirSync(dir).filter((k) => !k.startsWith("."));
  if (kids.length === 1 && statSync(join(dir, kids[0])).isDirectory()) {
    return { root: join(dir, kids[0]), cleanup: dir };
  }
  return { root: dir, cleanup: dir };
}

function findAppRoot(dir) {
  if (existsSync(join(dir, "package.json"))) return dir;
  // lovable sometimes nests
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory() && existsSync(join(p, "package.json"))) return p;
  }
  return dir;
}

let cleanup = null;
let sourceRoot = resolve(srcArg);
if (extname(sourceRoot) === ".zip" || sourceRoot.endsWith(".zip")) {
  const ex = extractZip(sourceRoot);
  sourceRoot = findAppRoot(ex.root);
  cleanup = ex.cleanup;
} else {
  sourceRoot = findAppRoot(sourceRoot);
}

const report = {
  source: sourceRoot,
  copied: [],
  skippedProtected: [],
  stripped: [],
  depsToRemove: [],
  depsToAdd: [],
  rewriteCandidates: [],
  warnings: [],
};

// map external src structure → product
const externalSrc = existsSync(join(sourceRoot, "src"))
  ? join(sourceRoot, "src")
  : sourceRoot;

const targets = {
  app: join(ROOT, "src/app/(product)"),
  components: join(ROOT, "src/components/product"),
  lib: join(ROOT, "src/lib/product"),
  public: join(ROOT, "public"),
};

if (!dryRun) {
  mkdirSync(targets.app, { recursive: true });
  mkdirSync(targets.components, { recursive: true });
  mkdirSync(targets.lib, { recursive: true });
}

// package.json deps analysis
const extPkgPath = join(sourceRoot, "package.json");
if (existsSync(extPkgPath)) {
  const pkg = JSON.parse(readFileSync(extPkgPath, "utf8"));
  const all = { ...pkg.dependencies, ...pkg.devDependencies };
  for (const dep of Object.keys(all || {})) {
    if (stripDeps.has(dep)) report.depsToRemove.push(dep);
  }
}

function copyTree(fromDir, toDir, prefixLabel) {
  if (!existsSync(fromDir)) return;
  const files = walk(fromDir);
  for (const rel of files) {
    const from = join(fromDir, rel);
    // never overwrite protected destination paths
    let destRel;
    if (prefixLabel === "app") destRel = join("src/app/(product)", rel);
    else if (prefixLabel === "components") destRel = join("src/components/product", rel);
    else if (prefixLabel === "lib") destRel = join("src/lib/product", rel);
    else destRel = join("public", rel);

    if (isProtected(destRel)) {
      report.skippedProtected.push(destRel);
      continue;
    }
    if (shouldStrip(rel) || shouldStrip(destRel)) {
      report.stripped.push(rel);
      continue;
    }

    // skip external lock/config that would nuke factory
    if (
      ["package.json", "package-lock.json", "pnpm-lock.yaml", "yarn.lock", "next.config.ts", "next.config.js", "tsconfig.json", "middleware.ts", "middleware.js"].includes(
        basename(rel),
      )
    ) {
      report.stripped.push(rel + " (config)");
      continue;
    }

    const to = join(ROOT, destRel);
    if (!dryRun) {
      mkdirSync(dirname(to), { recursive: true });
      cpSync(from, to);
    }
    report.copied.push(destRel);

    // scan rewrites (case-insensitive)
    if (/\.(tsx?|jsx?)$/.test(rel)) {
      const text = readFileSync(from, "utf8");
      const low = text.toLowerCase();
      const hits = [
        ["supabase", "use factory db() + better-auth; remove supabase auth"],
        ["@clerk", "useAccess() / getSessionAccess() from @/factory"],
        ["clerk", "useAccess() / getSessionAccess() from @/factory"],
        ["stripe", "QUACK_CHECKOUT_URL / access.checkoutUrl — sem Stripe"],
        ["mercadopago", "Quack Checkout only"],
        ["getserversession", "getSessionAccess() from @/factory"],
        ["next-auth", "Better Auth already in factory"],
        ["createbrowserclient", "remove supabase client — use @/lib/db"],
      ];
      for (const [needle, hint] of hits) {
        if (low.includes(needle)) {
          report.rewriteCandidates.push({ file: destRel, hint });
        }
      }
    }
  }
}

// prefer app/ or src/app/
const appDir = existsSync(join(externalSrc, "app"))
  ? join(externalSrc, "app")
  : existsSync(join(sourceRoot, "app"))
    ? join(sourceRoot, "app")
    : null;
const componentsDir = existsSync(join(externalSrc, "components"))
  ? join(externalSrc, "components")
  : existsSync(join(sourceRoot, "components"))
    ? join(sourceRoot, "components")
    : null;
const libDir = existsSync(join(externalSrc, "lib"))
  ? join(externalSrc, "lib")
  : existsSync(join(sourceRoot, "lib"))
    ? join(sourceRoot, "lib")
    : null;
const publicDir = existsSync(join(sourceRoot, "public")) ? join(sourceRoot, "public") : null;

if (appDir) copyTree(appDir, targets.app, "app");
if (componentsDir) copyTree(componentsDir, targets.components, "components");
if (libDir) copyTree(libDir, targets.lib, "lib");
if (publicDir) copyTree(publicDir, targets.public, "public");

// dedupe rewrite candidates
const seen = new Set();
report.rewriteCandidates = report.rewriteCandidates.filter((r) => {
  const k = r.file + r.hint;
  if (seen.has(k)) return false;
  seen.add(k);
  return true;
});

// generate product layout wrapper if we imported app routes
const layoutPath = join(ROOT, "src/app/(product)/layout.tsx");
if (!existsSync(layoutPath) && report.copied.some((c) => c.startsWith("src/app/(product)"))) {
  const layout = `import { RequireAccess } from "@/factory";

/** Auto-gerado por import-external — protege UI importada com paywall/trial. */
export default function ProductLayout({ children }: { children: React.ReactNode }) {
  return <RequireAccess>{children}</RequireAccess>;
}
`;
  if (!dryRun) {
    mkdirSync(dirname(layoutPath), { recursive: true });
    writeFileSync(layoutPath, layout);
  }
  report.copied.push("src/app/(product)/layout.tsx (generated)");
}

// agent TODO report
const md = `# Import report

- **source:** \`${report.source}\`
- **dryRun:** ${dryRun}
- **copied:** ${report.copied.length}
- **stripped:** ${report.stripped.length}
- **skipped protected:** ${report.skippedProtected.length}

## Deps do externo pra REMOVER (não instalar no factory)

${report.depsToRemove.length ? report.depsToRemove.map((d) => `- \`${d}\``).join("\n") : "_nenhuma detectada_"}

## Arquivos stripped (auth/billing externo)

${report.stripped.length ? report.stripped.map((d) => `- \`${d}\``).join("\n") : "_none_"}

## Rewrites necessários (agente)

${
  report.rewriteCandidates.length
    ? report.rewriteCandidates.map((r) => `- \`${r.file}\` → ${r.hint}`).join("\n")
    : "_nenhum pattern óbvio — ainda assim rode grep por supabase/stripe/clerk_"
}

## Checklist do agente (ordem)

1. [ ] \`pnpm install\` (sem deps stripped)
2. [ ] Fix imports quebrados (paths \`@/\` do externo → \`@/components/product\` ou \`@/lib/product\`)
3. [ ] Substituir auth/billing pelos exports de \`@/factory\`
4. [ ] Confirmar \`src/app/(product)/layout.tsx\` usa \`<RequireAccess>\`
5. [ ] \`pnpm build\`
6. [ ] \`./scripts/smoke-factory.sh\`
7. [ ] Preencher env + Quack + Coolify (\`./scripts/ship.sh\` se configurado)
8. [ ] Disparar \`trackClient('import_completed')\` smoke no control

## Copiados

${report.copied.map((c) => `- \`${c}\``).join("\n") || "_none_"}
`;

const reportPath = join(ROOT, ".factory/import-report.md");
if (!dryRun) writeFileSync(reportPath, md);
console.log(md);

if (cleanup) rmSync(cleanup, { recursive: true, force: true });

// exit code: 0 always if structural ok; agent reads report
console.log(dryRun ? "\n(dry-run — nada escrito)" : `\nreport → ${reportPath}`);
