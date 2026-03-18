import { useQueryClient, useQuery } from "@tanstack/react-query";
import { useCallback } from "react";
import { getClientId } from "@/lib/client-id";

export interface UsageData {
  isPro: boolean;
  chat: { used: number; limit: number };
  images: { used: number; limit: number };
  date: string;
}

const USAGE_QUERY_KEY = ["nexus-usage"];

async function fetchUsage(): Promise<UsageData> {
  const res = await fetch("/api/openai/usage", {
    headers: { "x-client-id": getClientId() },
  });
  if (!res.ok) throw new Error("Failed to fetch usage");
  return res.json();
}

export function useUsage() {
  const queryClient = useQueryClient();

  const { data: usage } = useQuery({
    queryKey: USAGE_QUERY_KEY,
    queryFn: fetchUsage,
    staleTime: 10_000,
    refetchOnWindowFocus: true,
  });

  const refresh = useCallback(async () => {
    await queryClient.invalidateQueries({ queryKey: USAGE_QUERY_KEY });
  }, [queryClient]);

  return { usage: usage ?? null, refresh };
}
