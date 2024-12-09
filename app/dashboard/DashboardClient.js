"use client";

import { useState } from "react";
import { signOut } from "next-auth/react";
import Link from "next/link";

function scoreColor(pct) {
  if (pct >= 80) return "#4d7c5f";
  if (pct >= 60) return "#d97706";
  return "#c2410c";
}

export default function DashboardClient({ quizzes, user }) {
  const [deleting,   setDeleting]   = useState(null);
  const [list,       setList]       = useState(quizzes);
  const [copiedId,   setCopiedId]   = useState(null);

  const handleDelete = async (shareId) => {
    if (!confirm("Delete this quiz? This cannot be undone.")) return;
    setDeleting(shareId);
    try {
      const res = await fetch(`/api/quiz/${shareId}`, { method: "DELETE" });
      if (res.ok) setList(l => l.filter(q => q.shareId !== shareId));
    } catch { alert("Failed to delete quiz."); }
    finally { setDeleting(null); }
  };

  const copy = (shareId) => {
    navigator.clipboard.writeText(`${window.location.origin}/quiz/${shareId}`);
    setCopiedId(shareId);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="min-h-screen relative z-10">
      <div className="max-w-3xl mx-auto px-4 py-10">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Link href="/" className="inline-flex items-center gap-1.5 text-[var(--amber)]">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-5 h-5"><path d="M20.24 12.24a6 6 0 0 0-8.49-8.49L5 10.5V19h8.5z"/><line x1="16" y1="8" x2="2" y2="22"/><line x1="17.5" y1="15" x2="9" y2="15"/></svg>
                <span className="font-serif text-xl font-bold text-[var(--ink)]">QuizCraft</span>
              </Link>
            </div>
            <p className="text-sm text-[var(--muted)]">Welcome back, <span className="font-medium text-[var(--ink)]">{user.name}</span></p>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/" className="text-xs px-3 py-2 border border-[var(--border)] rounded-xl text-[var(--muted)] hover:border-[var(--amber)] transition-all">
              + New quiz
            </Link>
            <button onClick={() => signOut({ callbackUrl: "/" })}
              className="text-xs px-3 py-2 border border-[var(--border)] rounded-xl text-[var(--muted)] hover:border-red-300 hover:text-red-500 transition-all">
              Sign out
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-8">
          {[
            { label: "Total Quizzes",   value: list.length },
            { label: "Total Responses", value: list.reduce((s, q) => s + q.responses.count, 0) },
            { label: "Avg Score",       value: list.length ? `${Math.round(list.reduce((s,q)=>s+(q.responses.avgScore||0),0)/list.length)}%` : "—" },
          ].map(({ label, value }) => (
            <div key={label} className="card text-center py-4">
              <p className="font-serif text-2xl font-bold text-[var(--ink)]">{value}</p>
              <p className="text-xs text-[var(--muted)] mt-1">{label}</p>
            </div>
          ))}
        </div>

        {/* Quiz list */}
        <div className="card">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-serif text-lg font-semibold text-[var(--ink)]">My Quizzes</h2>
            <Link href="/" className="text-xs text-[var(--amber)] hover:underline">+ Create new</Link>
          </div>

          {list.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-[var(--muted)] mb-3">No quizzes yet</p>
              <Link href="/" className="text-sm text-[var(--amber)] hover:underline">Create your first quiz →</Link>
            </div>
          ) : (
            <div className="space-y-3">
              {list.map(quiz => {
                const date = new Date(quiz.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
                return (
                  <div key={quiz.shareId} className="border border-[var(--border)] rounded-xl p-4 hover:border-[var(--amber)]/40 transition-all">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-serif font-semibold text-[var(--ink)] truncate">{quiz.title}</h3>
                        <p className="text-xs text-[var(--muted)] mt-0.5">{quiz.topic}</p>
                        <div className="flex items-center gap-3 mt-2 text-xs text-[var(--muted)]">
                          <span>{quiz.questions?.length || 0} questions</span>
                          <span>·</span>
                          <span>{quiz.language || "English"}</span>
                          <span>·</span>
                          <span>{date}</span>
                        </div>
                      </div>
                      {/* Response badge */}
                      <div className="shrink-0 text-right">
                        <p className="font-mono font-bold text-lg" style={{ color: quiz.responses.count > 0 ? scoreColor(quiz.responses.avgScore) : "var(--muted)" }}>
                          {quiz.responses.count}
                        </p>
                        <p className="text-[10px] text-[var(--muted)]">responses</p>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 mt-3 pt-3 border-t border-[var(--border)]">
                      <a href={`/quiz/${quiz.shareId}`} target="_blank"
                        className="text-xs px-3 py-1.5 border border-[var(--border)] rounded-lg text-[var(--muted)] hover:border-[var(--amber)] hover:text-[var(--ink)] transition-all">
                        Take quiz ↗
                      </a>
                      <Link href={`/results/${quiz.shareId}`}
                        className="text-xs px-3 py-1.5 border border-[var(--border)] rounded-lg text-[var(--muted)] hover:border-[var(--amber)] hover:text-[var(--ink)] transition-all">
                        Results ({quiz.responses.count})
                      </Link>
                      <button onClick={() => copy(quiz.shareId)}
                        className={`text-xs px-3 py-1.5 border rounded-lg transition-all ${
                          copiedId === quiz.shareId
                            ? "border-sage/40 bg-sage/10 text-sage"
                            : "border-[var(--border)] text-[var(--muted)] hover:border-[var(--amber)] hover:text-[var(--ink)]"
                        }`}>
                        {copiedId === quiz.shareId ? "✓ Copied!" : "Copy link"}
                      </button>
                      <button onClick={() => handleDelete(quiz.shareId)} disabled={deleting === quiz.shareId}
                        className="ml-auto text-xs px-3 py-1.5 border border-[var(--border)] rounded-lg text-[var(--muted)] hover:border-red-300 hover:text-red-500 transition-all disabled:opacity-40">
                        {deleting === quiz.shareId ? "Deleting…" : "Delete"}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}