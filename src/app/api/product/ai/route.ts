import { getSessionAccess } from "@/factory";

export const runtime = "nodejs";

const MODEL = process.env.AI_MODEL ?? "gemini-2.0-flash";

const PROMPT_RESOLVE = [
  "Você ajuda alguém a resolver rápido uma tarefa da agenda dela.",
  "Responda em português do Brasil, direto, sem enrolação e sem travessão.",
  "Entregue a resposta pronta para usar: se for e-mail, escreva o e-mail;",
  "se for decisão, dê a recomendação; se for pesquisa, dê o resumo.",
  "No máximo 200 palavras.",
].join(" ");

const PROMPT_TIP = [
  "Você é um conselheiro de gestão do tempo baseado em cronobiologia.",
  "Recebe o resumo de um período da agenda de alguém e devolve UMA dica prática.",
  "Português do Brasil, no máximo 120 palavras, sem travessão, sem repetir o que já foi apontado.",
].join(" ");

function json(body: unknown, status = 200) {
  return Response.json(body, { status });
}

export async function POST(req: Request) {
  const ctx = await getSessionAccess();
  if (!ctx) return json({ error: "Faça login para usar a IA." }, 401);
  if (!ctx.access.allowed) return json({ error: "A IA é do Pro." }, 402);

  const key = process.env.GEMINI_API_KEY;
  if (!key) return json({ error: "A IA ainda não está configurada." }, 503);

  let body: { mode?: string; title?: string; note?: string; summary?: string };
  try {
    body = await req.json();
  } catch {
    return json({ error: "corpo inválido" }, 400);
  }

  const tip = body.mode === "tip";
  const userText = tip
    ? String(body.summary ?? "").slice(0, 6000)
    : [`Tarefa: ${String(body.title ?? "").slice(0, 500)}`, body.note ? `Contexto: ${String(body.note).slice(0, 2000)}` : ""]
        .filter(Boolean)
        .join("\n");

  if (!userText.trim()) return json({ error: "nada para enviar" }, 400);

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`,
    {
      method: "POST",
      headers: { "content-type": "application/json", "x-goog-api-key": key },
      body: JSON.stringify({
        system_instruction: { parts: [{ text: tip ? PROMPT_TIP : PROMPT_RESOLVE }] },
        contents: [{ role: "user", parts: [{ text: userText }] }],
        generationConfig: { temperature: 0.6, maxOutputTokens: 800 },
      }),
    },
  );

  if (!res.ok) {
    return json({ error: "A IA não respondeu agora. Tente de novo." }, 502);
  }

  const data = (await res.json()) as {
    candidates?: { content?: { parts?: { text?: string }[] } }[];
  };
  const text = (data.candidates?.[0]?.content?.parts ?? [])
    .map((p) => p.text ?? "")
    .join("")
    .trim();

  if (!text) return json({ error: "A IA voltou vazia." }, 502);
  return json({ text });
}
