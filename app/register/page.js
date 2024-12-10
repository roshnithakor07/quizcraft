"use client";

import { useState, useEffect, Suspense } from "react";
import { signIn, useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

function RegisterForm() {
  const router       = useRouter();
  const searchParams = useSearchParams();
  const { data: session } = useSession();
  const hasPending   = searchParams.get("pending") === "quiz";

  const [name,     setName]     = useState("");
  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [error,    setError]    = useState("");
  const [loading,  setLoading]  = useState(false);

  useEffect(() => {
    if (session?.user) router.push("/");
  }, [session]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !email || !password) { setError("Please fill in all fields."); return; }
    setLoading(true); setError("");
    try {
      const res  = await fetch("/api/auth/register", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Registration failed."); return; }
      const signInRes = await signIn("credentials", { email, password, redirect: false });
      if (signInRes?.error) { router.push("/login"); return; }
      router.push("/");
      router.refresh();
    } catch {
      setError("Something went wrong. Please try again.");
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative z-10">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 text-[var(--amber)] mb-3">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-5 h-5">
              <path d="M20.24 12.24a6 6 0 0 0-8.49-8.49L5 10.5V19h8.5z"/>
              <line x1="16" y1="8" x2="2" y2="22"/>
              <line x1="17.5" y1="15" x2="9" y2="15"/>
            </svg>
            <span className="font-serif text-2xl font-bold text-[var(--ink)]">QuizCraft</span>
          </div>
          <h1 className="font-serif text-xl font-semibold text-[var(--ink)] mb-1">Create your account</h1>
          {hasPending ? (
            <div className="flex items-center justify-center gap-1.5 text-sm text-amber-600 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2 mt-2">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4 shrink-0"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>
              Sign up to save your quiz
            </div>
          ) : (
            <p className="text-sm text-[var(--muted)]">Free forever · No credit card needed</p>
          )}
        </div>
        <div className="card space-y-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-[var(--muted)] uppercase tracking-wider mb-1.5 block">Name</label>
              <input type="text" value={name} onChange={e=>setName(e.target.value)}
                placeholder="Your name" autoComplete="name"
                className="w-full border border-[var(--border)] rounded-xl px-4 py-3 text-sm text-[var(--ink)] bg-[var(--paper)] outline-none focus:border-[var(--amber)] placeholder-[var(--muted)]/40 transition-colors"/>
            </div>
            <div>
              <label className="text-xs font-semibold text-[var(--muted)] uppercase tracking-wider mb-1.5 block">Email</label>
              <input type="email" value={email} onChange={e=>setEmail(e.target.value)}
                placeholder="you@example.com" autoComplete="email"
                className="w-full border border-[var(--border)] rounded-xl px-4 py-3 text-sm text-[var(--ink)] bg-[var(--paper)] outline-none focus:border-[var(--amber)] placeholder-[var(--muted)]/40 transition-colors"/>
            </div>
            <div>
              <label className="text-xs font-semibold text-[var(--muted)] uppercase tracking-wider mb-1.5 block">Password</label>
              <input type="password" value={password} onChange={e=>setPassword(e.target.value)}
                placeholder="Min. 6 characters" autoComplete="new-password"
                className="w-full border border-[var(--border)] rounded-xl px-4 py-3 text-sm text-[var(--ink)] bg-[var(--paper)] outline-none focus:border-[var(--amber)] placeholder-[var(--muted)]/40 transition-colors"/>
            </div>
            {error && (
              <div className="bg-ember/10 border border-ember/30 text-ember text-sm px-4 py-3 rounded-xl">{error}</div>
            )}
            <button type="submit" disabled={loading}
              className={`w-full py-3 rounded-xl font-semibold text-sm transition-all ${
                loading ? "bg-[var(--warm)] text-[var(--muted)] cursor-not-allowed"
                        : "bg-[var(--ink)] text-[var(--paper)] hover:bg-[#2d2010] active:scale-[0.99]"
              }`}>
              {loading ? "Creating account…" : hasPending ? "Create account & save quiz" : "Create account"}
            </button>
          </form>
          <p className="text-xs text-center text-[var(--muted)] pt-2 border-t border-[var(--border)]">
            Already have an account?{" "}
            <Link href={hasPending ? "/login?pending=quiz" : "/login"}
              className="text-[var(--amber)] hover:underline font-medium">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><p className="text-sm text-[var(--muted)]">Loading…</p></div>}>
      <RegisterForm />
    </Suspense>
  );
}