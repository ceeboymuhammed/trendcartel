// src/hooks/useWallet.ts
"use client";

import { useState, useEffect, useCallback } from "react";
import { PlanTier, ToolKey } from "@/lib/billing/plans";

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

  // Load wallet and purge any expired 7-day free tasks automatically
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed: WalletState = JSON.parse(raw);
        const now = Date.now();
        const validTasks = (parsed.savedTasks || []).filter(
          (t) => !t.expiresAt || new Date(t.expiresAt).getTime() > now
        );
        const cleaned = { ...parsed, savedTasks: validTasks };
        setWallet(cleaned);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(cleaned));
      }
    } catch {
      // ignore storage errors
    } finally {
      setLoaded(true);
    }
  }, []);

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

  // Pre-flight check before calling any tool API
  const checkCanRunTool = useCallback(
    (
      toolKey: ToolKey,
      creditCost: number
    ):
      | { allowed: true }
      | {
          allowed: false;
          reason: "FREE_TIER_TOOL_LOCKED" | "INSUFFICIENT_CREDITS";
          message: string;
        } => {
      if (
        wallet.planTier === "free" &&
        wallet.freeActiveTool &&
        wallet.freeActiveTool !== toolKey
      ) {
        return {
          allowed: false,
          reason: "FREE_TIER_TOOL_LOCKED",
          message:
            "Free accounts can only complete 1 tool workflow. Subscribe via WhatsApp to unlock all TrendCartel engines.",
        };
      }

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

  // Commit deduction + record 7-day retention task after API succeeds
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

        const nextFreeTool =
          prev.planTier === "free" ? prev.freeActiveTool || toolKey : prev.freeActiveTool;

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
          freeActiveTool: nextFreeTool,
          savedTasks: nextTasks,
        };
      });
    },
    [persist]
  );

  return {
    wallet,
    loaded,
    checkCanRunTool,
    recordToolUsage,
  };
}