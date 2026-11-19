// src/hooks/useWallet.ts
"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@supabase/supabase-js";
import { PlanTier, ToolKey } from "@/lib/billing/plans";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export interface SavedTaskItem {
  id: string;
  toolKey: ToolKey;
  title: string;
  payload: unknown;
  createdAt: string;
  expiresAt: string | null; // null = permanent (paid), ISO date = 7-day expiry (free)
}

export interface WalletState {
  userId: string;
  email: string;
  planTier: PlanTier;
  credits: number;
  freeActiveTool: ToolKey | null;
  savedTasks: SavedTaskItem[];
}

const STORAGE_KEY = "trendcartel_wallet_v1";

const DEFAULT_WALLET: WalletState = {
  userId: "guest-trial-user",
  email: "",
  planTier: "free",
  credits: 25,
  freeActiveTool: null,
  savedTasks: [],
};

export function useWallet() {
  const [wallet, setWallet] = useState<WalletState>(DEFAULT_WALLET);
  const [loaded, setLoaded] = useState(false);

  const syncFromSupabase = useCallback(async () => {
    try {
      // 1. Load local cached tasks first so UI isn't blank
      let localTasks: SavedTaskItem[] = [];
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed: WalletState = JSON.parse(raw);
        const now = Date.now();
        localTasks = (parsed.savedTasks || []).filter(
          (t) => !t.expiresAt || new Date(t.expiresAt).getTime() > now
        );
        setWallet({ ...parsed, savedTasks: localTasks });
      }

      // 2. Check authenticated Supabase user and pull live user_wallets row
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        const { data: dbWallet, error } = await supabase
          .from("user_wallets")
          .select("*")
          .eq("user_id", user.id)
          .single();

        if (!error && dbWallet) {
          const syncedWallet: WalletState = {
            userId: user.id,
            email: user.email || dbWallet.email || "",
            planTier: (dbWallet.plan_tier as PlanTier) || "free",
            credits:
              typeof dbWallet.credits_balance === "number"
                ? dbWallet.credits_balance
                : 25,
            freeActiveTool: dbWallet.free_active_tool || null,
            savedTasks: localTasks,
          };

          setWallet(syncedWallet);
          localStorage.setItem(STORAGE_KEY, JSON.stringify(syncedWallet));
        } else {
          // Authenticated user without a wallet row yet
          setWallet((prev) => ({
            ...prev,
            userId: user.id,
            email: user.email || "",
          }));
        }
      }
    } catch (err) {
      console.warn("[useWallet] Sync error:", err);
    } finally {
      setLoaded(true);
    }
  }, []);

  useEffect(() => {
    syncFromSupabase();

    // Re-sync immediately whenever user logs in, logs out, or switches account
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_IN" || event === "TOKEN_REFRESHED") {
        syncFromSupabase();
      } else if (event === "SIGNED_OUT") {
        localStorage.removeItem(STORAGE_KEY);
        setWallet(DEFAULT_WALLET);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [syncFromSupabase]);

  const persist = useCallback((updater: (prev: WalletState) => WalletState) => {
    setWallet((prev) => {
      const next = updater(prev);
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch {
        // ignore storage errors
      }
      return next;
    });
  }, []);

  // Pre-flight check before calling any tool API (Only blocks when out of credits)
  const checkCanRunTool = useCallback(
    (
      _toolKey: ToolKey,
      creditCost: number
    ):
      | { allowed: true }
      | {
          allowed: false;
          reason: "FREE_TIER_TOOL_LOCKED" | "INSUFFICIENT_CREDITS";
          message: string;
        } => {
      if (wallet.credits < creditCost) {
        return {
          allowed: false,
          reason: "INSUFFICIENT_CREDITS",
          message: `This action costs ${creditCost} credits, but you have ${wallet.credits} left. Subscribe via WhatsApp to top up.`,
        };
      }

      return { allowed: true };
    },
    [wallet]
  );

  // Commit deduction + record retention task after API succeeds
  const recordToolUsage = useCallback(
    (params: {
      toolKey: ToolKey;
      creditCost: number;
      taskTitle?: string;
      taskPayload?: unknown;
      serverCreditsRemaining?: number;
    }) => {
      const { toolKey, creditCost, taskTitle, taskPayload, serverCreditsRemaining } = params;

      persist((prev) => {
        const nextCredits =
          typeof serverCreditsRemaining === "number"
            ? serverCreditsRemaining
            : Math.max(0, prev.credits - creditCost);

        let nextTasks = prev.savedTasks;
        if (taskTitle && taskPayload) {
          const expiresAt =
            prev.planTier === "free"
              ? new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
              : null;

          const newItem: SavedTaskItem = {
            id: `${Date.now()}`,
            toolKey,
            title: taskTitle,
            payload: taskPayload,
            createdAt: new Date().toISOString(),
            expiresAt,
          };
          nextTasks = [newItem, ...prev.savedTasks];
        }

        return {
          ...prev,
          credits: nextCredits,
          savedTasks: nextTasks,
        };
      });
    },
    [persist]
  );

  return {
    wallet,
    loaded,
    refreshWallet: syncFromSupabase,
    checkCanRunTool,
    recordToolUsage,
  };
}