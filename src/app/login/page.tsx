"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import {
  ArrowRight,
  Mail,
  Lock,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  Eye,
  EyeOff,
} from "lucide-react";
import Link from "next/link";

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectPath = searchParams.get("redirect") || "/dashboard";
  const initialMode =
    searchParams.get("mode") === "signin" || searchParams.get("mode") === "login"
      ? "signin"
      : "signup";

  const [authMode, setAuthMode] = useState<"signup" | "signin" | "reset">(initialMode);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resetSending, setResetSending] = useState(false);
  const [message, setMessage] = useState<{
    text: string;
    type: "success" | "error";
  } | null>(null);

  const safeRedirect =
    redirectPath && redirectPath.startsWith("/dashboard")
      ? redirectPath
      : "/dashboard";

  // Sync tab when URL query parameter changes (?mode=signin or ?mode=signup)
  useEffect(() => {
    const modeParam = searchParams.get("mode");
    if (modeParam === "signin" || modeParam === "login") {
      setAuthMode("signin");
    } else if (modeParam === "signup" || modeParam === "register") {
      setAuthMode("signup");
    } else if (modeParam === "reset") {
      setAuthMode("reset");
    }
  }, [searchParams]);

  // Listen for Supabase PASSWORD_RECOVERY event when user returns from reset email link
  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") {
        setAuthMode("reset");
        setMessage({
          text: "Enter your new password below to complete your reset.",
          type: "success",
        });
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleForgotPassword = async () => {
    const cleanEmail = email.trim();
    setMessage(null);

    if (!cleanEmail) {
      setMessage({
        text: "Please enter your email address above first, then click Forgot password.",
        type: "error",
      });
      return;
    }

    setResetSending(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(cleanEmail, {
        redirectTo: `${window.location.origin}/login?mode=reset`,
      });

      if (error) {
        setMessage({ text: error.message, type: "error" });
      } else {
        setMessage({
          text: "Password reset link sent! Check your email inbox (and spam folder).",
          type: "success",
        });
      }
    } catch (err: any) {
      setMessage({
        text: err.message || "Could not send password reset link.",
        type: "error",
      });
    } finally {
      setResetSending(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      setMessage({
        text: "New password must be at least 6 characters long.",
        type: "error",
      });
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) {
        setMessage({ text: error.message, type: "error" });
        return;
      }

      setMessage({
        text: "Password updated successfully! Redirecting to dashboard...",
        type: "success",
      });
      setTimeout(() => router.push(safeRedirect), 1000);
    } catch (err: any) {
      setMessage({
        text: err.message || "Failed to update password.",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = email.trim();
    if (!cleanEmail || !password) return;

    if (authMode === "signup" && password.length < 6) {
      setMessage({
        text: "Password must be at least 6 characters long.",
        type: "error",
      });
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      if (authMode === "signup") {
        const { data, error } = await supabase.auth.signUp({
          email: cleanEmail,
          password,
        });

        if (error) {
          setMessage({ text: error.message, type: "error" });
          setLoading(false);
          return;
        }

        if (data.session && data.user) {
          router.push(safeRedirect);
          return;
        }

        // Fallback: immediately sign in with the password just created
        const signInRes = await supabase.auth.signInWithPassword({
          email: cleanEmail,
          password,
        });

        if (signInRes.data?.user) {
          router.push(safeRedirect);
          return;
        }

        setMessage({
          text: "Account created! Please switch to Sign In or check your email to verify.",
          type: "success",
        });
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: cleanEmail,
          password,
        });

        if (error) {
          setMessage({ text: error.message, type: "error" });
          setLoading(false);
          return;
        }

        if (data.user) {
          router.push(safeRedirect);
          return;
        }
      }
    } catch (err: any) {
      setMessage({
        text: err.message || "Authentication failed. Please try again.",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-950 flex flex-col justify-center items-center px-4 py-12">
      <div className="w-full max-w-md bg-neutral-900 border border-neutral-800 rounded-3xl p-8 shadow-2xl">
        <div className="text-center mb-6">
          <Link href="/" className="inline-flex items-center gap-2 mb-4">
            <div className="w-9 h-9 rounded-xl bg-emerald-500 flex items-center justify-center font-black text-neutral-950 text-xl">
              T
            </div>
            <span className="font-extrabold text-xl text-white tracking-tight">
              Trend<span className="text-emerald-400">Cartel</span>
            </span>
          </Link>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">
            {authMode === "reset"
              ? "Set New Password"
              : authMode === "signup"
              ? "Create Your Free Account"
              : "Welcome Back"}
          </h1>
          <p className="text-xs text-neutral-400 mt-1.5">
            {authMode === "reset"
              ? "Choose a strong new password for your TrendCartel account."
              : authMode === "signup"
              ? "Claim 25 starter credits and build your first digital product."
              : "Sign in to access your TrendCartel workspace and saved files."}
          </p>
        </div>

        {authMode !== "reset" && (
          <div className="grid grid-cols-2 gap-1.5 p-1 rounded-2xl bg-neutral-950 border border-neutral-800 mb-6 text-xs font-bold">
            <button
              type="button"
              onClick={() => {
                setAuthMode("signup");
                setMessage(null);
              }}
              className={`py-2.5 rounded-xl transition ${
                authMode === "signup"
                  ? "bg-emerald-500 text-neutral-950"
                  : "text-neutral-400 hover:text-white"
              }`}
            >
              Create Account
            </button>
            <button
              type="button"
              onClick={() => {
                setAuthMode("signin");
                setMessage(null);
              }}
              className={`py-2.5 rounded-xl transition ${
                authMode === "signin"
                  ? "bg-emerald-500 text-neutral-950"
                  : "text-neutral-400 hover:text-white"
              }`}
            >
              Sign In
            </button>
          </div>
        )}

        {authMode === "signup" && (
          <div className="mb-5 p-3.5 rounded-2xl bg-neutral-950 border border-neutral-800 space-y-1.5 text-[11px] text-neutral-300">
            <div className="font-bold text-emerald-400 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" /> Free Starter Account Includes:
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
              <span>25 wallet credits (complete 1 full tool workflow)</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
              <span>7-day retention on your completed project details</span>
            </div>
          </div>
        )}

        {message && (
          <div
            className={`p-3.5 rounded-xl text-xs mb-5 border leading-relaxed ${
              message.type === "success"
                ? "bg-emerald-950/40 border-emerald-800 text-emerald-300"
                : "bg-rose-950/40 border-rose-800 text-rose-300"
            }`}
          >
            {message.text}
          </div>
        )}

        {authMode === "reset" ? (
          <form onSubmit={handleUpdatePassword} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-neutral-300 uppercase tracking-wider mb-1.5">
                New Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-neutral-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  minLength={6}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Minimum 6 characters"
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl pl-10 pr-10 py-3 text-sm text-neutral-100 placeholder:text-neutral-600 focus:outline-none focus:border-emerald-500 transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-300"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-extrabold py-3.5 px-4 rounded-xl text-sm transition flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? "Saving New Password..." : "Update Password"}
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-neutral-300 uppercase tracking-wider mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-neutral-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@domain.com"
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl pl-10 pr-4 py-3 text-sm text-neutral-100 placeholder:text-neutral-600 focus:outline-none focus:border-emerald-500 transition"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-neutral-300 uppercase tracking-wider">
                  Password
                </label>
                {authMode === "signin" && (
                  <button
                    type="button"
                    onClick={handleForgotPassword}
                    disabled={resetSending}
                    className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 hover:underline disabled:opacity-50"
                  >
                    {resetSending ? "Sending reset link..." : "Forgot password?"}
                  </button>
                )}
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-neutral-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Minimum 6 characters"
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl pl-10 pr-10 py-3 text-sm text-neutral-100 placeholder:text-neutral-600 focus:outline-none focus:border-emerald-500 transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-300"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-extrabold py-3.5 px-4 rounded-xl text-sm transition flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading
                ? authMode === "signup"
                  ? "Creating Account..."
                  : "Signing In..."
                : authMode === "signup"
                ? "Create Free Account (25 Credits)"
                : "Sign In to Dashboard"}
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}

        <div className="mt-7 pt-5 border-t border-neutral-800 text-center text-xs text-neutral-500 space-y-2">
          <div className="flex items-center justify-center gap-1.5 text-neutral-400">
            <ShieldCheck className="w-4 h-4 text-emerald-400" /> Instant access · No card required
          </div>
          <Link href="/" className="inline-block text-neutral-500 hover:text-neutral-300">
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-neutral-950 flex items-center justify-center text-xs text-neutral-400">
          Loading sign-in...
        </div>
      }
    >
      <LoginContent />
    </Suspense>
  );
}