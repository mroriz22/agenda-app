"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useId, useState } from "react";
import { authClient } from "@/lib/auth-client";

/** Traduz o recado técnico do Better Auth pra uma frase que a pessoa entende. */
function recado(bruto: string, modo: "login" | "signup") {
  const t = bruto.toLowerCase();
  if (t.includes("invalid") && t.includes("password")) return "E-mail ou senha não conferem.";
  if (t.includes("invalid email") || t.includes("user not found")) return "E-mail ou senha não conferem.";
  if (t.includes("already") || t.includes("exists")) return "Já existe uma conta com esse e-mail. Tente entrar.";
  if (t.includes("password") && t.includes("short")) return "A senha precisa de pelo menos 8 caracteres.";
  if (t.includes("network") || t.includes("fetch")) return "Não deu pra falar com o servidor. Confira a internet e tente de novo.";
  return modo === "login"
    ? "Não consegui entrar agora. Tente de novo em instantes."
    : "Não consegui criar a conta agora. Tente de novo em instantes.";
}

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [verSenha, setVerSenha] = useState(false);
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const id = useId();

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      if (mode === "signup") {
        const res = await authClient.signUp.email({ email, password, name: name || email.split("@")[0] });
        if (res.error) throw new Error(res.error.message ?? "signup failed");
      } else {
        const res = await authClient.signIn.email({ email, password });
        if (res.error) throw new Error(res.error.message ?? "login failed");
      }
      router.push("/app");
      router.refresh();
    } catch (err) {
      setError(recado(err instanceof Error ? err.message : String(err), mode));
    } finally {
      setLoading(false);
    }
  }

  const campo =
    "w-full rounded-btn border border-hairline bg-transparent px-3 py-2.5 text-sm outline-none focus:border-signal";
  const rotulo = "block text-sm font-medium text-ink";

  return (
    <main className="mx-auto flex min-h-full w-full max-w-md flex-col justify-center gap-6 px-6 py-16">
      <div className="space-y-1">
        <Link href="/" className="text-sm text-slate hover:text-ink">
          ← voltar
        </Link>
        <h1 className="text-2xl font-semibold tracking-tight text-ink">
          {mode === "login" ? "Entrar no SmartDayZ" : "Criar sua conta"}
        </h1>
        <p className="text-sm text-slate">
          {mode === "login"
            ? "Sua agenda, a matriz do dia e o aproveitamento do seu pico de energia."
            : "São 7 dias de teste, sem cartão. Depois você decide se continua."}
        </p>
      </div>

      <form onSubmit={onSubmit} className="space-y-4" noValidate={false}>
        {mode === "signup" && (
          <div className="space-y-1.5">
            <label className={rotulo} htmlFor={`${id}-nome`}>
              Como quer ser chamada
            </label>
            <input
              id={`${id}-nome`}
              className={campo}
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoComplete="name"
            />
          </div>
        )}

        <div className="space-y-1.5">
          <label className={rotulo} htmlFor={`${id}-email`}>
            E-mail
          </label>
          <input
            id={`${id}-email`}
            className={campo}
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
          />
        </div>

        <div className="space-y-1.5">
          <label className={rotulo} htmlFor={`${id}-senha`}>
            Senha
          </label>
          <div className="relative">
            <input
              id={`${id}-senha`}
              className={`${campo} pr-20`}
              type={verSenha ? "text" : "password"}
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete={mode === "login" ? "current-password" : "new-password"}
              aria-describedby={mode === "signup" ? `${id}-regra` : undefined}
            />
            <button
              type="button"
              onClick={() => setVerSenha(!verSenha)}
              aria-pressed={verSenha}
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded px-2 py-1 text-xs font-medium text-slate hover:text-ink"
            >
              {verSenha ? "ocultar" : "ver"}
            </button>
          </div>
          {mode === "signup" && (
            <p id={`${id}-regra`} className="text-xs text-slate">
              Pelo menos 8 caracteres.
            </p>
          )}
        </div>

        {error && (
          <p role="alert" className="rounded-btn bg-signal/10 px-3 py-2 text-sm text-signal">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-btn bg-signal py-2.5 text-sm font-medium text-white hover:opacity-90 disabled:opacity-50"
        >
          {loading ? "Um instante…" : mode === "login" ? "Entrar" : "Criar conta e começar o teste"}
        </button>
      </form>

      <button
        type="button"
        className="text-sm text-slate hover:text-ink"
        onClick={() => {
          setMode(mode === "login" ? "signup" : "login");
          setError(null);
        }}
      >
        {mode === "login" ? "Não tem conta? Criar agora" : "Já tem conta? Entrar"}
      </button>
    </main>
  );
}
