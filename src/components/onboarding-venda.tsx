"use client";

import { useEffect } from "react";

type Sdk = {
  iniciar: (opcoes: {
    slug: string;
    aoEnviarDados?: (dados: Record<string, string>) => void;
    aoConcluir?: () => void;
  }) => Promise<unknown>;
};

/**
 * As telas de venda que quem chega do anuncio ve antes da pagina.
 * O texto vive no control (control.roriz.tech/saas/smartdayz/onboarding),
 * entao mudar copy nao passa por deploy daqui.
 */
export function OnboardingVenda({ destino = "/login" }: { destino?: string }) {
  useEffect(() => {
    const css = document.createElement("link");
    css.rel = "stylesheet";
    css.href = "https://control.roriz.tech/sdk/onboarding.css";
    document.head.appendChild(css);

    const js = document.createElement("script");
    js.src = "https://control.roriz.tech/sdk/onboarding.js";
    js.async = true;
    js.onload = () => {
      const sdk = (window as unknown as { OnboardingVenda?: Sdk }).OnboardingVenda;
      if (!sdk) return;
      sdk
        .iniciar({
          slug: "smartdayz",
          // o control guarda as respostas junto do evento; aqui fica a copia
          // local pra nao perder o lead se a rede cair no meio do caminho
          aoEnviarDados: (dados) => {
            try {
              localStorage.setItem("smartdayz:lead", JSON.stringify(dados));
            } catch {
              /* modo anonimo */
            }
          },
          aoConcluir: () => {
            window.location.href = destino;
          },
        })
        .catch(() => {
          /* control fora do ar: a pessoa fica na pagina normal */
        });
    };
    document.body.appendChild(js);

    // sem cleanup de proposito: em dev o React monta duas vezes e remover o
    // script no meio do caminho cancela o carregamento antes do onload
  }, [destino]);

  return null;
}
