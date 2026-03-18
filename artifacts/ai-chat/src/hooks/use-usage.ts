import { useState, useEffect, useCallback } from "react";
import { getClientId } from "@/lib/client-id";

export interface UsageData {
  isPro: boolean;
  chat: { used: number; limit: number };
  images: { used: number; limit: number };
  date: string;
}

export function useUsage() {
  const [usage, setUsage] = useState<UsageData | null>(null);

  const refresh = useCallback(async () => {
    try {
      const res = await fetch("/api/openai/usage", {
        headers: { "x-client-id": getClientId() },
      });
      if (res.ok) {
        const data: UsageData = await res.json();
        setUsage(data);
      }
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { usage, refresh };
}
