"use client";

import { useCallback, useEffect, useState } from "react";

export type ClientAccess = {
  status: string;
  plan: string;
  features: string[];
  allowed: boolean;
  trialEndsAt: string | null;
  currentPeriodEnd: string | null;
  reason?: string;
  checkoutUrl: string;
};

type MeResponse =
  | { authenticated: false }
  | {
      authenticated: true;
      user: { id: string; email: string; name: string };
      access: ClientAccess;
    };

/**
 * Hook pro UI vibecoded/Lovable:
 *
 *   const { access, loading, refresh } = useAccess()
 *   if (!access?.allowed) return <Paywall />
 */
export function useAccess() {
  const [data, setData] = useState<MeResponse | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/factory/me", { credentials: "include" });
      if (res.status === 401) {
        setData({ authenticated: false });
        return;
      }
      setData((await res.json()) as MeResponse);
    } catch {
      setData({ authenticated: false });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return {
    loading,
    refresh,
    authenticated: data?.authenticated === true,
    user: data && data.authenticated ? data.user : null,
    access: data && data.authenticated ? data.access : null,
  };
}

/** Track client-side (passa pelo proxy server). */
export async function trackClient(
  name: string,
  properties?: Record<string, unknown>,
) {
  try {
    await fetch("/api/factory/track", {
      method: "POST",
      headers: { "content-type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ name, properties }),
    });
  } catch {
    // swallow
  }
}
