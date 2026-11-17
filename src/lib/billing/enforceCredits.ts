// src/lib/billing/enforceCredits.ts
import { createClient } from "@supabase/supabase-js";
import { PlanTier, ToolKey } from "./plans";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export interface EnforcementResult {
  allowed: boolean;
  status: number;
  error?: string;
  code?: "INSUFFICIENT_CREDITS" | "FREE_TIER_TOOL_LOCKED" | "UNAUTHORIZED";
  remainingCredits?: number;
  planTier?: PlanTier;
}

export async function verifyAndDeductCredits(params: {
  userId: string;
  toolKey: ToolKey;
  creditCost: number;
}): Promise<EnforcementResult> {
  const { userId, toolKey, creditCost } = params;

  if (!userId) {
    return {
      allowed: false,
      status: 401,
      code: "UNAUTHORIZED",
      error: "Please sign in to use TrendCartel tools.",
    };
  }

  const { data: wallet, error } = await supabaseAdmin
    .from("user_wallets")
    .select("*")
    .eq("user_id", userId)
    .single();

  if (error || !wallet) {
    return {
      allowed: false,
      status: 404,
      code: "UNAUTHORIZED",
      error: "User wallet not found.",
    };
  }

  const planTier = wallet.plan_tier as PlanTier;

  // 1. Enforce Free-Tier Single-Tool Rule
  if (planTier === "free") {
    if (wallet.free_active_tool && wallet.free_active_tool !== toolKey) {
      return {
        allowed: false,
        status: 403,
        code: "FREE_TIER_TOOL_LOCKED",
        planTier,
        remainingCredits: wallet.credits_balance,
        error:
          "Free accounts can use 1 tool only. Subscribe via WhatsApp to unlock all TrendCartel tools.",
      };
    }
  }

  // 2. Enforce Credit Balance Check
  if (wallet.credits_balance < creditCost) {
    return {
      allowed: false,
      status: 402,
      code: "INSUFFICIENT_CREDITS",
      planTier,
      remainingCredits: wallet.credits_balance,
      error: `This action requires ${creditCost} credits, but you have ${wallet.credits_balance} left. Upgrade via WhatsApp to top up.`,
    };
  }

  // 3. Deduct Credits & Lock Free Tool if First Use
  const nextBalance = wallet.credits_balance - creditCost;
  const nextFreeTool =
    planTier === "free" ? wallet.free_active_tool || toolKey : wallet.free_active_tool;

  const { error: updateError } = await supabaseAdmin
    .from("user_wallets")
    .update({
      credits_balance: nextBalance,
      free_active_tool: nextFreeTool,
      updated_at: new Date().toISOString(),
    })
    .eq("user_id", userId);

  if (updateError) {
    return {
      allowed: false,
      status: 500,
      error: "Could not update wallet credits. Please try again.",
    };
  }

  return {
    allowed: true,
    status: 200,
    remainingCredits: nextBalance,
    planTier,
  };
}

export async function saveUserOutput(params: {
  userId: string;
  planTier: PlanTier;
  toolKey: ToolKey;
  title: string;
  payload: unknown;
}) {
  const { userId, planTier, toolKey, title, payload } = params;

  // Free users retain output details for 7 days; paid plans keep them permanently
  const expiresAt =
    planTier === "free"
      ? new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
      : null;

  await supabaseAdmin.from("saved_outputs").insert({
    user_id: userId,
    tool_key: toolKey,
    title,
    payload,
    expires_at: expiresAt,
  });
}