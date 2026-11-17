'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { ArrowRight, Mail, Sparkles, ShieldCheck } from 'lucide-react';
import Link from 'next/link';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setLoading(true);
    setMessage(null);

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/dashboard`,
      },
    });

    setLoading(false);

    if (error) {
      setMessage({ text: error.message, type: 'error' });
    } else {
      setMessage({
        text: 'Magic sign-in link sent! Check your inbox to enter your dashboard.',
        type: 'success',
      });
    }
  };

  return (
    <div className="min-h-screen bg-neutral-950 flex flex-col justify-center items-center px-4 py-12">
      <div className="w-full max-w-md bg-neutral-900 border border-neutral-800 rounded-2xl p-8 shadow-2xl">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-4">
            <div className="w-9 h-9 rounded-xl bg-emerald-500 flex items-center justify-center font-black text-neutral-950 text-xl">
              T
            </div>
            <span className="font-extrabold text-xl text-white tracking-tight">
              Trend<span className="text-emerald-400">Cartel</span>
            </span>
          </Link>
          <h1 className="text-2xl font-bold text-white tracking-tight">Access Your Command Center</h1>
          <p className="text-xs text-neutral-400 mt-2">
            Sign up for free. Get 3 free niche explorations instantly.
          </p>
        </div>

        {message && (
          <div
            className={`p-4 rounded-xl text-xs mb-6 border ${
              message.type === 'success'
                ? 'bg-emerald-950/40 border-emerald-800 text-emerald-300'
                : 'bg-rose-950/40 border-rose-800 text-rose-300'
            }`}
          >
            {message.text}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-neutral-300 uppercase tracking-wider mb-2">
              Work Email Address
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

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-bold py-3 px-4 rounded-xl text-sm transition flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? 'Sending link...' : 'Continue with Magic Link'}
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-neutral-800 text-center text-xs text-neutral-500">
          <div className="flex items-center justify-center gap-1.5 text-neutral-400">
            <ShieldCheck className="w-4 h-4 text-emerald-400" /> Passwordless authentication. Zero spam.
          </div>
        </div>
      </div>
    </div>
  );
}