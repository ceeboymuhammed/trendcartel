import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const PLAN_CREDITS: Record<string, number> = {
  creator: 100,
  agency: 500,
  pro: 500,
};

export async function POST(req: NextRequest) {
  try {
    const { secret, email, planTier, bonusCredits = 0 } = await req.json();

    if (!secret || secret !== process.env.ADMIN_ACTIVATION_SECRET) {
      return NextResponse.json({ error: "Unauthorized admin secret." }, { status: 401 });
    }

    if (!email || !planTier) {
      return NextResponse.json(
        { error: "Both email and planTier ('creator' or 'agency') are required." },
        { status: 400 }
      );
    }

    // 1. Look up the user in Supabase Auth by email
    const { data: usersData, error: listError } = await supabaseAdmin.auth.admin.listUsers();
    if (listError) throw listError;

    const targetUser = usersData.users.find(
      (u) => u.email?.toLowerCase() === email.trim().toLowerCase()
    );

    if (!targetUser) {
      return NextResponse.json(
        { error: `No user found with email: ${email}` },
        { status: 404 }
      );
    }

    // 2. Fetch current wallet balance
    const { data: wallet, error: walletError } = await supabaseAdmin
      .from("user_wallets")
      .select("*")
      .eq("user_id", targetUser.id)
      .single();

    if (walletError || !wallet) {
      return NextResponse.json({ error: "User wallet record not found." }, { status: 404 });
    }

    const addedCredits = (PLAN_CREDITS[planTier.toLowerCase()] || 100) + Number(bonusCredits);
    const updatedBalance = (wallet.credits_balance || 0) + addedCredits;

    // 3. Upgrade plan_tier and credit the wallet
    const { error: updateError } = await supabaseAdmin
      .from("user_wallets")
      .update({
        plan_tier: planTier.toLowerCase(),
        credits_balance: updatedBalance,
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", targetUser.id);

    if (updateError) throw updateError;

    return NextResponse.json({
      success: true,
      email: targetUser.email,
      userId: targetUser.id,
      newPlanTier: planTier.toLowerCase(),
      creditsAdded: addedCredits,
      newCreditsBalance: updatedBalance,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Failed to upgrade user." },
      { status: 500 }
    );
  }
}