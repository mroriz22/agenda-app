/**
 * Smoke da jornada do SmartDayZ. Nao cria conta, nao cobra nada, nao escreve
 * no banco: so percorre o que qualquer visitante ve e confere que as portas
 * do produto estao abertas.
 *
 *   node scripts/e2e-smoke.mjs                      # http://127.0.0.1:3000
 *   BASE=https://smartdayz.com node scripts/e2e-smoke.mjs
 */

const BASE = (process.env.BASE ?? `http://127.0.0.1:${process.env.E2E_PORT ?? 3000}`).replace(/\/$/, "");

let ok = 0;
const falhas = [];

function check(nome, condicao, detalhe = "") {
  if (condicao) {
    ok++;
    console.log("  ok   " + nome);
  } else {
    falhas.push(nome + (detalhe ? " — " + detalhe : ""));
    console.log("  FALHA " + nome + (detalhe ? " (" + detalhe + ")" : ""));
  }
}

async function pega(caminho, redirect = "follow") {
  const r = await fetch(BASE + caminho, { redirect });
  const corpo = r.status === 204 ? "" : await r.text();
  return { status: r.status, location: r.headers.get("location") ?? "", corpo };
}

console.log("smoke SmartDayZ em " + BASE + "\n");

// 1. Landing
const home = await pega("/");
check("home responde 200", home.status === 200, "status " + home.status);
check("home fala do SmartDayZ", /SmartDayZ/.test(home.corpo));
check("home leva ao app", /href="\/app"/.test(home.corpo));
check("home leva ao preco", /href="\/pricing"/.test(home.corpo));
check("home leva ao login", /href="\/login"/.test(home.corpo));

// 2. O produto
const app = await pega("/app");
check("app responde 200", app.status === 200, "status " + app.status);
check("app e a agenda", /id="pwPass"/.test(app.corpo) && /id="calGrid"|Agenda/.test(app.corpo));
check("app promete a senha certa (8)", /mínimo 8 caracteres/.test(app.corpo));
check("app nao promete 6 caracteres", !/mínimo 6 caracteres/.test(app.corpo));

// 3. Rotas antigas continuam funcionando
const dash = await pega("/dashboard", "manual");
check("/dashboard leva ao app", dash.status >= 300 && dash.status < 400 && dash.location.endsWith("/app"),
  "status " + dash.status + " -> " + dash.location);

// 4. Login e preco
const login = await pega("/login");
check("login responde 200", login.status === 200, "status " + login.status);
check("login exige senha de 8", /minlength="8"|minLength="8"/i.test(login.corpo));

const preco = await pega("/pricing");
check("pricing responde 200", preco.status === 200, "status " + preco.status);
check("pricing tem chamada de acao", /Assinar o Pro|Começar o teste/.test(preco.corpo));

// 5. Portas fechadas continuam fechadas
const me = await pega("/api/factory/me");
check("me sem sessao devolve 401", me.status === 401, "status " + me.status);
check("me nao vaza dado", /"authenticated":false/.test(me.corpo));

const snap = await pega("/api/product/snapshot");
check("snapshot sem sessao devolve 401", snap.status === 401, "status " + snap.status);

const ia = await fetch(BASE + "/api/product/ai", {
  method: "POST",
  headers: { "content-type": "application/json" },
  body: JSON.stringify({ kind: "resolve", text: "teste" }),
});
check("IA sem sessao devolve 401", ia.status === 401, "status " + ia.status);

// 6. Nenhum recado tecnico na tela do cliente
const tecnico = /QUACK_CHECKOUT_URL|variáveis de ambiente|Cole UI do Lovable|process\.env/;
for (const [nome, corpo] of [["home", home.corpo], ["app", app.corpo], ["login", login.corpo], ["pricing", preco.corpo]]) {
  check(nome + " sem recado de configuracao", !tecnico.test(corpo));
}

console.log("\n" + ok + " verificacoes verdes, " + falhas.length + " falhas");
if (falhas.length) {
  for (const f of falhas) console.log(" - " + f);
  process.exit(1);
}
